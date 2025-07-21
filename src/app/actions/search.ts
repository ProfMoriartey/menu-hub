// src/app/actions/search.ts
"use server";

import { db } from "~/server/db";
// Ensure categories and menuItems are imported here for subqueries
import { categories, menuItems } from "~/server/db/schema";
// Import 'exists' and 'and' for complex subqueries
import { eq, exists, and } from "drizzle-orm";
import type { Restaurant } from "~/types/restaurant";

// NEW SERVER ACTION: Search Restaurants from the database
export async function searchRestaurants(searchTerm: string): Promise<Restaurant[]> {
  if (!searchTerm || searchTerm.trim() === "") {
    return []; // Return empty array if search term is empty
  }

  const lowerCaseSearchTerm = `%${searchTerm.toLowerCase()}%`; // Use % for LIKE wildcards

  try {
    const results = await db.query.restaurants.findMany({
      where: (restaurant, { or: drizzleOr, ilike: drizzleIlike }) =>
        drizzleOr(
          // Primary restaurant fields
          drizzleIlike(restaurant.name, lowerCaseSearchTerm),
          drizzleIlike(restaurant.slug, lowerCaseSearchTerm),
          drizzleIlike(restaurant.country, lowerCaseSearchTerm),
          drizzleIlike(restaurant.foodType, lowerCaseSearchTerm),
          drizzleIlike(restaurant.address, lowerCaseSearchTerm),

          // Search within categories (by name)
          exists(
            db.select().from(categories).where(
              and(
                eq(categories.restaurantId, restaurant.id), // Link category to current restaurant
                drizzleIlike(categories.name, lowerCaseSearchTerm) // Search category name
              )
            )
          ),

          // Search within menu items (by name)
          exists(
            db.select().from(menuItems).where(
              and(
                eq(menuItems.restaurantId, restaurant.id), // Link menu item to current restaurant
                drizzleIlike(menuItems.name, lowerCaseSearchTerm) // Search menu item name
              )
            )
          )
        ),
      // Still fetch categories and menu items for popover display purposes
      with: {
        categories: {
          with: {
            menuItems: true,
          },
        },
      },
    });

    // The post-processing filter `finalResults` is now redundant because the Drizzle query
    // directly fetches only the matching restaurants based on all criteria.
    // We can directly return `results`.

    return results;

  } catch (error) {
    console.error("Error searching restaurants:", error);
    throw new Error(`Failed to search restaurants: ${error instanceof Error ? error.message : String(error)}`);
  }
}