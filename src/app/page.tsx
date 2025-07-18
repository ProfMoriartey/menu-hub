// app/page.tsx

import { db } from "~/server/db";
// No need to import 'restaurants' schema directly here if using db.query.restaurants
// import { restaurants } from "~/server/db/schema";

// NEW: Import the HomePageClient component
import { HomePageClient } from "~/components/public/HomePageClient";

// Main Landing Page Component (Server Component)
export default async function HomePage() {
  // Fetch restaurants (this remains a Server-side operation)
  const allRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
    with: {
      categories: {
        // Explicitly fetch categories
        with: {
          // And within categories, explicitly fetch menuItems
          menuItems: true,
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-gray-800">
      {/* Pass fetched data to the Client Component */}
      <HomePageClient restaurants={allRestaurants} />

      <footer className="mt-auto w-full py-8 text-center text-sm text-gray-600">
        <p>
          &copy; {new Date().getFullYear()} Ahmed Alhusaini. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
