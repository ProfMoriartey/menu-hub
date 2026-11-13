# Running locally

Needs Postgres 16 binaries in `/usr/lib/postgresql/16/bin` and a `postgres` system user.

| Command | What it does |
|---|---|
| `pnpm dev:setup` | Throwaway Postgres under `/var/tmp/menu-hub-pg` (free port, runs as `postgres`), pushes the schema with `drizzle-kit push --force`, writes `.env.development.local`. Safe to re-run. |
| `pnpm dev:seed` | Resets and inserts 4 fake restaurants (5 menu languages, 3 designs, edge-case dishes). Prints URLs. Needs `dev:setup` first. |
| `pnpm dev` | Next dev server on :3000. |
| `pnpm check:ui [baseUrl] [paths...] [--shots dir]` | Browser sweep (paths x en/tr/ar/es/ru x 320/390/768/1440). Exits 1 on overflow or console errors. |
| `pnpm check:lcp [baseUrl] [paths...] [--runs n]` | LCP median at 390 px, CPU 4x and Fast 3G, cold cache (default: the 4 seeded menus). Run against `pnpm build && pnpm start` (load `.env.development.local` into the shell first), not `pnpm dev`. |
| `pnpm lint` / `pnpm typecheck` / `pnpm i18n:check` | Static checks. |

## Env (`.env.development.local`, git-ignored; values are dummies)
    SKIP_ENV_VALIDATION=1
    UPLOADTHING_TOKEN=dummy
    CLERK_SECRET_KEY=sk_test_x
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk
    DATABASE_URL=postgres://postgres@127.0.0.1:<port>/menu_hub

## Seeded URLs
`/en/demo-lokanta` (classic, green), `/en/demo-limon-cafe` (photo-grid, light yellow), `/en/demo-nacht-bistro` (compact, navy), `/en/demo-bosphorus` (default colours, 3 branches: `/kadikoy`, `/besiktas`, `/sisli`). Swap `en` for any locale.

## Traps
- Postgres refuses to run as root; the script uses `runuser -u postgres`.
- Port is random per setup; it is stored in `/var/tmp/menu-hub-pg/port` and in the env file. If the machine restarts, run `dev:setup` again (it restarts the cluster, possibly on a new port, and rewrites the env file).
- Guest pages are cached. After re-seeding, restart `pnpm dev` if a menu looks stale.
- Site pages go through Clerk. With dummy keys the first request is redirected to Clerk's hosted handshake. `check:ui` avoids it by setting `__clerk_db_jwt` and `__client_uat=0` cookies (signed-out dev browser) and blocking `*.clerk.accounts.dev`; blocked requests are counted separately, not as failures. `/sign-in` only renders Clerk's widget, which cannot load here, so it measures as empty.
- `pnpm lint` and `drizzle-kit` load `~/env`; without a `.env` they fail on DATABASE_URL. Prefix with `SKIP_ENV_VALIDATION=1` (typecheck needs nothing).
- Never run `playwright install`; the browser is preinstalled.
