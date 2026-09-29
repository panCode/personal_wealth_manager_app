import { inrFull } from "./format";

/**
 * Goal sizing. Pure functions with the assumptions in one place, so the
 * "how we sized this" drawer can show every input and recompute when one changes.
 * Money in rupees, rates per year, months as integers.
 */

export const assumptions = {
  inflation: 0.06,
  propertyGrowth: 0.07,
  equityReturn: 0.1, // long-horizon goals (retirement)
  balancedReturn: 0.09, // 3–8 year goals (home)
  liquidReturn: 0.065, // emergency fund
  postRetirementReturn: 0.07,
  epfReturn: 0.0825,
  downPaymentPct: 0.2, // lenders finance up to 80%
  stampDutyPct: 0.07, // Karnataka, stamp duty + registration + cess
  interiorsBuffer: 200_000,
  healthAndUpkeepInRetirement: 25_000, // per month, today's money, replaces the EMI that ends
  planToAge: 90,
  todayYear: 2026,
  todayMonth: 9,
};

const monthly = (annual: number) => annual / 12;

/** Months from today to the first day of `year`. */
export function monthsUntil(year: number, month = 1): number {
  return Math.max(1, (year - assumptions.todayYear) * 12 + (month - assumptions.todayMonth));
}

/** Future value of a lump sum plus a monthly SIP, monthly compounding. */
export function futureValue(lump: number, sip: number, annualRate: number, months: number): number {
  const r = monthly(annualRate);
  const g = Math.pow(1 + r, months);
  return lump * g + sip * ((g - 1) / r);
}

/** Monthly SIP needed to reach `target` from `saved` in `months`. */
export function sipNeeded(target: number, saved: number, annualRate: number, months: number): number {
  const r = monthly(annualRate);
  const g = Math.pow(1 + r, months);
  const remaining = target - saved * g;
  if (remaining <= 0) return 0;
  return remaining / ((g - 1) / r);
}

/** Months until `target` is reached at the current SIP (capped at 50 years). */
export function monthsToReach(target: number, saved: number, sip: number, annualRate: number): number {
  for (let m = 1; m <= 600; m++) if (futureValue(saved, sip, annualRate, m) >= target) return m;
  return 600;
}

export function addMonths(year: number, month: number, add: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + add;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

export const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/* ---------- Emergency fund ---------- */

export type EmergencyInput = {
  monthlyExpenses: number;
  spouseEarns: boolean;
  dependents: number; // children + parents supported
  incomeSteady: "steady" | "variable" | "uncertain";
};

export function emergencyGoal(i: EmergencyInput) {
  let months = 6;
  if (!i.spouseEarns && i.dependents > 0) months = 9;
  if (i.incomeSteady !== "steady") months += 3;
  months = Math.min(months, 12);
  const target = roundTo(months * i.monthlyExpenses, 50_000);
  return { months, target, derivation: `${months} × ${fmtL(i.monthlyExpenses)} monthly expenses` };
}

/* ---------- Home ---------- */

export type HomeInput = {
  budgetToday: number;
  year: number;
  saved: number;
  sip: number;
  sellCurrentFlat?: "yes" | "no" | "unsure";
  monthlyIncome: number;
  incomeGrowth?: number;
};

export function homeGoal(i: HomeInput) {
  const years = i.year - assumptions.todayYear;
  const priceThen = i.budgetToday * Math.pow(1 + assumptions.propertyGrowth, years);
  const down = priceThen * assumptions.downPaymentPct;
  const duty = priceThen * assumptions.stampDutyPct;
  const buffer = assumptions.interiorsBuffer;
  const total = roundTo(down + duty + buffer, 100_000);
  const months = monthsUntil(i.year, 12); // by the end of the target year
  const needed = sipNeeded(total, i.saved, assumptions.balancedReturn, months);
  const reachIn = monthsToReach(total, i.saved, i.sip, assumptions.balancedReturn);
  const reach = addMonths(assumptions.todayYear, assumptions.todayMonth, reachIn);
  const onTrack = reach.year <= i.year;
  // Affordability of the remaining loan at purchase time
  const loan = priceThen - down;
  const emi = emiFor(loan, 0.085, 20 * 12);
  const incomeThen = i.monthlyIncome * Math.pow(1 + (i.incomeGrowth ?? 0.08), years);
  const emiShare = emi / incomeThen;
  return { years, priceThen, down, duty, buffer, total, months, needed, reachIn, reach, onTrack, loan, emi, incomeThen, emiShare };
}

/** Standard EMI. */
export function emiFor(principal: number, annualRate: number, months: number): number {
  const r = monthly(annualRate);
  const g = Math.pow(1 + r, months);
  return (principal * r * g) / (g - 1);
}

/* ---------- Retirement ---------- */

export type RetireInput = {
  age: number;
  retireAt: number;
  lifestyle: "simpler" | "same" | "more";
  monthlyExpenses: number;
  emi: number; // ends before retirement
  saved: number; // retirement-tagged assets today
  sip: number;
  epfMonthly: number; // incl. employer
};

export function retireGoal(i: RetireInput) {
  const factor = i.lifestyle === "simpler" ? 0.8 : i.lifestyle === "more" ? 1.25 : 1;
  const spendToday = (i.monthlyExpenses - i.emi + assumptions.healthAndUpkeepInRetirement) * factor; // per month, today's money
  const yearsToRetire = i.retireAt - i.age;
  const yearsInRetirement = assumptions.planToAge - i.retireAt;
  // Real return during retirement: money must keep pace with inflation while it's drawn down
  const real = (1 + assumptions.postRetirementReturn) / (1 + assumptions.inflation) - 1;
  const annuity = (1 - Math.pow(1 + real, -yearsInRetirement)) / real;
  const corpusToday = spendToday * 12 * annuity; // in today's money
  const corpusThen = corpusToday * Math.pow(1 + assumptions.inflation, yearsToRetire); // nominal, at retirement
  const months = yearsToRetire * 12;
  const fromSaved = futureValue(i.saved, 0, assumptions.equityReturn, months);
  const fromEpf = futureValue(0, i.epfMonthly, assumptions.epfReturn, months);
  const gap = Math.max(0, corpusThen - fromSaved - fromEpf);
  const needed = sipNeeded(gap, 0, assumptions.equityReturn, months);
  const neededRounded = roundTo(needed, 1_000);
  const shortBy = Math.max(0, neededRounded - i.sip);
  return { spendToday, yearsToRetire, yearsInRetirement, corpusToday: roundTo(corpusToday, 1_000_000), corpusThen, fromSaved, fromEpf, gap, needed: neededRounded, shortBy, onTrack: shortBy === 0, year: assumptions.todayYear + yearsToRetire };
}

/* ---------- helpers ---------- */

function fmtL(n: number) {
  return inrFull(n);
}

/* ---------- Everything at once, from the onboarding answers ---------- */

import { persona } from "./persona";
import type { Onboarding } from "./store";

export function computeGoals(ob: Onboarding) {
  const expenses = ob.expenses.emi + ob.expenses.household + ob.expenses.rest;
  const emergency = emergencyGoal({
    monthlyExpenses: expenses,
    spouseEarns: ob.household.spouse === "earns",
    dependents: ob.household.children + ob.household.parents,
    incomeSteady: ob.household.incomeSteady,
  });
  const eg = persona.goals[0];
  const emergencyMonths = monthsToReach(emergency.target, eg.saved, eg.sip, assumptions.liquidReturn);
  const emergencyReach = addMonths(assumptions.todayYear, assumptions.todayMonth, emergencyMonths);

  const hg = persona.goals[1];
  const home = homeGoal({ budgetToday: ob.home.budgetToday, year: ob.home.year, saved: hg.saved, sip: hg.sip, sellCurrentFlat: ob.home.sellFlat, monthlyIncome: ob.income });

  const rg = persona.goals[2];
  const retire = retireGoal({
    age: persona.age,
    retireAt: ob.retire.retireAt,
    lifestyle: ob.retire.lifestyle,
    monthlyExpenses: expenses,
    emi: ob.expenses.emi,
    saved: rg.saved,
    sip: rg.sip,
    epfMonthly: 9_600,
  });

  return {
    expenses,
    surplus: ob.income - expenses,
    emergency: { ...emergency, saved: eg.saved, sip: eg.sip, reach: emergencyReach, onTrack: emergencyMonths <= 9 },
    home: { ...home, saved: hg.saved, sip: hg.sip },
    retire: { ...retire, saved: rg.saved, sip: rg.sip },
  };
}

export type GoalsComputed = ReturnType<typeof computeGoals>;
