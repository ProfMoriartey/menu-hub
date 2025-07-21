// app/admin/restaurants/page.tsx
import { db } from "~/server/db";

// NEW IMPORT: RestaurantManagementClient
import { RestaurantManagementClient } from "~/components/admin/RestaurantManagementClient";

// Import Server Actions from the new file
import {
  addRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "~/app/actions/restaurant";

// Main Admin Restaurants Page Component (Server Component)
export default async function AdminRestaurantsPage() {
  // Fetch all restaurants from the database, including categories and menuItems
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Restaurants</h1>
      {/* Render the Client Component and pass data and Server Actions */}
      <RestaurantManagementClient
        initialRestaurants={allRestaurants}
        addRestaurantAction={addRestaurant}
        deleteRestaurantAction={deleteRestaurant}
        updateRestaurantAction={updateRestaurant}
      />
    </div>
  );
}
