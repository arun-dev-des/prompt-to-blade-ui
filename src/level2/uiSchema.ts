/**
 * The constrained "Blade UI spec" that Claude is forced to emit (via the
 * structured-outputs JSON schema in /api/generate). The renderer maps every
 * node to a real Blade component + tokens — so whatever Claude returns is
 * guaranteed on-system (no raw hex, no magic px, theme-agnostic).
 *
 * Deliberately NON-RECURSIVE (structured outputs don't support recursive
 * schemas): a Screen has Sections, and each Section has flat leaf Elements.
 * Two levels covers forms, dashboards, confirmations, settings, pricing, etc.
 */

export type ElementTone = 'normal' | 'subtle' | 'muted';
export type FeedbackColor = 'positive' | 'negative' | 'notice' | 'information' | 'neutral' | 'primary';

export type UIElement =
  | { kind: 'heading'; text: string; size?: 'small' | 'medium' | 'large' }
  | { kind: 'text'; text: string; tone?: ElementTone }
  | { kind: 'amount'; label?: string; value: number; currency?: string }
  | { kind: 'statTile'; label: string; value: number; currency?: string; delta?: string; up?: boolean }
  | { kind: 'badge'; text: string; color?: FeedbackColor }
  | { kind: 'button'; text: string; variant?: 'primary' | 'secondary' | 'tertiary'; icon?: string }
  | { kind: 'input'; label: string; placeholder?: string; inputType?: 'text' | 'email' | 'password' | 'textarea' }
  | { kind: 'switchRow'; title: string; description?: string; on?: boolean }
  | { kind: 'person'; name: string; subtitle?: string }
  | { kind: 'feature'; text: string }
  | { kind: 'divider' };

export type UISection = {
  variant?: 'card' | 'plain';
  layout?: 'stack' | 'grid';
  heading?: string;
  elements: UIElement[];
};

export type UIScreen = {
  title: string;
  subtitle?: string;
  sections: UISection[];
};

/**
 * JSON Schema handed to the Messages API as `output_config.format`. Kept within
 * the structured-outputs feature set (object/array/string/number/boolean,
 * enum, anyOf, const; additionalProperties:false; no recursion).
 */
export const UI_SCHEMA = {
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
} as const;

/** System prompt — the "visual design skill", constrained to the Blade vocabulary. */
export const SYSTEM_PROMPT = `You are a senior product designer who works exclusively in Razorpay's Blade design system. Given a short prompt, design ONE clean screen or component.

Return ONLY a JSON object matching the provided schema — a screen with a title and 1–4 sections, each holding flat leaf elements (heading, text, amount, statTile, badge, button, input, switchRow, person, feature, divider).

Design principles (apply rigorously):
- ONE obvious primary action per screen (exactly one button with variant "primary"); everything else secondary/tertiary.
- Restraint: few elements, clear hierarchy, tight warm microcopy. Lead with the outcome.
- Group related elements into a "card" section; use a "grid" layout for 2–3 parallel items (stats, plans).
- Use "amount"/"statTile" for money and metrics, "switchRow" for settings, "input" for forms, "person" for people, "feature" for checklist items, "badge" for status.
- Button icons (optional) must be one of: download, share, check, arrow, plus, user, calendar, lock, mail, sparkles, send, trash.
- Keep copy concise and human. No placeholder lorem ipsum.

Do not include any prose outside the JSON.`;
