/**
 * Scripted answers for the Ask screen. No model call: safe, free, and every
 * number matches the persona. Matching is by keyword; anything else gets the
 * honest fallback and an offer to route it to the wealth manager.
 */

export type Answer = {
  id: string;
  match: RegExp;
  question: string; // canonical phrasing, used for chips
  lead: string;
  facts?: Array<{ label: string; value: string; tone?: "attn" }>;
  body: string[];
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  footnote?: string;
};

export const answers: Answer[] = [
  {
    id: "prepay",
    match: /prepay|bonus|home loan|loan/i,
    question: "Should I prepay my home loan with the ₹3L bonus I got?",
    lead: "Short answer: prepay most of it, but not all.",
    facts: [
      { label: "Loan rate", value: "8.6% · 14 yrs left" },
      { label: "₹3L prepaid saves", value: "≈ ₹4.1L interest" },
      { label: "Emergency fund", value: "4.2 of 6 months", tone: "attn" },
    ],
    body: [
      "Your emergency fund is still short by ₹1.1L. I'd put that in first, then prepay ₹1.9L. That trims about 7 months off the loan and keeps you safe if income stops.",
      "Want me to set this up as a decision for you to approve?",
    ],
    actions: [
      { label: "Yes, set it up", href: "/decision/prepay-1", primary: true },
      { label: "Show the maths", href: "/decision/prepay-1" },
    ],
    footnote: "Based on Meera's prepayment rule for your plan. Not a guarantee.",
  },
  {
    id: "regime",
    match: /regime|old or new|tax/i,
    question: "Old or new tax regime for me?",
    lead: "New regime, by about ₹18,000 this year.",
    facts: [
      { label: "Old regime tax", value: "₹2.14L" },
      { label: "New regime tax", value: "₹1.96L" },
      { label: "Deductions you use", value: "80C, HRA, NPS" },
    ],
    body: [
      "Your deductions add up to ₹2.4L. The old regime only wins above roughly ₹3.75L of deductions at your income, so the new one is cheaper.",
      "The one thing that could flip it: a big home-loan interest claim on a let-out property. You don't have one.",
    ],
    actions: [{ label: "See the full tax plan", href: "/notifications" }],
    footnote: "FY 2026–27 slabs. We re-check every January before your employer asks.",
  },
  {
    id: "sip-house",
    match: /sip enough|house|home|down payment|2031|2029/i,
    question: "Is my SIP enough for the house?",
    lead: "Yes for 2031. Not for 2029.",
    facts: [
      { label: "SIP today", value: "₹28,000 / month" },
      { label: "Needed for 2031", value: "₹28,000 / month" },
      { label: "Needed for 2029", value: "₹52,000 / month", tone: "attn" },
    ],
    body: [
      "₹9.8L saved plus ₹28,000 a month at about 10% gets to ₹40L by early 2031, which is the plan.",
      "Pulling it to 2029 needs ₹52,000 a month, or a smaller home, or selling the current flat first. Try the scenario if you want to see the trade-offs side by side.",
    ],
    actions: [{ label: "Try 'house by 2029'", href: "/scenarios", primary: true }],
  },
  {
    id: "gold",
    match: /gold|sgb/i,
    question: "Should I buy gold now?",
    lead: "Not now. You're at 3% and the plan allows up to 5%.",
    facts: [
      { label: "Gold today", value: "₹2.6L · 3%" },
      { label: "Plan ceiling", value: "5%" },
      { label: "Gold, last 12 months", value: "+31%" },
    ],
    body: [
      "Gold has run a long way and you're already inside the plan's range. Adding after a rally is buying comfort, not return.",
      "If you want more, the plan will nudge you towards 5% through SGBs when there's a dip or a fresh tranche. I'll bring that as a decision, not a tip.",
    ],
  },
  {
    id: "car",
    match: /car|vehicle/i,
    question: "Can I afford a ₹12L car?",
    lead: "You can. It costs you two years on the bigger home.",
    facts: [
      { label: "EMI + running", value: "₹18,600 / month" },
      { label: "Left for goals", value: "₹62,000 → ₹43,400" },
      { label: "Bigger home", value: "2031 → 2033", tone: "attn" },
    ],
    body: ["A used car at ₹8L or waiting until 2028 keeps the home on 2031. The simulation shows all three side by side."],
    actions: [{ label: "Open the simulation", href: "/simulate/car", primary: true }],
  },
  {
    id: "retire",
    match: /retire|4\.2|corpus/i,
    question: "How much do I need to retire?",
    lead: "₹4.2 Cr in today's money, by 60.",
    facts: [
      { label: "Spending at 60", value: "₹83k → ₹4.5L / month" },
      { label: "Years to fund", value: "60 to 85" },
      { label: "On track with", value: "₹26,000 / month", tone: "attn" },
    ],
    body: [
      "That's today's ₹83,000 a month, minus the EMI that ends, grown at 6% inflation, then funded from 60 to 85 at 7% returns. EPF and NPS cover part of it, so the SIP only fills the gap.",
      "You're at ₹22,000 a month; ₹26,000 closes it. The step-up is waiting for you on the Plan tab.",
    ],
    actions: [{ label: "See the step-up", href: "/decision/stepup-1", primary: true }],
  },
  {
    id: "crash",
    match: /crash|fall|market|drop|sell/i,
    question: "What if the market crashes?",
    lead: "You do nothing, and that's the plan.",
    facts: [
      { label: "Money you'd need soon", value: "Not in equity" },
      { label: "Equity horizon", value: "2031 and beyond" },
      { label: "At −10%", value: "We bring a buy, not a sell" },
    ],
    body: [
      "Your emergency fund and the next two years of the home goal sit in liquid and short-duration debt. A 20% fall in equity doesn't touch them.",
      "If it falls 10% or more, we'll bring you a decision to buy a little more, because that's when it's cheap. We won't bring you a sell.",
    ],
  },
];

export const fallback = {
  lead: "I'd rather not guess on that.",
  body: ["It's outside what I can answer from your numbers alone. Meera can take it on your call; want me to add it to her list?"],
};

export function findAnswer(text: string): Answer | null {
  const t = text.toLowerCase();
  return answers.find((a) => a.match.test(t)) ?? null;
}
