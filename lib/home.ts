/**
 * What Home shows, computed from the persona, the goal formulas and the
 * store. Pure functions so the screen stays thin and the rules are testable.
 * The rule for every line here: it must say what changed (DESIGN.md §1.3).
 */
import { decisions, type Decision } from "./decisions";
import type { GoalsComputed } from "./goals";
import { dayMonth, inr, inrFull } from "./format";
import { persona } from "./persona";
import type { DecisionRecord, Onboarding } from "./store";

type Live = Record<string, DecisionRecord>;

/** Decisions the CFO brings to Home, in the order they are offered. */
const QUEUE = ["rebalance-1", "stepup-1"];

/** "Decision · Rebalance" → "Rebalance" */
function shortName(d: Decision) {
  return d.eyebrow.split("·").pop()?.trim() ?? d.eyebrow;
}

export function statusOf(live: Live, id: string) {
  return live[id]?.status ?? "proposed";
}

/** The single open decision, or null when nothing needs the user. */
export function oneThing(live: Live): Decision | null {
  const id = QUEUE.find((d) => statusOf(live, d) === "proposed");
  return id ? decisions[id] : null;
}

/** "Up ₹1.2L this month. On plan." — what moved, then what it means. */
export function verdict(goals: GoalsComputed, ob: Onboarding, live: Live): { moved: string; meaning: string } {
  const c = persona.netWorth.monthChange;
  const moved = c > 0 ? `Up ${inr(c)} this month.` : c < 0 ? `Down ${inr(-c)} this month.` : "Flat this month.";
  if (!ob.connections.bank) return { moved, meaning: "Link your bank to see the full picture." };
  const retireShort = statusOf(live, "stepup-1") === "proposed" ? goals.retire.shortBy : 0;
  const offTrack = [goals.emergency.onTrack, goals.home.onTrack, retireShort <= 0].filter((ok) => !ok).length;
  return { moved, meaning: offTrack === 0 ? "On plan." : offTrack === 1 ? "One goal needs a nudge." : `${offTrack} goals need a nudge.` };
}

export type MovedRow = { key: string; label: string; sub: string; value: string; href: string };

/**
 * Up to three rows, in priority order, each only when its change clears a
 * threshold. A quiet month returns fewer rows; the screen says so instead of
 * padding.
 */
export function whatMoved(live: Live, ob: Onboarding): MovedRow[] {
  const rows: MovedRow[] = [];
  const p = persona;

  // 1 · the user's own orders, placed or settled
  for (const id of Object.keys(live)) {
    const d = decisions[id];
    const r = live[id];
    if (!d || !r) continue;
    if (r.status === "placed") {
      const settles = new Date(r.at);
      settles.setDate(settles.getDate() + d.settleDays);
      rows.push({ key: `placed-${id}`, label: `${shortName(d)} placed`, sub: `settles by ${dayMonth(settles.toISOString())}`, value: inr(d.legs.reduce((s, l) => s + l.amount, 0) / Math.max(1, d.legs.length)), href: "/activity" });
    } else if (r.status === "settled") {
      rows.push({ key: `settled-${id}`, label: `${shortName(d)} settled`, sub: `done ${dayMonth(r.at)}`, value: "Done", href: "/activity" });
    }
  }

  // 2 · investments, when the market moved them by at least ₹10k
  if (Math.abs(p.netWorth.investmentsChange) >= 10_000) {
    const c = p.netWorth.investmentsChange;
    rows.push({ key: "investments", label: "Investments", sub: c >= 0 ? "mostly markets" : "markets dipped; SIPs kept buying", value: `${c >= 0 ? "+" : "−"}${inr(Math.abs(c))}`, href: "/portfolio" });
  }

  // 3 · spending, when this month is 5% off the usual, and only with a bank linked
  if (ob.connections.bank) {
    const diff = p.spending.total - p.spending.usual;
    if (Math.abs(diff) >= p.spending.usual * 0.05) {
      rows.push({ key: "spending", label: "Spending", sub: `${inrFull(Math.abs(diff))} ${diff < 0 ? "under" : "over"} your usual`, value: inr(p.spending.total, { decimals: 0 }), href: "/spending" });
    }
  }

  // 4 · SIPs that ran this month
  const sips = p.goals.reduce((s, g) => s + g.sip, 0);
  rows.push({ key: "sips", label: "SIPs", sub: `went in on the ${p.sipDay}th`, value: inr(sips), href: "/plan" });

  return rows.slice(0, 3);
}

/** Next month's SIP date, for the calm card's "next check-in" line. */
export function nextCheckIn(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, persona.sipDay);
  return dayMonth(d.toISOString());
}
