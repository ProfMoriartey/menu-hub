// app/[locale]/(app)/dashboard/[restaurantSlug]/edit/page.tsx
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { type Metadata } from "next";

import RestaurantEditor from "~/components/dashboard/RestaurantEditor";
import type { DeliveryAppLinks, SocialMediaLinks } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

interface EditPageProps {
  params: Promise<{ restaurantSlug: string }>;
}

async function getRestaurantData(slug: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, slug),
    with: {
      categories: {
        with: {
          menuItems: {
            orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
          },
        },
        orderBy: (categories, { asc }) => [asc(categories.order)],
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  // Cast unknown JSONB fields to their expected types
  return {
    ...restaurant,
    currency: restaurant.currency || "USD",
    socialMedia: restaurant.socialMedia as SocialMediaLinks,
    deliveryApps: restaurant.deliveryApps as DeliveryAppLinks,
  } as Restaurant;
}

export const metadata: Metadata = {
  title: "Menu Editor | Menupedia",
  description: "Manage your restaurant menu, categories, and delivery links.",
};

export default async function RestaurantEditPage({ params }: EditPageProps) {
  const { restaurantSlug } = await params;
  const restaurantData = await getRestaurantData(restaurantSlug);

  return (
    // Increased to max-w-7xl to give the new multi-column form breathing room
    <div className="mx-auto max-w-7xl px-4">
      <RestaurantEditor initialRestaurantData={restaurantData} />
    </div>
  );
}