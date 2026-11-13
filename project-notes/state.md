# State

- The Table redesign is partly built: primitives, tokens and fonts exist in `src/components/table/` and `globals.css`. Home, `/menus`, navbar/footer and guest menus (ticket 7) are in The Table; check the branch history for the rest.
- `DESIGN.md` is a working draft; `.impeccable/surfaces/` holds the direction for the pages above.
- Guest menu has three designs (classic, photo-grid, compact), 5 menu languages, branches with opening hours, sold-out and hidden items, per-restaurant colour themes.
- Dashboard and admin are complete and unchanged by the redesign.
- Local tooling: `scripts/dev` (setup, seed, UI check). Baseline UI numbers are recorded when the checker is run on a clean checkout; compare against your own run.
- Payments are recorded by hand by an admin; no payment provider is connected.
