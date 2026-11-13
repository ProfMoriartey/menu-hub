# Project notes

Short developer notes for menu-hub (Next.js 15, next-intl, Clerk, Drizzle/Postgres, Tailwind v4, pnpm).
Read `map.md` first, then `run.md` to get the app running with fake data.

- `map.md`: where things live, and the pattern to copy for each area
- `run.md`: one command per script, env vars, setup traps
- `conventions.md`: how code is written here (i18n, RTL, tokens, fonts)
- `decisions.md`: choices that look odd and why they were made
- `gotchas.md`: things that bite
- `state.md`: what is built, what is partly built

Other docs in the repo: `DESIGN.md` (visual direction, draft), `PRODUCT.md` (users and purpose),
`.impeccable/surfaces/` (the design contract for site pages), `docs/HANDOFF.md` (long conventions guide).

Quick start (needs Postgres 16 binaries in `/usr/lib/postgresql/16/bin`):

    pnpm install
    pnpm dev:setup && pnpm dev:seed
    pnpm dev
    pnpm check:ui
