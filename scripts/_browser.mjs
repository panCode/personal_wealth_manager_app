/**
 * Shared Playwright setup for scripts/shots.mjs and scripts/flows.mjs.
 *
 *   BASE_URL     where the app runs (default http://localhost:3000, i.e. `npm run dev`)
 *   CHROME_PATH  optional Chromium binary; otherwise Playwright's own
 *                (one-time: `npx playwright install chromium`)
 *
 * Every context is a fresh phone: 390×844, touch, mobile UA, empty localStorage.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

export const BASE = process.env.BASE_URL ?? "http://localhost:3000";
export const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

export async function launch() {
  const executablePath = process.env.CHROME_PATH || undefined;
  return chromium.launch({ executablePath });
}

/** New phone-sized context + page, with console/page errors collected into `errors`. */
export async function phone(browser, { userAgent } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return { ctx, page, errors };
}

/** Navigate and settle. `load` rather than `networkidle`: the dev server keeps an HMR socket open. */
export async function go(page, path, settle = 500) {
  await page.goto(BASE + path, { waitUntil: "load" });
  await page.waitForTimeout(settle);
}

export function shotsDir() {
  mkdirSync("shots", { recursive: true });
  return "shots";
}

/** Tiny assertion helper: prints ✓/✗ and counts failures. */
export function checker() {
  let failed = 0;
  return {
    check(name, ok, detail = "") {
      if (ok) console.log(`  ✓ ${name}${detail ? `  (${detail})` : ""}`);
      else {
        failed++;
        console.log(`  ✗ ${name}${detail ? `  (${detail})` : ""}`);
      }
    },
    get failed() {
      return failed;
    },
  };
}
