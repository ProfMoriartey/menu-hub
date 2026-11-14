import { Bricolage_Grotesque, Noto_Sans_Arabic, Onest } from "next/font/google";

/*
 * The site's type, every page (taken from the Table redesign).
 *
 * One font stack covers every locale (--font-sans in globals.css):
 * Bricolage Grotesque sets Latin and Turkish, and the browser falls through
 * to Onest for Cyrillic (Bricolage has none) and to Noto Sans Arabic for
 * Arabic. Each subset is a separate file with its own unicode-range, so a
 * page only downloads the scripts it shows.
 *
 * The one subset each locale's headline needs is also in public/fonts under
 * its own family ("Site Latin", ...), first in the stack, so the locale
 * layout can preload the right one per locale; next/font cannot. Same files
 * as Google serves; replace them (new file name) when updating.
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

export const fontVariables = `${bricolage.variable} ${onest.variable} ${notoArabic.variable}`;

// The face each locale's headline is set in (public/fonts): preloaded so
// the first viewport does not swap after load.
export const HEADLINE_FONT: Record<string, string> = {
  ar: "/fonts/noto-sans-arabic.woff2",
  ru: "/fonts/onest-cyrillic.woff2",
};
export const DEFAULT_HEADLINE_FONT = "/fonts/bricolage-latin.woff2";
