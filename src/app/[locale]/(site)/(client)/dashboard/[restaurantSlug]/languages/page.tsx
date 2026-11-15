// app/[locale]/(client)/dashboard/[restaurantSlug]/languages/page.tsx
import { type Metadata } from "next";
import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { canEditDetails } from "~/lib/access";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { MenuLanguagesSettings } from "~/components/menu-languages/MenuLanguagesSettings";

export const metadata: Metadata = {
  title: "Languages | Menupedia",
  description: "Choose the languages your menu is offered in.",
};

/**
 * The menu's languages: the main one and the extra ones each dish can be
 * translated into (was part of the Branches page). Experimental: every plan
 * has them for now. Owners and admins only.
 */
export default async function RestaurantLanguagesPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);

  // Like the details, these are the owner's; editors manage the menu.
  if (!canEditDetails(role)) {
    return redirect({ href: `/dashboard/${restaurant.slug}/menu`, locale: await getLocale() });
  }

  return (
    <>
      <DashboardRestaurantHeader restaurant={restaurant} role={role} activeTab="languages" />
      <MenuLanguagesSettings
        restaurantId={restaurant.id}
        isAdmin={role === "admin"}
        enabled={restaurant.multilingualEnabled}
        maxExtraLanguages={restaurant.maxExtraLanguages}
        mainLanguage={restaurant.mainLanguage}
        extraLanguages={restaurant.extraLanguages}
        description={restaurant.description}
        translations={restaurant.translations}
      />
    </>
  );
}
