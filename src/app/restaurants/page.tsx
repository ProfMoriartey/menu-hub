// src/app/restaurants/page.tsx
import { db } from "~/server/db";

// Import the new client component
import { RestaurantSearchAndGrid } from "~/components/public/RestaurantSearchAndGrid";
// Import shared types if needed for clarity in this file, though infer from Drizzle is usually sufficient

export default async function RestaurantsPage() {
  // Fetch ALL restaurants with their categories and menu items
  // This is the data that will be passed as 'initialRestaurants' to the client component
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
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <header className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="mb-4 text-5xl leading-tight font-extrabold text-gray-900">
          Discover Restaurants
        </h1>
        <p className="mb-8 text-xl text-gray-700">
          Search and explore all restaurants available on Menu Hub.
        </p>
      </header>

      {/* Render the client component with all fetched data */}
      <main className="container mx-auto px-4 py-8">
        <RestaurantSearchAndGrid initialRestaurants={allRestaurants} />
      </main>
    </div>
  );
}
