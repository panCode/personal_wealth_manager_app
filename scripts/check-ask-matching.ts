/**
 * Guards the keyword routing on the Ask screen. `findAnswer` is first-match in
 * array order, so a regex change anywhere can silently re-route a question.
 *
 *   npx --yes tsx scripts/check-ask-matching.ts      (or: npm run check:ask)
 *
 * Exits 1 on any mismatch.
 */
import { answers, findAnswer, suggested } from "../lib/answers";

/** Question → expected answer id (null = the fallback). */
const table: Array<[string, string | null]> = [
  // prepay
  ["Prepay my home loan with the ₹3L bonus?", "prepay"],
  ["Should I prepay my home loan with the ₹3L bonus I got?", "prepay"],
  ["Should I prepay?", "prepay"],
  ["Can I use my bonus to pay off the loan?", "prepay"],
  // car
  ["Can I afford a ₹12L car?", "car"],
  ["Should I take a car loan?", "car"],
  // loan
  ["How is my home loan going?", "loan"],
  ["When does my loan end?", "loan"],
  ["Should I increase my EMI?", "loan"],
  ["Is my EMI too high?", "loan"],
  ["What is my outstanding loan?", "loan"],
  // card
  ["Based on my spend, which credit card is best for me?", "card"],
  ["Which credit card is best for me?", "card"],
  ["Which card gives most cashback?", "card"],
  ["Should I get a new credit card?", "card"],
  // insurance
  ["Is my insurance cover enough?", "insurance"],
  ["Is my healthcare cover enough?", "insurance"],
  ["Is there a shortfall in my cover?", "insurance"],
  ["Do I need a health top-up?", "insurance"],
  ["Should I buy term insurance?", "insurance"],
  ["Is my term life cover enough?", "insurance"],
  // spending
  ["Am I overspending?", "spending"],
  ["Is my food delivery spend too high?", "spending"],
  ["Can I cancel subscriptions?", "spending"],
  ["How much am I spending on household bills?", "spending"],
  ["Where does my salary go every month?", "spending"],
  // regime
  ["Old or new tax regime for me?", "regime"],
  ["Which regime is better?", "regime"],
  ["Old vs new, which is cheaper for me?", "regime"],
  // tax-save
  ["How do I save more tax this year?", "tax-save"],
  ["How can I save more tax?", "tax-save"],
  ["Should I claim HRA?", "tax-save"],
  ["Should I put ₹50,000 in NPS?", "tax-save"],
  ["What deductions am I missing? 80C, 80D", "tax-save"],
  ["Tell me about taxation", "tax-save"],
  // others, unchanged
  ["Is my SIP enough for the house?", "sip-house"],
  ["Should I buy gold now?", "gold"],
  ["How much do I need to retire?", "retire"],
  ["What if the market crashes?", "crash"],
  ["Should I sell everything?", "crash"],
  // fallback
  ["What's my net worth?", null],
  ["Hello", null],
];

let failed = 0;
const fail = (msg: string) => {
  failed += 1;
  console.error(`✗ ${msg}`);
};

for (const [q, want] of table) {
  const got = findAnswer(q)?.id ?? null;
  if (got !== want) fail(`"${q}" → ${got} (wanted ${want})`);
}
for (const a of answers) {
  const got = findAnswer(a.question)?.id ?? null;
  if (got !== a.id) fail(`chip "${a.question}" routes to ${got}, not its own answer "${a.id}"`);
}
const ids = new Set(answers.map((a) => a.id));
for (const id of suggested) if (!ids.has(id)) fail(`suggested id "${id}" has no answer`);
for (const id of ids) if (!suggested.includes(id)) fail(`answer "${id}" is missing from suggested`);
if (new Set(suggested).size !== suggested.length) fail("suggested has duplicates");

if (failed) {
  console.error(`${failed} mismatch${failed === 1 ? "" : "es"}`);
  process.exit(1);
}
console.log(`✓ ${table.length} questions and ${answers.length} chips route as expected`);
