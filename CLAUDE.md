@AGENTS.md
@DESIGN.md

# Working in this repo

Personal CFO prototype: a phone-first PWA (Next.js 16 App Router, Tailwind v4,
Zustand persisted to localStorage). Fake data, real flows. `README.md` has the
run/deploy steps; `DESIGN.md` (loaded above) has the design rules; `docs/` has
per-screen specs.

## Source of truth, in this order

1. `docs/<screen>.md` — what a screen shows and why (e.g. `docs/home-v2.md`).
2. `spec/*.dc.html` — the design-canvas mocks, one file per screen. Port from
   these; don't invent layout.
3. `lib/persona.ts` (every number), `lib/goals.ts` (goal formulas),
   `lib/scenarios.ts` (what-ifs), `lib/decisions.ts` (the decisions the CFO
   brings), `lib/answers.ts` (scripted Ask answers, routing guarded by
   `npm run check:ask`).
4. `components/ui.tsx` — primitives. Extend them; don't restyle inline.

Never type a ₹ figure into a screen that the lib can compute. If two screens
disagree on a number, the lib is right and the screen is wrong.

## Before changing a screen

- Read its `docs/` spec if there is one, and `DESIGN.md` §0 for what is still
  pending. Pending items are not to be built; ask.
- Keep the phone frame honest: 390 wide, nothing scrolls horizontally, tap
  targets ≥ 44px, inputs 16px, `.safe-top`/`.safe-bottom` on edges.
- Client-only values (clock, user agent, `window`) are read only after the
  store's `hydrated` flag, never in a `useEffect` that calls `setState`
  (`react-hooks/set-state-in-effect` is an error here). See
  `components/InstallBanner.tsx` and the greeting in `app/home/page.tsx`.
- Typographic apostrophes (’) in JSX text; `react/no-unescaped-entities` is on.

## Verify, every time

```bash
npm run check          # eslint + tsc + Ask routing table
npm run build          # must be clean; Turbopack, static where possible
npm run dev            # then, in another shell:
npm run shots          # every route → shots/*.png, fails on overflow or console errors
npm run flows          # click-through: core loop, onboarding, informed, ship
```

`shots` and `flows` need Playwright's Chromium once: `npx playwright install
chromium`. They default to `http://localhost:3000`; set `BASE_URL` otherwise.
Look at the screenshots; a passing script is not a reviewed screen.

To see it on a phone: `npm run dev -- -H 0.0.0.0`, then open
`http://<laptop-ip>:3000` on the phone (same Wi-Fi). `next.config.ts`
`allowedDevOrigins` must list that IP.

## Git

- Work on `design-v2`. `main` is what testers are using; don't push there
  without Nikhil saying so.
- One phase per commit (`DESIGN.md` §10), message starts with the phase:
  `Phase A: tokens, type scale, SkyBand`.
- Commit the `AGENTS.md` block `next dev` rewrites rather than fighting it.
