# Menupedia design: The Table (working draft)

> **Working draft (ticket 1 of Operation Set Table).** Written from the
> direction contract (`.impeccable/surfaces/src-app-locale-site-page-tsx.md`)
> before the pages are built. The final DESIGN.md is written in ticket 8 from
> the built world and replaces this file.

## The world

A shared restaurant table seen from above, where every seat reads the same
menu in its own language. Wine-red linen is the ground, porcelain plates are
the main surfaces, ink is warm near-black, brass marks focus and the current
choice, white place cards carry languages and navigation. Friendly and
everyday, never fine dining; a menu to read, never an ordering system.

Scope: the public site only (home, marketing pages, /menus, guest menus,
sign-in, navbar, footer). Everything lives under `.table-world`
(`<TableWorld>`), so the owner dashboard and the admin panel, which share the
`(site)` layout, keep their current look and shadcn tokens.

## Colour tokens

Defined in `src/styles/globals.css` on `.table-world` (light) and
`.dark .table-world` (dark), exposed as Tailwind colours (`bg-cloth`,
`text-ink-muted`, ...). Outside `.table-world` they are undefined, so they
cannot restyle the dashboard by accident.

| Token | Light | Dark | Use |
|---|---|---|---|
| `cloth` | `#7a1f2b` | `#6a1a25` | the linen ground |
| `cloth-deep` | `#5e1520` | `#4c1019` | darker cloth band |
| `cloth-action` | `#7a1f2b` | same | primary pill on porcelain (white text 10.2:1) |
| `cloth-ink` | `#7a1f2b` | same | cloth-red text on porcelain (9.8 / 7.9:1) |
| `on-cloth` | `#ffffff` | `#fff8f5` | text on the cloth (10.2 / 11.2:1) |
| `on-cloth-muted` | `#f1dcdf` | `#ecd3d6` | quieter text on the cloth (7.8 / 8.3:1) |
| `plate` | `#fbfaf7` | `#e9e2d7` | porcelain well (dimmed at night) |
| `plate-rim` | `#ebe6de` | `#d9cfc1` | the rim |
| `plate-rim-shadow` | `#d8d1c6` | `#c4b9a9` | line where the rim rises |
| `ink` | `#221a17` | same | text on plates (16.4 / 13.3:1) |
| `ink-muted` | `#5a4f4a` | same | secondary text on plates (7.6 / 6.2:1; 5.2:1 on the night rim) |
| `brass` | `#c9a24a` | `#d8b45e` | active seat ring, focus on the cloth (4.3 / 5.9:1) |
| `brass-ink` | `#7d5f17` | same | focus on porcelain (5.7 / 4.6:1) |
| `place-card` | `#ffffff` | `#ece5db` | place cards (dimmed paper at night) |
| `place-card-ink` | `#221a17` | same | place card text |
| `place-card-muted` | `#6f6460` | `#625853` | "Seat 1" label (5.7 / 5.5:1) |
| `sold-out` | `#c42318` | same | the SOLD OUT stamp (5.8 / 4.5:1) |

Dark mode keeps the material: the cloth deepens, plates and place cards stay
porcelain and paper, dimmed so they don't glare, and ink stays dark (lead's
ruling, 2026-11-09: the contract's porcelain-white plates win over the
ticket's "warm dark porcelain").

Contrast ratios are WCAG 2 against the surface named. Focus rings are drawn
outside the element, so `--table-focus` follows the surface around it:
brass-ink by default (porcelain, paper, off-white), brass on the cloth
(`.table-cloth` switches it), brass-ink again inside a `.table-plate`.

## Material

- **Cloth** (`.table-cloth`, `<Cloth>`): hairline repeating gradients, warp
  and weft, plus a coarser thread at prime periods (13, 17 px) so the weave
  reads as linen, not graph paper. No images, no SVG noise; painted once
  per layer, so scrolling is unaffected. `tone="deep"` for the darker cloth.
- **Plate** (`.table-plate`, `<Plate>`): a radial gradient draws the well,
  the rim (9% of the radius) and the thin shadow line where the rim rises;
  a soft offset shadow lifts it off the cloth. The hero plate is wider than a
  phone screen on phones (seen up close) and must sit in a centred row that
  clips horizontally.
- **Dish photos** (`<PlatePhoto>`): round, a porcelain rim drawn over the
  photo's edge. No photo: an empty plate (no icon, no broken image).
- **Place cards** (`<PlaceCard>`): white paper, small uppercase seat label,
  the name below, a slight tilt (mirrored on RTL pages), the current one
  ringed in brass (a ring, so keyboard focus keeps its own outline, white
  on the cloth just outside the ring; its
  offset gap is cloth red, so the active state is for cards on the cloth). Each
  line takes its direction from its own script (`dir="auto"`). Always a real
  button (`aria-pressed`) or, with `asChild`, a link (set `aria-current`),
  at least 44 px.
- **Leaders** (`<LeaderRow>`): name, dotted leader, price; prices in tabular
  figures; long names wrap and the leader follows the last line
  (`align-items: last baseline`); RTL flips it with no extra code.
- **Stamp** (`<Stamp>`): red, bordered, uppercase, tilted -8° (mirrored in
  RTL). The only ornament. Arabic is never letter-spaced.
- **Buttons**: `Button` variants `table` (cloth-red pill on porcelain) and
  `tableOnCloth` (white pill on the cloth), size `pill` (44 px min); both variants draw the
  `--table-focus` outline. Use them only inside `<TableWorld>`.

## Type

- **Bricolage Grotesque** (variable, optical size axis): headlines and text,
  Latin and Turkish (`latin`, `latin-ext`). Headlines 800, tight tracking
  (-0.035em), `text-balance`.
- **Onest** (variable): Cyrillic only. Bricolage Grotesque has no Cyrillic,
  so Russian falls through to Onest, a friendly grotesk of similar build.
- **Noto Sans Arabic** (variable): Arabic.

One stack (`--table-font`) for every locale (Russian pages put Onest first,
so Latin words in Russian text share its face): the browser picks the face per
script by unicode-range, so an Arabic place card on an English page is set in
Noto Sans Arabic, and a page only downloads the scripts it shows. Fonts are
declared in `src/components/table/fonts.ts`, not the root layout, so only
routes that render `<TableWorld>` preload Bricolage latin only (latin-ext loads
on demand for Turkish); Onest and Noto Sans Arabic are never preloaded
(`display: swap`). Bricolage and Onest use `adjustFontFallback: false`:
next/font's Arial stand-in has Cyrillic and Arabic glyphs and, placed
mid-stack, would set Russian and Arabic in Arial on Mac, Windows and iOS. The
dashboard and admin keep Geist.

## Eyebrow

The home plate carries a small eyebrow above the headline ("Digital menus
for restaurants and cafés"): plain letter-spaced caps in cloth red on the
plate, never a pill, chip or badge, no icon. The detector's
`hero-eyebrow-chip` finding is justified: required by the direction
contract's FIRST VIEWPORT and the approved sketch (lead's ruling,
2026-11-09). Arabic eyebrows are never letter-spaced.

## Motion

Place cards lift on hover (200 ms ease-out, `motion-safe` only). The
signature move is built (ticket 4, see "Signature interaction"); with reduced
motion it switches instantly.

### Signature interaction

Tap a place card and the phone's menu turns to that language (400 ms
`plate-turn` in `globals.css`, `transform`/`opacity` only, no layout shift;
Arabic flips the screen to RTL). `home/HeroStage.tsx` is the one client
island: it holds the active seat (starting as the page's language, so /ar
opens in Arabic) and picks one of five server-rendered `DemoScreen`s; the
URL and the site's language never change. Seats are plain tab-order buttons
with `aria-pressed` and a polite live region ("Showing the menu in ...", key
`HomePage.hero.showing`). The phone screen has a fixed size, carries `lang` and
`dir`, and crops what does not fit. Texts and prices: `src/lib/demo-menu.ts`
(fake data, five languages), formatted in `src/server/demo-menu.ts`.

## Logo

`public/brand/menupedia-wordmark.svg` (cloth red, for light grounds) and
`menupedia-wordmark-dark.svg` (porcelain, for the cloth and dark mode). The
mark is a plate seen from above: a disc with the well's edge cut out as a
thin ring (even-odd, transparent, so it sits on any ground). The well sits
up and to the start (a sixth of the radius), so the rim reads as a lit crescent rather than
a centred dot. "Menupedia" is Bricolage Grotesque 700 at optical size 96,
converted to outlines, so it
renders without the font. viewBox 469 x 100, the same proportions as the old
logo, so the navbar and footer only changed their `src`. **Pending the
owner's approval.**

The site's structured data uses the new square mark, `public/icon-512.png`.

## Raster provenance

All made once on 2026-11-09 by Chrollo; no image generation. The only photos are the demo dishes in `public/demo/` (Unsplash License, sources listed in `src/lib/demo-menu.ts`).

| File | Size | How |
|---|---|---|
| `public/brand/menupedia-wordmark*.svg` | 469 x 100 | Node script with opentype.js: the static instance of Bricolage Grotesque (opsz 96, wght 700) from Google Fonts (SIL Open Font License), text to SVG paths; the mark drawn as SVG circles. |
| `public/icon.svg` | 64 x 64 | the mark in porcelain on a cloth-red rounded square |
| `public/favicon.ico` | 32 x 32 | Playwright screenshot of the square mark (no rounded corners), wrapped as a PNG-in-ICO |
| `public/apple-icon.png` | 180 x 180 | Playwright screenshot of the square mark |
| `public/icon-192.png`, `icon-512.png` | 192, 512 | same; the plate stays inside the maskable safe zone |
| `public/og-image.png` | 1200 x 630 | Playwright screenshot of an HTML template: the cloth texture, a plate with the wordmark, the headline "Every seat reads your menu in their language.", the Lokanta Demo phone (demo dishes, photos from `public/demo/`) and five place cards (English ringed, Türkçe, العربية, Español, Русский), set in Bricolage Grotesque, Onest and Noto Sans Arabic |

## Home pattern

`src/app/[locale]/(site)/page.tsx` only composes; each section is a small
server component in `src/components/home/`. Copy this for the other pages.

- Order: Hero, HowItWorks, GuestsSee, Features, ExampleMenus, Pricing,
  ContactClose. One h1 (the hero plate), then one h2 per section, h3 inside.
- Sections are bands of cloth, full width, alternating `tone` cloth / deep,
  built with `PageSection tone="cloth|deep"` (heading and intro centred on the
  cloth, `py-16 lg:py-24`, `max-w-6xl`) and `CtaCard tone` for the close.
  Without `tone` they keep their old look for pages not yet moved.
- Content is made of primitives: `Plate size="fluid"` (as wide as its
  grid cell; give it `max-w-80` and `@container`, size type with `cqw` and
  keep text in a 66-70% wide box so it stays inside the rim), `Platter` for
  rows (leader rows on a rectangular porcelain tray), `PlatePhoto`,
  `PlaceCard`, `LeaderRow`, `Stamp`. No cards, no icon tiles. Step numbers are
  paper cards tucked under the plate's rim.
- Hero: fractions of the container, never fixed px. On phones the plate is
  `min(40rem,150vw)` wide inside an `overflow-x-clip` cloth and the copy box is
  `min(68%, 100vw - 3.5rem)`. Verify copy against the circle, not the box.
- Arabic: `rtl:tracking-normal` and `rtl:leading-snug` (1.3 on the h1) on
  headlines; caps labels lose their letter-spacing.
- `DemoPhone` takes a `locale`; the place cards (`SeatCards`) are buttons
  with no handler yet (ticket 4).
- `check:ui` skips text on gradients, which includes every plate: plate text
  uses `ink` / `ink-muted` on `plate`, 13:1 and above in both themes (see
  Colour tokens).

## Menus pattern

`/menus` is one cloth page: h1 and intro on the cloth, then `src/components/menus/`.
Each example menu is a `Plate` (as in the home's ExampleMenus, with the same
"Example" label) that links to the menu; place, hours and dish count sit under
it on the cloth and its languages are small static place cards. Grid is by
container (`@container`: 1, 2 at `@2xl`, 3 at `@5xl` columns). Filters and
scope are place-card chips (white, brass and a check when chosen, 44 px), the
search field sits on a pill platter, dish results are leader rows on a
`Platter`, empty and no-result states are a bare plate with one line and a
button. The phone filter sheet and the select popovers carry `table-world`.
No sample dish row on the plates: the directory data has no dish or price.

## Guest menu pattern

Guest pages (`[restaurantSlug]/**`, ticket 7) live in The Table but keep the
restaurant's colour and logo. The layout wraps them in
`<TableWorld className="guest-menu">`; `.guest-menu` (globals.css) maps the
shadcn tokens the guest components use to the world, so `bg-card` is a white
place card (dimmed paper at night) and `text-foreground` is ink in both
modes. The ground is warm off-white `#f5f0e8` by day, warm near-black
`#1d1714` at night; text set straight on it uses `text-on-ground` /
`text-on-ground-muted`, never `text-foreground` or `text-primary`.

- The restaurant's colour: the theme's light primary, or its header when
  the theme is dark all over, or the legacy brand colour
  (`guestBrandColor`). `guestBrandCss` turns it into `--brand` (the 6 px
  band under the header, `bg-brand`) and `--brand-ink` (prices, open-now,
  active pills via `--primary`), darkened towards ink until 4.5:1 on the
  ground by day and on the dimmed plate at night (demo green #2f7d32 becomes
  #2e732f at night; light yellow #f5e663 becomes #766c35 / #6c6132). No
  colour set: cloth red. The theme's other roles are not used on guest
  pages any more.
- Menu page: white header (logo, full name that wraps, open-now line with a
  drawn dot, controls that wrap to a second row), band, search and filter,
  sticky pill nav on the ground, muted caps section headings with a rule,
  dishes as white cards: classic = leader row and a 96 px `PlatePhoto`;
  photo grid = a 128 px plate on top (shrinks, stays round), leader row
  under; compact = leader rows in one card, no photos.
- Sold out: `Stamp` in the flow under the name, never over it.
- Item page and sheet: a large plate, `LeaderRow` with the name as the
  heading, stamp under it. About: band, white card, controls on a paper
  pill over the ground. 404 and error: the ground and an empty plate.
- Portals (dish sheet, filter popover, language list, branch dialog) add
  `table-world guest-menu` and `tableFontVariables` themselves.
- Font: Bricolage (one latin woff2 preloaded) on guest pages; LCP measured
  no worse than the system/Geist baseline (`pnpm check:lcp`).

## Marketing pages

Same recipe as the home: small server components, bands of cloth, plates.
Shared blocks live in `shared/MarketingBlocks.tsx` (`ClothHero`: the one h1 on
the cloth; `PageSection tone`; `PlatterList`: named rows with dotted rules on
a `Platter`; `CLOTH_LINK`), `shared/StepPlates.tsx` (the home's steps, also
used by pricing, about, multilingual), `shared/FaqList` (rows on a platter)
and the home's `ContactClose` (every page closes with it; `#contact` is its
id). Forms on a plate use `.table-form` (maps the shadcn tokens to porcelain
and ink).

| Page | Blocks |
|---|---|
| `/features` | ClothHero, `MenuDemo` (controls on a platter, phone in a warm-ink bezel), feature groups as platters of `PlatterList`, price line, ContactClose |
| `/pricing` | ClothHero, home `PricingPlate` + leader rows of what is included, StepPlates (trial), FaqList (FAQPage JSON-LD kept), ContactClose. The old monthly/yearly toggle and card are gone: one plan; the yearly price is in the FAQ |
| `/faq` | ClothHero, one platter of `FaqList` per group on alternating bands (FAQPage JSON-LD kept), ContactClose |
| `/about` | ClothHero, story platter, StepPlates (4), audience platters, values `PlatterList`, ContactClose (the doodle is gone) |
| `/multilingual-menu` | ClothHero, StepPlates, MenuDemo, details `PlatterList`, FaqList, ContactClose |
| `/start` | cloth, h1, the form on a `table-form` platter (signed-out visitors still go to sign-in; not rendered offline) |
| `/kvkk` | h1 on the cloth, the notice on one wide platter, 17 px text, 1.75 line height |
| `/invite/[token]` | no navbar: brings its own `TableWorld` and `main`; place-card language list, form states on a platter |

## Open

- ~~`/menus` restyled in the Table (ticket 6).~~ Done, see "Menus pattern".
- Wordmark and colours need the owner's approval.
- ~~Ticket 3 (from the reviews of the preview): first viewport relative to its
  container; hero copy inside the plate at 320 px; looser Arabic headline
  line height; contrast guard for brand colours on the dark plate.~~ Done in
  ticket 3 (see "Home pattern"). The only restaurant colour on the home is
  Lokanta Demo's green band on the phone's screen (white on it, 10:1); no
  brand colour sits on a dimmed plate.
- Arabic and Cyrillic faces are not preloaded on /ar and /ru (one font
  instance serves all locales); the Arabic headline swaps in after load.
  /ru still preloads Bricolage latin (~77 KB) though Russian pages set Onest
  first.
- ~~Ticket 2: the "●" in "Open now" ... draw the dot in CSS.~~ Done in
  ticket 7 (`OpenStatusText` draws it; no "●" glyph left in the code).
- ~~Guest menus in The Table, sold-out stamp clear of names, guest portals
  carry the scope (ticket 7).~~ Done, see "Guest menu pattern".
- The colours editor still offers seven roles per mode; guest pages now use
  only one colour from it (owner to decide whether to simplify the editor).
- Radix portals (done in ticket 2): the mobile sheet and the language popover
  carry `table-world` plus `tableFontVariables` on their own content, so they
  get the tokens and fonts. Do the same for any new portal.
- Clerk's `appearance` (done in ticket 2, `(site)/layout.tsx`): cloth-red
  primary, `--table-font`, brass-ink focus, see-through card on a porcelain
  plate. It could not be seen offline (the widget needs Clerk); check it once
  with real keys.
- Geist is still declared (and preloaded) in the root layout for every page.
  Once all public pages are inside `<TableWorld>`, move it to the dashboard
  and admin layouts so public pages preload only Bricolage (latin ~77 KB
  woff2).
