// src/app/actions/restaurant.ts
"use server"; // This directive must be at the very top of the file

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq, and, ne } from "drizzle-orm"; // Import 'and' and 'ne' for update logic
import { revalidatePath } from "next/cache";

// Import the schema and type from the shared schemas file
import { restaurantSchema, type RestaurantFormData } from "~/lib/schemas";

// Helper to safely get string values from FormData
const getStringValue = (formData: FormData, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
};

// Server Action to add a new restaurant
export async function addRestaurant(formData: FormData) {
  const rawData = {
    name: getStringValue(formData, "name"),
    slug: getStringValue(formData, "slug"),
    address: getStringValue(formData, "address"),
    country: getStringValue(formData, "country"),
    foodType: getStringValue(formData, "foodType"),
    isActive: formData.get("isActive") === "on",
    isDisplayed: formData.get("isDisplayed") === "on",
    logoUrl: getStringValue(formData, "logoUrl"),
  };

  const result = restaurantSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    throw new Error(
      "Invalid input: " +
        result.error.errors.map((_e) => _e.message).join(", "),
    );
  }

  const {
    name,
    slug,
    address,
    country,
    foodType,
    isActive,
    isDisplayed,
    logoUrl,
  } = result.data;

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });

  if (existing) {
    throw new Error("Slug already exists.");
  }

  await db.insert(restaurants).values({
    name,
    slug,
    address,
    country,
    foodType,
    isActive,
    isDisplayed,
    logoUrl,
  });

  revalidatePath("/admin/restaurants");
}

// Server Action to delete a restaurant
export async function deleteRestaurant(restaurantId: string) {
  try {
    await db.delete(restaurants).where(eq(restaurants.id, restaurantId));
    revalidatePath("/admin/restaurants");
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw new Error("Failed to delete restaurant.");
  }
}

// Server Action to update a restaurant
export async function updateRestaurant(formData: FormData) {
  const rawData = {
    id: getStringValue(formData, "id"),
    name: getStringValue(formData, "name"),
    slug: getStringValue(formData, "slug"),
    address: getStringValue(formData, "address"),
    country: getStringValue(formData, "country"),
    foodType: getStringValue(formData, "foodType"),
    isActive: formData.get("isActive") === "on",
    isDisplayed: formData.get("isDisplayed") === "on",
    logoUrl: getStringValue(formData, "logoUrl"),
  };

  const result = restaurantSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    throw new Error(
      "Invalid input: " +
        result.error.errors.map((_e) => _e.message).join(", "),
    );
  }

  const {
    id,
    name,
    slug,
    address,
    country,
    foodType,
    isActive,
    isDisplayed,
    logoUrl,
  } = result.data;

  // Ensure 'id' exists for update operation
  if (!id) {
    throw new Error("Restaurant ID is required for update.");
  }

  const existing = await db.query.restaurants.findFirst({
    where: (restaurant, { and: drizzleAnd, eq: drizzleEq, ne: drizzleNe }) =>
      drizzleAnd(drizzleEq(restaurant.slug, slug), drizzleNe(restaurant.id, id)),
  });

  if (existing) {
    throw new Error("Slug already exists for another restaurant.");
  }

  await db
    .update(restaurants)
    .set({
      name,
      slug,
      address,
      country,
      foodType,
      isActive,
      isDisplayed,
      logoUrl,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, id));

  revalidatePath("/admin/restaurants");
}