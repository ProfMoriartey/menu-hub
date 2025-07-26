// app/restaurants/page.tsx
import { db } from "~/server/db";
import { RestaurantSearchAndGrid } from "~/components/public/RestaurantSearchAndGrid";
import { cn } from "~/lib/utils";
// REMOVED: Import Server Actions (no longer passed to public component)
// import {
//   addRestaurant,
//   deleteRestaurant,
//   updateRestaurant,
// } from "~/app/actions/restaurant";

export default async function RestaurantsPage() {
  const allRestaurants = await db.query.restaurants.findMany({
    with: {
      categories: {
        with: {
          menuItems: true,
        },
      },
    },
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
  });

  return (
    <div className={cn("min-h-screen p-8", "bg-background text-foreground")}>
      <header className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-foreground mb-4 text-5xl leading-tight font-extrabold">
          Discover Restaurants
        </h1>
        <p className="text-muted-foreground mb-8 text-xl">
          Search and explore all restaurants available on Menupedia.
        </p>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* REMOVED: Passing Server Actions as props */}
        <RestaurantSearchAndGrid initialRestaurants={allRestaurants} />
      </main>
    </div>
  );
}
