---
version: 1
slug: "src-app-locale-site-page-tsx"
primary_target: "src/app/[locale]/(site)/page.tsx"
related_targets: ["src/app/[locale]/(site)/menus/page.tsx","src/app/[locale]/[restaurantSlug]/_pages/menu-page.tsx","src/app/[locale]/(site)/sign-in/[[...sign-in]]/page.tsx"]
---

# Public site: home, marketing pages, /menus, guest menus, sign-in

Mode: Persuade (home, marketing, /menus); guest menus are Operate inside the same world.
Audience: restaurant owners anywhere (buyers); guests on phones (users).
Job: an owner believes, within one screen, that guests will love the menu AND that this is serious software; then starts free (6 months, then $25/month).
Proof: show the product working (demo restaurant "Lokanta Demo", example menus labelled as examples). No invented customers, numbers or quotes.
Constraints: 5 languages incl. Arabic RTL; name "Menupedia" fixed, logo and colours open; WCAG AA; fast on mobile data; warm and inviting; clearly a menu to read, never an ordering system; avoid startup-SaaS, cartoon and corporate-grey looks. Rejected on 9 Nov: "The Pass" (read as ordering, too cool), "Wayfinding".

## Direction contract

THESIS: A shared restaurant table seen from above, where every seat reads the same menu in its own language. Refuses the split hero with a feature-card grid, and any ordering or kitchen imagery.

OWN-WORLD: Deep wine-red linen as the ground (fine woven texture), porcelain-white plates with a soft rim as the main surfaces, warm near-black ink, brass for focus and highlights, white place cards as the language and navigation vocabulary. A friendly, sturdy grotesk with character for headlines and text, a proper Arabic face for RTL. Round plate frames for food photos; dotted leaders to prices; a red SOLD OUT stamp is the only ornament. Real, everyday food photography (not fine dining).

STORY: The visitor sees one menu on a phone lying on the table, taps the place cards and watches it switch language (Arabic flips right to left), understands "every guest reads my menu, and I run it myself", and starts free.

FIRST VIEWPORT: Slim nav on the cloth. Left: a large plate holds the eyebrow, the headline "Every seat reads your menu in their language.", one line of copy, the primary action "Create your menu" and the price note. Right: a phone lying at an angle showing Lokanta Demo. Five place cards (English, Türkçe, العربية, Español, Русский) around the table; the active one ringed in brass.

FORM: The set table seen from above, candidate 3 of 7 on the re-rolled list (re-roll 1, steer: warm, a menu to read, not ordering). seed:d7a275540f9d5ec0. Signature interaction: tap a place card and the phone's menu changes language with a short turn of the plate; reduced-motion swaps instantly. /menus = example menus as plates on the table, labelled examples. Guest menus keep the restaurant's own colours and logo; the world shows as a warm off-white ground, a band in the restaurant's colour under the header, round plate photos, leaders to prices and the sold-out stamp. Sign-in sits on a plate.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
