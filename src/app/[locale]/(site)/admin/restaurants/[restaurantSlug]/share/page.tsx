// app/admin/restaurants/[restaurantSlug]/share/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getShareLinks } from "~/server/public-origin";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { SharePanel } from "~/components/share/SharePanel";
import { ScanStats } from "~/components/share/ScanStats";
import { getScanStats } from "~/server/qr-scans";

export default async function AdminSharePage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });
  if (!restaurant) notFound();

  const [{ menuUrl, permanentUrl }, scanStats] = await Promise.all([
    getShareLinks(restaurant),
    getScanStats(restaurant.id, restaurant.timeZone),
  ]);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="share" />
      <SharePanel
        restaurant={restaurant}
        menuUrl={menuUrl}
        permanentUrl={permanentUrl}
        detailsHref={`/admin/restaurants/${restaurant.slug}/edit`}
        printHref={`/admin/restaurants/${restaurant.slug}/share/print`}
      />
      <ScanStats stats={scanStats} />
    </div>
  );
}
