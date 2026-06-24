# Blade Kit — Level 2 freestyle playbook

> The prompt is the variable; **Blade is the constant.** This file is the constant in
> writing — paste the on-the-spot prompt, build in `src/level2/Playground.tsx`
> (open `#level2`), and use the reference below to stay on-system under pressure.

## The 90-second workflow when the prompt drops

1. **Name the surface.** Is it a *screen*, a *flow*, or a *component*? Pick the Blade
   container: `Card`, `Modal`, `Drawer`, `BottomSheet`, or a plain `Box` layout.
2. **One primary action.** Decide the single obvious thing the user does. Everything
   else is secondary/tertiary.
3. **Lay out with `Box`** using `spacing.*` for gap/padding — never raw px.
4. **Fill with real Blade components** (table below). Never a raw `<div>`/`<button>`.
5. **Colour only from tokens** — `surface.*`, `feedback.*`, `interactive.*`.
6. **Make it responsive** with `{ base, m, l }` props; **label every control**;
   keep targets ≥44px.
7. **Test the dark toggle** (header) — if it survives, your tokens are correct.

## Setup (already done in this repo)

```tsx
import '@razorpay/blade/fonts.css';
import { BladeProvider, ToastContainer } from '@razorpay/blade/components';
import { bladeTheme } from '@razorpay/blade/tokens';

<BladeProvider themeTokens={bladeTheme} colorScheme="light">
  <ToastContainer />
  {/* your build */}
</BladeProvider>
```

## Tokens (exact, verified against @razorpay/blade@12.98.1)

**Spacing** (`spacing.N`): 0=0 · 1=2 · 2=4 · 3=8 · 4=12 · 5=16 · 6=20 · 7=24 · 8=32 ·
9=40 · 10=48 · 11=56 px. Use as `padding="spacing.5"`, `gap="spacing.4"`.

**Breakpoints** (responsive prop keys): `base`(0) · `xs`(320) · `s`(480) · `m`(768) ·
`l`(1024) · `xl`(1200). e.g. `flexDirection={{ base: 'column', l: 'row' }}`.

**Radius** (`borderRadius`): `none 2xsmall xsmall small medium large xlarge 2xlarge max round`.

**Border width** (`borderWidth`): `none thinner thin thick thicker`.

**Motion**: `theme.motion.duration.*` (`2xquick`80 … `gentle`480 … `2xgentle`960 ms),
`theme.motion.easing.*` (`entrance exit standard emphasized overshoot shake`).

**Colour** — semantic, `category.role.tone.emphasis`. Tones/emphasis that exist:

| Token family | Values |
| --- | --- |
| `surface.background.*` | `gray`(subtle/moderate/intense) · `primary`(subtle/intense) · `sea`(subtle/intense) · `cloud`(subtle/intense) |
| `surface.text.*` | `gray`(normal/subtle/muted/disabled) · `primary.normal` · `staticWhite`(normal/subtle/muted) · `staticBlack` · `onSea` · `onCloud` |
| `surface.icon.*` | `gray` · `primary` · `staticWhite` · `staticBlack` · `onSea` · `onCloud` (normal/subtle/muted/disabled) |
| `surface.border.*` | `gray`(normal/subtle/muted) · `primary`(normal/muted) |
| `feedback.{background,border,text,icon}.*` | `positive negative notice information neutral` (+ `subtle`/`intense` on bg/border) |
| `interactive.{background,text,icon,border}.*` | `positive negative notice information neutral gray primary onPrimary staticWhite staticBlack` (normal/subtle/muted/disabled) |

Rule of thumb: text on a coloured surface → `surface.text.staticWhite.*`; a positive
icon → `interactive.icon.positive.normal`; a muted helper line → `surface.text.gray.muted`.

## Box — the layout primitive

Token-driven props: `padding paddingX paddingY paddingTop…`, `margin*`, `gap`,
`display`, `flexDirection`, `alignItems`, `justifyContent`, `flexWrap`, `flexGrow`,
`flexShrink`, `flexBasis`, `order`, `width/height/min/max`, `position`, `top/right/…`,
`zIndex`, `backgroundColor`, `borderRadius`, `borderWidth/Color` (+ per-side),
`elevation` (`none lowRaised midRaised highRaised`), `overflow`. All accept either a
single value or a `{ base, m, l }` responsive object.

## Component cheat-sheet (the ones you'll reach for)

| Need | Component(s) | Key props |
| --- | --- | --- |
| Type | `Display` `Heading` `Text` `Code` `Amount` | `size`, `weight`, `color`; `Amount` value/currency |
| Action | `Button` `IconButton` `Link` `ButtonGroup` | `variant` primary/secondary/tertiary, `icon`, `iconPosition`, `isLoading`, `isFullWidth`, `size`; `IconButton`/`Link(button)` need `accessibilityLabel` |
| Status | `Badge` `Indicator` `Counter` `Tag` `Spinner` `ProgressBar` `Alert` | `color` (feedback + primary), `emphasis` subtle/intense |
| Container | `Card`(+Header/Body/Footer) `Modal` `Drawer` `BottomSheet` `Collapsible` `Accordion` `Carousel` | Card is fixed style (gray.intense, medium radius); compose with subcomponents |
| Inputs | `TextInput` `TextArea` `PasswordInput` `SelectInput` `AutoComplete` `Checkbox(Group)` `Radio(Group)` `Switch` `OTPInput` `DatePicker` `TimePicker` `SearchInput` `PhoneNumberInput` | `label`, `value`, `onChange`, `validationState`, `helpText`, `isRequired` |
| Data | `Table` `List` `StepGroup`/`StepItem` `Chart*` `Pagination` `InfoGroup` | StepItem: `title`, `timestamp`, `description`, `marker` |
| People | `Avatar` `AvatarGroup` | Avatar `name` (initials), `src`, `size`, `color`; AvatarGroup `maxCount` |
| Nav/overlay | `TopNav` `SideNav` `Tabs`/`TabNav` `Menu` `Dropdown` `Tooltip` `Popover` `Breadcrumb` | overlays need a focusable trigger child |
| Feedback | `useToast()` → `toast.show({ content, color, leading })` | render `<ToastContainer />` once |
| Motion | `Fade` `Move` `Slide` `Scale` `Morph` `Stagger` | `isVisible`, `motionTriggers` |
| Icons | `*Icon` (hundreds), e.g. `SparklesIcon` `CheckCircleIcon` `MapPinIcon` | `size`, `color` (icon tokens) |
| Empty/loading | `EmptyState` `Skeleton` | — |

`import { useTheme } from '@razorpay/blade/components'` → `{ theme, colorScheme, setColorScheme }`
for reading token values (e.g. building a gradient) or driving dark mode.

## Scoring it on the 5 lenses (same rubric as Level 1)

- **Aesthetics** — one spacing rhythm, one type scale, restrained palette, consistent radii.
- **Ease of use** — one primary action, scannable, labelled, low cognitive load.
- **Copy & story** — tight, warm microcopy; make the moment feel something.
- **Interactions** — use Blade's real hover/press/focus/loading; add toast/motion intent.
- **Systems thinking** — tokens everywhere, reusable prop-driven components, theme-agnostic.

## Reusable pieces already in this repo

`src/components/MetaRow.tsx` · `SectionHeading.tsx` · `Reveal.tsx` (token-timed entrance)
are generic enough to drop into a Level 2 build.
