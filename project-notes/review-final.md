# Final review of The Table (ticket 8)

One review of the redesign branch against main, in four parts, then one fix round. Only the fixed Must items were re-checked.

| Part | Verdict | Must | Should | Nice | Fixed | Left |
|---|---|---|---|---|---|---|
| QA | no blockers | 0 | 6 | 5 | 4 Should | 2 Should, 5 Nice |
| Code review | no blockers | 0 | 6 | 5 | 4 Should | 2 Should, 5 Nice |
| Design review | ship with fixes | 3 | 4 | 3 | 3 Must, 3 Should, 1 Nice | 1 Should, 2 Nice |
| Security review | clean | 0 | 0 | 2 | 2 Nice | none |

Design verdict after the fix round: the three Must items re-checked and fixed, no regressions seen.

## Fixed
- Dish names wrapped inside words (Arabic lost its letter joins): names keep their words whole; when a name cannot sit beside its price, the leader and price drop to their own line.
- Sold-out stamp stretched across the photo-grid card: it keeps its own width.
- Four step plates on /about overflowed in ru and es: two by two below 1536 px, text clear of the step card.
- Arabic prices read "$US 6.50": prices are isolated left to right (dish prices, pricing facts).
- A dark brand band vanished at night: lightened until it shows (3:1 on the night ground).
- On phones the place cards sat below the demo phone: they now come first.
- Guest details page showed an empty "Location" heading without an address: hidden.
- The open-now line appeared after load and shifted the header: its line is held.
- Unused components, helpers and redesign message keys removed (see the commit).
- The seed script refuses a non-local database; the dev setup marks its keys as dummies.

## Left open
- Features demo phone differs from the real guest menu (no band, different chips and headings), and on phones its controls come before the phone; the demo's open-now status and dietary tags stay in the page language when another menu language is picked.
- /menus labels every live restaurant "Example"; whether real restaurants should carry it is the owner's call.
- Clerk's account menu may fall back to the system font outside the world; check with real keys.
- Small: branch lost when opening a dish page from a branch menu; unknown locale prefix redirects into a 404; scroll-spy marks the last chip at the very bottom; sold-out photo not dimmed on the item page; /menus chips wrap at 1440; guest header name not centred against the logo; LanguageSwitcher builds its cards on every render; the hero sends five phone screens.
