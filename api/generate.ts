import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { UI_SCHEMA, SYSTEM_PROMPT } from '../src/level2/uiSchema';

/**
 * Vercel serverless function — the ONLY place the Anthropic key lives.
 * Set ANTHROPIC_API_KEY in the Vercel project's Environment Variables; it is
 * never shipped to the browser. The client POSTs a prompt here and gets back a
 * validated Blade UI spec (structured output), which the frontend renders with
 * real Blade components + tokens.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    // Frontend falls back to local recipes when the key isn't configured.
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const prompt = String(req.body?.prompt ?? '').slice(0, 280).trim();
  if (!prompt) {
    res.status(400).json({ error: 'empty_prompt' });
    return;
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Design this in Blade: ${prompt}` }],
      // Force the response to match the Blade UI spec exactly.
      output_config: {
        format: { type: 'json_schema', name: 'blade_screen', schema: UI_SCHEMA },
      },
    } as never);

    const block = (message as { content: Array<{ type: string; text?: string }> }).content.find(
      (b) => b.type === 'text',
    );
    const text = block?.text ?? '';
    const screen = JSON.parse(text);
    res.status(200).json({ screen });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown';
    res.status(502).json({ error: 'generation_failed', detail });
  }
}
