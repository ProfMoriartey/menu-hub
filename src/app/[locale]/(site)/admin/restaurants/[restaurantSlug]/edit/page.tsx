// app/admin/restaurants/[restaurantSlug]/edit/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { updateRestaurant } from "~/app/actions/restaurant";
import { AdminRestaurantForm } from "~/components/admin/restaurant-form/AdminRestaurantForm";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { MenuLanguagesSettings } from "~/components/menu-languages/MenuLanguagesSettings";
import { OpeningHoursSettings } from "~/components/restaurant-settings/OpeningHoursSettings";
import { BrandColorSettings } from "~/components/restaurant-settings/BrandColorSettings";
import type { Restaurant } from "~/types/restaurant";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });
  if (!row) notFound();

  const restaurant: Restaurant = {
    ...row,
    categories: [],
    socialMedia: row.socialMedia as SocialMediaLinks,
    deliveryApps: row.deliveryApps as DeliveryAppLinks,
  };

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="details" />
      <AdminRestaurantForm restaurant={restaurant} action={updateRestaurant} />
      {/* Saved on its own, outside the form's save bar. */}
      <MenuLanguagesSettings
        restaurantId={row.id}
        isAdmin
        enabled={row.multilingualEnabled}
        mainLanguage={row.mainLanguage}
        extraLanguages={row.extraLanguages}
        description={row.description}
        translations={row.translations}
      />
      <OpeningHoursSettings
        restaurantId={row.id}
        timeZone={row.timeZone}
        hours={row.openingHours}
      />
      <BrandColorSettings
        restaurantId={row.id}
        isAdmin
        enabled={row.brandColorEnabled}
        color={row.brandColor}
      />
    </div>
  );
}
