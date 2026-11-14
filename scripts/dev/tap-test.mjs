// node scripts/dev/tap-test.mjs [baseUrl]
// The home hero's signature move: tap/click a place card and the phone turns to that language.
// Per locale x motion x input (tap at 390, click at 1440, keyboard): each of the 5 cards must be
// aria-pressed after the press and the visible phone screen must carry that lang (dir=rtl for ar).
// Exits 1 on any failure.
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");

const CLERK = /\.clerk\.accounts\.dev/;
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const host = new URL(base).hostname;
const SEATS = [
  ["en", "English"],
  ["tr", "Türkçe"],
  ["ar", "العربية"],
  ["es", "Español"],
  ["ru", "Русский"],
];
const PAGES = ["en", "ar"];
const SCREEN = "div[lang][dir].bg-plate";
const XSCREEN = "div[@lang][@dir][contains(@class,'bg-plate')]";

const browser = await chromium.launch();
const rows = [];

async function newCtx(opts) {
  const ctx = await browser.newContext(opts);
  // Same as check-ui.mjs: signed-out dev browser cookies, and Clerk's host blocked.
  await ctx.addCookies(["__clerk_db_jwt=x", "__client_uat=0"].map((c) => ({ name: c.split("=")[0], value: c.split("=")[1], domain: host, path: "/" })));
  await ctx.route(CLERK, (route) => route.abort());
  return ctx;
}

async function state(page, group) {
  const pressed = await group.locator("button").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-pressed")));
  // Scope to the hero: the nearest ancestor of the card group that also holds the phone screen.
  const screens = group.locator(`xpath=ancestor::*[.//${XSCREEN}][1]`).locator(`${SCREEN}:visible`);
  const n = await screens.count();
  const screen = n ? await screens.first().evaluate((e) => ({ lang: e.getAttribute("lang"), dir: e.getAttribute("dir") })) : null;
  return { pressed, screen, n };
}

for (const motion of ["no-preference", "reduce"]) {
  for (const [mode, width, hasTouch] of [["tap", 390, true], ["click", 1440, false], ["keyboard", 1440, false]]) {
    const ctx = await newCtx({ viewport: { width, height: 900 }, hasTouch, isMobile: hasTouch, reducedMotion: motion });
    for (const pageLocale of PAGES) {
      for (let i = 0; i < SEATS.length; i++) {
        const [lang, name] = SEATS[i];
        const page = await ctx.newPage();
        const problems = [];
        try {
          await page.goto(`${base}/${pageLocale}`, { waitUntil: "load", timeout: 120000 });
          await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
          const group = page.getByRole("group").filter({ has: page.locator("button[aria-pressed]") }).first();
          const card = group.locator("button").nth(i);
          await card.scrollIntoViewIfNeeded();
          if (mode === "tap") await card.tap();
          else if (mode === "click") await card.click();
          else {
            await page.locator("body").click({ position: { x: 1, y: 1 } }).catch(() => {});
            await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
            let reached = false;
            for (let t = 0; t < 80 && !reached; t++) {
              await page.keyboard.press("Tab");
              reached = await card.evaluate((el) => el === document.activeElement);
            }
            if (!reached) problems.push("Tab never reached card");
            await page.keyboard.press(i % 2 ? "Space" : "Enter");
          }
          await page.waitForTimeout(500);
          const s = await state(page, group);
          if (s.pressed[i] !== "true") problems.push(`card aria-pressed=${s.pressed[i]}`);
          if (s.pressed.filter((p) => p === "true").length !== 1) problems.push(`pressed count ${s.pressed.filter((p) => p === "true").length}`);
          if (s.n !== 1) problems.push(`${s.n} visible screens`);
          if (!s.screen) problems.push("no visible screen");
          else {
            if (s.screen.lang !== lang) problems.push(`screen lang=${s.screen.lang}`);
            if (s.screen.dir !== (lang === "ar" ? "rtl" : "ltr")) problems.push(`screen dir=${s.screen.dir}`);
          }
          const live = (await page.locator('[role="status"]').first().textContent())?.trim();
          if (pageLocale !== lang && !live?.includes(name)) problems.push(`live region "${live}"`);
        } catch (e) {
          problems.push(e.message.split("\n")[0]);
        }
        rows.push({ motion, mode, width, page: pageLocale, card: lang, ok: !problems.length, why: problems.join("; ") });
        await page.close();
      }
    }
    await ctx.close();
  }
}
await browser.close();

const pad = (v, n) => String(v).padEnd(n);
console.log(pad("motion", 15) + pad("input", 10) + pad("w", 6) + pad("page", 6) + pad("card", 6) + "result");
for (const r of rows) console.log(pad(r.motion, 15) + pad(r.mode, 10) + pad(r.width, 6) + pad(r.page, 6) + pad(r.card, 6) + (r.ok ? "ok" : `FAIL ${r.why}`));
const bad = rows.filter((r) => !r.ok);
console.log(`\n${rows.length} checks, ${bad.length} failed`);
process.exit(bad.length ? 1 : 0);
