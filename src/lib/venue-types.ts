// src/lib/venue-types.ts

/*
 * What kind of place a menu belongs to. Stored as the key in
 * restaurants.typeOfEstablishment; labels are translated (VenueTypes
 * messages). Rows saved before the list existed may hold free text that
 * isn't a key: it is shown as typed and counts as no type in filters.
 */
export const VENUE_TYPES = [
  "restaurant",
  "cafe",
  "coffee_shop",
  "bakery",
  "dessert",
  "fast_food",
  "bar",
  "home_cooking",
] as const;

export type VenueType = (typeof VENUE_TYPES)[number];

export const isVenueType = (value: unknown): value is VenueType =>
  VENUE_TYPES.includes(value as VenueType);

/** The type's translated label, or older free text as typed. */
export function venueTypeLabel(
  value: string | null | undefined,
  t: (key: VenueType) => string,
): string | null {
  if (!value) return null;
  return isVenueType(value) ? t(value) : value;
}
