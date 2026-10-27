// app/[locale]/(site)/menus/page.tsx
import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getMenusDirectory } from "~/server/public-menu";
import { describeOpenStatus } from "~/components/public/OpeningHours";
import { MenusDirectory, type DirectoryFilters } from "~/components/menus/MenusDirectory";
import { countryName, isCountryCode } from "~/lib/countries";
import { allMenuLanguages, menuLanguagesOf } from "~/lib/menu-languages";
import { isVenueType, venueTypeLabel } from "~/lib/venue-types";
import { getVisitorCountry } from "~/server/visitor-country";
import type { DirectoryScope, DirectoryVenue, LocalArea } from "~/lib/menus-directory";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MenusPage");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

// Blank text counts as none.
const textOrNull = (value: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
};

export default async function MenusPage({ searchParams }: { searchParams: SearchParams }) {
  // Open now is worked out per request, so the page is never served stale.
  await connection();
  const [t, tMenu, tVenue, locale, params, rows, visitorCountry] = await Promise.all([
    getTranslations("MenusPage"),
    getTranslations("PublicMenu"),
    getTranslations("VenueTypes"),
    getLocale(),
    searchParams,
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

  // Visitors start with menus from their own country, when it has any.
  const local: LocalArea | null = visitorCountry
    ? {
        code: visitorCountry,
        name: countryName(visitorCountry, locale) ?? visitorCountry,
        count: venues.filter((v) => v.countryCode === visitorCountry).length,
      }
    : null;
  const defaultScope: DirectoryScope = local && local.count > 0 ? "local" : "global";
  const scopeParam = one(params.scope);

  // Filters from the address, so a shared or reloaded link keeps them.
  const initialFilters: DirectoryFilters = {
    scope: scopeParam === "local" || scopeParam === "global" ? scopeParam : defaultScope,
    query: one(params.q),
    type: one(params.type),
    city: one(params.city),
    openNow: one(params.open) === "1",
    inMyLanguage: one(params.lang) === "1",
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="mx-auto max-w-5xl px-4 pt-10 pb-6 sm:pt-16">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-base sm:text-lg">{t("intro")}</p>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <MenusDirectory
          venues={venues}
          local={local}
          defaultScope={defaultScope}
          initialFilters={initialFilters}
        />
      </main>
    </div>
  );
}
