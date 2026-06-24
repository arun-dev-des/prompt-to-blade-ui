# AI × Design Meetup @ Razorpay — rebuilt in Blade

**The Blade Build Challenge · Level 1.** The event's Luma page, recreated pixel-by-token
in [Blade](https://blade.razorpay.com), Razorpay's design system. Same content, same
hierarchy — every surface rendered with Blade components and tokens.

```bash
npm install --legacy-peer-deps   # react-native peers are optional for web
npm run dev                       # open the printed localhost URL
```

> `--legacy-peer-deps` is only needed because Blade lists React-Native peers that a
> web app doesn't use (an `.npmrc` already sets this, so plain `npm install` works
> too). Everything else is a normal Vite + React + TypeScript app.

- **Level 1** (default view): the rebuilt Luma page.
- **Level 2** (freestyle): open `#level2` — **a prompt → Blade studio**. Type a screen or
  component; the prompt goes to **Claude (`claude-opus-4-8`)**, which returns a structured
  Blade UI spec, rendered live with real Blade components + tokens. See
  [`BLADE_KIT.md`](./BLADE_KIT.md) for the on-system playbook.

### How Level 2 stays on-system *and* safe

- Claude is called from a **Vercel serverless function** (`api/generate.ts`) — the
  Anthropic key lives only in a server env var, never in the browser bundle.
- Claude is constrained via **structured outputs** to a fixed Blade vocabulary
  (`src/level2/uiSchema.ts`); a deterministic renderer (`SchemaRenderer.tsx`) maps that
  spec to Blade components. So whatever Claude writes is guaranteed on-system — no raw
  hex, no magic px, dark-mode safe.
- If `ANTHROPIC_API_KEY` isn't set, Level 2 **falls back to local keyword recipes**, so
  the site never breaks.

## Deploy (Vercel)

The repo is one-click ready. On [vercel.com](https://vercel.com) → **Add New → Project**
→ import this repo. Vercel auto-detects Vite; `vercel.json` + `.npmrc` pin the
install/build so it works first try. Or via CLI: `npx vercel --prod`.

**For the Level 2 Claude studio**, set one env var in Vercel → **Settings → Environment
Variables**: `ANTHROPIC_API_KEY`. Without it, Level 2 uses the recipe fallback. Never
commit a key — see `.env.example`.

## What it captures

- **Cover + title** — "AI × Design Meetup @ Razorpay" with a token-built gradient hero.
- **When / Where** — Wed, 24 Jun · 7:30–11:00 PM · Razorpay Arena Office, Koramangala.
- **RSVP state** — "You're In" + My Ticket, with the attendee's pass.
- **Hosts + social proof** — host avatars and "64 going".
- **About + Schedule** — copy and a `StepGroup` timeline.
- **Primary action** — Add to Calendar (real `.ics` download) + Invite a friend (Web Share).

## How it maps to the 5 judging lenses

| Lens | Where it shows up |
| --- | --- |
| **Aesthetics** | One spacing scale (Blade `spacing.*`), one type scale (`Display`/`Heading`/`Text`), restrained primary/sea/cloud palette, consistent `medium`/`large` radii. |
| **Ease of use** | One obvious primary action per surface, scannable two-column → single-column layout, ≥44px tap targets, labelled controls, `prefers-reduced-motion` respected. |
| **Copy & story** | Warm, tight microcopy ("You're In", "Your kind of people will be there"). |
| **Interactions** | Real hover/press/focus from Blade, toast feedback, a tasteful token-timed entrance animation, working theme toggle. |
| **Systems thinking** | 100% Blade tokens — **no raw hex, no magic pixels** where a token exists. Data-driven from one typed `event` model. Reusable, theme-agnostic prop APIs (`MetaRow`, `SectionHeading`, `Reveal`). |

## Architecture

```
src/
  data/event.ts           # single typed source of truth — all copy/facts live here
  utils/calendar.ts        # .ics generation (pure browser, no backend)
  components/
    EventCover.tsx         # gradient hero (gradient colours read from theme tokens)
    PageHeader.tsx          # sticky bar + dark-mode toggle (useTheme().setColorScheme)
    MetaRow.tsx             # reusable icon-tile + two-line row (date / location)
    RegistrationCard.tsx    # "You're In" + ticket + primary/secondary actions
    AboutSection.tsx
    ScheduleSection.tsx     # Blade StepGroup timeline
    HostsSection.tsx        # hosts + "N going" AvatarGroup
    SectionHeading.tsx      # shared section-title rhythm
    Reveal.tsx              # entrance animation driven by Blade motion tokens
    EventPage.tsx           # responsive composition
  App.tsx                   # single <BladeProvider> + <ToastContainer>
```

## On-system constraints honoured

- **Blade components + tokens only.** No raw hex anywhere; the one gradient reads its
  colours from resolved theme tokens via `useTheme()`. Spacing, radii, borders, motion
  and colour all come from `@razorpay/blade/tokens`.
- **Responsive** mobile → desktop (Blade's `{ base, m, l }` responsive props).
- **Accessible** — labelled icon buttons, semantic headings, contrast-safe token pairs,
  ≥44px targets, reduced-motion fallback.
- **Light theme, no backend, no routing.**

## Stretch goals included

- 🌗 **Dark mode** — toggle in the header (`BladeProvider` colour scheme).
- 📅 **Add-to-calendar `.ics`** — generated and downloaded client-side.
- 🔗 **Share / invite** — Web Share API with clipboard fallback.
- ✨ **Entrance animation** — staggered fade-up using Blade motion duration/easing tokens.

Built against `@razorpay/blade@12.98.1`.
