// src/lib/menus-directory.ts
import type { VenueType } from "~/lib/venue-types";
import type { MenuLanguage } from "~/lib/menu-languages";

/** One venue's card on the Menus page, with every text in the page's language. */
export interface DirectoryVenue {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  // Null for no type, or for free text typed before the list existed
  // (shown as `typeLabel` but not offered as a filter).
  type: VenueType | null;
  typeLabel: string | null;
  cuisine: string | null;
  city: string | null;
  country: string | null;
  featured: boolean;
  photos: string[];
  dishCount: number;
  // Empty when the menu isn't translated.
  languages: MenuLanguage[];
  // Null when no opening hours are set.
  open: { isOpen: boolean; label: string } | null;
}

// Fewer letters match too many dishes to be useful.
export const MIN_DISH_QUERY = 2;

/**
 * Text folded for matching: lower case in the page's language, without
 * accents, so "cafe" finds "Café" and "kofte" finds "Köfte".
 */
export function foldText(text: string, locale: string): string {
  return text
    .toLocaleLowerCase(locale)
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/ı/g, "i");
}
