// app/[locale]/(app)/dashboard/[restaurantSlug]/edit/page.tsx
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { type Metadata } from "next";

// 🛑 IMPORT THE MAIN CLIENT WRAPPER
import RestaurantEditor from "~/components/dashboard/RestaurantEditor";

interface EditPageProps {
  params: Promise<{ restaurantSlug: string }>;
}

// 1. Fetch the restaurant data structure required by the client components
async function getRestaurantData(slug: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, slug),
    with: {
      categories: {
        with: {
          menuItems: true, // Fetch nested items for item count display
        },
        orderBy: (categories, { asc }) => [asc(categories.order)],
      },
    },
    // IMPORTANT: The layout should have already enforced authorization.
    // We rely on the layout's check, but this fetch is for the data payload.
  });

  // Safety check: if the layout passed, the data should exist.
  if (!restaurant) {
    notFound();
  }

  // Ensure currency has a default value for the form
  const currency = restaurant.currency || "USD";

  // Destructure to match the RestaurantData interface in RestaurantEditor.tsx
  return {
    ...restaurant,
    currency,
  };
}

export const metadata: Metadata = {
  title: "Menu Editor",
  description: "Edit restaurant details, categories, and menu items.",
};

export default async function RestaurantEditPage({ params }: EditPageProps) {
  // Fetch the detailed, nested data structure
  const restaurantData = await getRestaurantData((await params).restaurantSlug);

  return (
    <div className="mx-auto max-w-7xl py-8">
      {/* 🛑 RENDER THE MAIN CLIENT WRAPPER */}
      <RestaurantEditor initialRestaurantData={restaurantData} />
    </div>
  );
}
