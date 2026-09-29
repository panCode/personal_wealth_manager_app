/**
 * Seed data for the prototype. Every number on every screen comes from here,
 * so changing the persona changes the whole app consistently.
 * All money in rupees. All dates ISO.
 */

export const persona = {
  firstName: "Aditya",
  initials: "A",
  age: 31,
  city: "Bengaluru",
  state: "Karnataka",
  phoneMasked: "+91 98765 •••10",
  joined: "2026-01-01",
  today: "2026-09-27",

  wealthManager: { name: "Meera Iyer", initials: "MI", title: "SEBI-registered wealth manager", lastReview: "2026-09-01" },

  household: {
    spouse: "earns" as "earns" | "not-earning" | "none",
    children: 1,
    parentsSupported: 1,
    incomeSteady: "steady" as "steady" | "variable" | "uncertain",
  },

  income: { monthly: 145_000, source: "Salary credits · HDFC · last 6 months", other: 0 },
  expenses: {
    monthly: 83_000,
    breakdown: [
      { key: "emi", label: "EMI", amount: 38_400, color: "#16201D" },
      { key: "household", label: "Household & bills", amount: 28_000, color: "#0E6B55" },
      { key: "lifestyle", label: "Lifestyle", amount: 12_600, color: "#6FB79B" },
      { key: "other", label: "Other", amount: 4_000, color: "#C9C3B6" },
    ],
  },
  get surplus() {
    return this.income.monthly + this.income.other - this.expenses.monthly;
  },

  netWorth: { total: 4_860_000, assets: 9_090_000, loans: 4_230_000, monthChange: 120_000, monthChangePct: 2.5 },
  sparkline: [2, 30, 34, 32, 22, 24, 14, 16, 6],

  loans: [{ id: "home", label: "Home loan", lender: "SBI", outstanding: 4_230_000, rate: 8.6, emi: 38_400, yearsLeft: 14, dueDay: 5 }],

  protection: {
    term: { cover: 10_000_000, note: "Covers the loan and 12 years of family expenses" },
    health: { cover: 1_000_000, topUpSuggested: 2_500_000, topUpIssued: true },
  },
  tax: { savedFY: 46_800, morePossible: 31_000, notes: "NPS 80CCD(1B), HRA you're not claiming" },

  goals: [
    {
      id: "emergency",
      name: "Emergency fund",
      months: 6,
      target: 500_000,
      saved: 350_000,
      sip: 12_000,
      by: "2027-03-01",
      vehicle: "Liquid fund + sweep FD",
      status: "on-track" as GoalStatus,
      derivation: "6 × ₹83,000 monthly expenses",
    },
    {
      id: "home",
      name: "Bigger home",
      shortName: "Home down payment",
      budgetToday: 10_000_000,
      year: 2031,
      target: 4_000_000,
      saved: 1_120_000,
      sip: 28_000,
      by: "2031-12-01",
      vehicle: "Balanced funds",
      status: "on-track" as GoalStatus,
      derivation: "Upfront cash on a ₹1 Cr home, at 2031 prices",
      sellCurrentFlat: "unsure" as "yes" | "no" | "unsure",
    },
    {
      id: "retire",
      name: "Retire well",
      shortName: "Retire at 60",
      retireAt: 60,
      lifestyle: "same" as "simpler" | "same" | "more",
      year: 2055,
      target: 22_000_000, // today's money; see lib/goals.ts retireGoal()
      saved: 3_100_000,
      sip: 20_000,
      sipNeeded: 24_000,
      by: "2055-01-01",
      vehicle: "Equity funds + NPS + EPF",
      status: "behind" as GoalStatus,
      derivation: "Today's spending minus the EMI, 6% inflation, to age 90",
    },
  ],

  portfolio: {
    total: 9_090_000,
    invested: 6_820_000,
    gains: 2_270_000,
    fees3y: 110_000,
    xirr3y: 14.2,
    nifty3y: 12.9,
    allocation: [
      { key: "equity", label: "Equity mutual funds", pct: 52, target: 48, drift: "over" },
      { key: "epf", label: "EPF & PPF", pct: 17, target: 17 },
      { key: "debt", label: "Debt funds & FDs", pct: 18, target: 20 },
      { key: "stocks", label: "Direct stocks", pct: 8, target: 10 },
      { key: "gold", label: "Gold & cash", pct: 5, target: 5 },
    ],
    groups: [
      {
        key: "equity",
        label: "Equity mutual funds",
        count: 9,
        total: 4_730_000,
        holdings: [
          { id: "bluechip", goal: "retire", name: "Bluechip Large-cap Fund", sub: "Direct · XIRR 15.1% · SIP ₹10,000", value: 940_000, status: "action", decision: "rebalance-1" },
          { id: "flexi", goal: "retire", name: "Flexi-cap Fund", sub: "Direct · XIRR 18.4% · SIP ₹15,000", value: 780_000, status: "on-track" },
          { id: "midcap", goal: "retire", name: "Midcap Opportunities Fund", sub: "Direct · XIRR 21.0% · manager changed Aug", value: 610_000, status: "watching" },
          { id: "taxsaver", goal: "retire", name: "Tax Saver (regular plan)", sub: "Regular · XIRR 11.2% · lock-in to Mar 2027", value: 220_000, status: "lockin" },
        ],
        more: { count: 5, value: 2_180_000 },
      },
      {
        key: "debt",
        label: "Debt funds & FDs",
        count: 3,
        total: 1_640_000,
        holdings: [
          { id: "fd", goal: "home", name: "SBI fixed deposit", sub: "7.1% · matures 14 Mar 2027 · auto-renew off", value: 800_000 },
          { id: "shortdebt", goal: "home", name: "Short-duration Debt Fund", sub: "Direct · XIRR 7.1% · home goal, near-term", value: 490_000 },
          { id: "liquid", goal: "emergency", name: "Liquid Fund", sub: "Direct · XIRR 6.8% · emergency fund", value: 350_000 },
        ],
      },
      {
        key: "epf",
        label: "EPF & PPF",
        count: 2,
        total: 1_550_000,
        holdings: [
          { id: "epf", goal: "retire", name: "EPF", sub: "8.25% · ₹9,600 a month incl. employer", value: 1_210_000 },
          { id: "ppf", goal: "retire", name: "PPF", sub: "7.1% · matures 2038", value: 340_000 },
        ],
      },
      {
        key: "stocks",
        label: "Direct stocks",
        count: 3,
        total: 730_000,
        holdings: [
          { id: "hdfcbank", goal: "retire", name: "HDFC Bank", sub: "Zerodha · 180 shares · +22% since buy", value: 290_000 },
          { id: "infy", goal: "retire", name: "Infosys", sub: "Zerodha · 150 shares · +9% since buy", value: 240_000 },
          { id: "tatamotors", goal: "retire", name: "Tata Motors", sub: "Zerodha · 260 shares · −6% since buy", value: 200_000 },
        ],
      },
      {
        key: "gold",
        label: "Gold & cash",
        count: 2,
        total: 450_000,
        holdings: [
          { id: "sgb", goal: "retire", name: "Sovereign Gold Bonds", sub: "30 g · 2.5% interest + gold price", value: 260_000 },
          { id: "savings", goal: "none", name: "Savings balances", sub: "HDFC, ICICI · after this month's bills", value: 190_000 },
        ],
      },
    ] as PortfolioGroup[],
    movers: [
      { name: "Midcap Opportunities Fund", sub: "Best performer · 21.0% a year", amount: 240_000 },
      { name: "Flexi-cap Fund", sub: "Steady · 18.4% a year, low drawdown", amount: 210_000 },
      { name: "Tax Saver, regular plan", sub: "Fee drag vs the direct plan of the same fund", amount: -24_000 },
      { name: "Tata Motors", sub: "Only holding below cost · 2% of portfolio, no action", amount: -13_000 },
    ],
    byGoal: [
      { name: "Retire well", sub: "Equity-heavy, 29 years to go", xirr: 15.9 },
      { name: "Bigger home", sub: "Balanced, shifting to debt as 2031 nears", xirr: 10.4 },
      { name: "Emergency fund", sub: "Liquid on purpose, safety over return", xirr: 6.8 },
    ],
    // ₹100 → over 3 years, 13 monthly-ish points
    growth: { you: [100, 104, 101, 108, 114, 111, 119, 126, 131, 128, 138, 143, 149], nifty: [100, 103, 99, 106, 111, 108, 115, 121, 125, 122, 133, 138, 144] },
  },

  spending: {
    month: "September",
    total: 78_400,
    usual: 83_000,
    categories: [
      { key: "emi", label: "EMI", amount: 38_400, change: "same", color: "#16201D" },
      { key: "household", label: "Household & bills", amount: 24_100, change: "−14%", changeTone: "accent", color: "#0E6B55" },
      { key: "lifestyle", label: "Lifestyle", amount: 9_900, change: "+21%", changeTone: "attn", color: "#6FB79B" },
      { key: "other", label: "Other", amount: 6_000, change: "—", color: "#C9C3B6" },
    ],
    unlabelled: [
      { id: "u1", payee: "PAYTM*RAJESH KUMAR", amount: 1_800, meta: "14 Sep · UPI · HDFC" },
      { id: "u2", payee: "UPI-SHARMA ENTERPRISES", amount: 900, meta: "20 Sep · UPI · ICICI" },
      { id: "u3", payee: "ATM withdrawal", amount: 500, meta: "22 Sep · HDFC · what was the cash for?" },
    ],
    insights: [
      {
        id: "subs",
        title: "6 subscriptions, ₹2,150 a month. Two unused for 90 days.",
        sub: "Cancelling both saves ₹700 a month, ₹8,400 a year. That's 2 months off your emergency-fund target.",
        action: { label: "Move ₹700 to the emergency SIP", href: "/decision/subs-1" },
      },
      { id: "food", title: "Food delivery ₹4,200, up 35% on your 6-month average.", sub: "Not a problem at your surplus. Just so you know." },
      { id: "emi", title: "EMI is 26% of take-home. Healthy.", sub: "Lenders start worrying above 40%. Keep this in mind for the bigger home." },
    ],
  },
};

export type GoalStatus = "on-track" | "behind" | "done";
export type HoldingStatus = "action" | "watching" | "on-track" | "lockin";
export type Holding = { id: string; goal: string; name: string; sub: string; value: number; status?: HoldingStatus; decision?: string };
export type PortfolioGroup = { key: string; label: string; count: number; total: number; holdings: Holding[]; more?: { count: number; value: number } };
export type Persona = typeof persona;
export type Goal = Persona["goals"][number];
