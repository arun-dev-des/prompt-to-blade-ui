# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-purpose web app: a **prompt → Blade UI studio**. The user types a description; Claude
(`claude-opus-4-8`) returns a structured spec under a strict JSON schema; a deterministic
renderer turns that spec into real Razorpay [Blade](https://blade.razorpay.com) components.
The guarantee is that AI output is **always on-system** — the model picks content/arrangement,
the design system owns all styling. See `ARCHITECTURE.md` for the full walkthrough.

Stack: Vite + React + TypeScript + `@razorpay/blade`, one Vercel serverless function
(`api/generate.ts`), `@anthropic-ai/sdk`. No router, no database.

## Commands

```bash
npm install                 # .npmrc pins --legacy-peer-deps (Blade lists RN peers a web app skips)
npm run dev                 # Vite dev server — FRONTEND ONLY (see gotcha below)
npm run build               # tsc -b && vite build
npm run lint                # oxlint
npx tsc -b                  # type-check only
```

There is **no test runner** configured. Verification = `npx tsc -b` + `npm run lint` + `npm run build`.

### Running the real AI path locally (important gotcha)

`npm run dev` does **not** run `api/generate.ts`, so Level 2 silently falls back to recipe mode
(no live Claude). To exercise the actual Claude path you must use `vercel dev`, AND the key must
be **exported into the shell before launching** — `vercel dev` does not reliably inject
`.env.local` into the function (a blank "Sensitive" `ANTHROPIC_API_KEY` from the linked Vercel
project shadows it):

```bash
export ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d= -f2-)
npx vercel dev --listen 3000
curl -s localhost:3000/api/generate    # sanity: should report "keyConfigured":true
```

## Architecture — the constrained-generation pipeline

```
PromptStudio (text box)  →  POST /api/generate  →  Claude w/ JSON schema  →  UIScreen spec
                                                                                 │
                            SchemaRenderer (spec → Blade components)  ◄──────────┤
                            screenToJsx     (spec → copy-pasteable JSX) ◄────────┘
```

The model never writes code — it fills a fixed schema. A spec is `Screen → sections[] → flat
elements[]` (kinds: heading, text, amount, statTile, badge, button, input, switchRow, person,
feature, divider). The renderer maps each element to a Blade component carrying the tokens; no
styling values ever come from the model.

**`src/level2/uiSchema.ts` is the contract** and the center of gravity. Four things consume it:
the JSON schema sent to Claude, the TS types (`UIScreen`/`UISection`/`UIElement`), the renderer,
and the serializer.

### ⚠️ The schema lives in TWO places — keep them in sync

`api/generate.ts` is **self-contained on purpose** (the JSON schema *and* the system prompt are
inlined) so Vercel's function bundler has nothing cross-directory to resolve. So there are two
copies of the schema: `src/level2/uiSchema.ts` (the canonical types + schema used by the
frontend) and the inlined `UI_SCHEMA` in `api/generate.ts` (the one actually sent to Claude).
**Any schema/system-prompt change must be made in BOTH** or the runtime behaviour and the
frontend types drift apart.

### Adding or changing an element type touches 4 places

1. `src/level2/uiSchema.ts` — the `UIElement` type union **and** the `UI_SCHEMA` JSON schema.
2. `api/generate.ts` — the inlined `UI_SCHEMA` copy (and the `SYSTEM_PROMPT` guidance).
3. `src/level2/SchemaRenderer.tsx` — a `case` in the `Element` switch (renders it).
4. `src/level2/screenToJsx.ts` — a matching `case` (serializes it for the Code tab).

`SchemaRenderer` and `screenToJsx` are inverses; the Code tab is only faithful if they agree.

### Structured-output constraints (hard limits, learned the hard way)

The schema is bound by Anthropic structured outputs: **no recursion**, and a **≤24 optional-
parameter** budget for grammar compilation. Inlining a sub-schema twice doubles its optional-
param count and 400s; share definitions via `$defs` + `$ref` instead (both are supported).

### Fallback path

If `ANTHROPIC_API_KEY` is missing or Claude errors, `PromptStudio` calls `matchRecipe()`
(keyword match) and renders a hand-built composition from `src/level2/recipes.tsx`. The app
never shows an error; it degrades.

## Blade / on-system discipline

Blade tokens only — **no raw hex, no magic pixels** where a token exists (`spacing.*`,
`surface.*`, `border.radius.*`, `motion.*`). The only styled-components escape hatches
(`components/Reveal.tsx`, `level2/CodeBlock.tsx`) still read every value from the resolved theme
via `useTheme()`. `BLADE_KIT.md` is the build-time Blade playbook (token tables, component
cheat-sheet, principle→Blade-move map) — it is **not** imported or sent to Claude; the runtime
`SYSTEM_PROMPT` in `api/generate.ts` is a distilled excerpt of it.

## Routing & the shared link

`App.tsx` always renders the studio (`Playground`). The `#level2` hash is a **no-op kept alive
on purpose**: that link was shared widely on social media, so both `/` and `/#level2` must keep
resolving to the studio. Do not reintroduce hash-based routing that would break `/#level2`.

## Deploy & names (don't break these)

- Deploys to Vercel (`npx vercel --prod`); `vercel.json` + `.npmrc` pin install/build. The
  Anthropic key lives **only** as the `ANTHROPIC_API_KEY` env var on the server function.
- **The live URL `razorpay-challenge.vercel.app` must never change** — it's the social-shared
  link (the Vercel *project* name, independent of the GitHub repo name `prompt-to-blade-ui`).
  Don't rename the Vercel project or delete/re-import it.
- `ARCHITECTURE.md` reference links are pinned to the **`blog-v1` git tag** (line-stable
  permalinks). If you materially change the referenced source, cut a new tag and update the doc.
