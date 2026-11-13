// pnpm check:ui [baseUrl] [paths...] [--shots <dir>]
// Layout checks per path x locale x width. Exits 1 on horizontal overflow or console errors.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const { chromium } = createRequire(import.meta.url)("playwright");

const CLERK = /\.clerk\.accounts\.dev/;
let blocked = 0;
const LOCALES = ["en", "tr", "ar", "es", "ru"];
const WIDTHS = [320, 390, 768, 1440];
const SEEDED = ["demo-lokanta", "demo-limon-cafe", "demo-nacht-bistro", "demo-bosphorus", "demo-bosphorus/kadikoy"];

const args = process.argv.slice(2);
let shots = null;
const rest = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--shots") shots = args[++i];
  else rest.push(args[i]);
}
const base = (rest[0]?.startsWith("http") ? rest.shift() : "http://localhost:3000").replace(/\/$/, "");
const paths = rest.length ? rest : ["/", "/menus", "/pricing", ...SEEDED.map((s) => `/${s}`)];
if (shots) mkdirSync(shots, { recursive: true });

// Runs in the page. Colours go through a canvas so any CSS colour syntax (oklch, lab...) resolves to rgba.
const inPage = () => {
  const cx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  cx.canvas.width = cx.canvas.height = 1;
  const rgba = (c) => {
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = "#000";
    cx.fillStyle = c;
    cx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const label = (el) =>
    el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "") + (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
  const visible = (el, s, r) => s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0 && r.width > 1 && r.height > 1;

  const root = document.documentElement;
  const cw = root.clientWidth;
  const out = { overflow: root.scrollWidth > cw, widest: "", rtl: root.getAttribute("dir") === "rtl" || document.body.getAttribute("dir") === "rtl", small: [], contrast: [], skipped: 0 };

  let worst = 0;
  for (const el of document.body.querySelectorAll("*")) {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (!visible(el, s, r)) continue;
    if (out.overflow) {
      const over = Math.max(r.right - cw, -r.left);
      if (over > worst && s.position !== "fixed") { worst = over; out.widest = `${label(el)} (+${Math.round(over)}px)`; }
    }
    if (el.matches("a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=menuitem]") && (r.width < 44 || r.height < 44))
      out.small.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);

    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) continue;
    // Find the background: first ancestor with a colour; skip when an image or gradient sits in between.
    let fg = rgba(s.color), bg = null, bad = false;
    for (let p = el; p; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.backgroundImage !== "none") { bad = true; break; }
      const c = rgba(ps.backgroundColor);
      if (c[3] > 0) { if (c[3] < 1) { bad = true; break; } bg = c; break; }
    }
    if (!bg && !bad) bg = [255, 255, 255, 1]; // canvas default
    // Text over an image positioned under it is not computable either.
    const under = document.elementsFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 4));
    if (under.some((u) => u !== el && !el.contains(u) && ["IMG", "VIDEO", "CANVAS", "svg"].includes(u.tagName))) bad = true;
    if (bad || fg[3] < 1) { out.skipped++; continue; }
    const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    const px = parseFloat(s.fontSize), bold = +s.fontWeight >= 700;
    const need = px >= 24 || (px >= 18.66 && bold) ? 3 : 4.5;
    if (ratio < need) out.contrast.push(`${label(el)} ${ratio.toFixed(2)}<${need} "${el.textContent.trim().slice(0, 20)}"`);
  }
  return out;
};

const browser = await chromium.launch();
const rows = [];
let fail = false;
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  // Dummy Clerk keys: pretend a signed-out visitor with a dev browser (skips Clerk's handshake redirect) and
  // block the unreachable Clerk host. Blocked requests and the console noise they cause are counted apart.
  const host = new URL(base).hostname;
  await ctx.addCookies(["__clerk_db_jwt=x", "__client_uat=0"].map((c) => ({ name: c.split("=")[0], value: c.split("=")[1], domain: host, path: "/" })));
  await ctx.route(CLERK, (route) => { blocked++; return route.abort(); });
  for (const path of paths) {
    for (const locale of LOCALES) {
      const url = `${base}/${locale}${path === "/" ? "" : path}`;
      const page = await ctx.newPage();
      const errors = [], failed = [];
      page.on("console", (m) => m.type() === "error" && !CLERK.test(m.location().url) && !/^Clerk: Failed to load/.test(m.text()) && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("requestfailed", (r) => !CLERK.test(r.url()) && failed.push(`${r.url()} ${r.failure()?.errorText}`));
      page.on("response", (r) => r.status() >= 400 && !CLERK.test(r.url()) && failed.push(`${r.url()} ${r.status()}`));
      let res = null, r = null;
      try {
        res = await page.goto(url, { waitUntil: "load", timeout: 120000 });
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(300);
        r = await page.evaluate(inPage);
        if (shots && (width === 390 || width === 1440))
          await page.screenshot({ path: `${shots}/${path.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "home"}-${locale}-${width}.png`, fullPage: false });
      } catch (e) {
        errors.push(`navigation: ${e.message.split("\n")[0]}`);
      }
      const status = res?.status() ?? 0;
      const o = r?.overflow ?? false;
      if (o || errors.length || status >= 500 || !res) fail = true;
      rows.push({ width, path, locale, status, o, widest: r?.widest ?? "", rtl: locale === "ar" ? !!r?.rtl : null, errors, failed, small: r?.small ?? [], contrast: r?.contrast ?? [], skipped: r?.skipped ?? 0 });
      await page.close();
    }
  }
  await ctx.close();
}
await browser.close();

const pad = (v, n) => String(v).padEnd(n);
// One row per path x width; counts are summed over the 5 locales (overflow, rtl: locales affected).
console.log(pad("path", 26) + pad("w", 6) + pad("http!", 6) + pad("ovfl", 5) + pad("rtl!", 5) + pad("cons", 5) + pad("fail", 5) + pad("<44", 5) + pad("contr", 6) + "skip");
const groups = new Map();
for (const x of rows) {
  const k = `${x.path}|${x.width}`;
  groups.set(k, [...(groups.get(k) ?? []), x]);
}
const n = (g, f) => g.reduce((a, x) => a + f(x), 0);
for (const [k, g] of groups) {
  const [path, width] = k.split("|");
  console.log(
    pad(path, 26) + pad(width, 6) + pad(n(g, (x) => +(x.status >= 400 || !x.status)), 6) + pad(n(g, (x) => +x.o), 5) + pad(n(g, (x) => +(x.rtl === false)), 5) +
      pad(n(g, (x) => x.errors.length), 5) + pad(n(g, (x) => x.failed.length), 5) + pad(n(g, (x) => x.small.length), 5) + pad(n(g, (x) => x.contrast.length), 6) + n(g, (x) => x.skipped),
  );
}

// Details: first 5 distinct entries per path and kind (numbers and locales removed so repeats collapse).
console.log("\nDetails (first 5 distinct per path):");
const norm = (t) => t.replace(/\(\+\d+px\)/, "").replace(/\d+x\d+$/, "").replace(/"[^"]*"$/, "").replace(/[\d.]+<[\d.]+/, "").trim();
for (const path of paths) {
  const mine = rows.filter((x) => x.path === path);
  const show = (kind, pick) => {
    const seen = new Map();
    for (const x of mine) for (const e of pick(x)) { const key = norm(e); if (!seen.has(key)) seen.set(key, `${e} [${x.locale} ${x.width}]`); }
    [...seen.values()].slice(0, 5).forEach((v) => console.log(`${path} ${kind}: ${v.slice(0, 200)}`));
  };
  show("OVERFLOW", (x) => (x.o ? [x.widest] : []));
  show("NO-RTL", (x) => (x.rtl === false ? ["dir=rtl missing"] : []));
  show("CONSOLE", (x) => x.errors);
  show("FAILED-REQ", (x) => x.failed);
  show("SMALL", (x) => x.small);
  show("CONTRAST", (x) => x.contrast);
}
const sum = (k) => rows.reduce((a, x) => a + (Array.isArray(x[k]) ? x[k].length : +x[k]), 0);
console.log(`\n${rows.length} page checks: overflow ${rows.filter((x) => x.o).length}, console errors ${sum("errors")}, failed requests ${sum("failed")}, small targets ${sum("small")}, low contrast ${sum("contrast")}, blocked Clerk requests ${blocked}, contrast skipped (images/gradients/transparent) ${sum("skipped")} elements`);
process.exit(fail ? 1 : 0);
