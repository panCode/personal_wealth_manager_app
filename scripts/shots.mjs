/**
 * Screenshot every screen at phone size → shots/<name>.png
 *
 *   npm run shots                  all routes
 *   npm run shots -- /home /plan   just these
 *
 * Needs the app running (`npm run dev`, or `npm run build && npm start` with
 * BASE_URL=http://localhost:3000). Fails (exit 1) on console errors or on any
 * page wider than the 390px frame, which is how horizontal overflow shows up.
 */
import { checker, go, launch, phone, shotsDir } from "./_browser.mjs";

const ALL = [
  "/",
  "/connect",
  "/about",
  "/goals",
  "/home",
  "/decision/rebalance-1",
  "/execute/rebalance-1",
  "/activity",
  "/portfolio",
  "/portfolio/holdings",
  "/portfolio/performance",
  "/plan",
  "/ask",
  "/notifications",
  "/whatsapp",
  "/spending",
  "/scenarios",
  "/simulate/car",
  "/simulate/job-loss",
  "/simulate/raise-30",
  "/simulate/house-2029",
  "/simulate/retire-55",
  "/settings",
];

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
const dir = shotsDir();
const browser = await launch();
const { page, errors } = await phone(browser);
const c = checker();

for (const r of routes) {
  await go(page, r);
  const name = r.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "welcome";
  await page.screenshot({ path: `${dir}/${name}.png` });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  c.check(`${r} → ${dir}/${name}.png`, sw <= 390, `scrollWidth ${sw}`);
}

if (errors.length) {
  c.check("no console or page errors", false);
  console.log(errors.map((e) => `    ${e}`).join("\n"));
} else c.check("no console or page errors", true);

await browser.close();
process.exit(c.failed ? 1 : 0);
