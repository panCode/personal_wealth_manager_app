/**
 * Click-through checks for the flows that matter. Each section runs on a fresh
 * phone (empty localStorage) so sections don't leak state into each other.
 *
 *   npm run flows            all sections
 *   npm run flows -- core    one section: core | onboarding | informed | ship
 *
 * Needs the app running (see scripts/shots.mjs). Exit 1 on any failed check.
 * Selectors follow accessible names (roles, labels, visible text), so a
 * restyle shouldn't break them; a copy change might, and that's the point.
 */
import { IOS_UA, checker, go, launch, phone, shotsDir } from "./_browser.mjs";

const only = process.argv[2];
const dir = shotsDir();
const browser = await launch();
const c = checker();

async function section(name, fn, opts) {
  if (only && only !== name) return;
  console.log(`\n${name}`);
  const { ctx, page, errors } = await phone(browser, opts);
  try {
    await fn(page);
  } catch (e) {
    c.check(`${name} ran to the end`, false, e.message.split("\n")[0]);
  }
  c.check(`${name}: no console or page errors`, errors.length === 0, errors[0] ?? "");
  await ctx.close();
}

// 1 · Core loop: Home → one thing → Approve (OTP) → History; Home reflects it, state survives reload
async function approve(page, id) {
  await go(page, `/decision/${id}`);
  await page.getByRole("link", { name: /Approve/ }).click();
  await page.waitForURL(`**/execute/${id}`);
  for (let i = 0; i < 6; i++) await page.locator(`#otp${i}`).fill(String(i + 1));
  await page.getByRole("button", { name: /Confirm order/ }).click();
  await page.waitForURL("**/activity**", { timeout: 8000 });
  await page.waitForTimeout(600);
}

await section("core", async (page) => {
  await go(page, "/home");
  const thing = page.getByRole("link", { name: /One thing this week/ });
  c.check("one thing shows the rebalance", /Rebalance/.test((await thing.getAttribute("aria-label")) ?? ""));
  c.check("verdict: one goal needs a nudge", (await page.getByText("One goal needs a nudge.").count()) === 1);
  c.check("nothing red or amber on Home", (await page.locator('[class*="attn"], [class*="danger"]').count()) === 0);
  await thing.click();
  await page.waitForURL("**/decision/rebalance-1");
  c.check("decision opens", /Move ₹1\.2L/.test(await page.locator("h1").textContent()));
  await page.getByRole("link", { name: /Approve/ }).click();
  await page.waitForURL("**/execute/rebalance-1");
  for (let i = 0; i < 6; i++) await page.locator(`#otp${i}`).fill(String(i + 1));
  await page.getByRole("button", { name: /Confirm order/ }).click();
  await page.waitForURL("**/activity**", { timeout: 8000 });
  await page.waitForTimeout(600);
  c.check("toast confirms the order", /approved/i.test(await page.getByRole("status").textContent()));
  await page.screenshot({ path: `${dir}/flow_activity_after.png` });
  await go(page, "/home");
  c.check("what moved shows the placed order", (await page.getByText("Rebalance placed").count()) === 1);
  c.check("one thing moves on to the step-up", /Step up/.test((await thing.getAttribute("aria-label")) ?? ""));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(500);
  c.check("placed row survives reload", (await page.getByText("Rebalance placed").count()) === 1);
  await approve(page, "stepup-1");
  await go(page, "/home");
  c.check("calm state once nothing is pending", (await page.getByText("Nothing needs you this week.").count()) === 1);
  c.check("verdict: on plan", (await page.getByText("On plan.").count()) === 1);
  await page.screenshot({ path: `${dir}/flow_home_calm.png` });
  // Ask from Home
  await page.locator("#home-ask").fill("Can I prepay my home loan?");
  await page.locator("#home-ask").press("Enter");
  await page.waitForURL("**/ask?text=**");
  await page.waitForTimeout(400);
  c.check("question typed on Home opens Ask with an answer", (await page.getByText("Short answer: prepay most of it, but not all.").count()) === 1);
});

// 2 · Onboarding: Connect → About → Goals (drawers recompute) → Home
await section("onboarding", async (page) => {
  await go(page, "/connect");
  await page.getByRole("button", { name: "Connect" }).first().click();
  await page.waitForTimeout(1300);
  c.check("connect count updates", /4 connected/.test(await page.getByRole("link", { name: /Continue/ }).textContent()));
  await page.getByRole("link", { name: /Continue/ }).click();
  await page.waitForURL("**/about");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "More children" }).click();
  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.locator("#inc").fill("150000");
  await page.waitForTimeout(200);
  const surplus = await page.locator("span.font-display.text-\\[26px\\]").last().textContent();
  c.check("surplus recomputes from income", surplus === "₹67,000", surplus);
  await page.getByRole("link", { name: /continue/i }).click();
  await page.waitForURL("**/goals");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Bigger home/ }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "2029" }).click();
  await page.getByRole("button", { name: "Size my goals" }).click();
  await page.waitForTimeout(400);
  c.check("home goal re-sized to 2029", /2029 prices/.test(await page.locator("text=Upfront cash on a").textContent()));
  await page.getByRole("button", { name: "How we sized Bigger home" }).click();
  await page.waitForTimeout(400);
  c.check("sizing sheet opens", (await page.locator("span.font-display.text-\\[34px\\]").count()) === 1);
  await page.getByRole("button", { name: /^Keep/ }).click();
  await page.waitForTimeout(300);
  await go(page, "/connect");
  await page.getByRole("link", { name: /Skip the bank/ }).click();
  await page.waitForURL("**/about");
  await go(page, "/goals");
  await page.getByRole("button", { name: /Build my plan/ }).click();
  await page.waitForURL("**/home");
  c.check("lands on Home", true);
});

// 3 · Informed: notifications channels, WhatsApp, spending, simulations
await section("informed", async (page) => {
  await go(page, "/notifications");
  await page.getByRole("button", { name: "App", exact: true }).first().click();
  const ch = await page.locator("button", { hasText: /^WhatsApp$|^App \+ WhatsApp$/ }).first().textContent();
  c.check("channel toggles", /WhatsApp/.test(ch ?? ""), ch);
  await go(page, "/whatsapp");
  await page.locator("#wa").fill("Should I sell?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.waitForTimeout(300);
  c.check("WhatsApp replies and hands off to Ask", (await page.getByText("Open Ask in app").count()) === 1);
  await go(page, "/spending");
  await page.getByRole("button", { name: "Household" }).first().click();
  await page.waitForTimeout(200);
  await page.locator("#amt").fill("1500");
  await page.locator("#what").fill("Maid, cash");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.waitForTimeout(300);
  c.check("spend added", (await page.getByText("Maid, cash").count()) === 1);
  const verdict = () => page.locator("span.font-display.text-\\[22px\\]").first().textContent();
  await go(page, "/simulate/car");
  c.check("car verdict", /afford/.test(await verdict()), await verdict());
  await page.getByRole("button", { name: "Try" }).nth(1).click();
  await page.waitForTimeout(300);
  c.check("used-car alternative recomputes", /2033/.test(await verdict()), await verdict());
  for (const [id, re] of [
    ["retire-55", /a month/],
    ["job-loss", /months/],
    ["house-2029", /more a month/],
    ["raise-30", /more a month/],
  ]) {
    await go(page, `/simulate/${id}`);
    c.check(`${id} verdict`, re.test(await verdict()), await verdict());
  }
  await go(page, "/ask?q=insurance");
  c.check("Ask deep-link seeds the insurance answer", (await page.getByText("Is my insurance cover enough?").count()) >= 1);
});

// 4 · Ship: iOS install hint, dismiss persists, settings reset clears everything
await section(
  "ship",
  async (page) => {
    await go(page, "/home");
    const hint = () => page.getByText("Put it on your home screen").count();
    c.check("iOS install hint shows", (await hint()) === 1);
    await page.getByRole("button", { name: "Dismiss" }).click();
    await page.waitForTimeout(200);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(500);
    c.check("dismiss survives reload", (await hint()) === 0);
    await go(page, "/settings");
    await page.getByRole("button", { name: "Reset this prototype" }).click();
    await page.getByRole("button", { name: "Yes, reset" }).click();
    await page.waitForURL("**/");
    await page.waitForTimeout(300);
    const ls = await page.evaluate(() => localStorage.getItem("cfo-prototype-v1"));
    c.check("reset clears local state", ls === null);
    await go(page, "/home");
    c.check("hint is back after reset", (await hint()) === 1);
  },
  { userAgent: IOS_UA },
);

await browser.close();
console.log(c.failed ? `\n${c.failed} check(s) failed` : "\nall checks passed");
process.exit(c.failed ? 1 : 0);
