// src/server/menu-structured-data.ts
import { parsePrice } from "~/lib/format-price";
import { WEEK_DAYS, type OpeningHours } from "~/lib/opening-hours";
import type { SocialMediaLinks } from "~/lib/schemas";
import type { PublicCategory } from "~/components/public/menu-types";
import type { VenueType } from "~/lib/venue-types";
import type { DietaryLabel, Restaurant } from "~/types/restaurant";

const SCHEMA_DAYS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
} as const;

// schema.org diets with an exact match; the other labels are left out
// rather than mapped to something close.
const DIETS: Partial<Record<DietaryLabel, string>> = {
  vegetarian: "https://schema.org/VegetarianDiet",
  vegan: "https://schema.org/VeganDiet",
  "gluten-free": "https://schema.org/GlutenFreeDiet",
};

// The closest schema.org type for each venue type; others are a Restaurant.
const SCHEMA_TYPES: Partial<Record<VenueType | (string & {}), string>> = {
  cafe: "CafeOrCoffeeShop",
  coffee_shop: "CafeOrCoffeeShop",
  bakery: "Bakery",
  fast_food: "FastFoodRestaurant",
  bar: "BarOrPub",
};

// A branch's address, phone and hours, as schema.org properties.
interface Place {
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  openingHours?: OpeningHours | null;
}

function placeData(place: Place) {
  return {
    telephone: place.phoneNumber ?? undefined,
    address:
      place.address || place.city || place.country
        ? {
            "@type": "PostalAddress",
            streetAddress: place.address ?? undefined,
            addressLocality: place.city ?? undefined,
            addressCountry: place.country ?? undefined,
          }
        : undefined,
    // A range closing before it opens runs past midnight, as schema.org allows.
    openingHoursSpecification: place.openingHours
      ? WEEK_DAYS.flatMap((day) =>
          place.openingHours![day].map((range) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${SCHEMA_DAYS[day]}`,
            opens: range.open,
            closes: range.close,
          })),
        )
      : undefined,
  };
}

/**
 * schema.org Restaurant data for a menu page, so search engines can show the
 * restaurant and its dishes. Prices are only included when they can be read
 * without guessing (see parsePrice); a wrong price in search results is
 * worse than none.
 */
export function restaurantStructuredData({
  restaurant,
  categories,
  pageUrl,
  itemUrl,
  inLanguage,
  branches,
}: {
  restaurant: Pick<
    Restaurant,
    | "name"
    | "description"
    | "logoUrl"
    | "phoneNumber"
    | "address"
    | "city"
    | "country"
    | "typeOfEstablishment"
    | "foodType"
    | "currency"
  > & {
    socialMedia: SocialMediaLinks | null;
    openingHours?: OpeningHours | null;
  };
  categories: PublicCategory[];
  pageUrl: string;
  itemUrl: (itemSlug: string) => string;
  // The menu text's language, when known (translations on).
  inLanguage?: string;
  // On a restaurant's own page when it has several branches: each one,
  // with its page. (The restaurant then has no address of its own.)
  branches?: (Place & { name: string; url: string })[];
}) {
  const type = SCHEMA_TYPES[restaurant.typeOfEstablishment ?? ""] ?? "Restaurant";
  const sameAs = Object.values(restaurant.socialMedia ?? {}).filter(
    (url): url is string => typeof url === "string" && url.trim() !== "",
  );

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: restaurant.name,
    url: pageUrl,
    description: restaurant.description ?? undefined,
    image: restaurant.logoUrl ?? undefined,
    ...placeData(restaurant),
    servesCuisine: restaurant.foodType ?? undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    department: branches?.length
      ? branches.map((branch) => ({
          "@type": type,
          name: branch.name,
          url: branch.url,
          ...placeData(branch),
        }))
      : undefined,
    hasMenu: {
      "@type": "Menu",
      url: pageUrl,
      inLanguage,
      hasMenuSection: categories.map((category) => ({
        "@type": "MenuSection",
        name: category.name,
        hasMenuItem: category.menuItems.map((item) => {
          const price = parsePrice(item.price, restaurant.currency);
          const diets = (item.dietaryLabels ?? []).flatMap(
            (label) => DIETS[label] ?? [],
          );
          return {
            "@type": "MenuItem",
            name: item.name,
            url: itemUrl(item.slug),
            description: item.description ?? undefined,
            image: item.imageUrl ?? undefined,
            suitableForDiet: diets.length ? diets : undefined,
            offers: price
              ? {
                  "@type": "Offer",
                  price: price.value,
                  priceCurrency: price.currency,
                  availability:
                    item.availability === "sold_out"
                      ? "https://schema.org/SoldOut"
                      : "https://schema.org/InStock",
                }
              : undefined,
          };
        }),
      })),
    },
  };
}

/**
 * JSON for a <script type="application/ld+json"> tag. Owners type the text in
 * it, so "<" is escaped: a name containing "</script>" can't end the tag.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
