// app/[locale]/(client)/dashboard/[restaurantSlug]/edit/page.tsx
import { type Metadata } from "next";
import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { canEditDetails } from "~/lib/access";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { RestaurantDetailsEditor } from "~/components/dashboard/RestaurantDetailsEditor";
import { MenuLanguagesSettings } from "~/components/menu-languages/MenuLanguagesSettings";
import { BranchesSettings } from "~/components/branches/BranchesSettings";
import { getBranchesForEdit } from "~/server/branches";
import { countryOptions } from "~/lib/countries";
import type { DeliveryAppLinks, SocialMediaLinks } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

interface EditPageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export const metadata: Metadata = {
  title: "Restaurant Details | Menupedia",
  description:
    "Manage your restaurant's details, contact information and links.",
};

export default async function RestaurantEditPage({ params }: EditPageProps) {
  const { restaurantSlug } = await params;
  const { restaurant: row, role } =
    await getDashboardRestaurant(restaurantSlug);

  // Editors manage the menu only.
  if (!canEditDetails(role)) {
    return redirect({
      href: `/dashboard/${row.slug}/menu`,
      locale: await getLocale(),
    });
  }

  const restaurant: Restaurant = {
    ...row,
    categories: [],
    currency: row.currency || "USD",
    socialMedia: row.socialMedia as SocialMediaLinks,
    deliveryApps: row.deliveryApps as DeliveryAppLinks,
  };

  return (
    <>
      <DashboardRestaurantHeader
        restaurant={restaurant}
        role={role}
        activeTab="details"
      />
      <RestaurantDetailsEditor restaurant={restaurant} />
      <div className="mt-8 space-y-8">
        <BranchesSettings
          restaurantId={row.id}
          branches={await getBranchesForEdit(row.id)}
          maxBranches={row.maxBranches}
          isAdmin={role === "admin"}
          countries={countryOptions(await getLocale())}
        />
        <MenuLanguagesSettings
          restaurantId={row.id}
          isAdmin={role === "admin"}
          enabled={row.multilingualEnabled}
          maxExtraLanguages={row.maxExtraLanguages}
          mainLanguage={row.mainLanguage}
          extraLanguages={row.extraLanguages}
          description={row.description}
          translations={row.translations}
        />
      </div>
    </>
  );
}
