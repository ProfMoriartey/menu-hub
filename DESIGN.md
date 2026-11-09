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
| `cloth-action` | `#7a1f2b` | `#a3303f` | primary pill on porcelain (white text 10.2 / 6.9:1) |
| `cloth-ink` | `#7a1f2b` | `#f0a3ad` | cloth-red text on porcelain (9.8 / 7.8:1) |
| `on-cloth` | `#ffffff` | `#fff8f5` | text on the cloth (10.2 / 11.2:1) |
| `on-cloth-muted` | `#f1dcdf` | `#ecd3d6` | quieter text on the cloth (7.8 / 8.3:1) |
| `plate` | `#fbfaf7` | `#2a2321` | porcelain well |
| `plate-rim` | `#ebe6de` | `#352c29` | the rim |
| `plate-rim-shadow` | `#d8d1c6` | `#1b1514` | line where the rim rises |
| `ink` | `#221a17` | `#f3ece6` | text on plates (16.4 / 13.2:1) |
| `ink-muted` | `#5a4f4a` | `#c7bab1` | secondary text on plates (7.6 / 8.2:1) |
| `brass` | `#c9a24a` | `#d8b45e` | active seat ring, focus on the cloth (4.3 / 5.9:1) |
| `brass-ink` | `#7d5f17` | `#d8b45e` | focus on porcelain (5.7 / 7.8:1) |
| `place-card` | `#ffffff` | `#ece5db` | place cards (dimmed paper at night) |
| `place-card-ink` | `#221a17` | `#221a17` | place card text |
| `place-card-muted` | `#6f6460` | `#625853` | "Seat 1" label (5.7 / 5.5:1) |
| `sold-out` | `#c42318` | `#ff7a6e` | the SOLD OUT stamp (5.8 / 6.1:1) |

Contrast ratios are WCAG 2 against the surface named. Focus rings are drawn
outside the element, so `--table-focus` follows the surface around it:
brass-ink by default (porcelain, paper, off-white), brass on the cloth
(`.table-cloth` switches it).

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
  ringed in brass (a ring, so keyboard focus keeps its own outline). The
  words take their direction from their script (`dir="auto"`). Always a real
  button (`aria-pressed`) or, with `asChild`, a link (set `aria-current`),
  at least 44 px.
- **Leaders** (`<LeaderRow>`): name, dotted leader, price; prices in tabular
  figures; long names wrap and the leader follows the last line
  (`align-items: last baseline`); RTL flips it with no extra code.
- **Stamp** (`<Stamp>`): red, bordered, uppercase, tilted -8° (mirrored in
  RTL). The only ornament. Arabic is never letter-spaced.
- **Buttons**: `Button` variants `table` (cloth-red pill on porcelain) and
  `tableOnCloth` (white pill on the cloth), size `pill` (44 px min, brass
  focus ring). Use them only inside `<TableWorld>`.

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

## Motion

Place cards lift on hover (200 ms ease-out, `motion-safe` only). The
signature move (tap a place card, the phone's menu turns to that language,
Arabic flips) is built in ticket 2; with reduced motion it switches
instantly.

## Logo

`public/brand/menupedia-wordmark.svg` (cloth red, for light grounds) and
`menupedia-wordmark-dark.svg` (porcelain, for the cloth and dark mode). The
mark is a plate seen from above: a disc with the well's edge cut out as a
thin ring (even-odd, transparent, so it sits on any ground). The well sits
slightly up and to the start, so the rim reads as a lit crescent rather than
a centred dot. "Menupedia" is Bricolage Grotesque 700 at optical size 96,
converted to outlines, so it
renders without the font. viewBox 469 x 100, the same proportions as the old
logo, so the navbar and footer only changed their `src`. **Pending the
owner's approval.**

The old `public/menupedia-logo.svg`, `-dark.svg` and `.png` are kept
(unreferenced now; delete once the owner approves). The site's structured
data uses the new square mark, `public/icon-512.png`.

## Raster provenance

All made once on 2026-11-09 by Chrollo; no image generation, no stock.

| File | Size | How |
|---|---|---|
| `public/brand/menupedia-wordmark*.svg` | 469 x 100 | Node script with opentype.js: the static instance of Bricolage Grotesque (opsz 96, wght 700) from Google Fonts (SIL Open Font License), text to SVG paths; the mark drawn as SVG circles. |
| `public/icon.svg` | 64 x 64 | the mark in porcelain on a cloth-red rounded square |
| `public/favicon.ico` | 32 x 32 | Playwright screenshot of the square mark (no rounded corners), wrapped as a PNG-in-ICO |
| `public/apple-icon.png` | 180 x 180 | Playwright screenshot of the square mark |
| `public/icon-192.png`, `icon-512.png` | 192, 512 | same; the plate stays inside the maskable safe zone |
| `public/og-image.png` | 1200 x 630 | Playwright screenshot of an HTML template: the cloth texture, a plate with the wordmark, the headline "Every seat reads your menu in their language.", the Lokanta Demo phone (demo dishes, photos from `public/demo/`) and five place cards (English ringed, Türkçe, العربية, Español, Русский), set in Bricolage Grotesque, Onest and Noto Sans Arabic |

## Open

- Wordmark and colours need the owner's approval.
- Decisions raised to the lead: the eyebrow above the headline (the contract
  asks for it; the design skill bans it) and the dark-mode plate (built as
  the ticket asked, warm dark porcelain; the design review prefers dimmed
  porcelain).
- Ticket 2 (from the reviews of the preview): lay the first viewport out
  relative to its container (fixed px clip cards and phone from 1024 to
  ~1310 px); keep hero copy inside the plate at 320 px; a looser line height
  for Arabic headlines; restaurant brand colours on the dark plate need a
  contrast guard; set the public pages' html/body background to the cloth.
- Arabic and Cyrillic faces are not preloaded on /ar and /ru (one font
  instance serves all locales); the Arabic headline swaps in after load.
- Radix portals (dropdowns, dialogs) render into `<body>`, outside
  `<TableWorld>`: give portal content its own `table-world` class, or put
  the class on a public-only layout that hosts them.
- Clerk's sign-in `appearance` still uses the old orange and Geist (ticket 2).
- Geist is still declared (and preloaded) in the root layout for every page.
  Once all public pages are inside `<TableWorld>`, move it to the dashboard
  and admin layouts so public pages preload only Bricolage (latin ~77 KB
  woff2).
