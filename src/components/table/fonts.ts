import { Bricolage_Grotesque, Noto_Sans_Arabic, Onest } from "next/font/google";

/*
 * The Table's type. Declared here, not in the root layout, so only routes
 * that render <TableWorld> preload them; the dashboard and admin keep Geist.
 *
 * One font stack covers every locale (see .table-world in globals.css):
 * Bricolage Grotesque sets Latin and Turkish, and the browser falls through
 * to Onest for Cyrillic (Bricolage has none) and to Noto Sans Arabic for
 * Arabic. Each subset is a separate file with its own unicode-range, so a
 * page only downloads the scripts it shows.
 *
 * The one subset each locale's headline needs (Bricolage latin, Onest
 * cyrillic, Noto Sans Arabic arabic) is also in public/fonts under its own
 * family ("Table Latin", ...), first in the stacks (globals.css), so
 * TableWorld can preload the right one per locale; next/font cannot. Same
 * files as Google serves; replace them (new file name) when updating.
 */

export const bricolage = Bricolage_Grotesque({
  // Latin comes from public/fonts (preloaded per locale); latin-ext
  // (Turkish ğ ş ı İ) loads from here on demand.
  subsets: ["latin"],
  preload: false,
  // Optical size: tighter, more characterful letters at headline sizes.
  axes: ["opsz"],
  display: "swap",
  // No Arial stand-in mid-stack: it has Cyrillic and Arabic and would win
  // over Onest and Noto Sans Arabic on Mac, Windows and iOS.
  adjustFontFallback: false,
  variable: "--font-bricolage",
});

// Russian only; not preloaded, since most pages never show Cyrillic.
export const onest = Onest({
  subsets: ["cyrillic"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-onest",
});

// Arabic only; not preloaded, for the same reason.
export const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-noto-arabic",
});

export const tableFontVariables = `${bricolage.variable} ${onest.variable} ${notoArabic.variable}`;
