// app/[restaurantSlug]/item/[itemSlug]/page.tsx
import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { permanentRedirect } from "~/i18n/navigation";
import { isUuid } from "~/lib/slug";
import { MenuItemDisplayClient } from "~/components/public/MenuItemDisplayClient";

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

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    columns: { id: true },
  });
  if (!restaurant) notFound();

  // Hidden items have no public page; sold-out ones do, marked as such.
  const itemDetails = await db.query.menuItems.findFirst({
    where: and(
      eq(menuItems.restaurantId, restaurant.id),
      eq(menuItems.slug, itemSlug),
      ne(menuItems.availability, "hidden"),
    ),
    with: {
      restaurant: true,
      category: true,
    },
  });

  if (!itemDetails) {
    // Item links used to end in the item's id; send those to the slug URL.
    if (isUuid(itemSlug)) {
      const legacy = await db.query.menuItems.findFirst({
        where: and(eq(menuItems.restaurantId, restaurant.id), eq(menuItems.id, itemSlug)),
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

  // The item view brings its own layout: back link, photo and details.
  return (
    <MenuItemDisplayClient
      item={itemDetails}
      restaurantSlug={restaurantSlug}
      theme={itemDetails.restaurant.theme ?? "default"}
    />
  );
}
