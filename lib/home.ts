/**
 * What Home shows, computed from the persona, the goal formulas and the
 * store. Pure functions so the screen stays thin and the rules are testable.
 * The rule for every line here: it must say what changed (DESIGN.md §1.3).
 */
import { suggested } from "./answers";
import { decisions, type Decision } from "./decisions";
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

/**
 * The figures that roll under the hero number, in order: this month, all
 * time, and the money-weighted return. Signed, never coloured, no words about
 * the plan. The all-time figure is the portfolio's gains, so it matches
 * Portfolio › Performance.
 */
export function heroStats(): Array<{ value: string; label: string }> {
  const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${inr(Math.abs(n))}`;
  return [
    { value: signed(persona.netWorth.monthChange), label: "this month" },
    { value: signed(persona.netWorth.allTimeChange), label: "all time" },
    { value: `${persona.portfolio.xirr3y.toFixed(1)}%`, label: "a year, after fees" },
  ];
}

export type MovedRow = { key: string; label: string; sub: string; value: string; href: string };

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** When a placed order settles: the time it was placed plus the decision's settle days. */
function settleDate(at: string, d: Decision) {
  const s = new Date(at);
  s.setDate(s.getDate() + d.settleDays);
  return s;
}

/**
 * Placed orders whose settle date has passed, with the moment they settled.
 * No exchange calls back in the prototype, so the hydrator marks these settled
 * once per load and Home and History both move on.
 */
export function overdueOrders(live: Live, now = new Date()): Array<{ id: string; settledAt: string }> {
  const out: Array<{ id: string; settledAt: string }> = [];
  for (const [id, r] of Object.entries(live)) {
    const d = decisions[id];
    if (!d || r.status !== "placed") continue;
    const s = settleDate(r.at, d);
    if (s.getTime() <= now.getTime()) out.push({ id, settledAt: s.toISOString() });
  }
  return out;
}

/**
 * Up to three rows, in priority order, each only when its change clears a
 * threshold. A quiet month returns fewer rows; the screen says so instead of
 * padding. At most one order row, the most recent this month, so a busy
 * approver still sees Investments and Spending below it.
 */
export function whatMoved(live: Live, ob: Onboarding, now = new Date()): MovedRow[] {
  const rows: MovedRow[] = [];
  const p = persona;

  // 1 · the user's most recent order this month, placed or settled
  const latest = Object.entries(live)
    .filter(([id, r]) => decisions[id] && (r.status === "placed" || r.status === "settled") && sameMonth(new Date(r.at), now))
    .sort(([, a], [, b]) => b.at.localeCompare(a.at))[0];
  if (latest) {
    const [id, r] = latest;
    const d = decisions[id];
    if (r.status === "placed") {
      rows.push({ key: `placed-${id}`, label: `${shortName(d)} placed`, sub: `settles by ${dayMonth(settleDate(r.at, d).toISOString())}`, value: inr(d.legs.reduce((s, l) => s + l.amount, 0) / Math.max(1, d.legs.length)), href: "/activity" });
    } else {
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

/**
 * The three Ask chips on Home, from the user's situation: a loan → prepay,
 * a health policy → cover, a linked bank → the three-month spend view (else
 * the SIP-for-the-house question), then the discovery order fills the rest.
 */
export function askChips(ob: Onboarding): string[] {
  const picks: string[] = [];
  if (persona.loans.length) picks.push("prepay");
  if (persona.protection.health.cover > 0) picks.push("insurance");
  picks.push(ob.connections.bank ? "spends-3m" : "sip-house");
  for (const id of suggested) if (picks.length < 3 && !picks.includes(id)) picks.push(id);
  return picks.slice(0, 3);
}
