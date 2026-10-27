// src/server/directory-venues.ts
import { getLocale, getTranslations } from "next-intl/server";
import { getMenusDirectory } from "~/server/public-menu";
import { getVisitorCountry } from "~/server/visitor-country";
import { describeOpenStatus } from "~/components/public/OpeningHours";
import { countryName, isCountryCode } from "~/lib/countries";
import { allMenuLanguages, menuLanguagesOf } from "~/lib/menu-languages";
import { isVenueType, venueTypeLabel } from "~/lib/venue-types";
import type { DirectoryVenue, LocalArea } from "~/lib/menus-directory";

// Blank text counts as none.
const textOrNull = (value: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
};

/**
 * Every live venue as a Menus page card, in the request's language and
 * sorted by name, with open/closed worked out now; and the visitor's
 * country with how many of the venues are in it. Used by the Menus page
 * and the home page's "menus near you".
 */
export async function getDirectoryVenues(): Promise<{
  venues: DirectoryVenue[];
  local: LocalArea | null;
}> {
  const [tMenu, tVenue, locale, rows, visitorCountry] = await Promise.all([
    getTranslations("PublicMenu"),
    getTranslations("VenueTypes"),
    getLocale(),
    getMenusDirectory(),
    getVisitorCountry(),
  ]);

  const now = new Date();
  const collator = new Intl.Collator(locale);
  const venues: DirectoryVenue[] = rows
    .map((row) => {
      const languages = menuLanguagesOf(row);
      const open =
        row.openingHours && row.timeZone
          ? describeOpenStatus(row.openingHours, row.timeZone, now, tMenu, locale)
          : null;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        logoUrl: row.logoUrl,
        type: isVenueType(row.typeOfEstablishment) ? row.typeOfEstablishment : null,
        typeLabel: venueTypeLabel(row.typeOfEstablishment, tVenue),
        cuisine: textOrNull(row.foodType),
        city: textOrNull(row.city),
        country: countryName(row.country, locale),
        countryCode: isCountryCode(row.country) ? row.country : null,
        featured: row.isDisplayed,
        photos: row.photos,
        dishCount: row.dishCount,
        languages: languages ? allMenuLanguages(languages) : [],
        open: open && {
          isOpen: open.isOpen,
          label: [open.label, open.detail].filter(Boolean).join(" · "),
        },
      };
    })
    .sort((a, b) => collator.compare(a.name, b.name));

  const local: LocalArea | null = visitorCountry
    ? {
        code: visitorCountry,
        name: countryName(visitorCountry, locale) ?? visitorCountry,
        count: venues.filter((v) => v.countryCode === visitorCountry).length,
      }
    : null;

  return { venues, local };
}
