// app/admin/restaurants/[restaurantSlug]/billing/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getRestaurantBilling } from "~/server/billing";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { RestaurantBillingPanel } from "~/components/admin/billing/RestaurantBillingPanel";

export default async function RestaurantBillingPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    columns: { id: true, name: true, slug: true, logoUrl: true, isActive: true, isDisplayed: true },
  });
  if (!restaurant) notFound();

  const billing = await getRestaurantBilling(restaurant.id);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="billing" />
      <RestaurantBillingPanel restaurantId={restaurant.id} {...billing} />
    </div>
  );
}
