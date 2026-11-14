// app/[locale]/(client)/dashboard/[restaurantSlug]/branches/page.tsx
import { type Metadata } from "next";
import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { canEditDetails } from "~/lib/access";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { ExperimentalNote } from "~/components/dashboard/ExperimentalNote";
import { BranchesSettings } from "~/components/branches/BranchesSettings";
import { getBranchesForEdit } from "~/server/branches";
import { countryOptions } from "~/lib/countries";

export const metadata: Metadata = {
  title: "Branches & hours | Menupedia",
  description: "Manage your restaurant's branches and their opening hours.",
};

/**
 * The owner's branches, each with its address and opening hours (the menu
 * languages have their own tab). Experimental: every plan has them for
 * now. Owners and admins only.
 */
export default async function RestaurantBranchesPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);
  const locale = await getLocale();

  // Like the details, these are the owner's; editors manage the menu.
  if (!canEditDetails(role)) {
    return redirect({ href: `/dashboard/${restaurant.slug}/menu`, locale });
  }

  return (
    <>
      <DashboardRestaurantHeader
        restaurant={restaurant}
        role={role}
        activeTab="branches"
      />
      <ExperimentalNote />
      <BranchesSettings
        restaurantId={restaurant.id}
        branches={await getBranchesForEdit(restaurant.id)}
        maxBranches={restaurant.maxBranches}
        isAdmin={role === "admin"}
        countries={countryOptions(locale)}
      />
    </>
  );
}
