// app/[restaurantSlug]/item/[itemId]/page.tsx
import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { MenuItemDisplayClient } from "~/components/public/MenuItemDisplayClient";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemId: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemId } = await params;

  const itemDetails = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, itemId),
    with: {
      restaurant: true,
      category: true,
    },
  });

  if (!itemDetails || itemDetails.restaurant.slug !== restaurantSlug) {
    notFound();
  }

  return (
    <MenuItemDisplayClient
      item={itemDetails}
      restaurantSlug={restaurantSlug}
      theme={itemDetails.restaurant.theme ?? "default"} // CHANGED: || to ??
    />
  );
}
