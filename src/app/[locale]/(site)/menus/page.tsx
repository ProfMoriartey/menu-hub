// app/[locale]/(site)/menus/page.tsx
import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getDirectoryVenues } from "~/server/directory-venues";
import { sitePageMetadata } from "~/server/public-metadata";
import { MenusDirectory, type DirectoryFilters } from "~/components/menus/MenusDirectory";
import type { DirectoryScope } from "~/lib/menus-directory";

// The canonical link leaves out the search and filters (?q=, ?city= …), so
// every filtered view counts as this one page rather than a near-copy.
export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("MenusPage"), getLocale()]);
  return sitePageMetadata({
    locale,
    path: "/menus",
    title: `${t("metaTitle")} | Menupedia`,
    description: t("metaDescription"),
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MenusPage({ searchParams }: { searchParams: SearchParams }) {
  // Open now is worked out per request, so the page is never served stale.
  await connection();
  const [t, params, { venues, local }] = await Promise.all([
    getTranslations("MenusPage"),
    searchParams,
    getDirectoryVenues(),
  ]);

  // Visitors start with menus from their own country, when it has any.
  const defaultScope: DirectoryScope = local && local.count > 0 ? "local" : "global";
  const scopeParam = one(params.scope);

  // Filters from the address, so a shared or reloaded link keeps them.
  const initialFilters: DirectoryFilters = {
    scope: scopeParam === "local" || scopeParam === "global" ? scopeParam : defaultScope,
    query: one(params.q),
    type: one(params.type),
    country: one(params.country),
    city: one(params.city),
    openNow: one(params.open) === "1",
    inMyLanguage: one(params.lang) === "1",
  };

  return (
    <div className="text-foreground min-h-screen">
      {/* The search is the first thing on the page; the heading is for
          screen readers and search engines. */}
      <h1 className="sr-only">{t("title")}</h1>
      <main className="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:pt-12">
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
