// src/app/actions/search.ts
"use server"; // This directive must be at the very top of the file

import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq, or, ilike } from "drizzle-orm";
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
          drizzleIlike(restaurant.name, lowerCaseSearchTerm),
          drizzleIlike(restaurant.slug, lowerCaseSearchTerm),
          drizzleIlike(restaurant.country, lowerCaseSearchTerm),
          drizzleIlike(restaurant.foodType, lowerCaseSearchTerm),
          drizzleIlike(restaurant.address, lowerCaseSearchTerm),
        ),
      with: {
        categories: {
          with: {
            menuItems: true,
          },
        },
      },
    });

    // Post-process to filter by nested categories/menuItems if not already handled by top-level ilike
    const finalResults = results.filter(restaurant => {
      // Check if primary fields already matched
      if (
        (restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.slug?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.country?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.foodType?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        return true;
      }

      // Check categories and menu items
      if (restaurant.categories) {
        for (const category of restaurant.categories) {
          if (category.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }
          if (category.menuItems?.some(menuItem =>
              menuItem.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )) {
            return true;
          }
        }
      }
      return false;
    });

    // Ensure only unique restaurants are returned (though `findMany` should prevent duplicates if the initial query is well-formed)
    // Using Set for uniqueness is a client-side safeguard if the query might return non-distinct restaurants.
    // For this specific Drizzle `findMany`, it's usually not necessary as it returns distinct primary records.
    return finalResults;

  } catch (error) {
    console.error("Error searching restaurants:", error);
    throw new Error(`Failed to search restaurants: ${error instanceof Error ? error.message : String(error)}`);
  }
}