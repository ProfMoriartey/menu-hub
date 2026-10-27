// app/admin/restaurants/[restaurantSlug]/share/print/page.tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { tableCardFor } from "~/server/share-card";
import { TableCardSheet } from "~/components/share/TableCardSheet";

export default async function AdminPrintCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<{ branch?: string | string[] }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });
  if (!restaurant) notFound();

  const { menuUrl, permanentUrl, name } = await tableCardFor(
    restaurant,
    (await searchParams).branch,
  );

  return (
    <TableCardSheet
      restaurant={{ ...restaurant, name }}
      menuUrl={menuUrl}
      permanentUrl={permanentUrl}
      backHref={`/admin/restaurants/${restaurant.slug}/share`}
    />
  );
}
