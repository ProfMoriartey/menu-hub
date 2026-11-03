// app/admin/restaurants/[restaurantSlug]/plan/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getRestaurantPlan } from "~/server/billing";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { RestaurantPlanPanel } from "~/components/admin/billing/RestaurantPlanPanel";
import { PauseMenuCard } from "~/components/admin/billing/PauseMenuCard";
import { BillingDetailsCard } from "~/components/admin/billing/BillingDetailsCard";
import { getBillingDetails } from "~/server/billing-details";
import { getLocale } from "next-intl/server";

export default async function RestaurantPlanPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    columns: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      isActive: true,
      isDisplayed: true,
      pausedAt: true,
      liveUntil: true,
    },
  });
  if (!restaurant) notFound();

  const [{ plan, branchCount }, details, locale] = await Promise.all([
    getRestaurantPlan(restaurant.id),
    getBillingDetails(restaurant.id),
    getLocale(),
  ]);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="plan" />
      <RestaurantPlanPanel
        restaurantId={restaurant.id}
        plan={plan}
        branchCount={branchCount}
        detailsHref={`/admin/restaurants/${restaurant.slug}/edit`}
      />
      <BillingDetailsCard details={details} locale={locale} />
      <PauseMenuCard
        restaurantId={restaurant.id}
        pausedAt={restaurant.pausedAt}
        reason={plan?.pauseReason ?? null}
        note={plan?.pauseNote ?? null}
      />
    </div>
  );
}
