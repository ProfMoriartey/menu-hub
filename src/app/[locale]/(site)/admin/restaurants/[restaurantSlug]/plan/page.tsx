// app/admin/restaurants/[restaurantSlug]/plan/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getRestaurantPlan } from "~/server/billing";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { RestaurantPlanPanel } from "~/components/admin/billing/RestaurantPlanPanel";

export default async function RestaurantPlanPage({
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

  const plan = await getRestaurantPlan(restaurant.id);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="plan" />
      <RestaurantPlanPanel restaurantId={restaurant.id} plan={plan} />
    </div>
  );
}
