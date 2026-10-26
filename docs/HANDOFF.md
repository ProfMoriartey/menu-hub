# menu-hub: handoff brief

Read this before changing anything. It records how the app is built, the
rules the code follows, what has been done, what is open, and the traps
that cost time before. Last updated 2026-10-23, at commit `67113b8` on
branch `perf/users-dashboard`.

---

## 1. What the product is

**Menupedia / menu-hub** is a digital menu platform for restaurants. Guests
scan a QR code on the table and get the restaurant's menu in their own
language. Restaurants manage their menu in a dashboard. The owner of the
project runs an admin panel.

**The long-term goal is a self-running SaaS:** restaurants sign up and manage
themselves without the owner doing routine work. That isn't built yet
(no billing, plans or self-sign-up), but design choices should hold up for
many tenants. Keep data strictly per restaurant, prefer self-serve flows over
"ask the admin", and mention SaaS-relevant gaps when you see them. Don't
build billing or sign-up unless asked.

There are three audiences:

| Audience | Where | Language |
|---|---|---|
| Guests | public menu `/<slug>`, item pages, `/restaurants` | 5 languages |
| Restaurant staff (owners, editors) | `/dashboard/...` | 5 languages |
| The project owner (system admin) | `/admin/...` | English (shared components follow the URL locale) |

---

## 2. Stack

- **Next.js 15.2** (App Router, server actions, `after()`), **React 19**, TypeScript.
  Dev runs with Turbopack (`next dev --turbo`).
- **Tailwind CSS v4** (CSS-first config in `src/styles/globals.css`), shadcn/ui
  components on Radix (`src/components/ui`), `lucide-react` icons, `framer-motion`
  on the public pages.
- **Drizzle ORM** on **PostgreSQL** (driver `postgres`). Schema in
  `src/server/db/schema.ts`, migrations in `src/server/db/migrations`.
- **Clerk** for auth (`@clerk/nextjs` v6). The admin role comes from the Clerk
  session claims (`sessionClaims.metadata.role === "admin"`, set via
  `publicMetadata`).
- **next-intl v4** for i18n: locales `en, tr, ar, es, ru`, default `en`,
  always-prefixed URLs (`/en/...`). Arabic is right to left (`dir` is set on
  `<html>` in `src/app/[locale]/layout.tsx`).
- **UploadThing v7** for images (logos, item photos).
- **dnd-kit** for drag-and-drop ordering, **zod 3** for validation,
  **qrcode** for QR codes.
- **Package manager: pnpm** (`pnpm-lock.yaml` is the maintained lockfile;
  `package-lock.json` is stale and should be ignored or removed).

### Environment variables (`.env`, documented in `.env.example`)

`DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
`CLERK_WEBHOOK_SECRET`, `UPLOADTHING_TOKEN`, `NEXT_PUBLIC_APP_URL` (public
address used in QR codes and share links; must be the production domain in
production; optional, falls back to the request's address), `ADMIN_USER_ID`
(present in `.env` but not referenced anywhere in `src`; the admin role
comes from Clerk). `src/env.js` validates the server ones and
`NEXT_PUBLIC_APP_URL`.

### Commands

| Command | What it does |
|---|---|
| `pnpm dev` | dev server |
| `pnpm typecheck` / `pnpm lint` / `pnpm check` | `tsc --noEmit` / `next lint` / both |
| `pnpm i18n:check` | every literal `t("key")` exists in all 5 locales, every message formats (ICU, plurals), every server error code has a message |
| `pnpm db:generate` | generate a migration from schema changes (always read and, if needed, edit the SQL before applying) |
| `pnpm db:migrate` | apply migrations. **Use this, not `db:push`**: some migrations backfill data that `push` skips |
| `pnpm uploads:cleanup` | dry run: list UploadThing files nothing references; add `-- --delete` to delete (see §9) |

---

## 3. Map of the code

### Routes (`src/app`)

```
[locale]/
  layout.tsx          <html>, theme only. No Clerk, no translations for the
                      browser: menu pages (QR scans) stay light. See below.
  [restaurantSlug]/                                 public menu of one restaurant
    layout.tsx        gate: active → everyone; inactive → preview for people
                      with access (PreviewBanner, noindex), else redirect.
                      Gives the browser only CLIENT_NAMESPACES translations.
    page.tsx          the menu (hidden items excluded)
    about/, item/[itemSlug]/   (id-based item URLs permanently redirect to slugs)
  (site)/             every other page. layout.tsx adds ClerkProvider, all
                      translations, UploadThing's NextSSRPlugin, Navbar
    page.tsx, restaurants/, themes/, about/        public marketing + directory
  (site)/(client)/dashboard/                        restaurant staff
    layout.tsx        top bar: dashboard link, LanguageSwitcher, ThemeToggle, UserButton
    page.tsx          "Your restaurants" cards (+ setup progress)
    [restaurantSlug]/
      layout.tsx      access check for every page below (owner/editor/admin)
      menu/           categories + SetupChecklist;  menu/[categorySlug]/ items
      edit/           owner details form (editors are redirected to menu)
      share/          QR code, link, scan stats;  share/print/ table cards
      team/           members, invite editors by link, pending invitations, leave
  (site)/invite/[token]/   invitation page: sign in/up (Clerk withSignUp), email
                      check, accept/decline. noindex, no-referrer
  (site)/admin/                                     system admin only (layout checks role)
    restaurants/      list (filters incl. "Ready to go live"), new/
      [restaurantSlug]/edit | menu | menu/[categorySlug] | share | share/print | people
    users/, users/[userId]/   user list (search, Clerk profiles), access + roles, delete user
  (site)/sign-in/
r/[restaurantId]/route.ts   permanent QR link: counts the scan, 307 → /<current slug>
api/uploadthing/            upload routes (per-restaurant permission checks)
api/webhooks/clerk/         user.created / user.updated / user.deleted → users table
actions/                    server actions: auth, restaurant, category, menu-item, search
[locale]/(site)/admin/actions.ts   admin actions: assign/revoke access, delete user
```

`src/middleware.ts` runs Clerk + next-intl. It skips `/api`, `/trpc` and `/r/`
(those have no locale prefix). Server-side `auth()` works on every page; only
`(site)` pages have Clerk in the browser.

**Menu pages and the browser:** a client component used under
`[restaurantSlug]` can only use the translation namespaces listed in
`CLIENT_NAMESPACES` in `[restaurantSlug]/layout.tsx` (plus
`MenuEditor.dietary`); add new ones there or it shows `MISSING_MESSAGE`.
Never use Clerk's client components (`UserButton`, `useUser` …) there. This
layout split cut a menu page's JavaScript from 394 KB to 212 KB gzipped
(measured 2026-10-26 with production builds); keep it that way.

### Key modules

| File | Role |
|---|---|
| `lib/action-result.ts` | `ActionResult<T>`, `ActionError(code)`, `ACTION_ERROR_CODES`, `unwrap()`, `ActionFailure`. Browser-safe |
| `server/run-action.ts` | `runAction(fallbackCode, body)`: translates errors with the request locale; server-only |
| `app/actions/auth.ts` | `isSystemAdmin`, `getRestaurantRole`, `checkAuthorization` (any access), `checkOwnerAuthorization` (owner/admin) |
| `lib/access.ts` | `ACCESS_LEVELS` (`owner`, `editor`), `RestaurantRole` (+ `admin`), `canEditDetails` |
| `server/public-menu.ts` | cached reads for public pages (`getRestaurantBySlug`, `getPublicMenu`, `getPublicMenuItem`; `unstable_cache`, no Date columns) and `revalidatePublicMenu(id)` / `revalidatePublicRestaurant(id?)`, which every save action must call |
| `lib/format-price.ts` | guest-language prices, server only (see §6) |
| `lib/category-section.ts`, `lib/dietary-labels.ts` | menu section ids; dietary label → translation key |
| `server/menu-data.ts` | category summaries / category with items, shared by admin + dashboard |
| `server/dashboard-restaurant.ts` | `getDashboardRestaurant(slug)` → restaurant + viewer's role (React `cache`) |
| `server/setup-facts.ts` + `lib/setup-checklist.ts` | getting-started checklist data (grouped queries) and rules |
| `server/qr-scans.ts` | record scans, bot filter, 7/30/all-time stats |
| `server/uploads.ts` | `deleteUploadedFiles(urls)`: only deletes files no restaurant/item still references |
| `server/public-origin.ts` | public origin + share links (`menuUrl`, `permanentUrl`) |
| `server/clerk-profiles.ts` | batch Clerk profile lookup (name, photo, last sign-in, admin) |
| `lib/slug.ts` | `slugify`, `uniqueSlug`, `isUuid` |
| `lib/schemas.ts` | restaurant zod schema, `RESERVED_SLUGS` |
| `lib/menu-item-schemas.ts` | item zod schemas, `ITEM_AVAILABILITY` |
| `lib/resize-image.ts` | browser-side image shrinking before upload |
| `lib/qr-code.ts` | QR to SVG/PNG (logo in the middle), logo loading via `/_next/image` |
| `lib/unsaved-changes.ts` | `useUnsavedChangesGuard`, `hasUnsavedChanges` |
| `lib/table-card-text.ts` | printed card headlines per language (not in messages; chosen per print) |
| `utils/uploadthing.ts` | `UploadButton`, shared `uploadButtonClass` |

### Shared component folders

- `components/menu-editor/`: **shared by admin and dashboard**: `CategoryList`
  (takes `basePath`), `MenuItemList`, `MenuItemDialog`, `CategorySwitcher`,
  `ReorderStatus`, `ConfirmDialog` (optional `confirmText` = type to confirm),
  `DeleteCategoryDialog`, `availability.tsx`.
- `components/share/`: `SharePanel`, `TableCardSheet`, `ScanStats` (both sides).
- `components/forms/fields.tsx`: `FormSection`, `Field`, `UrlInput`,
  `CharCount`, `ToggleRow`.
- `components/admin/`: admin-only (English): restaurant form, list, cards,
  headers, people/user access, `StatusBadges`.
- `components/dashboard/`: `DashboardRestaurantHeader`,
  `RestaurantDetailsEditor`, `SetupChecklist`.
- `components/public/`: `MenuDisplayClient` (filters + dish sheet around
  `MenuLayout`), `MenuLayout` (the one layout; the design picks the dish
  component), `MenuItemCard` (the three dish styles, with `data-role`
  colour markers used by the Appearance preview), `DishSheet`,
  `DietaryBadges`, `CategoryNav` (scroll-following bar),
  `MenuItemDetail` (server), `PublicPageControls`, `PreviewBanner`,
  `SoldOutBadge`, `menu-types.ts`.
- `components/shared/`: `Navbar`, `ThemeToggle`, `LanguageSwitcher`,
  `RestaurantLogo` (logo or initials; admin, dashboard and public).

---

## 4. Data model (`src/server/db/schema.ts`)

| Table | Notes |
|---|---|
| `menu-hub_restaurants` | `slug` unique; `isActive` (live) and `isDisplayed` (featured on homepage); `logoUrl`, `ogImage`, `currency`, `theme`, social/delivery links (jsonb), SEO fields; menu languages: `multilingualEnabled` (admin switch), `mainLanguage`, `extraLanguages` (jsonb), `translations` (description per language); `timeZone` (IANA), `openingHours` (jsonb, `lib/opening-hours`), `brandColorEnabled` (admin switch for custom colours), `colorTheme` (jsonb light/dark palettes), legacy `brandColor` (#rrggbb) |
| `menu-hub_categories` | `slug` unique per restaurant; `order`; `translations` (name per language) |
| `menu-hub_menu_items` | `slug` unique per restaurant; `order`; `availability` enum `available` / `sold_out` / `hidden`; `dietaryLabels` jsonb; `price` is free text; `translations` (name/description/ingredients per language) |
| `menu-hub_users` | Clerk user id + email (synced by the webhook) |
| `menu-hub_users_to_restaurants` | `accessLevel` `owner` / `editor` (unknown values count as editor) |
| `menu-hub_qr_scan_days` | `(restaurantId, day UTC)` → `count`; no personal data |
| `menu-hub_restaurant_invites` | owner → editor invitations: lower-cased `email`, `tokenHash` (SHA-256 of the link token; the link itself is never stored), `expiresAt` (7 days), `invitedBy`. Unique per `(restaurantId, email)`: inviting again replaces the link. Accepted/cancelled rows are deleted, expired ones cleaned up when listed |

Deleting a restaurant cascades to its categories, items, access rows, scan
counts and invitations. Deleting a user cascades to their access rows.

**Migrations:** `0001` (old), `0002` slugs (with backfill SQL), `0003` QR scan
days, `0004` item availability, `0005` restaurant invitations, `0006` menu
translations, `0007` time zone, opening hours and brand colour, `0008` colour
theme (all add columns only), `0009` renames stored designs to the new
three (data only; `menuDesignOf` maps old names too, so the order of deploy
and migrate doesn't matter). The
development database has 0001–0004 applied (checked 2026-10-23); **0005 was
created 2026-10-26 and must be applied with `pnpm db:migrate` in dev and in
production before the Team tab, admin People tab or dashboard invitations
are used** (the Team and People pages error without the table). **0006
(2026-10-26) must run before deploying the menu-languages change: every
public restaurant page and the menu editors read its columns.** The same
goes for **0007 and 0008 (2026-10-26)**: public pages read their columns.

**Reserved slugs** (`RESERVED_SLUGS`): app routes like `admin`, `dashboard`,
`restaurants`, … plus `new` (admin route), `r` (QR link route) and `invite`
(invitation links).

---

## 5. Access model

- **System admin**: Clerk role `admin`. Full access everywhere; the only one
  who sees `/admin`, publishes restaurants (`isActive`), and manages users.
- **Owner**: restaurant details (name, address, phone, map link,
  description, logo, social/delivery links) **and** the menu.
- **Editor**: the menu only (categories, items, availability, duplicate,
  reorder) plus the Share tab. Sees the Team tab read-only and can leave.
- **Team management** (`app/actions/team.ts`, dashboard Team tab): owners
  (and admins, from the admin People tab) invite **editors only**, by a
  copyable link (WhatsApp button), and remove editors. Both screens render
  `components/team/InvitationsPanel` (translated, like the menu editor). **Owners are only added or removed by a system admin**
  (admin People tab); owners can't leave. Accepting an invitation requires a
  signed-in account whose **verified** Clerk email equals the invited
  address (`getVerifiedEmails`); the link alone isn't enough, and the accept
  action re-checks it. Accepting never downgrades an existing member, and
  creates the `users` row if the Clerk webhook hasn't yet. Invitees with an
  account also see open invitations on the dashboard home. Max 20 open
  invitations per restaurant.
- Admin-only restaurant fields (slug, active, featured, currency, theme,
  cuisine/type, country, SEO, og image) are **kept server-side** when a
  non-admin saves (`updateRestaurant`), whatever the request contains.
- Every server action checks access itself (`checkAuthorization` /
  `checkOwnerAuthorization` / `isSystemAdmin`), and every query that takes an
  id also filters by `restaurantId` (tenant isolation). `addMenuItem` /
  `updateMenuItem` verify the category belongs to the restaurant.
- Uploads (`api/uploadthing/core.ts`): item photos need any access to that
  restaurant; logos need owner/admin; a logo without a restaurant (admin "new
  restaurant" form) needs admin. Buttons send `{ restaurantId, locale }`.
- **Menu languages** (`lib/menu-languages.ts`, `app/actions/menu-languages.ts`):
  only a system admin switches the feature on per restaurant
  (`setMultilingualEnabled`); owners and admins pick the main and extra
  languages (the site's five only) and translate the description; anyone on
  the team translates items (item dialog tabs) and category names. Off hides
  translations everywhere but keeps them; removing a language keeps its
  text too. Server actions only accept the restaurant's current languages.
- **Opening hours and time zone** (`app/actions/restaurant-settings.ts`):
  owners and admins. **Colours**: a system admin switches custom colours on
  per restaurant (`setBrandColorEnabled`), then owners and admins design them
  on the Colours page (`updateColorTheme`).
- Inactive restaurants: public pages are visible as a **preview** to anyone
  with access (`PreviewBanner`, `noindex`); others are redirected.

---

## 6. Rules the code follows (keep following them)

### Server actions and errors
- Actions **return** `ActionResult` and never throw to the client: in
  production Next.js hides thrown error messages.
- User-facing failures are `throw new ActionError("code")` inside
  `runAction(fallbackCode, async () => …)`. The code must be in
  `ACTION_ERROR_CODES` (typed) **and** have a message under `ActionErrors` in
  all 5 locales; `pnpm i18n:check` verifies both. The server translates using
  the request locale; results also carry `code` for logic (e.g. the admin form
  maps `slugTaken`/`slugInvalid` to the slug field).
- To return data: `runAction<T>` → `ActionResult<T>` with `data`
  (see `duplicateMenuItem`).
- Client code either checks `result.ok` or wraps in try/catch with
  `unwrap(await action(...))`.
- After changing restaurant or menu data, call `revalidatePublicMenu(id)` or
  `revalidatePublicRestaurant(id?)` from `server/public-menu.ts`. They clear
  the public pages' cache **and** re-render everything under `/[locale]`.
  A plain `revalidatePath` leaves guests seeing cached data for up to an hour.
- `revalidatePath` matches folder paths, **route groups included**: use
  `"/[locale]/(site)/admin"`, not `"/[locale]/admin"`. Plain `"/admin/..."`
  paths never match because of the locale prefix.

### i18n
- Every user-facing string in public pages, the dashboard and shared
  components goes through next-intl in **all five** locales, with proper ICU
  plurals (Arabic zero/one/two/few/many/other, Russian one/few/many/other,
  Turkish no plural after numbers). Admin-only pages may stay English.
- Use the scripts in `scripts/i18n/` to edit `src/messages/*.json` (§7). They
  keep the files' formatting; don't rewrite the files with `JSON.stringify`.
- Brand names (Instagram, Getir, Uber Eats …) stay untranslated.
- Use logical CSS (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`,
  `text-start`), flip directional icons with `rtl:rotate-180`, and keep URLs,
  phone numbers and slugs `dir="ltr"`.

### UI conventions
- Shared menu editing lives in `components/menu-editor` (admin and
  dashboard render the same components with different `basePath`).
- Destructive actions use `ConfirmDialog` (shows errors, stays open while
  running). Restaurant deletion requires typing its name.
- Upload buttons use `uploadButtonClass`, resize images with
  `onBeforeUploadBegin={resizeImages(ITEM_PHOTO | LOGO)}` and pass the locale.
- Forms with a save bar use `useUnsavedChangesGuard(isDirty && !isPending, …)`.
- Prices are free text plus the restaurant's currency (often "TL" or
  "دينار", not ISO codes), never a hardcoded `$`. Public pages show them via
  `lib/format-price.ts`, **on the server only** (Node and browsers format
  some currencies differently → hydration mismatches). It only reformats
  unambiguous prices (`459`, `12.50`) in a known currency (`TL` → TRY);
  anything else ("3.000 دينار", "10-12 TL") shows exactly as typed. The
  editors show the raw `"{price} {currency}"`.
- Colors come from theme tokens; charts were validated with the dataviz
  method (bar color `#D97706` passes on both theme surfaces).

### Code style
- Match the surrounding code; comments explain *why*, in plain sentences.
- Files in this repo mix LF and CRLF line endings: prefer the Edit tool over
  regex/`sed` for multi-line changes, and check that a scripted edit actually
  matched.

---

## 7. Translation workflow

1. Write the new messages for all five locales into a JSON file outside the
   repo (e.g. a scratch folder):
   - new namespace: `{ "en": { "Ns": { … } }, "tr": { … }, … }` →
     `node scripts/i18n/add-namespaces.cjs src/messages <file>`
   - keys inside an existing namespace: `{ "en": { "Ns.path.key": "…" }, … }` →
     `node scripts/i18n/set-keys.cjs src/messages <file>` (refuses namespaces
     that aren't in the standard layout instead of reformatting them)
   - removing unused namespaces: `node scripts/i18n/remove-namespaces.cjs src/messages Ns1 Ns2`
2. Run `pnpm i18n:check`. Keys built at runtime (`` t(`dietary.${key}`) ``) aren't
   covered by the key scan; check those by hand.
3. **Restart `next dev` after changing message files.** Turbopack keeps stale
   copies per compiled page, so new keys show as `Namespace.key` on pages
   compiled earlier. If a restart isn't enough, delete `.next`. Production
   builds aren't affected.

Namespaces of note: `MenuEditor`, `ConfirmDialog`, `Availability`, `Share`,
`Setup`, `ActionErrors`, `UnsavedChanges`, `LanguageSwitcher`,
`DashboardShell`, `DashboardHome`, `DashboardRestaurant`, `RestaurantDetails`,
`MenuPreview`, `Dashboard` (role labels/hints), plus the older public ones
(`hero`, `restaurantMenuPage`, `menuItemDetailPage`, …).

---

## 8. Features as they stand

**Admin:** restaurant list (search, filters All/Active/Inactive/Ready to go
live/Featured, setup progress badges); full-page restaurant form with
sections, sticky save bar, slug auto-generation; Details / Menu / Share /
People tabs (People also invites editors by link and manages open invitations, with the same `components/team/InvitationsPanel` as the owner Team tab); users list with Clerk names/photos, access + Owner/Editor role,
delete user (Clerk + DB; not self, not admins).

**Dashboard:** home cards (logo, role, counts, setup progress, menu/details/
share/preview buttons, admin banner); Menu (checklist, categories:
add/rename/reorder/delete; items: sortable list, availability picker,
duplicate, delete, item dialog with photo, price, category move,
availability, dietary chips, "save and add another"); Details (owners);
Share (status, QR with logo switch, PNG/SVG downloads, link copy, permanent
link note, printable A4/A6 table cards with card language + second line, scan
stats); Team (members, invite editors by link with copy/WhatsApp, pending
invitations with new link/cancel, remove editors, leave); invitations on the
home page; language switcher; unsaved-changes guard.

**Public:** three designs (`lib/menu-design.ts`: classic, photo-grid,
compact), all one scrolling page (`components/public/MenuLayout.tsx`) with a
compact phone-first header, one-row search + Filter popover, and a sticky
category bar that follows the scroll; dishes (`MenuItemCard.tsx`:
`ClassicDish`, `PhotoDish`, `CompactDish`) open in a bottom sheet
(`DishSheet.tsx`, `?dish=<slug>` in the address so Back closes it and links
share; the dish page stays for long-press/new tab/Google); search (12+ items) and dietary filters;
prices in the guest's format; guest language switcher; sold-out items last
and dimmed; empty categories hidden; logo-or-initials, no placeholder images;
hidden items excluded (menu, item page, search); preview of inactive
restaurants for staff; permanent QR links `/r/<id>` that forward to the
current slug, count scans after the redirect, skip bots/HEAD/repeats within
30 minutes (path-scoped cookie).

**Menus in several languages:** existing columns hold the main language;
translations sit in `translations` jsonb (see §4). Settings card
`components/menu-languages/MenuLanguagesSettings` on the admin edit page and
the owner Details tab. Editor: language tabs in `MenuItemDialog`, a Translate
button per category, "Not translated: …" markers. Public pages localize with
`server/localize-menu.ts` (guest's language if the menu has it, else main,
field by field; text in another language than the page gets `lang` +
`dir="auto"`; search also matches main-language text). SEO: with
translations on, only the menu's languages get hreflang links and sitemap
entries; other language pages name the main-language page as canonical. The
admin SEO title/description (untranslated) are only used on main-language
pages. Slugs stay in the main language. Automatic translation: deferred.

**Opening hours:** card `components/restaurant-settings/OpeningHoursSettings`
on the admin edit page and the owner Details tab,
next to the menu-languages card. Up to 3 ranges a day; a close time before
the open time runs past midnight; open == close means 24 hours. The menu
header shows "Open now · until …" / "Closed · opens …" and the about page a
week table (`components/public/OpeningHours.tsx`, server components, worked
out per request in the restaurant's time zone). Structured data carries
`openingHoursSpecification`. QR scan days use the restaurant's time zone
once set (UTC before). Logic and tests: `lib/opening-hours.ts`.

**Appearance** (route `/colors`, tab "Appearance"): the menu design picker
(every owner; `updateMenuDesign` stores it in `restaurants.theme`) and custom
colours, in the dashboard (owners/admins; editors redirected) and in admin
(`components/colors/AppearanceEditor`). Its preview
(`components/colors/MenuColorPreview`) renders the real dish components in
the chosen design. A system admin switches the feature
on per restaurant (`brandColorEnabled`, toggle on the page); off = default
colours, design kept. Six colours per mode, light and dark
(`lib/color-theme.ts`: background, card, text, primary, secondary, accent);
every token the pages use (`--muted-foreground`, `--border`, text on
buttons …) is derived from them in `paletteTokens`, so hover (`accent`) and
every state follow the theme. The editor has presets, "Make from light
mode" (`darkFromLight`), contrast warnings (never auto-changes the owner's
choice) and a live preview (`MenuColorPreview`) whose parts carry
`data-role`: hovering outlines the part and highlights its control, clicking
selects it. `[restaurantSlug]/layout.tsx` wraps public pages in
`.brand-scope` (own background/text) with `colorThemeCss`. The CSS also targets
`body:has(.brand-scope)`, because pop-ups (dish sheet, filter panel,
language list) render at the end of `<body>`, outside the scope; keep that
when changing it. The unchanged "Default" palette uses the site's exact
tokens (`SITE_TOKENS`, white text on amber) instead of derived ones, and
gets no contrast warnings. Legacy: the
single `brandColor` (before themes) still applies, primary + accent, until a
theme is saved; saving or "Use the default colours" clears it. Default
palette values are hex conversions of globals.css: update `DEFAULT_THEME`
if the site theme changes. When adding colour to public components, use the
theme tokens (`bg-card`, `text-primary`, `hover:bg-accent` …), not fixed
colours, or custom themes won't reach them.

**Features page** (`/features`, was `/themes`, which redirects permanently
in `next.config.js`): marketing page for potential customers, built for
selling without plan labels (no plans exist yet). Hero, an interactive demo
(`components/features/MenuDemo`: Lokanta Demo, a made-up restaurant in
`lib/demo-menu.ts`, nine dishes in all five languages, each with a photo (`public/` and
`public/demo/`, Unsplash License, sources listed in `lib/demo-menu.ts`); visitors switch design, palette, light/dark and menu language
and tap dishes; it renders the real dish components and
`DishSheetInPlaceProvider`, a sheet that opens inside the phone frame and
keeps its state instead of using `?dish=`, and is non-modal so the page
keeps scrolling while it is open), feature groups, and a contact
block. The home page's "Why choose" section shows the same demo with fewer
controls. Prices for the demo are formatted on the server
(`server/demo-menu.ts`). **Contact details live only in
`lib/site-contact.ts`** (email, WhatsApp/phone; still the ones the home page
showed, to be confirmed by the owner). When a feature is added, add it to
the Features page's `GROUPS` and messages (`featuresPage.features`).

**Search engines and link previews:** menu, about and item pages have their
own title, description, preview image (admin SEO fields first, then
description / logo / dish photo), canonical URL and hreflang links
(`server/public-metadata.ts`). The menu page carries schema.org Restaurant
JSON-LD with sections, items, diets and prices
(`server/menu-structured-data.ts`; prices only when `parsePrice` can read
them; `jsonLd()` escapes `<`). `app/sitemap.ts` lists every live page in each of
its languages (`force-dynamic`, data cached an hour; at build time it would
freeze and need the database); `app/robots.ts` keeps crawlers out of admin,
dashboard, sign-in, `/api/` and `/r/`. The middleware lets both through
without a language prefix. Missing restaurants/items answer a real 404, and
inactive ones a 307: there must be **no `loading.tsx` above
`[restaurantSlug]`**, or responses start streaming as 200 first.

**Infrastructure:** Clerk webhook syncs users (created/updated/deleted);
UploadThing cleanup only deletes unreferenced files; `scripts/cleanup-uploads.mjs`
removes orphans (dry run first).

Git history (`git log`) has a detailed commit message for each change.

---

## 9. Open items and decisions

**Possible follow-ups to team management:** sending invitation emails (needs
an email service such as Resend and a verified sender domain; links are
copied by hand today); seat limits per plan for the SaaS; an activity log of
who changed what.

**Ideas raised and deferred:**
- Owner self-publishing ("Publish" button, maybe with admin review), building
  on preview + the "Ready to go live" queue.
- Translating the admin-only pages.
- Automatic translation of menus (AI/translation service; a paid-plan idea).
- Special closures and holidays for opening hours.

**Done by the owner (confirmed 2026-10-26):** Clerk webhook subscribed to
`user.updated` and `user.deleted`; `NEXT_PUBLIC_APP_URL` set on Vercel;
unused UploadThing files cleaned up; migrations applied in dev up to 0008.

**Still to check with the owner:**
- `pnpm db:migrate` in production for migrations 0002–0009, before deploying
  (0005: Team tab; 0006: menu languages; 0007: hours and brand colour; 0008:
  colour themes; 0009: design names).
- Owners set on each restaurant's People tab (all old assignments became editors).

**Agreed next steps, parked for now (2026-10-26):**
1. **Owners publish their own menu**: a Publish button once the checklist
   is complete, probably as "request publishing" that an admin approves in
   one click (the "Ready to go live" filter becomes a review queue); owners
   can unpublish. Decisions still open: instant vs approval, unpublish yes/no.
2. **Plans**: bundle the per-restaurant switches (menu languages, custom
   colours, editor seats …) into free/paid plans; needs pricing and a payment
   provider. Design discussion first.
3. Smaller: invitation emails, automatic translation, holiday closures,
   activity log.

**Known leftovers:**
- `package-lock.json` is stale (pnpm is canonical).
- `next lint` still warns in four files nobody has reworked yet:
  `app/[locale]/layout.tsx`, `app/[locale]/(site)/page.tsx`,
  `components/about/AboutPageClient.tsx`, `components/svg/GroovySittingDoodle.tsx`.
- Signed-out visits to the dashboard/admin redirect to sign-in with status 200
  (the redirect streams after `(site)/loading.tsx`). Harmless: crawlers are
  kept out by robots.txt.
- Old message keys left unused: `menuItemDetailPage.pageTitle`, `.priceLabel`,
  `.dietaryLabels` (the scripts have no single-key removal).

---

## 10. How to verify work here

- Always run `pnpm typecheck`, `pnpm lint` (or targeted `next lint --file …`),
  and `pnpm i18n:check` when messages changed.
- Pages behind Clerk can't be opened from a script; say so and tell the owner
  exactly what to click to check.
- **Don't start a second `next dev`** while the owner's is running: both write
  `.next` and corrupt each other. Same for deleting `.next`.
- Read-only database checks work with
  `node --env-file=.env --input-type=module -e '…'` using `postgres`. Never
  write to the database or apply migrations without being asked.
- Pure logic (QR codes, checklist rules, bot filter) was tested by transpiling the
  TypeScript file with `typescript.transpileModule` into a temp `.mjs`; delete
  temp files afterwards. ESM scripts resolve imports from the script's folder,
  so pipe them via stdin (`node --input-type=module < file`) to resolve from the project.
- Some packages are only nested under `node_modules/.pnpm` (e.g. `sharp`);
  import them by path.
- Shell gotchas: an apostrophe inside a `node -e '…'` script ends the bash
  string; use the Write tool for scripts with prose comments.
- Agent tooling decodes `\uXXXX` sequences in tool input, so writing a
  backslash-u escape into a file (Write/Edit, even shell commands) silently
  inserts the real character. Write such escapes with Python `chr(92)` and
  check the bytes (`cat -A`) afterwards.
- Files are mixed CRLF/LF; `grep -c $'\r$'` is unreliable in this Git Bash,
  count with Python (`b.count(b'\r\n')`) instead. Git normalises on commit.
- When the owner's dev server is stopped, a production check is possible:
  `pnpm build`, then `next start -p 3101` and fetch pages. Otherwise read
  pages from their dev server (GET only), as the point-4 checks did.

---

## 11. Working with the owner

- Explain changes in plain language with a short summary of what changed and
  what to test; flag anything not verified.
- **End every finished change set with a ready-to-paste commit message**
  (imperative subject, body grouped into changes and fixes, plus any deploy
  steps such as migrations). **Don't commit unless asked**; the owner commits.
- **Never mention Claude** in commit messages, pushes or PRs: no
  `Co-Authored-By` line, no "Generated with" footer. Commits are authored
  as **Chrollo** with the owner's email (set in this repo's git config).
- The owner prefers recommendations with reasons, then decides ("let's do
  your way"). Ask only when the choice is genuinely theirs.
- Keep admin and dashboard in step: features added to shared components
  should appear on both sides; say so explicitly.
