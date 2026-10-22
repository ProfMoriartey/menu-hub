// src/server/queries.ts
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";

/**
 * Restaurant row by slug, without relations. Wrapped in React cache() so the
 * public layout, pages and metadata share one query per request.
 */
export const getRestaurantBySlug = cache(async (slug: string) => {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });
});
