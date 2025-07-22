// app/admin/restaurants/page.tsx
import { db } from "~/server/db";
import { RestaurantManagementClient } from "~/components/admin/RestaurantManagementClient";
import {
  addRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "~/app/actions/restaurant";
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

export default async function AdminRestaurantsPage() {
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
    // The parent div in layout.tsx already sets bg-background and text-foreground.
    // This div needs to ensure its own text color is semantic.
    <div className="space-y-8">
      {/* UPDATED: Use text-foreground for the heading */}
      <h1 className={cn("text-3xl font-bold", "text-foreground")}>
        Manage Restaurants
      </h1>
      <RestaurantManagementClient
        initialRestaurants={allRestaurants}
        addRestaurantAction={addRestaurant}
        deleteRestaurantAction={deleteRestaurant}
        updateRestaurantAction={updateRestaurant}
      />
    </div>
  );
}
