// app/admin/restaurants/page.tsx
import { db } from "~/server/db";
import { RestaurantManagementClient } from "~/components/admin/RestaurantManagementClient";
import {
  addRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "~/app/actions/restaurant";
import { cn } from "~/lib/utils";
import { type Restaurant } from "~/types/restaurant";
import { type SocialMediaLinks, type DeliveryAppLinks } from "~/lib/schemas";

export default async function AdminRestaurantsPage() {
  // The management cards only need restaurant fields; categories and menu
  // items are loaded on each restaurant's own admin pages.
  const rawRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
  });

  // 🛑 FIX: Map through the raw results and cast the JSONB fields
  const allRestaurants: Restaurant[] = rawRestaurants.map((restaurant) => ({
    ...restaurant,
    categories: [],
    socialMedia: restaurant.socialMedia as SocialMediaLinks,
    deliveryApps: restaurant.deliveryApps as DeliveryAppLinks,
  }));

  return (
    <div className="space-y-8">
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