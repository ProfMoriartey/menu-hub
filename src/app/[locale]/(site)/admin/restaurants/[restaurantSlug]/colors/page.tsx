// app/[locale]/(site)/admin/restaurants/[restaurantSlug]/colors/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getPreviewMenu } from "~/server/color-preview";
import { startingTheme } from "~/lib/color-theme";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { AppearanceEditor } from "~/components/colors/AppearanceEditor";
import { menuDesignOf } from "~/lib/menu-design";

// The same Appearance page owners get, plus the custom-colours switch.
export default async function AdminColorsPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });
  if (!restaurant) notFound();

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="colors" />
      <AppearanceEditor
        restaurantId={restaurant.id}
        isAdmin
        colorsEnabled={restaurant.brandColorEnabled}
        design={menuDesignOf(restaurant.theme)}
        startTheme={startingTheme(restaurant.colorTheme, restaurant.brandColor)}
        hasSavedTheme={Boolean(restaurant.colorTheme ?? restaurant.brandColor)}
        menu={await getPreviewMenu(restaurant)}
      />
    </div>
  );
}
