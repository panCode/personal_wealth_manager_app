# Home v2 — spec

Status: **proposed, awaiting Nikhil's sign-off on P1–P3 in `DESIGN.md`.** Build in
Phase B. Read `DESIGN.md` first; this document only says what Home shows and
where each line comes from.

## Why Home changes

The user opens the app for three jobs, in this priority:

1. Check where they stand: net worth, how the investments are doing.
2. Ask something: "what does my health cover include", "my spends over the last
   three months", "can I prepay the loan, and how much".
3. Buy or sell something themselves. Lowest priority; not on Home.

Home v1 answers job 1 with eight blocks and shows numbers that do not move
(goal targets, the SIP plan, the WM card). Home v2 answers all three in four
blocks and shows only what moved. The rule is the "since you last opened" test
in `DESIGN.md` §1.3.

## Structure (top to bottom)

```
┌───────────────────────────────────┐
│ 1 SKY BAND                        │  time-of-day gradient, greeting,
│   Good evening, Aditya            │  the one number, the verdict
│   ₹48.6L                          │
│   Up ₹1.2L this month. On plan.   │
├───────────────────────────────────┤
│ 2 ONE THING THIS WEEK             │  ochre card, or the calm empty state
├───────────────────────────────────┤
│ 3 WHAT MOVED                      │  0–3 generated rows
├───────────────────────────────────┤
│ 4 ASK YOUR CFO                    │  input + 3 chips from state
└───────────────────────────────────┘
  bottom nav (per P2)
```

Nothing else. No bell, no badge, no goal bars, no SIP plan, no WM card, no
"watched today" list, no tiles. Prototype footer ("This is a prototype… Start
over") stays, muted, under block 4.

### 1 · Sky band

- Gradient by local hour (client-only, after `hydrated`, same pattern as the
  greeting today): dawn 05–09, day 09–17, dusk 17–20, night 20–05. A thin
  horizon line and two soft hills in `ground` at the bottom edge blend the band
  into the page.
- Greeting + date: `greeting()`, `dayLine()` from `lib/format.ts` (exist).
- The number: `persona.netWorth.total` → `inr()` → "₹48.6L". Count-up on first
  paint, 450ms, skipped under reduced motion.
- The verdict, one sentence, two parts:
  - what moved: `persona.netWorth.monthChange` → "Up ₹1.2L this month." /
    "Down ₹40k this month." / "Flat this month."
  - what it means: from `computeGoals()`: all `onTrack` → "On plan."; one goal
    short → "One goal needs a nudge." (the nudge is then block 2); not linked →
    "Link your bank to see the full picture."
- Variant per **P1**: number-first (above) or verdict-first (big "On plan.",
  net worth 26px under it). Build one; keep the other as a flag only if cheap.
- A 12-month line (`persona.sparkline`), 60px tall, no axes, no dots, single
  `accent` stroke, never red.

### 2 · One thing this week

Source: the first decision in `lib/decisions.ts` whose store status is
`proposed` (today: `rebalance-1`; after it is approved/declined, `stepup-1`).
At most one. Card in `ochre-soft` with an `ochre` dot, eyebrow "ONE THING THIS
WEEK", title = decision `title`, meta = "Meera reviewed · takes 1 min", action
"Look →" to `/decision/[id]`.

Empty state (no `proposed` decision): a plain card, no colour —
"Nothing needs you this week. Your money is doing its job. — Meera". This state
must look *better* than the card with a decision, not emptier.

### 3 · What moved

Rows generated from state, maximum three, in this priority, each shown only if
its threshold is met. Row = label · one number · one phrase.

| Row | Source | Threshold | Example |
|---|---|---|---|
| Investments | portfolio month change (add `persona.portfolioMonthChange` or derive from groups) | ≥ ₹10k | "Investments +₹94k · mostly markets" |
| Spending | `persona.spending.total` vs `usual` | ≥ 5% either way | "Spending ₹78k · ₹4,600 under usual" |
| SIPs | sum of `goals[].sip` (12k + 28k + 20k) | ran this month (persona: the 5th) | "SIPs ₹60k went in on the 5th" |
| Milestone | any goal `saved` crossing a round number this month | crossed | "Home fund crossed ₹11.5L" |
| Order settled | store decision with status `placed` → `settled` | this month | "Rebalance settled · 1 Oct" |

Quiet month: the block collapses to one line, "Quiet month. Nothing moved more
than usual." Do not pad.

Tapping a row goes to the screen that owns it (Portfolio, Spending, Plan,
Activity).

### 4 · Ask your CFO

- Input, 16px, placeholder "Ask anything about your money". Submitting routes
  to `/ask?text=<encoded>` (add `text` seeding next to the existing `?q=` id
  seeding in `app/ask/page.tsx`) so the answer renders on the Ask screen with
  its chips and booking.
- Three chips from state, using `lib/answers.ts` ids. Pick order:
  has a loan → `prepay`; has health policy → `insurance`; always → `spending`;
  then fill from `suggested[]` minus already-asked. Chip copy is the answer's
  `question`.
- Below the chips, muted: "What people like you asked this week · 3" linking to
  `/ask` (static for the prototype).

## What moves where

| Leaves Home | Goes to |
|---|---|
| Goal progress bars, targets, "On track · Aug 2027" | Plan, which leads with what moved and shows targets second, smaller |
| "How we get you there" (SIP plan, step-up, tax row) | Plan; the tax row becomes a `What moved` row only when it changes |
| Bell + badge | Removed. The one-thing card is the notification. Notification *settings* stay at `/notifications` via settings |
| WM card | Meera's name on the one-thing card; the "Talk" booking stays in Ask |
| "Your CFO watched today" | Activity (or History, per P2) |

## States to design, not just the happy path

1. Decision pending (today's default).
2. Nothing pending (after approving `rebalance-1` and `stepup-1`).
3. Quiet month (no row clears its threshold).
4. Bank not linked (`onboarding.connections.bank === false`): verdict line
   changes; Spending row absent; chip set swaps `spending` for `sip-house`.
5. Night, 11 pm: sky is night; everything still legible (`ink` on the light
   lower half; `surface` text only inside the dark top).

## Acceptance (add to `scripts/flows.mjs`, section `home`)

- Home renders exactly four blocks (count `section` elements or a data-attr).
- No `danger`/`attn` colour on Home when no decision is overdue.
- After approving `rebalance-1`, the one-thing card shows `stepup-1`; after
  approving that too, the empty state copy is present.
- Submitting a question from Home lands on `/ask` with that question as the
  first message.
- `document.documentElement.scrollWidth === 390` at 390 wide.

## Out of scope for this spec

Dark theme, a real model behind Ask, live data, push notifications. The sky is
cosmetic; it never encodes financial state.
