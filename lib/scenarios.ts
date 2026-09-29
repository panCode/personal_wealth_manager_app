/**
 * What-if simulations. Each takes the user's current plan (from computeGoals)
 * and an event, and returns before/after numbers for the things they care
 * about: money left for goals, each goal's date, and wealth at 60.
 * Everything is an estimate; the assumptions are the ones in lib/goals.ts.
 */

import { addMonths, assumptions, emiFor, futureValue, monthsToReach, type GoalsComputed } from "./goals";
import { persona } from "./persona";
import type { Onboarding } from "./store";

export type CarInput = {
  price: number; // on-road
  down: number;
  years: number; // loan tenure
  rate: number; // annual
  running: number; // per month: fuel, insurance, service
  startYear: number;
  startMonth: number;
  raiseHomeSipAfterHike?: number; // optional: add to home SIP from Oct 2027
};

export const defaultCar: CarInput = { price: 1_200_000, down: 300_000, years: 7, rate: 0.092, running: 4_000, startYear: 2027, startMonth: 1 };

const BLENDED = 0.09; // portfolio-wide growth used for the net-worth path
const SALARY_GROWTH = 0.08;

/** Net worth path for the next `years` years, in rupees, yearly points. `hit` is a per-year cash drain by year index. */
function netWorthPath(years: number, annualSurplus: number, drain: (yearIdx: number) => number, asset: (yearIdx: number) => number) {
  const pts: number[] = [persona.netWorth.total];
  let nw = persona.netWorth.total;
  for (let y = 1; y <= years; y++) {
    const surplus = annualSurplus * Math.pow(1 + SALARY_GROWTH, y - 1); // the surplus is what the plan invests
    nw = nw * (1 + BLENDED) + surplus - drain(y);
    pts.push(nw + asset(y));
  }
  return pts;
}

/** Wealth at 60 in today's money, given a yearly cash drain during the first `drainYears`. */
function wealthAt60(annualSurplus: number, yearlyDrain: number, drainYears: number, upfront: number) {
  const years = 60 - persona.age;
  let nw = persona.netWorth.total - upfront;
  for (let y = 1; y <= years; y++) {
    const surplus = annualSurplus * Math.pow(1 + SALARY_GROWTH, y - 1);
    nw = nw * (1 + BLENDED) + surplus - (y <= drainYears ? yearlyDrain : 0);
  }
  return nw / Math.pow(1 + assumptions.inflation, years);
}

export function carScenario(input: CarInput, goals: GoalsComputed, ob: Onboarding) {
  const months = input.years * 12;
  const loan = Math.max(0, input.price - input.down);
  const emi = emiFor(loan, input.rate, months);
  const hit = emi + input.running;
  const surplusBefore = goals.surplus;
  const surplusAfter = surplusBefore - hit;

  // Home goal absorbs the hit (emergency and retirement stay untouched): its SIP drops by the hit.
  const homeSipAfter = Math.max(0, goals.home.sip - hit + (input.raiseHomeSipAfterHike ?? 0));
  const startOffset = (input.startYear - assumptions.todayYear) * 12 + (input.startMonth - assumptions.todayMonth);
  // Until the car arrives the home SIP is unchanged; after that it's reduced for the loan tenure, then restored.
  let saved = goals.home.saved;
  let reachIn = 600;
  for (let m = 1; m <= 600; m++) {
    const sip = m <= startOffset ? goals.home.sip : m <= startOffset + months ? homeSipAfter : goals.home.sip;
    saved = saved * (1 + assumptions.balancedReturn / 12) + sip;
    if (m === startOffset) saved -= input.down; // down payment comes from the home bucket, not the emergency fund
    if (saved >= goals.home.total) {
      reachIn = m;
      break;
    }
  }
  const homeReach = addMonths(assumptions.todayYear, assumptions.todayMonth, reachIn);

  // Wealth at 60, today's money
  const annualSurplus = surplusBefore * 12;
  const yearlyDrain = hit * 12;
  const w60Before = wealthAt60(annualSurplus, 0, 0, 0);
  const w60After = wealthAt60(annualSurplus, yearlyDrain, input.years, input.down);

  // 10-year net-worth path; the car is an asset that loses 15% a year, the loan a liability that amortises
  const carValue = (y: number) => (y < input.startYear - assumptions.todayYear + 1 ? 0 : input.price * Math.pow(0.85, y - (input.startYear - assumptions.todayYear)));
  const loanBalance = (y: number) => {
    const paid = Math.max(0, Math.min(months, (y - (input.startYear - assumptions.todayYear)) * 12));
    if (paid <= 0) return y >= input.startYear - assumptions.todayYear ? loan : 0;
    const r = input.rate / 12;
    return Math.max(0, loan * Math.pow(1 + r, paid) - emi * ((Math.pow(1 + r, paid) - 1) / r));
  };
  const carYear = input.startYear - assumptions.todayYear;
  const pathBefore = netWorthPath(10, annualSurplus, () => 0, () => 0);
  const pathAfter = netWorthPath(
    10,
    annualSurplus,
    (y) => (y === carYear || (carYear === 0 && y === 1) ? input.down : 0) + (y > carYear - 1 && y <= carYear + input.years - 1 ? yearlyDrain : 0),
    (y) => (y >= Math.max(1, carYear) ? carValue(y) - loanBalance(y) : 0)
  );

  const verdictAffordable = surplusAfter > 0 && emi < ob.income * 0.15;
  return {
    emi,
    hit,
    loan,
    surplusBefore,
    surplusAfter,
    homeSipAfter,
    homeReachBefore: goals.home.reach,
    homeReachAfter: homeReach,
    homeSlipYears: homeReach.year - goals.home.reach.year,
    w60Before,
    w60After,
    pathBefore,
    pathAfter,
    verdictAffordable,
  };
}

export type Alternative = { id: string; title: string; outcome: (r: ReturnType<typeof carScenario>) => string; input: (base: CarInput) => CarInput };

export const carAlternatives: Alternative[] = [
  { id: "used-3yr", title: "A 2-year-old used car at ₹7L, 3-year loan", outcome: (r) => `EMI ${fmt(r.emi)} · home ${r.homeReachAfter.year}`, input: (b) => ({ ...b, price: 700_000, down: 300_000, years: 3 }) },
  { id: "cash", title: "A ₹6L used car, paid in cash from the home bucket", outcome: (r) => `no EMI · home ${r.homeReachAfter.year} · cheapest at 60`, input: (b) => ({ ...b, price: 600_000, down: 600_000, years: 1, running: 3_500 }) },
  { id: "hike", title: "Keep the ₹12L car, put ₹10,000 of the 2027 hike into the home SIP", outcome: (r) => `home ${r.homeReachAfter.year} · assumes +8% salary`, input: (b) => ({ ...b, raiseHomeSipAfterHike: 10_000 }) },
  { id: "after-home", title: "Buy it after the home, in 2032", outcome: (r) => `EMI ${fmt(r.emi)} from 2032 · home stays ${r.homeReachAfter.year}`, input: (b) => ({ ...b, startYear: 2032 }) },
];

function fmt(n: number) {
  return `₹${Math.round(n / 100) * 100 >= 100000 ? (n / 100000).toFixed(1) + "L" : (Math.round(n / 100) * 100).toLocaleString("en-IN")}`;
}

/* ---------- Simpler what-ifs that are just the goal formulas with one input changed ---------- */

export function jobLossScenario(goals: GoalsComputed, months = 6) {
  const need = goals.expenses * months;
  const fund = goals.emergency.saved;
  const shortfall = Math.max(0, need - fund);
  const coveredMonths = fund / goals.expenses;
  // goals pause for `months`; each goal's reach date shifts by that
  return { need, fund, shortfall, coveredMonths, homeReach: addMonths(goals.home.reach.year, goals.home.reach.month, months), emergencyReach: addMonths(goals.emergency.reach.year, goals.emergency.reach.month, months + Math.ceil(shortfall / goals.emergency.sip)) };
}

export function raiseScenario(goals: GoalsComputed, ob: Onboarding, pct = 0.3) {
  const extra = Math.round(ob.income * pct);
  const surplusAfter = goals.surplus + extra;
  // Put half the raise to retirement, a quarter to home, keep a quarter
  const retireSip = goals.retire.sip + Math.round(extra * 0.5);
  const homeSip = goals.home.sip + Math.round(extra * 0.25);
  const homeReach = addMonths(assumptions.todayYear, assumptions.todayMonth, monthsToReach(goals.home.total, goals.home.saved, homeSip, assumptions.balancedReturn));
  const retireExtraAt60 = futureValue(0, Math.round(extra * 0.5), assumptions.equityReturn, (60 - persona.age) * 12) / Math.pow(1 + assumptions.inflation, 60 - persona.age);
  return { extra, surplusAfter, retireSip, homeSip, homeReach, retireExtraAt60, retireOnTrack: retireSip >= goals.retire.needed };
}
