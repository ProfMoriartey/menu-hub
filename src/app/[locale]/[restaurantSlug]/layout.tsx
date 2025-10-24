// app/[locale]/[restaurantSlug]/layout.tsx
import { redirect, notFound } from "next/navigation";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface DynamicPublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}

/**
 * @description Public Route Gate: Checks if the restaurant is active before rendering any public menu page.
 * If isActive is false, redirects to the main restaurants list.
 */
export default async function DynamicPublicLayout({
  children,
  params,
}: DynamicPublicLayoutProps) {
  const restaurantSlug = (await params).restaurantSlug;

  // 1. Fetch the restaurant's active status from the database
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, restaurantSlug),
    columns: {
      id: true,
      isActive: true, // Only fetch what we need for the check
    },
  });

  // 2. Check existence
  if (!restaurant) {
    // If the slug doesn't exist, return 404
    return notFound();
  }

  // 3. Check active status
  if (!restaurant.isActive) {
    // If the restaurant is NOT active, redirect the user to the main restaurants page
    // The locale prefix is handled automatically by the router.
    return redirect("/restaurants");
  }

  // 4. If active, render the child route (page.tsx, /about, /item)
  return <>{children}</>;
}
