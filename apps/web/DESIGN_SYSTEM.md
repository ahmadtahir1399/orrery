# TaskNebula Design System

**Verified:** 2026-09-17

This is the implementation contract for TaskNebula's web UI. Read
[`DESIGN.md`](DESIGN.md) first: it owns product intent, page archetypes, flow
evidence, and acceptance. This document owns reusable visual and interaction
decisions.

The authority chain is:

```text
DESIGN.md (intent and evidence)
  -> DESIGN_SYSTEM.md (token and component contract)
    -> src/app/globals.css + tailwind.config.ts (token implementation)
      -> src/components/ui (reusable mechanics)
        -> domain components and routes
```

If code and this contract disagree, verify the intended behavior and repair
both in the same change. Neither a stale document nor an incidental CSS value
wins silently.

## Core language

The public product name is **Orrery**; code, packages, storage keys, and these
documents keep the `TaskNebula` identifiers.

The Workbench is calm and precise: white cards on a near-white neutral canvas,
near-black ink, and one emerald green for action. Dark mode is a neutral
near-black (`#1c1c1c` canvas), never navy or pure black. At the owner's
direction the palette follows Supabase's public design language; only the
color and type approach is borrowed, never its assets, logos, icons, or copy.

- Typography and spacing establish hierarchy before color or shadow.
- One primary emerald (`#3ecf8e`) communicates action. It is a **fill** color:
  `bg-primary` pairs with dark `text-primary-foreground` (`#171717`). Emerald
  fails contrast as text on white, so Tailwind maps `text-primary` to
  `--primary-text` (`#007a47` light, `#3ecf8e` dark), `border-primary` to
  `--primary-emphasis`, and `ring-primary` to `--primary-ring`. Never set
  emerald text on a light surface with an arbitrary value.
- Semantic color communicates real state, priority, risk, or category. Every
  text pairing in `globals.css` is checked against WCAG AA (4.5:1) in light
  and dark mode.
- No decorative "AI" palettes: no blue-to-violet gradients, neon accents, or
  glow. The logo mark is flat: an emerald check and orbit on a near-black tile.
- Navigation recedes; work, ownership, provenance, and the next handoff lead.
- Use fewer surfaces and borders. Avoid nested generic cards.
- Dark mode and keyboard behavior are first-class.
- Gradients, glass, dot grids, glows, and ornamental icon tiles are not product
  decoration. The public landing has a bounded exception documented under
  [Public landing](#public-landing-landing-dark).

### Workbench shell

- The global rail is the darkest and quietest layer. It uses icon-only
  destinations with accessible names; tiny multi-line labels are not navigation.
- The context panel uses neutral surfaces and readable local labels. Its active
  row is expressed with position, contrast, and a restrained action accent—not
  a large saturated tile.
- The desktop work canvas is an accountable inset surface with one perimeter,
  one command bar, and one content grid. It becomes edge-to-edge below the
  desktop breakpoint.
- Page headers and view toolbars align with the primary data surface. Avoid a
  page header floating at one width above a table or board at another width.
- Global search, create, and quick actions live in the command bar. Route-local
  filters and view controls live beside the data they affect.
- The desktop shell uses a 48px global rail and a 228px context panel. The
  context panel may be collapsed from the rail; persist that preference and
  remove the collapsed panel from the focus order rather than visually hiding
  interactive descendants.
- The command bar is 44px tall. Project context navigation uses the same quiet
  chrome token and a thin active underline; it must not become a second dark
  global rail.
- Mobile gets a five-destination bottom navigation and full-width route
  composition. Desktop sidebars do not shrink into the mobile viewport.

## Tokens

Use semantic Tailwind tokens; do not add arbitrary hex values when a token
exists.

| Intent                     | Preferred tokens                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Page and elevated surface  | `bg-background`, `bg-card`, `bg-surface`, `bg-surface-2`                                       |
| Primary and secondary text | `text-foreground`, `text-muted-foreground`                                                     |
| Action                     | `bg-primary`, `text-primary`, `text-primary-foreground`                                        |
| Neutral interaction        | `bg-muted`, `bg-accent`                                                                        |
| Status                     | `success`, `warning`, `destructive`, `info` token families                                     |
| Soft status tint           | `bg-primary-soft`, `bg-success-soft`, `bg-warning-soft`, `bg-destructive-soft` + matching text |
| Category                   | `accent-blue`, `accent-violet`, `accent-cyan`, `accent-emerald`, `accent-amber`, `accent-rose` |
| Edge and focus             | `border-border`, `border-border-strong`, `ring-ring`                                           |

Accent hues are semantic and sparse. They do not create a rainbow navigation
or a grid of interchangeable colored cards.

### Radius

The values are implemented by CSS variables and Tailwind:

| Token          |    Value | Use                                          |
| -------------- | -------: | -------------------------------------------- |
| `rounded-sm`   |      4px | compact tags, small metadata                 |
| `rounded-md`   |      6px | buttons, inputs, menus, interactive defaults |
| `rounded-lg`   |     12px | cards, dialogs, substantial panels           |
| `rounded-xl`   |     12px | public landing surfaces (same value as `lg`) |
| `rounded-2xl`  |     18px | the landing's single closing band only       |
| `rounded-full` | circular | avatars, dots, genuinely circular controls   |

`rounded-full` is for avatars, dots, counts, and soft status/due pills that
carry a text label. Do not introduce `rounded-xl` or `rounded-2xl` on ordinary
product cards.

### Elevation

- Cards (`surface-card`) rest on a hairline border with a neutral `shadow-xs`
  so white surfaces separate from the near-white canvas; nested content needs
  no extra shadow.
- Menus/popovers use `shadow-sm`; dialogs may use `shadow-lg`.
- Hover must not make content jump. Prefer border/color response over large
  lift or scale effects.
- Glow shadows are reserved for an explicitly approved public emphasis, not
  authenticated product state.

## Motion

Motion explains state, location, or response; it is not a finish layer.

- Interactive feedback: 150–200ms.
- Animate named properties (`transition-colors`, `transition-opacity`,
  `transition-transform`). Product UI does not use `transition-all`.
- An entrance may run up to 400ms only when it clarifies location or a major
  state change. Existing 500ms+ entrance utilities are legacy, not defaults.
- Ambient animation is reserved for real live/pending state and must not
  compete with the work.
- Never hide required information until an animation completes.
- Every motion path must remain usable with `prefers-reduced-motion`.

Use existing easing/timing tokens. Add a new keyframe only when a reusable,
evidence-backed behavior cannot be expressed with current primitives.

### Landing motion scale

The public landing is allowed ambient motion, but it runs on one system so it
reads as calm and deliberate rather than busy (`.landing-dark` tokens):

- **Easing**: `--lp-ease` (expo-out) for anything that enters or settles;
  `--lp-ease-inout` for every loop; `--lp-ease-out` for short state changes.
  No springs with visible overshoot on large surfaces — the hero deck and the
  journey traveller move on tweens.
- **Durations**: `--lp-dur-fast` 160ms (hover, pills), `--lp-dur` 320ms (state),
  `--lp-dur-slow` 640ms (reveals, entrances). Staggers are 40–110ms.
- **Cadence**: every ambient loop is a multiple of `--lp-loop-half` (6s) or
  `--lp-loop` (12s) — board loop 12s, illustration loops 6s, comets and
  packets 6s, bob 12s, aura 16s, border light 10s, beams 18–24s. Nothing runs
  on a 1–4s clock except a caret blink and the live dot (3s), and label swaps
  crossfade instead of stepping.
- **Budget**: one ambient loop per region; two background beams, not four; the
  border light sweeps only the front deck layer, the active journey station and
  the active story slide. No `filter: blur()` or `drop-shadow()` inside an
  animated path (the deck fades through a scrim, the thread glow is a wide
  translucent stroke). Loops pause offscreen (`.lp-live`) and reduced motion
  removes all of them.
- **Motion says something.** The hero's floating agent and activity panels
  step aside while the Build view is in front (`.lp-stage[data-front='build']`)
  because that view already carries both. An arriving activity row expands into
  the list (`lpa-feed` animates its height) rather than sitting invisible in a
  gap. The orrery is a turn-taking sequence on the 12s loop: a satellite pulses
  as it sends, its packet runs the arm, the board ripples on landing, and one
  card advances to-do → doing → done — never a decorative spin alone.
- **Reveals hide instantly and only the entrance animates.** Transitions on
  `.lp-reveal` and `.lp-line` exist only once an element has been seen or is
  in view; otherwise server-rendered content would fade _out_ after hydration.

## Composition primitives

### Buttons and controls

Use the primitives in `src/components/ui` before writing custom markup.

- Primary: `Button` default variant.
- Secondary: `outline`.
- Tertiary: `ghost`.
- Destructive: `destructive` with explicit confirmation/recovery where needed.
- Keep a stable label or accessible name during pending state; disable duplicate
  submission and show completion or actionable failure.

### Page frame, headers, and tabs

- `PageFrame` owns the shared content measure (up to 1480px), responsive page
  padding, and vertical rhythm. Route components should not recreate its outer
  gutters.
- `PageHeader` keeps identity and description on the leading edge and the next
  scoped action on the trailing edge. Secondary actions may wrap or disclose;
  the title must remain the only page-level `h1`.
- Shared tabs are compact text controls on one baseline with a 1px active
  underline. Avoid rounded active tiles, side-tab accents, or a second card
  around the tab list.
- `.command-header` joins board/list/detail toolbars to the quiet chrome layer
  so controls read as part of the work surface rather than a floating banner.

### Cards and panels

- A card groups one coherent decision or object. It is not the default wrapper
  for every section.
- Prefer one outer surface plus spacing or `surface-inset` to card-in-card
  nesting.
- `surface-card`, `surface-inset`, and `row-interactive` are implementation
  helpers, not permission to make every page a card grid.
- The existing user-selectable glass appearance is legacy compatibility. New
  components must remain legible without relying on blur and should not add
  new glass-only treatment.
- Workbench surfaces use quiet tonal separation: page canvas, primary data
  surface, then inset/selected state. Do not give every widget its own shadow.
- Dense cards and rows show identity and state first. Optional metadata yields
  before titles truncate or action targets become too small.
- Use `MetricStrip` for a short, comparable evidence row. It is a continuous
  border-y ledger with dividers and tabular numerals—not a set of KPI cards.

### Badges and status

A badge is earned by status or compact metadata. Status and due-date pills use
a soft tint with matching text and a leading dot (`bg-destructive-soft
text-destructive`, `bg-primary-soft text-primary`, …). Never encode state by
color alone: the pill always carries its label.

### Agent evidence

- Agent activity belongs to the work object or accountable operating surface,
  not an ornamental chatbot card.
- Keep human ownership, run kind, run state, source/evidence, proposed effect,
  approval requirement, and durable result visually distinguishable whenever
  the backend exposes them.
- A dashboard agent watch area may summarize real runs and pending approvals,
  but it must permission-gate review data and must not imply preview-only work
  was applied.
- Detail activity uses flat evidence rows and a chronological ledger. Reserve
  status color for real runtime state; do not invent confidence scores.

### Typography and numbers

- Use size and weight before color for hierarchy.
- Figtree (self-hosted variable font, SIL OFL) is the interface face for the
  workbench, auth, public pages, and email. Base UI text is 14/20; 12/16 is
  reserved for metadata and navigation support. Page titles are 22–26px
  semibold with slightly tightened tracking.
- Section eyebrows (`.kicker`) are 11px semibold uppercase sans captions.
- Identifiers and machine evidence use JetBrains Mono; prose does not.
- Plus Jakarta Sans remains a user-selectable alternative. The retired IBM
  Plex preference (`ibm`) migrates to Figtree.
- Comparisons, metrics, times, and aligned counts use `tabular-nums`.
- Long-form text keeps a readable measure.

### Focus and accessibility

- Reuse Radix/shadcn focus behavior. Custom controls need a visible
  `focus-visible` ring and semantic element/role.
- Focus returns after a dialog closes and moves to the failing field after
  validation when appropriate.
- Hover-only actions also appear on focus and remain available to touch.
- Check 320px and 390px widths plus at least one RTL locale for layout changes.

## Page-specific modifiers

`.dashboard-carbon` is a dashboard-scoped density modifier. It provides a calm
canvas and compact row feedback; it is not a second global design system and
must not leak into other archetypes. The first viewport uses a dated greeting
header, a subordinate summary card (`MetricStrip` with a completion footer),
one dominant attention queue, and a narrower agent/deadline rail. Standup,
pinned work, and delivery analysis stay progressively disclosed and do not
fetch until opened.

### Public landing (`.landing-dark`)

The landing (`src/app/page.tsx`, sections in `src/components/marketing/`) is
the one surface allowed dimensional decoration, and it earns it by showing the
real product. `.landing-dark` scopes its own `--landing-*` tokens (white or
`#121212` canvas, `--landing-accent` text vs `--landing-accent-fill` buttons).
Display type is Figtree 500 with negative tracking (`.landing-display`,
`.landing-title`); there are no eyebrows or gradient text. The only numbers in
the type are the two-digit mono chapter marks on the story rail and the
principles list (`.lp-chapter-index`).

- **The page is one story, read top to bottom.** Hero (the promise) → facts
  strip (`facts-strip.tsx`, only verifiable capabilities, never logos or
  counts) → the story (`story-section.tsx` + `story-scroller.tsx`: one issue's
  path through intake, plan, build, ship) → feature bento → agents → the five
  commitments (`principles-section.tsx`, mirrored from `PRODUCT.md`) → FAQ →
  closing band. Copy lives under `publicPages.landing.*`; the story chapters
  reuse `workflow.steps.*` and every claim in `build` names a real MCP tool.
- **The story is a journey, and one issue rides it.** `StoryJourney` pins
  the section for (legs + 1) screens and scrolls the page sideways along a
  drawn thread. Four stations (intake, plan, build, ship) are the live views
  with WEB-31 rendered as a dashed ghost slot (`ThreadCard mode="ghost"`);
  one traveller — the card itself, in the four shapes from `useThreadShapes`
  — rides the thread from slot to slot, holding at each station
  (`threadPosition`), while the line draws just ahead of it and arches over
  the next chapter's text. Anchors are measured from offset chains so scroll
  transforms cannot skew them; RTL mirrors the station order (the story runs
  right to left) with the track kept in LTR pixels. Everything is scrubbed to
  scroll; nothing runs on a timer. The pills at the bottom are real
  `aria-pressed` controls that scroll to a station. Below `lg`, under reduced
  motion, and without JavaScript the same chapters render as a vertical stack
  (`.lp-story-stack`); CSS picks the layout, so no state is branched on
  `useReducedMotion()`.
- **Hover brightens, it never restarts.** Illustrations loop on their own
  (`.lp-live` pauses them offscreen; `.lp-reveal` keys off the one-shot
  `data-seen` so cards do not re-hide). Hover and `[data-active]` may only
  change colour, background, shadow, or a property the loop does not animate.
  Never start, stop, or replace an animation on hover, and never redraw icons.
- **`html`/`body` under the landing use `overflow-x: clip`, never `hidden`.**
  `hidden` turns them into scroll containers and silently breaks every
  `position: sticky` on the page (nav, story stage).
- **The product is rendered in code, never screenshots.** `live-app.tsx` builds
  the workspace (`LiveBoard`), the activity feed and agent run panels
  (`LiveActivity`, `LiveAgent`), and the tour views (`LiveIssues`,
  `LiveSprint`) from `.lpa-*` classes. One 12s CSS loop drives them: a card is
  dragged into review, an agent run completes its tool calls and creates an
  issue, and registered integer properties (`--lpa-n`) tick the counts. Labels
  reuse the app's translated strings (`issuesViews`, `kanban.column`, `nav`,
  `dashboard`); keys, initials, and figures are sample data. A finished frame
  holds under reduced motion.
- **The hero is a deck, and depth comes from CSS 3D, not a WebGL runtime.**
  `HeroStage` stacks the four live views (board, issues, build, sprint) in
  depth: the front one is sharp and carries the border light, the rest recede
  up and back, blurred. The deck advances on its own every ~5s (paused on
  hover, offscreen, and under reduced motion) and the pills beneath it are
  real `aria-pressed` controls for the same deck, with a fill that shows the
  turn's progress. The rig settles from a tilt on scroll, leans toward the
  pointer, and the two floating panels parallax at deeper `translateZ` while
  bobbing on an idle loop. Entrance choreography is CSS gated on
  `data-armed`, animating only an inner wrapper so Framer's transforms are
  never overridden. Isometric keycaps, the raised orrery board, and the
  wireframe globe are true 3D faces (`preserve-3d`) from `lp-*` classes.
- **Hero spark stays around the product:** a soft emerald aura, a light that
  sweeps the front window's border (`.lpa-glow`, registered `--lpa-angle`), a
  drawn underline under the accent phrase, and a preview pill. None of it sits
  behind body text.
- **Header (`MarketingNav`)** is translucent with a backdrop blur, gains a
  hairline and shadow once scrolled (`data-scrolled`), and runs a scroll-spy:
  the section in view gets a shared-layout highlight that also follows hover.
  It stays opaque enough (≥ 78%) that nothing behind it can read as a state.
  Below `lg` the menu is a sheet (`MobileMenu`): 48px rows, both calls to
  action, a dimmed backdrop, focus moved to the first link, Escape to close,
  and the page locked behind it.
- **Phones and tablets are a first-class layout, not a squeezed desktop.**
  Product windows switch to a compact mode by container query
  (`@container (max-width: 540px)` on `.lpa-window`): 2×2 stats, no sidebar,
  wrapped two-line card titles, chips hidden, list rows without the state
  pill. Because it is container-driven, the same rules apply to the hero deck
  and to story slides regardless of viewport. The story below `lg` is a snap
  carousel of chapter cards (`.lp-story-slides`, keyboard-focusable, with
  `aria-pressed` dots) and the facts row snap-scrolls as cards below `sm`.
  Footer link columns sit side by side on phones.
- **Touch and WCAG contract.** Every landing control is at least 44px tall on
  coarse pointers (`@media (pointer: coarse)`), links carry `min-h-11` on
  phones, and the page passes axe with `wcag2a/2aa/21a/21aa` at 390, 768 and
  1440 px, in reduced motion, with zero violations. Two rules that came from
  real failures: never dim a layer that contains text with element `opacity`
  (the hero deck uses a per-depth scrim `::before` instead, so text keeps its
  contrast), and never render an attribute from `useReducedMotion()` (the
  pill progress fill is switched off in CSS under reduced motion).
- **Icons are line art, not image tiles.** `LineIcon` renders a Lucide glyph at
  stroke 1.5 that redraws itself when its host is active. Feature cards use
  line illustrations (`bento-visuals.tsx`) drawn from `--lp-line*` tokens with
  one emerald accent, and they may bleed past the card edge. An illustration
  shows a real capability: command names reuse the app's translated labels,
  and identifiers such as `WEB-18` are sample data.
- **Cards are alive when idle and brighten on hover.** Each illustration loops
  gently while on screen; hover styles key off
  `.lp-card:is(:hover, [data-active='true'])`, and `SpotlightGroup` feeds a
  pointer-following spotlight. `InView activate` sets `data-active` while a card
  is on screen on devices without hover, so touch visitors see the same motion.
- **Background patterns stay behind content and stay quiet:** the hero grid with
  travelling beams (`HeroGrid`), a dot field (`DotField`), and the bracket
  glyph field on the dark closing band (`GlyphField`), all in `patterns.tsx`.
- **Content is visible by default.** `InView` sets `data-armed` only after
  hydration, so reveal styles apply to `[data-armed='true']:not([data-inview='true'])`
  and no-JS, crawlers, and screenshots still see everything. Ambient loops
  (`.lp-live`) pause offscreen.
- **Reduced motion and `data-animations='false'`** remove every loop and beam,
  show revealed content, flatten the hero stage (`.lp-rig`), rest the orbit and
  globe, and jump hover timelines to their end state. Never branch rendered
  styles on `useReducedMotion()`; it differs between server and client and
  breaks hydration. Express the reduced state in CSS instead.
- Code samples (`pre`) are `dir="ltr"` in every locale. One-column grids use
  `grid-cols-[minmax(0,1fr)]` so long commands scroll inside their block
  instead of widening the page.
- Verify at 390px, in `ar`, in dark mode, and with reduced motion; the
  `e2e/public-surfaces.spec.ts` contract requires one `h1`, no document
  overflow, and a light or dark `.landing-dark` background.

## Loading states

- `app/[locale]/loading.tsx` shows the branded `AppLoadingScreen` while the
  authenticated shell resolves; `app/[locale]/(app)/loading.tsx` shows an
  in-shell `RouteLoadingSkeleton` for routes without their own loader.
- A route loader, its page `Suspense` fallback, and its client pending state
  render the same shell (see the dashboard) so hand-offs never jump.
- `Skeleton` (`.shimmer`) is a solid `--skeleton` block with a transform-only
  light sweep; it is disabled by reduced motion and `data-animations="false"`.
- Wait for the first real answer (`isPending`), and give failures an explicit
  error state with retry instead of an empty state.

## Internationalization

All new user-facing text, accessible names, placeholders, toasts, and errors
use `next-intl`. Examples in documentation describe structure rather than
copy-pastable English JSX. Add each key with a real translation to all 30
catalogs, preserve ICU placeholders, and run `pnpm i18n:check`.

Static lint catches only part of this rule; review configuration objects and
props manually.

## Replacement guide

| Avoid                                | Use                                           |
| ------------------------------------ | --------------------------------------------- |
| arbitrary gray/hex utilities         | semantic surface/text tokens                  |
| heavy nested shadows and borders     | spacing plus one accountable surface          |
| generic `transition-all`             | property-specific transition                  |
| `rounded-xl/2xl` generic cards       | `rounded-lg`                                  |
| non-circular `rounded-full` controls | `rounded-md` or `rounded-sm`                  |
| decorative gradient/glass/icon tile  | hierarchy or real work topology               |
| mixed icon sizes in one row          | one consistent Lucide size                    |
| simulated success                    | persisted success or explicit retry/recovery  |
| hardcoded visible copy               | `next-intl` key in all catalogs               |
| icon rail with 9px wrapped labels    | icon destination + tooltip/accessibility name |
| duplicated global and local action   | one scoped command/action surface             |
| desktop drawer squeezed onto mobile  | full-screen mobile detail                     |

## Change and verification

Token changes belong in the shared implementation and must update this
contract when they alter behavior. Route-specific preferences stay local.

Run from the repository root:

```bash
pnpm ui:check
pnpm i18n:check
pnpm --filter @tasknebula/web type-check
pnpm --filter @tasknebula/web lint
pnpm --filter @tasknebula/web test
```

For visible changes, also exercise the real route with keyboard and pointer in
light/dark, mobile/desktop, relevant loading/error states, and RTL when layout
can change. Follow the maker/checker evidence loop in `DESIGN.md`.
