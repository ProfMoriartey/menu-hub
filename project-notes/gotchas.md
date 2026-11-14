# Gotchas

- Middleware: a path is a guest route (no sign-in) when its second segment is not in `SITE_SEGMENTS`. A new top-level site page under `[locale]` must be added to that set, or it is treated as a restaurant slug and skips sign-in.
- `/r/<id>` (QR link) and `sitemap.xml`, `robots.txt`, `llms.txt` are served without locale or sign-in.
- Locale prefix is always present (`/en/...`); a bare `/slug` is redirected.
- `revalidatePath` needs the route-group path (`/[locale]/(site)/admin`), not `/[locale]/admin`. After data changes call the public menu revalidation helpers or guests see stale pages.
- A menu shows only when the restaurant is active, not paused and not past `liveUntil`.
- Table utilities resolve to nothing outside `.table-world`.
- `drizzle-kit push` prints truncated-identifier NOTICEs for long foreign key names; harmless.
- `drizzle.config.ts` reads `~/env`; set `SKIP_ENV_VALIDATION=1` and `DATABASE_URL` when running `drizzle-kit`.
- `pnpm db:migrate` and `db:push` are different: see decisions.
- Unknown `restaurants.theme` values map to Classic (`menuDesignOf`); legacy design names are translated there.
- Opening hours: a range whose close is at or before its open runs past midnight; `null` shows nothing.
- Signed-out controls (Sign in, Start free) sit inside Clerk's `SignedOut`, so offline (Clerk blocked) the navbar shows neither; the dashboard link and user button likewise.
- Portal content (Radix popover/dialog) is outside `.table-world`: give it the class and `tableFontVariables` itself.
- Guest pages: text straight on the ground uses `text-on-ground(-muted)`; `text-foreground`/`text-primary` are dark ink meant for cards and vanish on the night ground.
