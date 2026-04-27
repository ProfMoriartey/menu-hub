// src/app/actions/restaurant.ts
"use server";

import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkAuthorization, isSystemAdmin } from "~/app/actions/auth";

// 🛑 ADDED: Import the exported types directly from your schema
import { restaurantSchema, type SocialMediaLinks, type DeliveryAppLinks } from "~/lib/schemas";

const getStringValue = (formData: FormData, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
};

// 🛑 FIX: Use explicit type to satisfy ESLint
const getJsonValue = (formData: FormData, key: string): unknown => {
  const value = formData.get(key);
  if (typeof value === "string" && value.trim() !== "") {
    try {
      return JSON.parse(value) as unknown;
    } catch (e) {
      console.error(`Failed to parse JSON for ${key}:`, e);
      return null;
    }
  }
  return null;
};

export async function addRestaurant(formData: FormData) {
  const restaurantId = formData.get("restaurantId") as string;

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
    
    // 🛑 FIX: Cast to the correct imported types
    socialMedia: getJsonValue(formData, "socialMedia") as SocialMediaLinks | null,
    deliveryApps: getJsonValue(formData, "deliveryApps") as DeliveryAppLinks | null,
    
    mapUrl: getStringValue(formData, "mapUrl"),
    metaTitle: getStringValue(formData, "metaTitle"),
    metaDescription: getStringValue(formData, "metaDescription"),
    ogImage: getStringValue(formData, "ogImage"),
  };

  const parsedRawData = {
    ...rawData,
    currency: rawData.currency ?? "USD", 
    isActive: rawData.isActive,
    isDisplayed: rawData.isDisplayed,
    name: rawData.name ?? "",
    slug: rawData.slug ?? "",
  };

  try {
    const isAdmin = await isSystemAdmin();
    if (!isAdmin) {
      throw new Error("Unauthorized: Only system administrators can add new restaurants.");
    }
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  const result = restaurantSchema.safeParse(parsedRawData);

  if (!result.success) {
    console.error("Validation failed (addRestaurant):", result.error.errors);
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
    socialMedia,
    deliveryApps,
    mapUrl,
    metaTitle,
    metaDescription,
    ogImage,
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
    socialMedia,
    deliveryApps,
    mapUrl,
    metaTitle,
    metaDescription,
    ogImage,
  });

  revalidatePath(`/dashboard/${restaurantId}/edit`); 
  revalidatePath("/admin/restaurants");
  revalidatePath("/");
}

export async function deleteRestaurant(restaurantId: string) {
  try {
    const isAdmin = await isSystemAdmin();
    if (!isAdmin) {
      throw new Error("Unauthorized: Only system administrators can delete restaurants.");
    }
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  try {
    await db.delete(restaurants).where(eq(restaurants.id, restaurantId));
    revalidatePath(`/dashboard/${restaurantId}/edit`); 
    revalidatePath("/admin/restaurants");
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw new Error("Failed to delete restaurant.");
  }
}

export async function updateRestaurant(formData: FormData) {
  const restaurantId = getStringValue(formData, "id")!;
  
  try {
    if (!restaurantId) {
      throw new Error("400: Restaurant ID is required for authorization.");
    }
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

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
    
    // 🛑 FIX: Cast to the correct imported types
    socialMedia: getJsonValue(formData, "socialMedia") as SocialMediaLinks | null,
    deliveryApps: getJsonValue(formData, "deliveryApps") as DeliveryAppLinks | null,
    
    mapUrl: getStringValue(formData, "mapUrl"),
    metaTitle: getStringValue(formData, "metaTitle"),
    metaDescription: getStringValue(formData, "metaDescription"),
    ogImage: getStringValue(formData, "ogImage"),
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
    socialMedia,
    deliveryApps,
    mapUrl,
    metaTitle,
    metaDescription,
    ogImage,
  } = result.data;


  if (!id) {
    throw new Error("Internal Error: Validated ID is missing."); 
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
      socialMedia,
      deliveryApps,
      mapUrl,
      metaTitle,
      metaDescription,
      ogImage,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, id));

  revalidatePath(`/dashboard/${restaurantId}/edit`); 
  revalidatePath("/admin/restaurants");
  revalidatePath("/");
}