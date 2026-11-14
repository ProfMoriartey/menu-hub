# Decisions

- Guest menus live outside `(site)` so they never load Clerk and can be cached (ISR, empty `generateStaticParams`).
- Table fonts are declared in `table/fonts.ts`, not in the root layout, so only `TableWorld` routes load them. `adjustFontFallback` is off on purpose: an Arial-like fallback would win over the Cyrillic and Arabic fallbacks.
- Bricolage has no Cyrillic or Arabic glyphs; the stack falls through to Onest and Noto Sans Arabic.
- Dashboard keeps its own tokens and Geist; the new look is applied to public pages first.
- A restaurant is the brand and its menu; address, hours and contact belong to branches (at least one each, lowest `order` is main).
- Menu languages are the same five as the site locales; the page language is the URL locale.
- Local DB is a throwaway Postgres with `drizzle-kit push`, because it is a fresh database each time and needs no migration history. Shared and production databases use the SQL files in `src/server/db/migrations` (some backfill data that push does not).
- Prices are stored as strings and shown as entered.
