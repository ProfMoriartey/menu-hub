// app/[locale]/restaurants/page.tsx
// This is a Server Component.
// It handles data fetching and passes initial data to client components.

import { db } from "~/server/db";
import { RestaurantSearchAndGrid } from "~/components/public/RestaurantSearchAndGrid";
import { cn } from "~/lib/utils";
// ADDED: Import getTranslations for server components
import { getTranslations } from "next-intl/server";

// ADDED: Import types for casting
import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

export default async function RestaurantsPage() {
  // ADDED: Initialize translations for the "restaurantsPage" namespace
  const t = await getTranslations("restaurantsPage");

  // Fetch all restaurants on the server.
  // This operation happens once when the page is requested.
  const rawRestaurants = await db.query.restaurants.findMany({
    with: {
      categories: {
        with: {
          menuItems: true,
        },
      },
    },
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
  });

  // ADDED: Map through the raw results to cast the JSONB fields to the correct types
  const allRestaurants: Restaurant[] = rawRestaurants.map((restaurant) => ({
    ...restaurant,
    socialMedia: restaurant.socialMedia as SocialMediaLinks,
    deliveryApps: restaurant.deliveryApps as DeliveryAppLinks,
  }));

  return (
    <div className={cn("min-h-screen p-8", "bg-background text-foreground")}>
      <header className="mx-auto max-w-4xl px-4 py-12 text-center">
        {/* UPDATED: Use translation for main title */}
        <h1 className="text-foreground mb-4 text-5xl leading-tight font-extrabold">
          {t("mainTitle")}
        </h1>
        {/* UPDATED: Use translation for description */}
        <p className="text-muted-foreground mb-8 text-xl">{t("description")}</p>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Pass the server-fetched data to the client component. */}
        {/* The client component will handle client-side filtering and rendering. */}
        <RestaurantSearchAndGrid initialRestaurants={allRestaurants} />
      </main>
    </div>
  );
}