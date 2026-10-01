/**
 * Scripted answers for the Ask screen. No model call: safe, free, and every
 * number matches the persona. Matching is by keyword; anything else gets the
 * honest fallback and an offer to route it to the wealth manager.
 *
 * `findAnswer` returns the first match in array order, so the array is in
 * match priority, specific before broad: car before loan ("car loan" is the
 * car answer), card before spending ("based on my spend, which card"), regime
 * before tax-save ("old or new tax regime"), the three-month view before
 * spending ("my spends over the past 3 months"). Chip order on the screen is
 * `suggested`, kept separate so discovery order can differ from match order.
 * `scripts/check-ask-matching.ts` guards the routing.
 *
 * Known near-misses, left alone on purpose: "top up my SIP" and "does my
 * emergency fund cover 6 months" land on insurance; "home budget" lands on
 * spending. Adjacent, not wrong.
 */

export type Answer = {
  id: string;
  match: RegExp;
  question: string; // canonical phrasing, used for chips; keep it short, chips don't wrap
  lead: string;
  facts?: Array<{ label: string; value: string; tone?: "attn" }>;
  body: string[];
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  footnote?: string;
};

export const answers: Answer[] = [
  {
    id: "prepay",
    match: /pre-?pay|part-?pay|bonus|lump.?sum|pay (it |the loan |my loan )?off|foreclos/i,
    question: "Prepay my home loan with the ₹3L bonus?",
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
    id: "car",
    match: /\bcars?\b|vehicle|two-?wheeler|\bbike\b/i,
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
    id: "loan",
    match: /\bloans?\b|\bemis?\b|tenure|outstanding|interest rate|repay/i,
    question: "How is my home loan going?",
    lead: "On track. ₹42.3L left at 8.6%, done in 14 years.",
    facts: [
      { label: "Outstanding", value: "₹42.3L · SBI, floating 8.6%" },
      { label: "EMI", value: "₹38,400 · 26% of take-home" },
      { label: "Ends", value: "14 years · 2040" },
    ],
    body: [
      "26% of take-home is healthy; lenders start worrying above 40%. There's no prepayment charge because the rate is floating, so nothing on the loan itself needs changing.",
      "Want it gone sooner? A lump sum and a higher EMI save the same interest for the same money; the difference is you can't un-raise an EMI. So prepay ₹1.9L from the bonus (7 months off, about ₹2.6L of interest saved) and keep the EMI at ₹38,400 so the surplus keeps feeding the three SIPs.",
    ],
    actions: [
      { label: "Prepay ₹1.9L from the bonus", href: "/decision/prepay-1", primary: true },
      { label: "If income stops", href: "/simulate/job-loss" },
    ],
    footnote: "SBI account ••••4521. Floating rate; we tell you the day it moves.",
  },
  {
    id: "card",
    match: /credit.?card|debit.?card|\bcards?\b|cashback|cash back|\breward|lounge/i,
    question: "Which credit card is best for me?",
    lead: "A flat-cashback card. Yours pays about ₹150 a month; the right one, about ₹850.",
    facts: [
      { label: "Card-able spend", value: "≈ ₹30,000 / month" },
      { label: "ICICI Coral today", value: "≈ 0.5% · ₹1,800 / year" },
      { label: "Axis Ace", value: "2–5% · ≈ ₹10,200 / year", tone: "attn" },
    ],
    body: [
      "Your card spend is groceries, utility bills, food delivery, subscriptions, dining and fuel, spread thin across brands, so a flat 2% card beats any single-brand card. Axis Ace pays 5% on utility bills (₹5,500 a month for you), 4% on Swiggy and Zomato (₹4,200) and 2% on the rest, for a ₹499 fee that's waived at your spend. That's about ₹700 a month more than the Coral.",
      "Two rules that matter more than the card: pay the full statement every month (card interest runs past 36% a year and wipes out years of rewards), and never spend to earn; 2% back on something you didn't need is 98% gone.",
    ],
    actions: [{ label: "See where the ₹30,000 goes", href: "/spending", primary: true }],
    footnote: "Reward rates are illustrative and change often; check the issuer's current terms. We earn nothing from any card.",
  },
  {
    id: "insurance",
    match: /insur|\bcover(age|ed)?\b|\bhealth(care)?\b|term (plan|life|cover|insurance|policy)|top.?up|floater|mediclaim|premium|\bpolicy\b|hospital|nominee/i,
    question: "Is my insurance cover enough?",
    lead: "Yes, on both. Term ₹1 Cr, health ₹35L after the top-up.",
    facts: [
      { label: "Term life", value: "₹1 Cr · adequate" },
      { label: "Health, family floater", value: "₹10L + ₹25L top-up" },
      { label: "All three cost", value: "≈ ₹38,500 a year" },
    ],
    body: [
      "₹1 Cr clears the ₹42.3L loan and leaves 12 years of what your family spends each month once the EMI is gone. That holds while the loan and your child are both in the picture; we size it again when the bigger home happens.",
      "Health: the ₹10L floater plus the ₹25L super top-up you approved on 3 Sep covers a ₹35L bill, enough for a serious Bengaluru hospital stay. The top-up only starts after ₹10L in a year, which is why it costs so little. The one thing we haven't sized is a separate policy for the parent you support; Meera can take that on your call.",
    ],
    actions: [
      { label: "Protection on your plan", href: "/plan", primary: true },
      { label: "Top-up in Activity", href: "/activity" },
    ],
    footnote: "Cover from your policies; the top-up renews 3 Sep 2027. Premiums are approximate.",
  },
  {
    id: "spends-3m",
    match: /(last|past|previous|over the)\s*(3|three|few|couple of)\s*months|month[- ]on[- ]month|\btrend|quarter/i,
    question: "My spends, last 3 months?",
    lead: "Down three months in a row: ₹84k, ₹81k, ₹78k.",
    facts: [
      { label: "July", value: "₹84,100 · 1% over usual" },
      { label: "August", value: "₹81,300 · 2% under" },
      { label: "September", value: "₹78,400 · 6% under" },
    ],
    body: [
      "Household and bills did most of it: down ₹3,900 a month since you switched broadband and electricity plans in August. Lifestyle crept the other way, up ₹1,700, almost all of it food delivery. The EMI hasn’t moved.",
      "Net, you are putting away about ₹4,600 a month more than your six-month average. That is why the emergency fund date moved up, and why I haven’t brought you a spending decision: there isn’t one to make yet, other than the two unused subscriptions.",
    ],
    actions: [
      { label: "See the three months", href: "/spending", primary: true },
      { label: "Cancel the two unused subscriptions", href: "/decision/subs-1" },
    ],
    footnote: "HDFC + ICICI statements via Account Aggregator, July to 27 September. Three September spends still need a label.",
  },
  {
    id: "spending",
    match: /spend|spent|subscription|food delivery|swiggy|zomato|blinkit|zepto|budget|expense|lifestyle|household|dining|eating out|where.*(money|salary)/i,
    question: "Am I overspending?",
    lead: "No. September is ₹4,600 under your usual, and one line is drifting.",
    facts: [
      { label: "September", value: "₹78,400 · 6% under usual" },
      { label: "Lifestyle", value: "₹9,900 · +21%" },
      { label: "Food delivery", value: "₹4,200 · +35%", tone: "attn" },
    ],
    body: [
      "Lifestyle is up because of food delivery: ₹4,200 this month, a third more than your six-month average. Not a problem at a ₹62,000 surplus, but it's the one line moving the wrong way. Household and bills are down 14%, and the EMI is 26% of take-home, which is healthy.",
      "The easy win is subscriptions: six of them, ₹2,150 a month, two not opened in 90 days. Cancelling those two saves ₹700 a month, ₹8,400 a year, and brings the emergency fund forward by two months.",
    ],
    actions: [
      { label: "Cancel the two unused", href: "/decision/subs-1", primary: true },
      { label: "See September", href: "/spending" },
    ],
    footnote: "HDFC + ICICI statements via Account Aggregator, to 27 Sep. Three spends still need a label.",
  },
  {
    id: "regime",
    match: /regime|old (or|vs\.?|versus) new|new (or|vs\.?|versus) old/i,
    question: "Old or new tax regime for me?",
    lead: "New regime, by about ₹18,000 this year.",
    facts: [
      { label: "Old regime tax", value: "₹2.14L" },
      { label: "New regime tax", value: "₹1.96L" },
      { label: "Deductions today", value: "₹2.4L · 80C, 80D" },
    ],
    body: [
      "Your deductions add up to ₹2.4L today, and at that level the new regime is cheaper.",
      "What could flip it: the ₹50,000 NPS deduction and the HRA you're not claiming. Those are the ₹31,000 on your Home screen; they only count under the old regime, so we run both again in January with your bonus and pick the cheaper one.",
    ],
    actions: [{ label: "See the full tax plan", href: "/notifications" }],
    footnote: "FY 2026–27 slabs. We re-check every January before your employer asks.",
  },
  {
    id: "tax-save",
    match: /\btax|80 ?c\b|80 ?d\b|80 ?ccd|\bnps\b|\bhra\b|deduction|elss|section 80|\bitr\b|\btds\b/i,
    question: "How do I save more tax this year?",
    lead: "Up to ₹31,000 more, from two things you're not using yet.",
    facts: [
      { label: "Saved so far, FY26", value: "₹46,800" },
      { label: "NPS 80CCD(1B), ₹50,000", value: "≈ ₹15,600 back" },
      { label: "HRA you're not claiming", value: "≈ ₹15,400 back", tone: "attn" },
    ],
    body: [
      "Both only count under the old regime. Today the new regime is ahead by about ₹18,000, so in January, with your bonus and the rent proof in hand, we run old-vs-new again and file whichever leaves you more. The ₹50,000 into NPS also counts towards retirement, so it isn't wasted either way.",
      "80C is already full through EPF, PPF and the ELSS (₹2.2L, lock-in ends March 2027), and your health premiums are claimed under 80D. Nothing more to do there before 31 March.",
    ],
    actions: [
      { label: "See the January reminder", href: "/notifications", primary: true },
      { label: "Your 80C holdings", href: "/portfolio/holdings" },
    ],
    footnote: "FY 2026–27, 30% slab plus cess, old-regime figures. We re-check both regimes in January.",
  },
  {
    id: "sip-house",
    match: /sip enough|\bhouse\b|\bhome\b|down.?payment|2031|2029|bigger (home|house|flat)/i,
    question: "Is my SIP enough for the house?",
    lead: "Yes for 2031. Not for 2029.",
    facts: [
      { label: "SIP today", value: "₹28,000 / month" },
      { label: "Needed for 2031", value: "₹28,000 / month" },
      { label: "Needed for 2029", value: "₹52,000 / month", tone: "attn" },
    ],
    body: [
      "₹11.2L saved plus ₹28,000 a month at about 9% gets to ₹40L by late 2031, which is the plan.",
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
    id: "retire",
    match: /retire|corpus/i,
    question: "How much do I need to retire?",
    lead: "₹2.2 Cr in today's money, by 60.",
    facts: [
      { label: "Spending at 60", value: "₹69,600 / month today" },
      { label: "Years to fund", value: "60 to 90" },
      { label: "On track with", value: "₹24,000 / month", tone: "attn" },
    ],
    body: [
      "That's today's ₹83,000 a month minus the EMI that ends, plus ₹25,000 for health and upkeep, grown at 6% inflation, then funded from 60 to 90 at 7% returns. Your EPF and what you've already saved cover most of it, so the SIP only fills the gap.",
      "You're at ₹20,000 a month; ₹24,000 closes it. The step-up is waiting for you on the Plan tab.",
    ],
    actions: [{ label: "See the step-up", href: "/decision/stepup-1", primary: true }],
  },
  {
    id: "crash",
    match: /crash|\bfall|\bfell\b|\bdrop|market|\bsell\b|\bdip\b|correction|nifty|sensex/i,
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

/** "People also ask" order. Discovery order, not match order: the new topics first. */
export const suggested = ["tax-save", "spending", "spends-3m", "insurance", "loan", "card", "sip-house", "retire", "regime", "gold", "car", "crash", "prepay"];

export const fallback = {
  lead: "I'd rather not guess on that.",
  body: ["It's outside what I can answer from your numbers alone. Meera can take it on your call; want me to add it to her list?"],
};

export function findAnswer(text: string): Answer | null {
  const t = text.toLowerCase();
  return answers.find((a) => a.match.test(t)) ?? null;
}
