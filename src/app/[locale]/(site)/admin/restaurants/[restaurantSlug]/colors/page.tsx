// app/[locale]/(site)/admin/restaurants/[restaurantSlug]/colors/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getPreviewMenu } from "~/server/color-preview";
import { startingTheme } from "~/lib/color-theme";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { ColorThemeEditor } from "~/components/colors/ColorThemeEditor";

// The same colours page owners get, plus the switch that turns it on.
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
      <ColorThemeEditor
        restaurantId={restaurant.id}
        isAdmin
        enabled={restaurant.brandColorEnabled}
        startTheme={startingTheme(restaurant.colorTheme, restaurant.brandColor)}
        hasSavedTheme={Boolean(restaurant.colorTheme ?? restaurant.brandColor)}
        menu={await getPreviewMenu(restaurant)}
      />
    </div>
  );
}
