// app/[locale]/(client)/dashboard/[restaurantSlug]/share/print/page.tsx
import { type Metadata } from "next";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getShareLinks } from "~/server/public-origin";
import { TableCardSheet } from "~/components/share/TableCardSheet";

export const metadata: Metadata = {
  title: "Print table cards | Menupedia",
};

export default async function DashboardPrintCardsPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant } = await getDashboardRestaurant(restaurantSlug);
  const { menuUrl, permanentUrl } = await getShareLinks(restaurant);

  return (
    <TableCardSheet
      restaurant={restaurant}
      menuUrl={menuUrl}
      permanentUrl={permanentUrl}
      backHref={`/dashboard/${restaurant.slug}/share`}
    />
  );
}
