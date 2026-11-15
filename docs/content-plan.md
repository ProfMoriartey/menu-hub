# Menupedia content plan

Videos, posts and stories to sell Menupedia to restaurant owners. Agreed
with the owner on 2026-11-15. Nothing gets made until it's agreed here
first; then pieces are made one by one, in the order of the schedule.

Online copy (for comments): https://claude.ai/artifact/1q8i6JdnXXgPpVf8kfU656
This file is the one to work from; keep both in step.

## What this is for

- **Who:** owners and managers of restaurants, cafés and bakeries. Busy,
  often not technical, often on a phone.
- **The message:** menus made easy. Ready in minutes, updated in seconds.
- **The selling point:** owners need no one. They sign up on the website and
  make their menu themselves in about 5 minutes. Every piece ends by sending
  them to sign up ("Menünüzü 5 dakikada oluşturun", menu-pedia.com), not to
  call or message us.
- **Where it goes:** Instagram, Facebook, WhatsApp (sent to owners), and on
  the owner's phone during in-person sales.
- **Language:** everything in Turkish first; English versions later. No
  Arabic until the Arabic lines are reworked.

## Brand rules

- **Colours:** crimson `#9b1c2e` and the logo's gold `#dcaa48`. By day,
  cream `#fbf6f0` and dark ink. At night, deep wine `#221316` with ivory
  text `#f3e9e1` and gold accents.
- **Logo:** the plate with the gold ribbon (`public/icon.svg`,
  `public/menupedia-logo.svg`, `public/menupedia-logo-dark.svg`). No slogan
  under the logo for now. `docs/brand/` holds the old amber logo: don't use it.
- **Backgrounds:** crimson gingham by day, damask by night. Text sits on a
  napkin (a solid card); headlines and photos sit on plates. The styles are
  in `src/styles/globals.css` (`plate`, `platter`, `napkin`, `site-cloth`).
- **Type:** Bricolage Grotesque; Onest for Russian, Noto Sans Arabic for
  Arabic.
- **Animation:** turning plates and the gold ribbon (unrolling, sweeping
  across, tying around a plate), menus opening.
- **Demo menu:** Lokanta Demo (made up) in every piece.
- **Honesty:** no invented customers, reviews or numbers. Demo menus from
  real places are shown only as examples, never as customers.
- **Offer:** say only "6 ay ücretsiz" (free for 6 months). Never show the
  price ($25 a month / $250 a year): owners see it on the website.
- **On posts and videos:** the website (menu-pedia.com) and Instagram
  @menupediaofficial. No phone number and no email: people reach us from the
  website if they need to.
- **Link in bio:** the website link sits in the Instagram bio (and other
  profiles). Captions say "Link profilde" instead of asking people to type
  the address.
- **Always Menupedia:** every piece shows the Menupedia logo and name.
- **Videos have music.**

## Message bank

Turkish and English are ready to use. The Arabic needs rework (not used yet).

| English | Turkish | Use |
| --- | --- | --- |
| Menus made easy. | Menüler artık çok kolay. | Headline (live on the Turkish home page) |
| Ready in minutes, updated in seconds. | Dakikalar içinde hazır, saniyeler içinde güncel. | Line under the headline |
| You cook. We handle the menu. | Siz yemeği yapın, menü bizden. | Warm line for posts |
| Never reprint a menu again. | Bir daha menü bastırmayın. | The printed-menu pain |
| Edit. Save. It's live. | Düzenleyin. Kaydedin. Yayında. | Short video beat |
| Every menu, every language. | Her menü, her dilde. | Languages feature |
| Free for 6 months. | 6 ay ücretsiz. | Offer, end of every piece |

## Video ideas

15 to 25 seconds each, showing one easy thing in the real product, with
music. All in Turkish except the languages video. Status: all planned.

| Video | What it shows | Animation idea | Format | Language |
| --- | --- | --- | --- | --- |
| Sales demo loop | A silent loop to play on a phone or tablet while talking to an owner | A plate turns, the ribbon unrolls the three steps, and it loops without a jump | Vertical, 28s loop | Turkish |
| Your menu in 5 minutes | Sign up on the website, add the restaurant, add dishes, get the QR code: the whole self-serve setup, with a 5-minute clock; nobody to call | A plate turns like a clock face counting the 5 minutes; the ribbon carries each step | Vertical, 20–25s | Turkish |
| Price change in seconds | A printed menu with a price crossed out by pen, then the dashboard changes it, Save, and the guest's phone updates at once | A pen strikes the old price; a plate spins in carrying the phone; the gold ribbon sweeps across to reveal the new price | Vertical, 20s | Turkish |
| Paper to QR in 3 steps | Add your dishes, print the QR card, a guest scans it at the table | Three plates slide in, one per step, with the ribbon drawing a path between them; the QR card drops onto the table | Vertical, 20s | Turkish |
| Sold out tonight | During service the owner taps Sold out, and the dish greys out on the guest's phone | The dish's plate turns over and a ribbon reading "Tükendi" drapes across it | Vertical, 15s | Turkish |
| Day and night | The same menu on crimson gingham, then on damask at night | The plate turns like a clock as the gingham fades to damask and the ribbon changes from crimson to gold | Square, 10s | Turkish |
| One menu, five languages | A guest switches language and the menu changes; Arabic flips right to left | A plate turns, and each turn shows the menu in the next language | Vertical, 15s | Several languages |

## Post ideas

Still images for the Instagram and Facebook feeds, 1080×1080, in Turkish.
Status: all planned.

| Post | What it shows | Format |
| --- | --- | --- |
| Menüler artık çok kolay | The headline on a plate over gingham, plus 6 ay ücretsiz | Square post |
| How it works | From nothing to a working menu: cover, 1 sign up, 2 add your dishes, 3 print your QR, guests scan and the menu opens, sign-up call (changing prices belongs in its own video) | Square carousel, 6 slides |
| Before and after | A crossed-out printed menu next to the phone menu | Square post |
| Five languages | The same dish in each menu language (Arabic once it's reworked) | Carousel |

## Story ideas

Animated stories, 1080×1920, 8 seconds each, in Turkish, with music; each
ends on the Menupedia logo and "Link profilde". Status: all six made on
2026-11-15, in `brag-output/stories/` (01-tabak-donuyor … 06-fiyat-tabelasi).
Which week each goes up is decided later.

| Story | Animation | Line |
| --- | --- | --- |
| Plate turning | The logo plate spins in and the gold ribbon drops down beside it | Menüler artık çok kolay |
| Menu opening | A folded printed menu opens, and inside it is the phone menu | Bir daha menü bastırmayın |
| Ribbon reveal | The gold ribbon unrolls down the screen carrying the line | Dakikalar içinde hazır, saniyeler içinde güncel |
| You cook, we handle the menu | Night damask; a plate turns slowly with steam rising | Siz yemeği yapın, menü bizden |
| The offer | The ribbon ties around a plate like a gift, then unties to show the offer | 6 ay ücretsiz |
| Price flip | A price on a plate flips to a new one like a station board | Düzenleyin. Kaydedin. Yayında. |

## Posting schedule

Two feed posts a week for four weeks, made one by one in this order. The
sales demo loop comes first (for in-person sales, never posted). The days
are a suggestion.

Every piece also has a **dark (night) version** next to the light one, named
`-dark` (`brag-dark.mp4`, `video-dark.mp4`, `post-dark.png`,
`slide-N-dark.png`, `story-dark.mp4`, with `poster-dark.jpg`). "Sold out
tonight" and story 4 are night already; "Day and night" has no dark version
because it shows both. The dark look comes from `brag-output/work/night.js`,
switched on by opening a page with `?night`.

| Order | Date | Piece | Kind | Made |
| --- | --- | --- | --- | --- |
| 0 | Before launch | Sales demo loop | Video, not posted | yes, 2026-11-15 (`brag-output/brag.mp4`) |
| 1 | Tue 2026-11-17 | Menüler artık çok kolay | Post | yes, 2026-11-15 (`brag-output/posts/01-menuler-artik-cok-kolay/`) |
| 2 | Fri 2026-11-20 | Your menu in 5 minutes | Video | yes, 2026-11-15 (`brag-output/videos/02-menunuz-5-dakikada/`) |
| 3 | Tue 2026-11-24 | How it works | Carousel post (6 slides: cover, sign up, add dishes, print QR, guests scan, sign-up call) | yes, 2026-11-15 (`brag-output/posts/03-nasil-calisir/`) |
| 4 | Fri 2026-11-27 | Price change in seconds | Video | yes, 2026-11-15 (`brag-output/videos/04-fiyat-saniyeler-icinde/`) |
| 5 | Tue 2026-12-01 | Before and after | Post | yes, 2026-11-15 (`brag-output/posts/05-once-sonra/`) |
| 6 | Fri 2026-12-04 | Sold out tonight | Video (night look) | yes, 2026-11-15 (`brag-output/videos/06-bu-aksam-tukendi/`) |
| 7 | Tue 2026-12-08 | Day and night | Video (square, 12 s) | yes, 2026-11-15 (`brag-output/videos/07-gunduz-gece/`) |
| 8 | Fri 2026-12-11 | One menu, five languages | Video (shows TR, EN, ES, RU; no Arabic yet) | yes, 2026-11-15 (`brag-output/videos/08-tek-menu-5-dil/`) |

## Later

- "Paper to QR in 3 steps" video: moved out of the schedule, it overlaps "Your menu in 5 minutes".
- Which stories go up in which weeks.
- English versions of each piece.
- Rework the Arabic lines with a native speaker.

## Decisions log

| Date | Decision |
| --- | --- |
| 2026-11-15 | Captions point to the link in bio; every piece shows Menupedia. "Your menu in 5 minutes" takes slot 2, "Price change in seconds" slot 4; "Paper to QR" moves to Later. |
| 2026-11-15 | Selling point: sign up and make your menu yourself in 5 minutes, no need to contact us. Pieces end on the website and Instagram; no phone number. New video idea: "Your menu in 5 minutes". |
| 2026-11-15 | No prices in any piece; only "6 ay ücretsiz". The website shows the price. |
| 2026-11-15 | (Replaced by the selling-point decision above.) Posts carry WhatsApp and Instagram only; no email for now. |
| 2026-11-15 | Everything is made one by one, in Turkish first; English versions come after. |
| 2026-11-15 | Videos have music. |
| 2026-11-15 | Lokanta Demo is the menu shown in every piece. |
| 2026-11-15 | Two posts a week for the next month. |
| 2026-11-15 | All six video ideas are in. Only the languages video shows several languages. |
| 2026-11-15 | Posts and stories are separate lists. Stories are animated: a plate turning, a menu opening, the ribbon moving. |
| 2026-11-15 | Nothing in Arabic until the Arabic lines are reworked. |
| 2026-11-15 | Selling to owners: the message is "menus made easy". |
| 2026-11-15 | No slogan under the logo for now. |
| 2026-11-15 | Turkish home headline is "Menüler artık çok kolay". |
