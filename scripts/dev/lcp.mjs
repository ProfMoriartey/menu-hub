// pnpm check:lcp [baseUrl] [paths...] [--runs n]
// Largest Contentful Paint on a phone (390 px), throttled like a mid-range
// phone on mobile data: CPU 4x slower, DevTools "Fast 3G" network. Cold cache
// each run; prints the median per path. Measure a production build
// (`pnpm build && pnpm start`), not `pnpm dev`.
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");

const args = process.argv.slice(2);
let runs = 5;
const rest = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--runs") runs = Number(args[++i]);
  else rest.push(args[i]);
}
const base = (rest[0]?.startsWith("http") ? rest.shift() : "http://localhost:3000").replace(/\/$/, "");
const paths = rest.length ? rest : ["/en/demo-lokanta", "/en/demo-limon-cafe", "/en/demo-nacht-bistro", "/en/demo-bosphorus"];

// DevTools' "Fast 3G" preset.
const FAST_3G = { offline: false, latency: 562.5, downloadThroughput: (1.6e6 * 0.9) / 8, uploadThroughput: (750e3 * 0.9) / 8 };

const browser = await chromium.launch();
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

for (const path of paths) {
  const lcps = [];
  let element = "";
  for (let i = 0; i < runs; i++) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    // Site pages: a signed-out dev browser skips Clerk's handshake (as in check-ui.mjs).
    await context.addCookies(["__clerk_db_jwt=x", "__client_uat=0"].map((c) => ({ name: c.split("=")[0], value: c.split("=")[1], domain: new URL(base).hostname, path: "/" })));
    await context.route(/\.clerk\.accounts\.dev/, (route) => route.abort());
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", FAST_3G);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        const el = last.element;
        window.__lcp = { time: last.startTime, el: el ? el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : "") : "" };
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(base + path, { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(1000);
    const lcp = await page.evaluate(() => window.__lcp);
    if (lcp) {
      lcps.push(lcp.time);
      element = lcp.el;
    }
    await context.close();
  }
  console.log(`${path}  LCP median ${Math.round(median(lcps))} ms  (runs: ${lcps.map(Math.round).join(", ")})  element: ${element}`);
}
await browser.close();
