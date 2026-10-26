// app/[locale]/(client)/dashboard/[restaurantSlug]/share/page.tsx
import { type Metadata } from "next";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getShareLinks } from "~/server/public-origin";
import { canEditDetails } from "~/lib/access";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { SharePanel } from "~/components/share/SharePanel";
import { ScanStats } from "~/components/share/ScanStats";
import { getScanStats } from "~/server/qr-scans";

export const metadata: Metadata = {
  title: "Share your menu | Menupedia",
  description: "Your menu link and QR code for tables and posters.",
};

export default async function DashboardSharePage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);
  const [{ menuUrl, permanentUrl }, scanStats] = await Promise.all([
    getShareLinks(restaurant),
    getScanStats(restaurant.id, restaurant.timeZone),
  ]);

  return (
    <>
      <DashboardRestaurantHeader
        restaurant={restaurant}
        role={role}
        activeTab="share"
      />
      <div className="space-y-6">
        <SharePanel
          restaurant={restaurant}
          menuUrl={menuUrl}
          permanentUrl={permanentUrl}
          detailsHref={
            canEditDetails(role) ? `/dashboard/${restaurant.slug}/edit` : null
          }
          printHref={`/dashboard/${restaurant.slug}/share/print`}
        />
        <ScanStats stats={scanStats} />
      </div>
    </>
  );
}
