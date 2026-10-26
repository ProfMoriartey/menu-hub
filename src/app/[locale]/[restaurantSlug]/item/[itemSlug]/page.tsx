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
  const item = await getPublicMenuItem(restaurant.id, itemSlug);
  if (!item) return {};

  const locale = await getLocale();
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
  });
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemSlug } = await params;

  const restaurant = await getRestaurantBySlug(restaurantSlug);
  if (!restaurant) notFound();

  // Hidden items have no public page; sold-out ones do, marked as such.
  const item = await getPublicMenuItem(restaurant.id, itemSlug);

  if (!item) {
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

  return (
    <MenuItemDetail
      item={{
        ...item,
        displayPrice: formatPrice(
          item.price,
          restaurant.currency,
          await getLocale(),
        ),
      }}
      restaurant={restaurant}
    />
  );
}
