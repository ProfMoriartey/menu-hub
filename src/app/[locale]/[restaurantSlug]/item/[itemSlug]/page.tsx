// app/[restaurantSlug]/item/[itemSlug]/page.tsx
import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
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
