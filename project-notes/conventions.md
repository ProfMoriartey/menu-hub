# Conventions

- Every user-facing string goes through next-intl, in all five locales. Admin-only pages may stay English. Add keys with `scripts/i18n/*`, then `pnpm i18n:check`.
- Guest pages send only the client namespaces listed in `[restaurantSlug]/layout.tsx` to the browser; a client component using another namespace shows MISSING_MESSAGE until it is added.
- RTL (`ar`): logical properties only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`), `rtl:rotate-180` on directional icons, `dir="ltr"` on URLs, phones, slugs.
- Import `Link`, `redirect`, `usePathname` from `~/i18n/navigation`, not `next/link`.
- Tokens: Table colours are `--table-*` inside `.table-world` only. Dashboard and admin stay on `:root`/`.dark` tokens and Geist. Never put Table colours in `:root`.
- New primitives for the new look go in `src/components/table/`; wrap pages in `<TableWorld>` per page, not in the shared `(site)` layout.
- Restaurant colours come from `colorTheme` (or legacy `brandColor`) and are injected by the guest layout; do not hard-code accent colours on guest pages.
- Menu text: main language in the plain columns, other languages in `translations` JSON keyed by locale. Price, photo, labels are shared.
- Brand names are not translated.
- Checks before pushing: `pnpm lint`, `pnpm typecheck`, `pnpm i18n:check`.
