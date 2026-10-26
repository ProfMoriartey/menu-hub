// app/[locale]/(site)/(client)/dashboard/[restaurantSlug]/colors/page.tsx
import { type Metadata } from "next";
import { getLocale } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getPreviewMenu } from "~/server/color-preview";
import { canEditDetails } from "~/lib/access";
import { startingTheme } from "~/lib/color-theme";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { ColorThemeEditor } from "~/components/colors/ColorThemeEditor";

export const metadata: Metadata = {
  title: "Colours | Menupedia",
  description: "Choose the colours of your public menu.",
};

export default async function DashboardColorsPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);

  // Like the details, colours are the owner's; editors manage the menu.
  if (!canEditDetails(role)) {
    return redirect({
      href: `/dashboard/${restaurant.slug}/menu`,
      locale: await getLocale(),
    });
  }

  return (
    <>
      <DashboardRestaurantHeader
        restaurant={restaurant}
        role={role}
        activeTab="colors"
      />
      <ColorThemeEditor
        restaurantId={restaurant.id}
        isAdmin={role === "admin"}
        enabled={restaurant.brandColorEnabled}
        startTheme={startingTheme(restaurant.colorTheme, restaurant.brandColor)}
        hasSavedTheme={Boolean(restaurant.colorTheme ?? restaurant.brandColor)}
        menu={await getPreviewMenu(restaurant)}
      />
    </>
  );
}
