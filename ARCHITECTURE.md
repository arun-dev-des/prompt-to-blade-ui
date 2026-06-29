# How I got AI to turn a prompt into Razorpay's Blade UI — without it ever going off-brand

Recently I attended Razorpay's **AI × Design Meetup** and took part in the **Blade Build
Challenge** — then posted what I built on LinkedIn. The post blew up.

A lot of people asked how the build actually works — so here's the full breakdown, for designers
as much as engineers.

> **Type your prompt → Claude creates a JSON description of a screen → real Blade components rendered on screen.** A step-by-step walkthrough of the build — and the repo is [fully open source](https://github.com/arun-dev-des/prompt-to-blade-ui).

We'll follow one example all the way through: you type **"a payment successful screen."**

---

## Step 1 — You type your prompt. The app remembers it.

The text box keeps your words in a variable called `prompt`.

```tsx
const [prompt, setPrompt] = useState('');          // your prompt lives here

<TextArea
  value={prompt}
  onChange={({ value }) => setPrompt(value ?? '')} // every keystroke updates it
/>
```

**In plain words:** as you type, `prompt` always holds your current sentence. Nothing else
happens yet.

📄 **In the code →** [PromptStudio.tsx — the prompt text box, lines 149–156](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/PromptStudio.tsx#L149-L156) *(the `prompt` variable itself is set up on line 50)*

---

## Step 2 — You click "Build it." Your words get mailed to a helper.

The button runs `build()`, which packs your prompt into a package and sends it to an
address, `/api/generate`, then shows a spinner.

```tsx
<Button onClick={() => build(prompt)}>Build it</Button>

const build = async (text) => {
  setStatus('building');                       // show the spinner
  const res = await fetch('/api/generate', {   // mail the words to the helper
    method: 'POST',
    body: JSON.stringify({ prompt: text }),    // 📦 { prompt: "a payment successful screen" }
  });
  const data = await res.json();               // wait for the reply
  setScreen(data.screen);                      // save what comes back (Step 5)
  setStatus('done');
};
```

**In plain words:** clicking sends your words off and shows a spinner while it waits.

📄 **In the code →** [PromptStudio.tsx — the `build()` function, lines 75–107](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/PromptStudio.tsx#L75-L107)

---

## Step 3 — The helper forces Claude to fill a strict form (`UI_SCHEMA`).

This is the heart of the whole thing, so it's worth slowing down.

**The problem.** By default, an LLM is a free-form text generator. Ask it to
"design a payment screen" and it might hand back code with hard-coded colors like `#00ff00`,
random pixel sizes, a layout that ignores your design system, or even a component that doesn't
exist. Often useful — but **unpredictable**. You can't *guarantee* it'll be on-brand.

**The technique: don't let it write freely — make it fill a form.** The Anthropic API has a
feature called **structured outputs**: you hand the model a *schema* (a rulebook), and the
reply is **forced** to match it. Claude can choose what goes in the blanks, but it cannot add a
blank that isn't on the form — the API rejects anything off-shape. The constraint, not the
prompt, is what keeps the output on-system.

Here's the call. `/api/generate` is a **tiny program deployed on the Vercel server** (the only
place the secret key lives, so it never sits in the browser). The 👈 line is where the rulebook
is enforced:

```ts
const message = await client.messages.create({
  model: 'claude-opus-4-8',
  system: SYSTEM_PROMPT,                               // "You are a Blade designer…"
  messages: [{ role: 'user', content: `Design this in Blade: ${prompt}` }],
  output_config: { format: { schema: UI_SCHEMA } },    // 👈 forces the reply to match the form
});
res.status(200).json({ screen });                       // send the filled form back
```

That one argument — `schema: UI_SCHEMA` — **is the strict form** from the technique above. It's
the rulebook the reply is forced to match: everything Claude is allowed to return is defined in
it, and anything off-shape is rejected. So let's open `UI_SCHEMA` up and see what's inside.

### What's inside `UI_SCHEMA` — read top to bottom

`UI_SCHEMA` is a **component library written as rules** — a designer's locked Figma library, but
as text. Read it the way it nests: a **screen** → its **sections** → the **elements** inside them.

**1 · The screen** — the outer object. A screen has exactly three possible fields: `title` and
`sections` are mandatory, `subtitle` is optional. (Rule of thumb for the whole file: **if a field
isn't in `required`, it's optional.**)

```js
const UI_SCHEMA = {
  type: 'object',
  additionalProperties: false,        // only the fields listed in properties below — nothing else
  required: ['title', 'sections'],    // a screen MUST have a title and sections
  properties: {
    title:    { type: 'string' },     // required (it's in the list above)
    subtitle: { type: 'string' },     // optional (it isn't)
    sections: { type: 'array', items: { /* …a section — see #2 */ } },
  },
};
```

**2 · A section** — each item inside `sections`. A section is just a container that groups
elements, with two dropdowns for how they're arranged.

```js
{
  type: 'object',
  additionalProperties: false,
  required: ['elements'],                   // a section must hold elements
  properties: {
    variant: { enum: ['card', 'plain'] },   // dropdown: render as a card or plain
    layout:  { enum: ['stack', 'grid'] },    // dropdown: vertical stack or side-by-side grid
    heading: { type: 'string' },             // optional section title
    elements:{ type: 'array', items: { anyOf: [ /* …the 11 shapes — see #3 */ ] } },
  },
}
```

Its two dropdowns decide how the group looks and lays out:

- **`variant`** is the *wrapper*. `card` puts the group inside a Blade Card — a bordered, slightly
  raised, padded panel; `plain` drops the wrapper and places the elements straight on the
  background.
- **`layout`** is the *arrangement*. `stack` lays the elements in a vertical column (one under the
  next); `grid` places them side by side in a row — handy for parallel items like stat tiles or
  pricing columns.

(Both are optional — leave them out and you get a plain, stacked section.)

**3 · An element** — each item inside `elements`. This is the `anyOf`: every element must match
**exactly one** of 11 component shapes. Here's one of them — the button:

```js
{
  type: 'object',
  additionalProperties: false,              // ❗ no extra fields → nowhere to put styling
  required: ['kind', 'text'],
  properties: {
    kind:    { const: 'button' },           // the fixed tag that says "this is a Button"
    text:    { type: 'string' },            // the label (free text)
    variant: { enum: ['primary', 'secondary', 'tertiary'] },  // a variant dropdown
    icon:    { type: 'string' },            // an optional icon name
  },
}
```

The `kind` (a fixed `const`) is the tag that tells the renderer which component to draw. The
only "style" choice is the fixed `variant` dropdown — and `additionalProperties: false` means
**there's nowhere to add a `color` or a `size`.** That absence *is* the guardrail: like a Figma
library with **"detach instance" turned off**, you always get the component exactly as the
design system defines it.

The other 10 shapes follow the same pattern — a `kind` tag, a few required fields, fixed
dropdowns, and no styling slot:

- **`heading` / `text`** — section titles and body copy
- **`amount`** — a formatted money value (e.g. ₹2,499.00)
- **`statTile`** — a metric tile with a trend badge
- **`badge`** — a status pill (Paid, Failed, …)
- **`button`** — a primary / secondary / tertiary action
- **`input`** — a form field (text · email · password · textarea)
- **`switchRow`** — a labeled on/off toggle
- **`person`** — an avatar + name + subtitle
- **`feature`** — a checklist line with a tick
- **`divider`** — a horizontal separator

**The payoff:** the form offers only real, on-brand components and has no styling slots — so
whatever Claude sends back is always something the app can build with actual Blade tokens.
Claude makes the design decisions (which components, what copy, what order); the design system
guarantees every pixel stays on-brand — even by accident.

> ▶ **[Play with all of this in the interactive Schema Playground →](https://razorpay-challenge.vercel.app/schema-playground.html)**
> — build a screen and watch this exact JSON form take shape live.

📄 **The rulebook actually sent to Claude →** [api/generate.ts — the inlined `UI_SCHEMA` object (lines 18–57), used by the `messages.create` call on line 99](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/api/generate.ts#L18-L57)
📄 **The canonical types + the copy the browser renders from →** [uiSchema.ts — the `UIScreen` / element types and the mirrored schema (lines 13–85)](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/uiSchema.ts#L13-L85)

---

## Step 4 — Claude returns a *description*, not a design.

What comes back is **`UI_SCHEMA` filled in** — the rulebook from Step 3, now a concrete answer.
It has the same `screen → sections → elements` shape, and every field is one the schema allowed:

```json
{
  "title": "Payment successful",
  "sections": [{ "elements": [
    { "kind": "badge",  "text": "Paid", "color": "positive" },
    { "kind": "amount", "label": "Amount paid", "value": 2499 },
    { "kind": "button", "text": "Download receipt", "icon": "download" }
  ]}]
}
```

**In plain words:** trace it against the rules from Step 3 — it's a screen (`title` + `sections`)
holding one section of `elements`; each element's `kind` is one of the 11; the badge's `color` is
a value straight from that dropdown. And notice what's *missing*: no hex, no pixels, no field the
schema didn't define — `additionalProperties: false` saw to that. Claude chose the content and the
order; the form shaped everything else.

---

## Step 5 — Saving the result triggers the renderer.

Back in `build()`, the **filled-in `UI_SCHEMA`** Claude returned (Step 4) — it arrives as
`data.screen` — is handed to `setScreen`. In React, calling `setScreen` re-renders the component,
and on that re-render this line runs the renderer with it:

```tsx
setScreen(data.screen);                          // Claude's description goes in (inside build(), Step 2)
...
{screen && <SchemaRenderer screen={screen} />}   // the re-render reaches this → SchemaRenderer gets the description
```

**In plain words:** `setScreen` doesn't call `SchemaRenderer` itself — it just triggers a
re-render, and that JSX line is *where* the description reaches `SchemaRenderer` and becomes UI.

📄 **Saving →** [PromptStudio.tsx — `setScreen(data.screen)` (line 94)](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/PromptStudio.tsx#L94)
📄 **Rendering →** [PromptStudio.tsx — `<SchemaRenderer screen={screen} />` (line 214)](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/PromptStudio.tsx#L214)

---

## Step 6 — The schema renderer turns each element into a real Blade component.

`SchemaRenderer` — the component `screen` was passed to in Step 5 — walks the description: its
sections, and the elements inside them. For each element, a `switch` on its `kind` picks the
matching **real Blade component**, which already carries Razorpay's exact colors, spacing, and
fonts. That switch is the heart of it:

```tsx
const Element = ({ el }) => {
  switch (el.kind) {
    case 'badge':  return <Badge color={el.color}>{el.text}</Badge>;
    case 'amount': return <Amount value={el.value} currency="INR" size="large" />;
    case 'button': return <Button variant={el.variant} icon={ICONS[el.icon]}>{el.text}</Button>;
    // …one case per allowed part
  }
};
```

The translation, line by line:

```
description item                  →   real Blade component you see
{ kind: "badge",  … }             →   <Badge>   → green "Paid" pill
{ kind: "amount", value: 2499 }   →   <Amount>  → ₹2,499.00 (auto-formatted)
{ kind: "button", … }             →   <Button>  → blue button + download icon
```

**In plain words:** the renderer is a translator — JSON in, real Blade component out. The
styling isn't decided here *or* by Claude; it lives inside the Blade components.

> ▶ **[See the mapping live in the Schema Playground →](https://razorpay-challenge.vercel.app/schema-playground.html)**
> — every element you add renders instantly as a Blade component, right beside its JSON.

📄 **The translator →** [SchemaRenderer.tsx — the `Element` mapping, lines 57–141](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/SchemaRenderer.tsx#L57-L141)

---

## Step 7 — React paints it. You see your screen.

React turns those Blade components into real pixels, and the finished, on-brand Razorpay screen
appears — built from your one sentence. (In the studio it shows under a **Preview** tab, with a
**Code** tab beside it that prints the same screen as copy-pasteable Blade JSX.)

📄 **In the code →** [PromptStudio.tsx — rendering the result, line 214](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/PromptStudio.tsx#L214)

---

## The mental model

```
  "a payment successful screen"                    ← what you type
            ▼  (mailed to the Vercel helper)
  { title, sections:[ badge, amount, button ] }    ← Claude fills the strict form (UI_SCHEMA)
            ▼  (renderer translates each item)
  <Badge/> <Amount/> <Button/>                     ← real Blade components on screen
```

**The one line to remember:** Claude only gets to *pick the parts and arrange them* — it
never chooses a single color or size. The Razorpay design system owns all the styling, baked
into the components. So **the AI makes the design decisions, but the design system guarantees
every pixel is on-brand.**

---

## What happens if Claude can't be reached?

If the secret key isn't set, or Claude errors, the studio doesn't show an error. It matches
your words to a small library of pre-built Blade screens by keyword and shows one of those
instead — with a small "offline build" note. So it never breaks; it gracefully degrades.

📄 **The fallback →** [recipes.tsx — the recipe library + keyword matcher, lines 269–283](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/recipes.tsx#L269-L283)

---

## Open source

The whole thing is open source — fork it, read it, or build your own design-system studio on top:

### → [github.com/arun-dev-des/prompt-to-blade-ui](https://github.com/arun-dev-des/prompt-to-blade-ui)

Try the [**live app**](https://razorpay-challenge.vercel.app) · play with the [**Schema Playground**](https://razorpay-challenge.vercel.app/schema-playground.html). Built on Razorpay's [Blade](https://blade.razorpay.com) design system.
