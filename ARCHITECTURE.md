# How your prompt turns into product UI in Razorpay's Blade design system

> **Type your prompt → Claude creates a JSON description of a screen → real Blade components rendered on screen.**

We'll follow one example all the way through: you type **"a payment successful screen."**

> **Reference links:** each step links to the exact lines in the repo.

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

The button runs `build()`, which packs your sentence into a package and sends it to an
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

**The problem.** Left to its own devices, an LLM is a free-form text generator. Ask it to
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

### What the form (`UI_SCHEMA`) looks like — and why it works

**If you've built a component set in Figma, you already understand this.** `UI_SCHEMA` is
basically a component library written as text. It says: here are the only components you may
place, here are each one's properties, and here's which properties are dropdowns vs. free text.
Claude can drag in components and set their props — but it can't repaint them or invent new
ones, exactly like a designer pulling from a locked library.

> ▶ **Play with it:** the [**interactive Schema Playground**](https://razorpay-challenge.vercel.app/schema-playground.html)
> lets you add components, watch this exact JSON build live, and try to sneak in a raw color to
> feel the guardrail bounce back. The rest of this step explains what you're seeing.

Here's the rule for **one** component — the button:

```js
{
  required: ['kind', 'text'],                 // props that MUST be set
  additionalProperties: false,                // ❗ no custom props / no overrides
  properties: {
    kind:    { const: 'button' },             // this component is a "Button"
    text:    { type: 'string' },              // the label (free text)
    variant: { enum: ['primary', 'secondary', 'tertiary'] },  // a variant dropdown
    icon:    { type: 'string' },              // an icon name
  },
}
```

Read it the way you'd read a Figma component:

- It's a **Button** — the component type is fixed.
- It **must have a label** — you can't place one with empty text.
- Its style is a **variant dropdown** — Primary, Secondary, or Tertiary, and nothing else.
- There is **no color, size, or spacing field** — and setting `additionalProperties: false`
  means no new properties can be added.

That last point *is* the guardrail: there's simply nowhere on the form to put a raw color or a
custom pixel value. Think of a library with **"detach instance" turned off** — you always get
the component exactly as the design system defines it.

A whole screen is just a stack of these components grouped into **sections**, with a title on
top — a frame built entirely from library parts.

**The payoff:** the form offers only real, on-brand components and has no styling slots — so
whatever Claude sends back is always something the app can build with actual Blade tokens.
Claude makes the design decisions (which components, what copy, what order); the design system
guarantees every pixel stays on-brand — even by accident.

📄 **The rulebook →** [uiSchema.ts — the `UIScreen` shape + the full `UI_SCHEMA`, lines 35–85 (the button rule is line 72)](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/uiSchema.ts#L35-L85)
📄 **Sent to Claude →** [api/generate.ts — the `messages.create` call, lines 99–111](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/api/generate.ts#L99-L111)

---

## Step 4 — Claude returns a *description*, not a design.

Because of the form, Claude can only send back a plain list of *which parts, in what order,
with what words* — never colors or pixels:

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

**In plain words:** Claude chose the *content and layout* (a "Paid" badge, an amount, a
download button) — but **no styling.** It's a furniture order form, filled in.

---

## Step 5 — The browser saves that description.

`setScreen(data.screen)` stores the JSON and tells the app: "we have a result — show it."

**In plain words:** the spinner disappears; the app now has a description to draw.

📄 **In the code →** [PromptStudio.tsx — saving the result, lines 92–94](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/PromptStudio.tsx#L92-L94)

---

## Step 6 — The renderer turns each line into a real Blade component.

`SchemaRenderer` reads the list and, for each item, drops in the matching **real Blade
component** — which already carries Razorpay's exact colors, spacing, and fonts.

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

📄 **The translator →** [SchemaRenderer.tsx — the `Element` mapping, lines 57–141](https://github.com/arun-dev-des/prompt-to-blade-ui/blob/blog-v1/src/level2/SchemaRenderer.tsx#L57-L141)

---

## Step 7 — React paints it. You see your screen.

```tsx
{screen && <SchemaRenderer screen={screen} />}
```

**In plain words:** the finished, on-brand Razorpay screen appears — built from your one
sentence.

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
