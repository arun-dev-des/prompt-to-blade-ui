import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Vercel serverless function — the ONLY place the Anthropic key lives.
 * Set ANTHROPIC_API_KEY in the Vercel project's Environment Variables; it is
 * never shipped to the browser. POST a prompt and get back a validated Blade UI
 * spec (structured output); the frontend renders it with real Blade components.
 *
 * The response is STREAMED as newline-delimited JSON — `{"delta":"<json text>"}`
 * lines as Claude generates, then `{"done":true}` (or `{"error":"..."}`) — so
 * the client can paint the first section of the screen long before the model
 * has finished. Errors BEFORE the first byte are plain JSON with a non-2xx
 * status, as before.
 *
 * Self-contained on purpose (schema + prompt inlined) so there is no
 * cross-directory import for Vercel's function bundler to resolve. It also
 * sticks to the plain Node req/res API (no res.status().json()) so the Vite
 * dev middleware in vite.config.ts can run it unchanged.
 *
 * GET this URL in a browser for a health check: it reports whether the function
 * is deployed and whether it can see the key — the fastest way to diagnose the
 * "offline fallback" case.
 */

const UI_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'sections'],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['elements'],
        properties: {
          variant: { type: 'string', enum: ['card', 'plain'] },
          layout: { type: 'string', enum: ['stack', 'grid'] },
          heading: { type: 'string' },
          elements: {
            type: 'array',
            items: {
              anyOf: [
                { type: 'object', additionalProperties: false, required: ['kind', 'text'], properties: { kind: { const: 'heading' }, text: { type: 'string' }, size: { type: 'string', enum: ['small', 'medium', 'large'] } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'text'], properties: { kind: { const: 'text' }, text: { type: 'string' }, tone: { type: 'string', enum: ['normal', 'subtle', 'muted'] } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'value'], properties: { kind: { const: 'amount' }, label: { type: 'string' }, value: { type: 'number' }, currency: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'label', 'value'], properties: { kind: { const: 'statTile' }, label: { type: 'string' }, value: { type: 'number' }, currency: { type: 'string' }, delta: { type: 'string' }, up: { type: 'boolean' } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'text'], properties: { kind: { const: 'badge' }, text: { type: 'string' }, color: { type: 'string', enum: ['positive', 'negative', 'notice', 'information', 'neutral', 'primary'] } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'text'], properties: { kind: { const: 'button' }, text: { type: 'string' }, variant: { type: 'string', enum: ['primary', 'secondary', 'tertiary'] }, icon: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'label'], properties: { kind: { const: 'input' }, label: { type: 'string' }, placeholder: { type: 'string' }, inputType: { type: 'string', enum: ['text', 'email', 'password', 'textarea'] } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'title'], properties: { kind: { const: 'switchRow' }, title: { type: 'string' }, description: { type: 'string' }, on: { type: 'boolean' } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'name'], properties: { kind: { const: 'person' }, name: { type: 'string' }, subtitle: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['kind', 'text'], properties: { kind: { const: 'feature' }, text: { type: 'string' } } },
                { type: 'object', additionalProperties: false, required: ['kind'], properties: { kind: { const: 'divider' } } },
              ],
            },
          },
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You are a senior product designer who works exclusively in Razorpay's Blade design system. Given a short prompt, design ONE clean screen or component.

Return ONLY a JSON object matching the provided schema — a screen with a title and 1–4 sections, each holding flat leaf elements (heading, text, amount, statTile, badge, button, input, switchRow, person, feature, divider).

Design principles (apply rigorously):
- ONE obvious primary action per screen (exactly one button with variant "primary"); everything else secondary/tertiary.
- Restraint: few elements, clear hierarchy, tight warm microcopy. Lead with the outcome.
- Group related elements into a "card" section; use a "grid" layout for 2–3 parallel items (stats, plans).
- Use "amount"/"statTile" for money and metrics, "switchRow" for settings, "input" for forms, "person" for people, "feature" for checklist items, "badge" for status.
- Button icons (optional) must be one of: download, share, check, arrow, plus, user, calendar, lock, mail, sparkles, send, trash.
- Keep copy concise and human. No placeholder lorem ipsum.

Do not include any prose outside the JSON.`;

const sendJson = (res: VercelResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const keyConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  // Health check — open this URL in a browser to diagnose.
  if (req.method === 'GET') {
    sendJson(res, 200, { status: 'ok', deployed: true, keyConfigured });
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  if (!keyConfigured) {
    sendJson(res, 503, { error: 'not_configured' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {};
  const prompt = String(body.prompt ?? '').slice(0, 500).trim();
  if (!prompt) {
    sendJson(res, 400, { error: 'empty_prompt' });
    return;
  }

  let started = false;
  const write = (obj: unknown) => {
    if (!started) {
      started = true;
      res.statusCode = 200;
      res.setHeader('content-type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('cache-control', 'no-cache, no-transform');
      res.setHeader('x-accel-buffering', 'no');
    }
    res.write(`${JSON.stringify(obj)}\n`);
  };

  try {
    const client = new Anthropic();
    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Design this in Blade: ${prompt}` }],
      output_config: { format: { type: 'json_schema', schema: UI_SCHEMA } },
    } as never);

    // Stop paying for tokens nobody will read if the tab closes mid-stream.
    res.on('close', () => {
      if (!res.writableEnded) stream.abort();
    });

    stream.on('text', (delta: string) => write({ delta }));
    await stream.finalMessage();
    write({ done: true });
    res.end();
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown';
    if (!started) {
      sendJson(res, 502, { error: 'generation_failed', detail });
    } else {
      write({ error: 'generation_failed', detail });
      res.end();
    }
  }
}
