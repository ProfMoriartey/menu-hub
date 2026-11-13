# Map

One line per area: where it is, and what to copy.

## Routes (`src/app/[locale]`)
- `layout.tsx`: root. Sets `<html lang dir>` (rtl for `ar`), Geist font, theme provider.
- `(site)/`: shared layout (Clerk, navbar, messages). Marketing pages (`page.tsx`, `about`, `faq`, `features`, `pricing`, `menus`, `multilingual-menu`, `kvkk`, `start`, `invite/[token]`) and `sign-in/[[...sign-in]]`. Copy a sibling page.
- `(site)/(client)/dashboard/[restaurantSlug]/...`: owner dashboard (menu, edit, team, share, plan, branches, colors).
- `(site)/admin/...`: system admin (users, requests, payments, restaurants).
- `[restaurantSlug]/`: guest pages, outside `(site)`, no sign-in. `page.tsx`, `[branchSlug]`, `item/[itemSlug]`, `about`, `preview`. Shared render code in `_pages/`. Layout injects the restaurant's colours.
- Outside the locale: `src/app/r/[restaurantId]` (permanent QR link), `api/*`, `sitemap.ts`, `robots.ts`, `llms.txt`. Server actions: `src/app/actions/*.ts`.
- `src/middleware.ts`: Clerk + next-intl. Guest routes skip sign-in (see gotchas).

## Components (`src/components`)
- `table/`: design primitives for the new look (Cloth, Plate, PlaceCard, Stamp, LeaderRow, `TableWorld` wrapper, `fonts.ts`). Wrap a page in `<TableWorld>` and compose these.
- `home/`: the home page's sections (Hero, HowItWorks, GuestsSee, Features, ExampleMenus, Pricing, ContactClose) plus `DemoPhone` and `SeatCards`; the page only composes them. Pattern in DESIGN.md "Home pattern".
- `layout/LayoutWrapper.tsx`: on public paths (incl. `/sign-in`) wraps the page in `TableWorld` with skip link, navbar, `<main id="main">` and footer; pages must not add their own `<main>`. The dashboard and admin have their own shells and never see the navbar.
- `shared/`: navbar (cloth bar, mobile sheet is a Radix dialog), site footer, language switcher (`variant` select | card | cards), theme toggle (`quiet` on the cloth), marketing blocks, restaurant logo.
- `public/`: guest menu, in The Table via `.guest-menu` (DESIGN.md "Guest menu pattern") (MenuDisplayClient, MenuLayout, MenuItemCard, CategoryNav, BranchPicker, OpeningHours, SoldOutBadge, DishSheet).
- `menus/`: the `/menus` directory (MenusDirectory, MenuCard, filters).
- `ui/`: shadcn primitives (button, card, dialog, input, select, switch, popover, command).
- Also: `admin/`, `dashboard/`, `menu-editor/`, `colors/`, `menu-languages/`, `branches/`, `share/`, `plans/`, `forms/`.

## Styles and fonts
- `src/styles/globals.css`: dashboard/shadcn tokens in `:root` and `.dark` (oklch, warm stone). Table tokens (`--table-*`) only inside `.table-world` (and `.dark .table-world`). Utilities for them live in `@theme inline` and resolve to nothing outside `.table-world`.
- `src/components/table/fonts.ts`: Bricolage Grotesque (latin), Onest (cyrillic), Noto Sans Arabic. Loaded only on routes that render `TableWorld`. Dashboard and admin keep Geist.

## i18n
- Messages: `src/messages/{en,tr,ar,es,ru}.json`. Routing: `src/i18n/routing.ts` (default `en`, prefix always present). Use `Link`/`redirect` from `src/i18n/navigation.ts`.
- `scripts/i18n/`: add/set/remove namespaces and keys; `pnpm i18n:check` verifies all five files.
- RTL: `ar` only; use logical properties.

## Data and logic
- `src/lib/`: `demo-menu.ts` (fake demo menu, not in DB), `color-theme.ts` (light/dark palettes; `guestBrandCss` for guest pages), `brand-color.ts` (older single accent), `menu-design.ts` (classic | photo-grid | compact), `menu-languages.ts`, `opening-hours.ts`, `plans.ts`, `billing.ts`.
- `src/server/`: `db/schema.ts` (tables prefixed `menu-hub_`), `db/migrations/`, queries (`public-menu.ts`, `public-branch.ts`, `menu-data.ts`, `directory-venues.ts`, ...).
- `scripts/dev/`: local setup, seed, UI checker. `scripts/*.mjs`: uploads cleanup and photo shrink.

## Assets and docs
- `public/brand/` wordmarks, `public/menupedia-logo*`, icons; demo food photos in `public/demo/*.jpg` and `lokanta-logo.svg`.
- `DESIGN.md`, `PRODUCT.md`, `.impeccable/surfaces/` (direction contract for home, marketing, `/menus`, guest menus, sign-in).
