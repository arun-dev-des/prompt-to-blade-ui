# How your prompt turns into product UI in Razorpay's Blade design system

> **Type your prompt → Claude creates a JSON description of a screen → real Blade components rendered on screen.**

We'll follow one example all the way through: you type **"a payment successful screen."**

> **About the reference links:** each step links to the *exact lines* in a frozen snapshot of
> the repo (the [`blog-v1`](https://github.com/arun-dev-des/prompt-to-blade-ui/tree/blog-v1)
> tag). So every link always resolves **and** always lands on the lines this post describes —
> even after the code changes later. (A revised post would point at a new tag, e.g. `blog-v2`.)

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

## Step 3 — The helper asks Claude — but hands it a strict form (`UI_SCHEMA`).

`/api/generate` is a **tiny program deployed on the Vercel server**. It's the only place the
secret key to talk to Claude lives (so the key never sits in the browser). It sends your
words to Claude *together with a rulebook* called `UI_SCHEMA`.

```ts
const message = await client.messages.create({
  model: 'claude-opus-4-8',
  system: SYSTEM_PROMPT,                               // "You are a Blade designer…"
  messages: [{ role: 'user', content: `Design this in Blade: ${prompt}` }],
  output_config: { format: { schema: UI_SCHEMA } },    // 👈 the strict form
});
res.status(200).json({ screen });                       // send the filled form back
```

### What is `UI_SCHEMA`, really?

It's a **machine-readable rulebook** (a format called JSON Schema) that lists *every part
Claude is allowed to use* and *exactly which blanks each part has*. It's not a polite
suggestion — it's passed to Claude through `output_config`, which **forces** the reply to
match it. If Claude tried to answer with anything off-list, the system would reject it.

Here's the rule for *one* part — the button:

```js
{
  required: ['kind', 'text'],                 // these blanks MUST be filled
  additionalProperties: false,                // ❗ no inventing extra blanks
  properties: {
    kind:    { const: 'button' },             // this part is a "button"
    text:    { type: 'string' },              // any words
    variant: { enum: ['primary', 'secondary', 'tertiary'] },  // pick ONE
    icon:    { type: 'string' },              // an icon name
  },
}
```

Read it like a form:

- **`required`** → the blanks that can't be left empty (a button must have `text`).
- **`enum`** → a dropdown: `variant` can only be one of three values.
- **`additionalProperties: false`** → the killer line. It means *"no blanks beyond the ones
  listed."* So Claude **cannot** add a `color: "#00ff00"` or a `fontSize` field — **there's
  simply nowhere on the form to put styling.** That absence is the guardrail.

And the whole screen has a shape too:

```ts
type UIScreen = { title: string; subtitle?: string; sections: UISection[] };
```

A screen must have a `title` and a list of `sections`; each section holds a list of these
"parts" (the allowed ones: heading, text, amount, statTile, badge, button, input, switchRow,
person, feature, divider).

**In plain words:** the helper makes Claude *fill out a form* instead of writing code. The
form lists only on-brand parts and has no slot for colors or sizes — so the answer is always
something the app can safely build.

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
