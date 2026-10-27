// app/admin/restaurants/page.tsx
import { Plus } from "lucide-react";
import { db } from "~/server/db";
import { MAIN_BRANCH, withMainBranch } from "~/server/branches";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { RestaurantManagementClient } from "~/components/admin/RestaurantManagementClient";
import { deleteRestaurant } from "~/app/actions/restaurant";
import { type Restaurant } from "~/types/restaurant";
import { setupProgress } from "~/lib/setup-checklist";
import { getSetupFacts } from "~/server/setup-facts";
import { type SocialMediaLinks, type DeliveryAppLinks } from "~/lib/schemas";

export default async function AdminRestaurantsPage() {
  // The management cards only need restaurant fields; categories and menu
  // items are loaded on each restaurant's own admin pages.
  const rawRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
    with: MAIN_BRANCH,
  });

  // 🛑 FIX: Map through the raw results and cast the JSONB fields
  const allRestaurants: Restaurant[] = rawRestaurants.map(withMainBranch).map((restaurant) => ({
    ...restaurant,
    categories: [],
    socialMedia: restaurant.socialMedia as SocialMediaLinks,
    deliveryApps: restaurant.deliveryApps as DeliveryAppLinks,
  }));

  // Setup checklist progress per restaurant, for the cards and the
  // "Ready to go live" filter.
  const facts = await getSetupFacts(allRestaurants);
  const setup = Object.fromEntries(
    allRestaurants.map((r) => [r.id, setupProgress(facts.get(r.id)!)]),
  );

  const activeCount = allRestaurants.filter((r) => r.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Restaurants</h1>
          <p className="text-muted-foreground mt-1">
            {allRestaurants.length} total · {activeCount} active
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/restaurants/new">
            <Plus className="h-4 w-4" /> New restaurant
          </Link>
        </Button>
      </div>
      <RestaurantManagementClient
        initialRestaurants={allRestaurants}
        setup={setup}
        deleteRestaurantAction={deleteRestaurant}
      />
    </div>
  );
}
