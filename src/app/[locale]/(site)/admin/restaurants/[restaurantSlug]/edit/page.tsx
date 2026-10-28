// app/admin/restaurants/[restaurantSlug]/edit/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { MAIN_BRANCH, getBranchesForEdit, withMainBranch } from "~/server/branches";
import { updateRestaurant } from "~/app/actions/restaurant";
import { AdminRestaurantForm } from "~/components/admin/restaurant-form/AdminRestaurantForm";
import { countryOptions } from "~/lib/countries";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { MenuLanguagesSettings } from "~/components/menu-languages/MenuLanguagesSettings";
import { BranchesSettings } from "~/components/branches/BranchesSettings";
import { FeatureOverridesCard } from "~/components/admin/billing/FeatureOverridesCard";
import { getRestaurantPlan } from "~/server/billing";
import { overridesOf } from "~/server/plans";
import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const found = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    with: MAIN_BRANCH,
  });
  if (!found) notFound();
  const row = withMainBranch(found);

  const restaurant: Restaurant = {
    ...row,
    categories: [],
    socialMedia: row.socialMedia as SocialMediaLinks,
    deliveryApps: row.deliveryApps as DeliveryAppLinks,
  };

  const { plan } = await getRestaurantPlan(row.id);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="details" />
      <AdminRestaurantForm restaurant={restaurant} action={updateRestaurant} />
      {/* Saved on their own, outside the form's save bar. */}
      <FeatureOverridesCard
        restaurantId={row.id}
        tier={plan?.tier ?? null}
        overrides={overridesOf(plan)}
        planHref={`/admin/restaurants/${row.slug}/plan`}
      />
      <BranchesSettings
        restaurantId={row.id}
        branches={await getBranchesForEdit(row.id)}
        maxBranches={row.maxBranches}
        isAdmin
        countries={countryOptions(await getLocale())}
      />
      <MenuLanguagesSettings
        restaurantId={row.id}
        isAdmin
        enabled={row.multilingualEnabled}
        maxExtraLanguages={row.maxExtraLanguages}
        mainLanguage={row.mainLanguage}
        extraLanguages={row.extraLanguages}
        description={row.description}
        translations={row.translations}
      />
    </div>
  );
}
