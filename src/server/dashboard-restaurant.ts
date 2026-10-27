// src/server/dashboard-restaurant.ts
import { cache } from "react";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { MAIN_BRANCH, withMainBranch } from "~/server/branches";
import { getRestaurantRole } from "~/app/actions/auth";

/**
 * The restaurant behind a dashboard URL (with its main branch's location)
 * and the viewer's role for it. The
 * [restaurantSlug] layout has already turned away anyone without access, so
 * a missing role here means the access was removed mid-request.
 */
export const getDashboardRestaurant = cache(async (slug: string) => {
  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
    with: MAIN_BRANCH,
  });
  if (!row) notFound();
  const restaurant = withMainBranch(row);

  const role = await getRestaurantRole(restaurant.id);
  if (!role) notFound();

  return { restaurant, role };
});
