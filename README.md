# Personal CFO — prototype

A phone-first, installable web app (PWA) for testing the "personal wealth manager for everyone" idea with friends and investors. Fake data, real flows.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zustand (persisted to localStorage) · self-hosted Fraunces + Manrope
- **Data:** one persona (`lib/persona.ts`), one decision catalogue (`lib/decisions.ts`). Nothing talks to a backend.
- **Design source:** `spec/*.dc.html` — the 21 screens from the design canvas, one file per screen. Port from these.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Deploy (Vercel)

1. Import this repo in Vercel (Add New → Project). Defaults are fine.
2. Optional: set `PASSCODE` in Project → Settings → Environment Variables to gate the link. Share it as `https://<your-app>.vercel.app/?key=<passcode>` and friends never see the gate. Leave unset to open it to anyone with the link.
3. Every push to `main` redeploys.

## Install on a phone

- **iPhone:** open the link in Safari → Share → *Add to Home Screen*.
- **Android:** Chrome shows an install prompt, or ⋮ → *Add to Home screen*.

## What works today

| Step | Screens | Status |
|---|---|---|
| 0 · Shell | PWA manifest, service worker, iOS meta, phone frame, tokens, primitives, passcode gate, feedback pill | ✅ |
| 1 · Core loop | Welcome → Home → Decision → Approve (OTP) → Activity, with state that survives reloads | ✅ |
| 2 · Money | Portfolio (allocation · holdings · performance), Plan, Ask with scripted answers and call booking | ✅ |
| 3 · Onboarding | Connect, About you (bank-connected and self-reported), Goals with the questions drawer and the "how we sized this" drawer; formulas in `lib/goals.ts` recompute live | ✅ |
| 4 · Informed | Notifications with per-category channel settings, WhatsApp preview, Spending (label + add spends), Scenarios, simulations (car with editable inputs; house-2029, retire-55, raise, job-loss) on `lib/scenarios.ts` | ✅ |
| 5 · Ship | Install nudge (iOS hint / Android prompt), tester settings with reset at `/settings` (tap the avatar on Home) | ✅ |

## Layout

```
app/                one folder per route
components/         primitives (ui.tsx), BottomNav, Drawer, Feedback, PhoneFrame, icons
lib/persona.ts      seed data — every number on every screen
lib/decisions.ts    the decisions the CFO can bring
lib/goals.ts        goal sizing formulas and assumptions
lib/scenarios.ts    what-if simulations
lib/answers.ts      scripted answers for Ask
lib/store.ts        user state (approvals, labels, events), persisted
lib/format.ts       ₹ formatting, Indian grouping
spec/               the design canvas, as HTML
proxy.ts            passcode gate
```

## Feedback and events

The floating tab on the right edge opens a feedback drawer. Notes are kept in localStorage and POSTed to `/api/feedback`, which logs them (Vercel → Logs). Every meaningful tap is recorded in the store's `events` array. To reset a tester's phone, tap the avatar on Home → Reset this prototype.
