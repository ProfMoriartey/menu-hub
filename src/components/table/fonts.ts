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
 */

export const bricolage = Bricolage_Grotesque({
  // Preloads latin only; latin-ext (Turkish ğ ş ı İ) still loads on demand.
  subsets: ["latin"],
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
