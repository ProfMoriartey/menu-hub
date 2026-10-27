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
  // The country's name, and its ISO code when it is stored as one.
  country: string | null;
  countryCode: string | null;
  featured: boolean;
  photos: string[];
  dishCount: number;
  // Empty when the menu isn't translated.
  languages: MenuLanguage[];
  // Null when no opening hours are set.
  open: { isOpen: boolean; label: string } | null;
}

/** The visitor's country (from the host's IP lookup) and its menus. */
export interface LocalArea {
  code: string;
  name: string;
  count: number;
}

// Menus from the visitor's country only, or from everywhere.
export type DirectoryScope = "local" | "global";

// Fewer letters match too many dishes to be useful.
export const MIN_DISH_QUERY = 2;
