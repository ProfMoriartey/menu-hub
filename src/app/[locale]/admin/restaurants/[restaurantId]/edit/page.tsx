// app/admin/restaurants/[restaurantId]/edit/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, UtensilsCrossed } from "lucide-react";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { updateRestaurant } from "~/app/actions/restaurant";
import { AdminRestaurantForm } from "~/components/admin/restaurant-form/AdminRestaurantForm";
import { RestaurantLogo, StatusBadges } from "~/components/admin/RestaurantCard";
import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });
  if (!row) notFound();

  const restaurant: Restaurant = {
    ...row,
    categories: [],
    socialMedia: row.socialMedia as SocialMediaLinks,
    deliveryApps: row.deliveryApps as DeliveryAppLinks,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/admin/restaurants"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" /> Restaurants
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <RestaurantLogo restaurant={restaurant} size="lg" />
            <div className="min-w-0">
              <h1 className="text-foreground truncate text-3xl font-bold tracking-tight">
                {restaurant.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-mono text-sm">/{restaurant.slug}</span>
                <StatusBadges restaurant={restaurant} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/restaurants/${restaurant.id}/categories`}>
                <UtensilsCrossed className="h-4 w-4" /> Manage menu
              </Link>
            </Button>
            {restaurant.isActive && (
              <Button variant="ghost" asChild>
                <Link href={`/${restaurant.slug}`} target="_blank">
                  View live <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <AdminRestaurantForm restaurant={restaurant} action={updateRestaurant} />
    </div>
  );
}
