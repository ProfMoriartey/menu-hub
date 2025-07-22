// src/app/restaurants/page.tsx
import { db } from "~/server/db";
import { RestaurantSearchAndGrid } from "~/components/public/RestaurantSearchAndGrid";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export default async function RestaurantsPage() {
  const allRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
    with: {
      categories: {
        with: {
          menuItems: true,
        },
      },
    },
  });

  return (
    // UPDATED: Use bg-background and text-foreground for the main container
    <div className={cn("min-h-screen p-8", "bg-background text-foreground")}>
      <header className="mx-auto max-w-4xl px-4 py-12 text-center">
        {/* UPDATED: Use text-foreground for the heading */}
        <h1 className="text-foreground mb-4 text-5xl leading-tight font-extrabold">
          Discover Restaurants
        </h1>
        {/* UPDATED: Use text-muted-foreground for the paragraph */}
        <p className="text-muted-foreground mb-8 text-xl">
          Search and explore all restaurants available on Menu Hub.
        </p>
      </header>

      <main className="container mx-auto px-4 py-8">
        <RestaurantSearchAndGrid initialRestaurants={allRestaurants} />
      </main>
    </div>
  );
}
