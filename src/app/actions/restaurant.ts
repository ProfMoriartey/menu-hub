// src/app/actions/restaurant.ts
"use server";

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Import the schema and type from the shared schemas file
import { restaurantSchema,  } from "~/lib/schemas";

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
    currency: getStringValue(formData, "currency"),
    phoneNumber: getStringValue(formData, "phoneNumber"),
    description: getStringValue(formData, "description"),
    theme: getStringValue(formData, "theme"),
    typeOfEstablishment: getStringValue(formData, "typeOfEstablishment"),
  };

  const parsedRawData = {
    ...rawData,
    currency: rawData.currency ?? "USD", // Example default if not sent by form
    isActive: rawData.isActive,
    isDisplayed: rawData.isDisplayed,
    name: rawData.name ?? "",
    slug: rawData.slug ?? "",
  };

  const result = restaurantSchema.safeParse(parsedRawData);

  if (!result.success) {
    console.error("Validation failed (addRestaurant):", result.error.errors);
    // Corrected line: Use _e.message
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
    currency,
    phoneNumber,
    description,
    theme,
    typeOfEstablishment,
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
    currency,
    phoneNumber,
    description,
    theme,
    typeOfEstablishment,
  });

  revalidatePath("/admin/restaurants");
  revalidatePath("/");
}

// Server Action to delete a restaurant (no change needed)
export async function deleteRestaurant(restaurantId: string) {
  try {
    await db.delete(restaurants).where(eq(restaurants.id, restaurantId));
    revalidatePath("/admin/restaurants");
    revalidatePath("/");
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
    currency: getStringValue(formData, "currency"),
    phoneNumber: getStringValue(formData, "phoneNumber"),
    description: getStringValue(formData, "description"),
    theme: getStringValue(formData, "theme"),
    typeOfEstablishment: getStringValue(formData, "typeOfEstablishment"),
  };

  const parsedRawData = {
    ...rawData,
    currency: rawData.currency ?? "USD",
    isActive: rawData.isActive,
    isDisplayed: rawData.isDisplayed,
    name: rawData.name ?? "",
    slug: rawData.slug ?? "",
    id: rawData.id ?? "",
  };

  const result = restaurantSchema.safeParse(parsedRawData);

  if (!result.success) {
    console.error("Validation failed (updateRestaurant):", result.error.errors);
    // Corrected line: Use _e.message
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
    currency,
    phoneNumber,
    description,
    theme,
    typeOfEstablishment,
  } = result.data;

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
      currency,
      phoneNumber,
      description,
      theme,
      typeOfEstablishment,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, id));

  revalidatePath("/admin/restaurants");
  revalidatePath("/");
}