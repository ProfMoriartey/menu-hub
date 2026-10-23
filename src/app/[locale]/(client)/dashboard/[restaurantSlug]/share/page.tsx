// app/[locale]/(client)/dashboard/[restaurantSlug]/share/page.tsx
import { type Metadata } from "next";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getShareLinks } from "~/server/public-origin";
import { canEditDetails } from "~/lib/access";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { SharePanel } from "~/components/share/SharePanel";

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
  const { menuUrl, permanentUrl } = await getShareLinks(restaurant);

  return (
    <>
      <DashboardRestaurantHeader restaurant={restaurant} role={role} activeTab="share" />
      <SharePanel
        restaurant={restaurant}
        menuUrl={menuUrl}
        permanentUrl={permanentUrl}
        detailsHref={canEditDetails(role) ? `/dashboard/${restaurant.slug}/edit` : null}
      />
    </>
  );
}
