// app/restaurants/RestaurantPageContent.tsx
// This is a Server Component, no "use client" directive needed.

import { db } from "~/server/db";
import { RestaurantSearchAndGrid } from "~/components/public/RestaurantSearchAndGrid";
import { cn } from "~/lib/utils";
import { useTranslations } from "next-intl";
import type { Restaurant } from "~/types/restaurant"; // Import the Restaurant type

// Helper to deeply serialize Date objects to ISO strings
function serializeDatesInObject<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString() as T;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeDatesInObject(item)) as T;
  }

  // Handle plain Objects
  const serializedObj = {} as T;
  for (const key in obj) {
    // Ensure it's the object's own property, not from prototype chain
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      serializedObj[key] = serializeDatesInObject(obj[key]);
    }
  }
  return serializedObj;
}

export async function RestaurantPageContent() {
  const t = useTranslations("restaurantsPage");

  // Explicitly type allRestaurants as Restaurant[]
  let allRestaurants: Restaurant[] = [];
  try {
    const fetchedRestaurants = await db.query.restaurants.findMany({
      with: {
        categories: {
          with: {
            menuItems: true,
          },
        },
      },
      orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
    });
    // Serialize Date objects before passing to the client component
    allRestaurants = serializeDatesInObject(fetchedRestaurants);
  } catch (error) {
    console.error("Failed to fetch restaurants in Server Component:", error);
    // You might want to display an error message or fallback UI here
    // For now, it will pass an empty array to the client component
  }

  // Pass translations and data to the client component
  return (
    <div className={cn("min-h-screen p-8", "bg-background text-foreground")}>
      <header className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-foreground mb-4 text-5xl leading-tight font-extrabold">
          {t("mainTitle")}
        </h1>
        <p className="text-muted-foreground mb-8 text-xl">{t("description")}</p>
      </header>

      <main className="container mx-auto px-4 py-8">
        <RestaurantSearchAndGrid
          initialRestaurants={allRestaurants}
          translations={{
            searchButton: t("searchButton"),
            searchPlaceholder: t("searchPlaceholder"),
            noResultsFound: t("noResultsFound"),
            allRestaurantsTitle: t("allRestaurantsTitle"),
            noRestaurantsFound: t("noRestaurantsFound"),
            adminPrompt: t("adminPrompt"),
          }}
        />
      </main>
    </div>
  );
}
