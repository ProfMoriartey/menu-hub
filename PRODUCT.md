# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Restaurant owners and managers** (the buyers): owners of restaurants, cafés,
  bakeries and similar places, anywhere in the world. Busy, often not technical,
  often on a phone. They come to the marketing site to decide in a few minutes
  whether a digital menu is worth trying, then build and update their menu
  themselves in the dashboard. Staff (editors) can be invited to keep the menu
  up to date.
- **Guests**: people at a table (or about to visit) who scan a QR code and read
  the menu on their own phone, in their own language, often on mobile data.
  They never sign up.
- **The product owner** (one person, system admin): sets up restaurants,
  handles plan requests and payments in the admin panel, in English.

## Product Purpose

Menupedia replaces printed menus with a menu guests open by scanning a QR code,
in their phone's language, and that the restaurant changes itself in seconds,
with nothing to reprint. Success: restaurants keep their menus complete and
current on their own, guests use them at the table, and restaurants stay after
the free period.

## Positioning

A multilingual menu the restaurant runs itself. Guests get the menu in their
own language (English, Turkish, Arabic with right-to-left layout, Spanish,
Russian) with no app and no sign-up. Owners change dishes, prices and
availability themselves and see it live at once, with permanent QR codes that
never need reprinting. Not tied to any one country or cuisine.

## Operating Context

- Guests: a phone at the table, in daylight or a dim room, one hand, possibly a
  slow connection; they want to find a dish and its price fast.
- Owners: set up in the dashboard (often on a phone), print QR table cards, edit
  prices and sold-out items during service, check daily scan counts.
- Sales today happen in person: the product owner shows a live menu on a phone
  to restaurant owners, then helps them set up.

## Capabilities and Constraints

- Public menu per restaurant, with branches (each with address, map, hours),
  item pages and an about page; three menu designs (Classic, Photo grid,
  Compact); restaurant's own colours for light and dark mode; logo.
- 5 languages for the site and menus; Arabic is right to left. Translations of
  dishes are entered by the restaurant (no automatic translation).
- Search and dietary filters, "Open now" from opening hours, sold-out items,
  prices in the guest's number format, dark mode.
- Permanent QR links (`/r/...`), printable table cards, daily scan statistics,
  search-engine friendly pages, link previews for sharing.
- Teams (owner and editor roles, invite links), a menus directory (`/menus`).
- Pricing: free for 6 months, then $25 a month or $250 a year, everything
  included; payment by card or cash, handled manually (no payment provider).
- Stack: Next.js 15, Tailwind CSS v4, shadcn/Radix, next-intl, Clerk, Drizzle on
  PostgreSQL, UploadThing.

## Brand Commitments

- The name **Menupedia** is fixed. The logo and colours are open for the
  redesign (decided 2026-11-09).
- The site should feel warm and welcoming, modern and professional, and must not
  read as tied to one city or country.

## Evidence on Hand

- Demo menus built from public menus of real places (e.g. Durumle, Flu Burger,
  Must Bowl, Yemen Royal). They may be shown **only as examples**, never as
  customers. There are no customers, testimonials, ratings or usage numbers yet:
  do not invent any.
- "Lokanta Demo", a made-up restaurant used for the interactive demo.

## Product Principles

1. The guest's menu comes first: fast, readable and appetising on any phone.
2. Owners can do everything themselves, without technical skills.
3. Every language is first class, right to left included.
4. Honest claims only: show the product working rather than invented proof.

## Accessibility & Inclusion

WCAG 2.1 AA for text contrast and touch targets on guest and owner pages;
right-to-left layout and Arabic type rendering; respect reduced motion.
