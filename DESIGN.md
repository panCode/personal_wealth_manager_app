# DESIGN.md — the rules every screen follows

This file is loaded into every Claude Code session through `CLAUDE.md`. It is the
contract for the "design v2" work: calm, unboring, low cognitive load. When a
request conflicts with a rule here, say so and ask before building.

The product promise, which every screen serves: **the user carries no cognitive
load.** A personal CFO, built by real wealth managers, watches everything and
brings the user one decision at a time. The user approves; a named human is
accountable.

## 0 · Decisions (all settled, 1 Oct 2026)

- **P1 Home hero: number-first.** Big ₹ net worth, monthly cadence, verdict in words under it. No date, no greeting in the band.
- **P2 Bottom tabs: 4** — Home · Portfolio · Plan · Ask. Activity becomes "History", reached from Settings (the gear on Home) and from the "placed/settled" rows in What moved.
- **P3 Direction: B, dusk & cream.** Cream page; the sky band on Home follows the clock and goes dark only at night. Samples that were chosen: `spec/HomeV2B.dc.html`, `spec/HomeV2BCalm.dc.html`.
- **P4 Built in the cloud session**, one phase per commit on `design-v2`; Nikhil reviews on the Vercel preview and his phone.

## 1 · Principles

1. **Calm is the absence of alarms.** Nothing on Home is red unless an action is
   overdue. The app must be able to say "Nothing needs you this week" and mean it.
2. **One thing at a time.** At most one open decision is shown anywhere. Never a
   list of alerts, never a badge count greater than 1.
3. **Show what moves, not what stands.** The "since you last opened" test: every
   element on Home must be able to say what changed since the last visit or in
   the last month. Static numbers (a retirement corpus 30 years out, a sum
   insured, a loan tenure) live in Plan/Portfolio or behind Ask, and surface on
   Home only on the day they change, as a decision. Targets are context;
   progress is content.
4. **Words first, digits second.** "Up ₹1.2L this month. On plan." before any
   chart. A sentence invites understanding; a score invites comparison.
5. **Humans are the warmth.** Meera (the wealth manager) is the face, not a
   mascot. Her name appears wherever a human stands behind a number.

## 2 · What we borrow and what we refuse

Borrowed from Headspace: one "today" card; a sky that reflects the time of day
(mood without information); organic shapes and big radii; copy that talks like
a kind person; "what others asked" as social proof for Ask.

Refused, from the dark-fintech pattern (Novelty, trading apps): scores
(37/100), red sparklines, 1-day change, "3 goals need attention!", jargon chips,
crowns/premium badges, cards inside cards, more than one number per card.

## 3 · Tokens

Existing (`app/globals.css`, Tailwind v4 `@theme`): `ground #f4f1ea`, `surface
#fff`, `sunken #eeebe3`, `ink #16201d`, `ink-2`, `muted`, `faint`, `line`,
`line-2`, `accent #0e6b55` (+ `-soft/-mid/-pale/-light/-dark`), `attn #b4540a`
(+ `-text/-soft/-line`), `danger #a8322b`.

To add in Phase A (direction B; names are proposals, keep them if nothing
better comes up):

```
--color-ochre:        #c2742a   /* "one thing for you" — warm, never an alarm */
--color-ochre-soft:   #f6e7d3
--sky-dawn:   linear-gradient(180deg, #f3d9c4 0%, #e9d6e4 60%, var(--color-ground) 100%)
--sky-day:    linear-gradient(180deg, #d9e6ee 0%, #ecefe9 60%, var(--color-ground) 100%)
--sky-dusk:   linear-gradient(180deg, #d9cfe6 0%, #ecd9d4 60%, var(--color-ground) 100%)
--sky-night:  linear-gradient(180deg, #2a2f4a 0%, #4a4463 55%, var(--color-ground) 100%)
--radius-card: 20px   (from 14)   --radius-card-lg: 24px   (from 16)
```

Colour as meaning, and only as meaning: green = on plan / growth; ochre = for
you (the `attn` tokens now carry these ochre values, so every "needs you"
state across the app is the same warm colour as the one-thing card); rust
(`danger`) = an error or an overdue action, rare; everything else neutral.
Never colour a number by its sign: a negative return is written in words, in ink.

## 4 · Type

- Display and all large numbers: **Fraunces Variable** (`font-display`). Use the
  SOFT axis at large sizes; it is literally a calmer serif.
- Text and UI: **Manrope Variable** (`font-sans`).
- Scale (px / line-height): hero number 44/1.05 · screen title 26/1.15 ·
  card title 17/1.3 · body 15/1.5 · meta 13/1.4 · eyebrow 11/1 uppercase
  tracking 0.08em. Fewer sizes, bigger steps.
- Indian grouping and compact units everywhere: ₹48.6L, ₹2.2 Cr, ₹81,300. Never
  ₹48,61,234 on Home.

## 5 · Shape and surfaces

- Cards: tone-on-tone (`surface` on `ground`), no borders, no shadows, radius
  20–24. One idea per card. No card inside a card; use whitespace and type
  hierarchy instead.
- Lists: rows with a 1px `line` divider, 56px min height, chevron only when the
  row navigates.
- Buttons: one primary per screen (dark ink or accent), secondaries are ghost.
- Illustration: the sky band and a horizon/hills motif, two or three shapes, no
  faces, no stock icons as decoration. Icons only where they carry meaning.
- Tap targets ≥ 44px. Inputs 16px (iOS zoom). Safe areas via `.safe-top`,
  `.safe-bottom`. The phone frame is 390×844; nothing scrolls horizontally.

## 6 · Numbers

- One number per card; at most three on a screen above the fold.
- Monthly cadence on Home ("this month"); no 1-day change anywhere on Home.
- No scores, no percentages on Home. Percentages live in Portfolio and Plan.
- Every ₹ figure comes from `lib/persona.ts`, `lib/goals.ts` or
  `lib/scenarios.ts`. Never type a number into a screen that the lib can
  compute; the lib is the source of truth and the formulas must agree across
  Home, Plan, Ask, decisions and simulations.

## 7 · Copy

- Kind, specific, second person, short. No exclamation marks, no "attention!",
  no "optimise", no finance jargon without the plain word next to it.
- Sentence patterns: `<what moved>. <what it means>.` → "Up ₹1.2L this month.
  On plan." · `<verdict>. <cost>.` → "You can afford it. The bigger home moves
  from 2031 to 2033."
- A human name wherever a human stands behind it: "Meera reviewed · 1 min".
- Typographic apostrophes in JSX text (’), never `'` (lint rule).
- The calm states get the best writing: "Nothing needs you this week. Your
  money is doing its job."

## 8 · Motion

- 300–450ms, ease-out. Numbers count up gently on first paint; the sky drifts
  slowly; drawers slide. Nothing bounces, pulses or shakes.
- Respect `prefers-reduced-motion`: no count-up, no drift.

## 9 · Components

Existing (`components/ui.tsx`): Screen, TopBar, Footer, H1, Eyebrow,
SectionTitle, Card, DarkCard, Note, Row, RowText, IconBox, Pill, Chip,
Segmented, OptionGroup, Button, ProgressBar, Avatar. Plus BottomNav, Drawer,
Feedback, InstallBanner, PhoneFrame, inputs (MoneyInput), portfolio header.

Added in v2: `SkyBand` (time-of-day gradient, sun/moon, hills; `--sky-line` for
the sparkline colour), `CountUp` (unit-stable rupee count-up), and in
`app/home/page.tsx` the one-thing card, the What-moved rows and the Ask block,
fed by `lib/home.ts` (pure: `oneThing`, `verdict`, `whatMoved`).

## 10 · Phases and definition of done

All four phases shipped on `design-v2` on 1 Oct 2026 (commits: Phase A `b4d8885`, B `f6fae54`, C `bb9758d`, D below). The table stays as the definition of done for any later pass.

| Phase | Scope | Done when |
|---|---|---|
| A · Foundation | tokens above, type scale, radii, borderless cards, `SkyBand`, copy pass for apostrophes/exclamations | no screen's structure changed; `npm run check`, `npm run shots`, `npm run flows` pass; before/after shots of /home /plan /portfolio reviewed |
| B · Home v2 + nav | Home per `docs/home-v2.md`; tabs per P2; Plan absorbs targets and the SIP plan | flows pass; Home has ≤ 4 blocks; nothing with a 30-year horizon above the fold |
| C · Ask on Home | `AskBlock` with chips from state; answers for insurance coverage, 3-month spends, prepay (`lib/answers.ts`, guarded by `npm run check:ask`) | chips change with persona state; `check:ask` passes |
| D · Propagate | Portfolio, Activity → History, remove every red that isn't overdue | `npm run shots` reviewed screen by screen |

One phase per commit on `design-v2`. `main` stays what testers are using.
