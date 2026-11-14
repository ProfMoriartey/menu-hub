# State

- The Table redesign is partly built: primitives, tokens and fonts exist in `src/components/table/` and `globals.css`. Home, `/menus`, navbar/footer and guest menus (ticket 7) are in The Table; check the branch history for the rest.
- `DESIGN.md` is a working draft; `.impeccable/surfaces/` holds the direction for the pages above.
- Guest menu has three designs (classic, photo-grid, compact), 5 menu languages, branches with opening hours, sold-out and hidden items, per-restaurant colour themes.
- Dashboard and admin are complete and unchanged by the redesign.
- Local tooling: `scripts/dev` (setup, seed, UI check). Baseline UI numbers are recorded when the checker is run on a clean checkout; compare against your own run.
- Payments are recorded by hand by an admin; no payment provider is connected.
- Marketing pages (features, pricing, faq, about, multilingual-menu, start, kvkk, invite) are in The Table; blocks per page in DESIGN.md "Marketing pages". Unused now: `PricingSection`/`PageHero`, `SittingDoodle`, and message keys such as `pricingPage.cta.faq`, `aboutPage.cta.*`, `faqPage.more.*`. `/start` and a valid `/invite/<token>` need a signed-in user or a DB invite and were not rendered offline.

## Checks at the end of ticket 8 (step 1)

Production build, local seed, 14 Nov 2026.

| Check | Result |
|---|---|
| lint, typecheck, i18n:check, build | pass (i18n: 5 files, 0 problems) |
| check:ui light, 16 paths x 5 locales x 4 widths (320 checks) | overflow 0, small targets 0, low contrast 0; console errors only on the intended 404 path |
| check:ui dark (theme in localStorage), /, /menus, /pricing, /features, 4 guest menus, 404 (180 checks) | overflow 0, small targets 0, low contrast 0 |
| Contrast pass with see-through backgrounds, 390 px, light and dark | 1 failure (dark sold-out stamp 3.4:1), fixed (4.6:1) |
| Hero tap test (`scripts/dev/tap-test.mjs`), /en and /ar, 5 cards, tap / click / keyboard, with and without reduced motion | 60 of 60 |
| Keyboard: /menus filter sheet, mobile nav (ru, tr), language popover, footer languages | focus moves in, stays in, Escape closes, focus returns |
| LCP median of 5 (390 px, CPU 4x, Fast 3G), guest menus | lokanta 1892, limon-cafe 1872, nacht-bistro 1808, bosphorus 1896 ms (ticket 7: 1932, 1928, 1984, 1924) |
| LCP, home | /en 1768, /ar 1900, /ru 1668 ms |

Not checked: the dashboard colour preview (needs a signed-in owner), `/start` and a valid invite (need sign-in or a DB invite), Clerk's widget (needs real keys). The 404 page stays light in dark mode by design (`not-found.tsx`).

## Open owner decisions
- Wordmark and palette approval.
- Whether to simplify the 7-colour editor (guest pages use one colour from it).
- Photos (demo photos only from `public/demo/`).
