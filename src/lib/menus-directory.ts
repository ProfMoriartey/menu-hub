// src/lib/menus-directory.ts
import type { VenueType } from "~/lib/venue-types";
import type { MenuLanguage } from "~/lib/menu-languages";

/** Where one of a venue's branches is, and whether it's open now. */
export interface DirectoryBranch {
  slug: string;
  city: string | null;
  // The country's name, and its ISO code when it is stored as one.
  country: string | null;
  countryCode: string | null;
  // Null when no opening hours are set.
  open: { isOpen: boolean; label: string } | null;
}

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
  // The branches the card is about: all of them, or those a filter kept
  // (see venueWithBranches). Never empty.
  branches: DirectoryBranch[];
  // How many branches the venue has in all.
  branchCount: number;
  featured: boolean;
  photos: string[];
  dishCount: number;
  // Empty when the menu isn't translated.
  languages: MenuLanguage[];
}

/**
 * The venue with only the branches `keep` accepts, or null when none is
 * left: a chain shows up under a city or country if any branch is there.
 */
export function venueWithBranches(
  venue: DirectoryVenue,
  keep: (branch: DirectoryBranch) => boolean,
): DirectoryVenue | null {
  const branches = venue.branches.filter(keep);
  if (branches.length === 0) return null;
  if (branches.length === venue.branches.length) return venue;
  return { ...venue, branches };
}

/** Where a card links: the branch's page when it's about one of several. */
export function venueHref(venue: DirectoryVenue): string {
  const only = venue.branches.length === 1 ? venue.branches[0] : undefined;
  return only && venue.branchCount > 1 ? `/${venue.slug}/${only.slug}` : `/${venue.slug}`;
}

/** The visitor's country (from the host's IP lookup) and how many venues have a branch there. */
export interface LocalArea {
  code: string;
  name: string;
  count: number;
}

// Menus from the visitor's country only, or from everywhere.
export type DirectoryScope = "local" | "global";

// Fewer letters match too many dishes to be useful.
export const MIN_DISH_QUERY = 2;
