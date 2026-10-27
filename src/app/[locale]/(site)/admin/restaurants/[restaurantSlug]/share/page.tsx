// app/admin/restaurants/[restaurantSlug]/share/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { MAIN_BRANCH, withMainBranch } from "~/server/branches";
import { getShareTargets } from "~/server/public-origin";
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

  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    with: MAIN_BRANCH,
  });
  if (!row) notFound();
  const restaurant = withMainBranch(row);

  const [targets, scanStats] = await Promise.all([
    getShareTargets(restaurant),
    getScanStats(restaurant.id, restaurant.timeZone),
  ]);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="share" />
      <SharePanel
        restaurant={restaurant}
        targets={targets}
        detailsHref={`/admin/restaurants/${restaurant.slug}/edit`}
        printHref={`/admin/restaurants/${restaurant.slug}/share/print`}
      />
      <ScanStats stats={scanStats} />
    </div>
  );
}
