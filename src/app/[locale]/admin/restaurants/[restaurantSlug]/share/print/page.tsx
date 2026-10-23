// app/admin/restaurants/[restaurantSlug]/share/print/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { getShareLinks } from "~/server/public-origin";
import { TableCardSheet } from "~/components/share/TableCardSheet";

export default async function AdminPrintCardsPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });
  if (!restaurant) notFound();

  const { menuUrl, permanentUrl } = await getShareLinks(restaurant);

  return (
    <TableCardSheet
      restaurant={restaurant}
      menuUrl={menuUrl}
      permanentUrl={permanentUrl}
      backHref={`/admin/restaurants/${restaurant.slug}/share`}
    />
  );
}
