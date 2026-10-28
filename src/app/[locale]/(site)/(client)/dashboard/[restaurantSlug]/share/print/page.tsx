// app/[locale]/(client)/dashboard/[restaurantSlug]/share/print/page.tsx
import { type Metadata } from "next";
import { isLive } from "~/lib/access";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { tableCardFor } from "~/server/share-card";
import { TableCardSheet } from "~/components/share/TableCardSheet";

export const metadata: Metadata = {
  title: "Print table cards | Menupedia",
};

export default async function DashboardPrintCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<{ branch?: string | string[] }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant } = await getDashboardRestaurant(restaurantSlug);
  const { menuUrl, permanentUrl, name } = await tableCardFor(
    restaurant,
    (await searchParams).branch,
  );

  return (
    <TableCardSheet
      restaurant={{ ...restaurant, name, isActive: isLive(restaurant) }}
      menuUrl={menuUrl}
      permanentUrl={permanentUrl}
      backHref={`/dashboard/${restaurant.slug}/share`}
    />
  );
}
