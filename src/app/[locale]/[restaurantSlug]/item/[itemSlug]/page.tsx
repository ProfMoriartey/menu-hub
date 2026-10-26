// app/[restaurantSlug]/item/[itemSlug]/page.tsx
import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  clip,
  publicPageMetadata,
  restaurantPreviewImage,
} from "~/server/public-metadata";
import { permanentRedirect } from "~/i18n/navigation";
import { isUuid } from "~/lib/slug";
import { formatPrice } from "~/lib/format-price";
import { getPublicMenuItem, getRestaurantBySlug } from "~/server/public-menu";
import { MenuItemDetail } from "~/components/public/MenuItemDetail";
import { allMenuLanguages, menuLanguagesOf } from "~/lib/menu-languages";
import { localizeCategory, localizeItem } from "~/server/localize-menu";

// The item and its category in the guest's language, when the menu has it.
function localized(
  row: NonNullable<Awaited<ReturnType<typeof getPublicMenuItem>>>,
  restaurant: Parameters<typeof menuLanguagesOf>[0],
  locale: string,
) {
  const languages = menuLanguagesOf(restaurant);
  const { category, ...item } = row;
  return {
    languages,
    item: {
      ...localizeItem(item, languages, locale),
      category: localizeCategory(category, languages, locale),
    },
  };
}

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemSlug: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { restaurantSlug, itemSlug } = await params;
  const restaurant = await getRestaurantBySlug(restaurantSlug);
  if (!restaurant) return {};
  const row = await getPublicMenuItem(restaurant.id, itemSlug);
  if (!row) return {};

  const locale = await getLocale();
  const { item, languages } = localized(row, restaurant, locale);
  const t = await getTranslations("PublicMenu");
  const price = formatPrice(item.price, restaurant.currency, locale);
  return publicPageMetadata({
    locale,
    path: `/${restaurant.slug}/item/${item.slug}`,
    title: t("metaItemTitle", { item: item.name, restaurant: restaurant.name }),
    description: clip(
      item.description
        ? `${price} · ${item.description}`
        : t("metaItemDescription", {
            item: item.name,
            restaurant: restaurant.name,
            price,
          }),
    ),
    // The dish photo makes the best preview; the restaurant's image otherwise.
    image: item.imageUrl
      ? { url: item.imageUrl, large: true }
      : restaurantPreviewImage(restaurant),
    siteName: restaurant.name,
    menuLanguages: languages && allMenuLanguages(languages),
  });
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemSlug } = await params;

  const restaurant = await getRestaurantBySlug(restaurantSlug);
  if (!restaurant) notFound();

  // Hidden items have no public page; sold-out ones do, marked as such.
  const row = await getPublicMenuItem(restaurant.id, itemSlug);

  if (!row) {
    // Item links used to end in the item's id; send those to the slug URL.
    // Rare, so this lookup isn't cached.
    if (isUuid(itemSlug)) {
      const legacy = await db.query.menuItems.findFirst({
        where: and(
          eq(menuItems.restaurantId, restaurant.id),
          eq(menuItems.id, itemSlug),
        ),
        columns: { slug: true },
      });
      if (legacy) {
        permanentRedirect({
          href: `/${restaurantSlug}/item/${legacy.slug}`,
          locale: await getLocale(),
        });
      }
    }
    notFound();
  }

  const locale = await getLocale();
  const { item } = localized(row, restaurant, locale);
  return (
    <MenuItemDetail
      item={{
        ...item,
        displayPrice: formatPrice(item.price, restaurant.currency, locale),
      }}
      restaurant={restaurant}
    />
  );
}
