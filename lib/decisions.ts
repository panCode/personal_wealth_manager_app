/**
 * The decisions the CFO can bring to the user. Static catalogue; their live
 * state (proposed / approved / declined / placed / settled) lives in the store.
 */

export type DecisionKind = "rebalance" | "sip-change" | "prepay" | "insurance" | "tax";

export type Leg = { side: "sell" | "buy" | "set"; name: string; sub: string; amount: number };

export type Decision = {
  id: string;
  kind: DecisionKind;
  eyebrow: string;
  title: string;
  summary: string; // one-liner for cards
  why: string;
  reviewedBy: string;
  reviewedOn: string; // ISO
  takes: string;
  impact?: { label: string; now: number; after: number; unit: "%" };
  impactNote?: string;
  facts: Array<{ label: string; value: string; sub: string }>;
  ifApproved: string[];
  legs: Leg[];
  rail: string;
  settleDays: number;
  activityTitle: string;
  approvedToast: string;
};

export const decisions: Record<string, Decision> = {
  "rebalance-1": {
    id: "rebalance-1",
    kind: "rebalance",
    eyebrow: "Decision · Rebalance",
    title: "Move ₹1.2L from Bluechip Large-cap to Flexi-cap",
    summary: "Rebalance: move ₹1.2L out of large-caps that drifted past target",
    why: "Large-caps rallied this year and now make up 41% of your equity, against a plan of 35%. Left alone, your portfolio takes more single-segment risk than you signed up for.",
    reviewedBy: "Meera Iyer",
    reviewedOn: "2026-09-26",
    takes: "takes 1 min",
    impact: { label: "Large-cap share of equity", now: 41, after: 35, unit: "%" },
    impactNote: "Back to the plan you and Meera agreed in January.",
    facts: [
      { label: "Tax impact", value: "₹0", sub: "Units older than a year, gains within the ₹1.25L LTCG exemption" },
      { label: "Exit load", value: "₹0", sub: "Past the 1-year load period" },
    ],
    ifApproved: [
      "We place a switch order through BSE StAR MF.",
      "You confirm with the OTP the exchange sends you.",
      "Units settle in 2–3 working days. We'll show you when it's done.",
    ],
    legs: [
      { side: "sell", name: "Bluechip Large-cap Fund, direct", sub: "Folio 1234567/89 · ≈ 2,140 units at today's NAV", amount: 120_000 },
      { side: "buy", name: "Flexi-cap Fund, direct", sub: "Same fund house, so no bank hop", amount: 120_000 },
    ],
    rail: "BSE StAR MF",
    settleDays: 3,
    activityTitle: "Rebalance ₹1.2L large-cap → flexi-cap",
    approvedToast: "Rebalance approved. Switch order placed, settles by 1 Oct.",
  },

  "stepup-1": {
    id: "stepup-1",
    kind: "sip-change",
    eyebrow: "Decision · SIP step-up",
    title: "Raise the retirement SIP from ₹22,000 to ₹26,000 from October",
    summary: "Step up retirement SIP by ₹4,000 in October",
    why: "Your retirement goal is ₹4,000 a month short of the pace it needs for 2055. Your salary revision lands in October, which covers the increase without touching anything else.",
    reviewedBy: "Meera Iyer",
    reviewedOn: "2026-09-26",
    takes: "takes 1 min",
    facts: [
      { label: "Retire at 60", value: "On track", sub: "₹4.2 Cr by 2055 in today's money" },
      { label: "Left for goals", value: "₹62,000", sub: "Unchanged after the revision" },
    ],
    ifApproved: [
      "We raise the SIP mandate on your Flexi-cap and NPS from 1 October.",
      "You approve the new eNACH amount with your bank's OTP.",
      "First higher instalment goes on 20 October.",
    ],
    legs: [{ side: "set", name: "Retirement SIP", sub: "Flexi-cap ₹15,000 → ₹18,000 · NPS ₹7,000 → ₹8,000", amount: 26_000 }],
    rail: "eNACH mandate",
    settleDays: 1,
    activityTitle: "Retirement SIP stepped up to ₹26,000",
    approvedToast: "SIP step-up approved. New mandate starts 1 Oct.",
  },

  "subs-1": {
    id: "subs-1",
    kind: "sip-change",
    eyebrow: "Decision · Small win",
    title: "Move ₹700 a month from two unused subscriptions to the emergency fund",
    summary: "Cancel two unused subscriptions, add ₹700 to the emergency SIP",
    why: "Two subscriptions haven't been opened in 90 days. ₹700 a month into the liquid fund brings the emergency-fund date forward by two months.",
    reviewedBy: "Meera Iyer",
    reviewedOn: "2026-09-27",
    takes: "takes 1 min",
    facts: [
      { label: "Emergency fund", value: "Jan 2027", sub: "Two months earlier than Mar 2027" },
      { label: "Per year", value: "₹8,400", sub: "Goes to the liquid fund instead" },
    ],
    ifApproved: [
      "We send you the two cancel links; you tap them.",
      "The emergency SIP rises from ₹12,000 to ₹12,700 next month.",
      "You approve the new amount with your bank's OTP.",
    ],
    legs: [{ side: "set", name: "Emergency fund SIP", sub: "Liquid Fund · ₹12,000 → ₹12,700", amount: 12_700 }],
    rail: "eNACH mandate",
    settleDays: 1,
    activityTitle: "Emergency SIP raised by ₹700, two subscriptions cancelled",
    approvedToast: "Approved. Emergency SIP goes to ₹12,700 from next month.",
  },

  "prepay-1": {
    id: "prepay-1",
    kind: "prepay",
    eyebrow: "Decision · Loan prepayment",
    title: "Prepay ₹1.9L of the home loan, keep ₹1.1L for the emergency fund",
    summary: "Prepay ₹1.9L of the home loan from the bonus; ₹1.1L to the emergency fund",
    why: "Your loan is at 8.6% for 14 more years. Prepaying most of the bonus saves interest, but the emergency fund is short by ₹1.1L, so that goes in first.",
    reviewedBy: "Meera Iyer",
    reviewedOn: "2026-09-27",
    takes: "takes 2 min",
    facts: [
      { label: "Interest saved", value: "≈ ₹2.6L", sub: "Over the remaining tenure" },
      { label: "Loan shortens by", value: "7 months", sub: "EMI stays ₹38,400" },
    ],
    ifApproved: [
      "₹1.1L moves from savings to the liquid fund today.",
      "We raise the ₹1.9L prepayment request with SBI; you confirm it in your SBI app.",
      "SBI updates the schedule in 2 working days.",
    ],
    legs: [
      { side: "buy", name: "Liquid Fund", sub: "Emergency fund top-up", amount: 110_000 },
      { side: "sell", name: "SBI home loan, part-prepayment", sub: "Account ••••4521 · no prepayment charge on floating rate", amount: 190_000 },
    ],
    rail: "BSE StAR MF + SBI",
    settleDays: 2,
    activityTitle: "Prepaid ₹1.9L of the home loan, topped up emergency fund",
    approvedToast: "Approved. Prepayment request sent to SBI.",
  },
};

export function getDecision(id: string): Decision | undefined {
  return decisions[id];
}
