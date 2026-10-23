// src/app/actions/restaurant.ts
"use server";

import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { deleteUploadedFiles } from "~/server/uploads";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ZodIssue } from "zod";
import { checkOwnerAuthorization, isSystemAdmin } from "~/app/actions/auth";
import { ActionError, runAction, type ActionResult } from "~/lib/action-result";

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

const readRestaurantFields = (formData: FormData) => ({
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
  socialMedia: getJsonValue(formData, "socialMedia") as SocialMediaLinks | null,
  deliveryApps: getJsonValue(formData, "deliveryApps") as DeliveryAppLinks | null,
  mapUrl: getStringValue(formData, "mapUrl"),
  metaTitle: getStringValue(formData, "metaTitle"),
  metaDescription: getStringValue(formData, "metaDescription"),
  ogImage: getStringValue(formData, "ogImage"),
});

// The id comes from the request target, never from the submitted fields.
const restaurantFields = restaurantSchema.omit({ id: true });

const invalidInput = (issues: ZodIssue[]) =>
  new ActionError("Invalid input: " + issues.map((issue) => issue.message).join(", "));

// Restaurant data shows up on public pages, the dashboard and the admin
// panel, so refresh every page under the locale segment.
const revalidateRestaurantPages = () => revalidatePath("/[locale]", "layout");

export async function addRestaurant(formData: FormData): Promise<ActionResult> {
  return runAction("Couldn't create the restaurant.", async () => {
    if (!(await isSystemAdmin())) {
      throw new ActionError("Only system administrators can add new restaurants.");
    }

    const fields = readRestaurantFields(formData);
    const result = restaurantFields.safeParse({
      ...fields,
      currency: fields.currency ?? "USD",
      name: fields.name ?? "",
      slug: fields.slug ?? "",
    });
    if (!result.success) throw invalidInput(result.error.errors);

    const data = result.data;

    const existing = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, data.slug),
      columns: { id: true },
    });
    if (existing) {
      throw new ActionError("Slug already exists.");
    }

    await db.insert(restaurants).values(data);
    revalidateRestaurantPages();
  });
}

export async function deleteRestaurant(restaurantId: string): Promise<ActionResult> {
  return runAction("Couldn't delete the restaurant.", async () => {
    if (!(await isSystemAdmin())) {
      throw new ActionError("Only system administrators can delete restaurants.");
    }

    // Collect the files first: the delete cascades to categories and items,
    // after which their photo URLs are gone.
    const [restaurant, items] = await Promise.all([
      db.query.restaurants.findFirst({
        where: eq(restaurants.id, restaurantId),
        columns: { logoUrl: true, ogImage: true },
      }),
      db.query.menuItems.findMany({
        where: eq(menuItems.restaurantId, restaurantId),
        columns: { imageUrl: true },
      }),
    ]);
    if (!restaurant) throw new ActionError("Restaurant not found.");

    await db.delete(restaurants).where(eq(restaurants.id, restaurantId));
    await deleteUploadedFiles([
      restaurant.logoUrl,
      restaurant.ogImage,
      ...items.map((item) => item.imageUrl),
    ]);

    revalidateRestaurantPages();
  });
}

export async function updateRestaurant(formData: FormData): Promise<ActionResult> {
  return runAction("Couldn't save the restaurant.", async () => {
    const restaurantId = getStringValue(formData, "id");
    if (!restaurantId) {
      throw new ActionError("Missing restaurant.");
    }
    const role = await checkOwnerAuthorization(restaurantId);

    const submitted = { id: restaurantId, ...readRestaurantFields(formData) };

    const current = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: {
        logoUrl: true,
        // Admin-only fields:
        slug: true,
        isActive: true,
        isDisplayed: true,
        currency: true,
        theme: true,
        typeOfEstablishment: true,
        country: true,
        foodType: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
    });
    if (!current) throw new ActionError("Restaurant not found.");
    const { logoUrl: previousLogoUrl, ...adminOnly } = current;

    // Owners edit what their dashboard shows (name, address, contact, logo,
    // links). The slug, visibility, theme, cuisine and SEO settings stay
    // admin-only, whatever the request contains.
    const rawData = role === "admin" ? submitted : { ...submitted, ...adminOnly };

    const result = restaurantFields.safeParse({
      ...rawData,
      currency: rawData.currency ?? "USD",
      name: rawData.name ?? "",
      slug: rawData.slug ?? "",
    });
    if (!result.success) throw invalidInput(result.error.errors);

    const data = result.data;

    const existing = await db.query.restaurants.findFirst({
      where: and(eq(restaurants.slug, data.slug), ne(restaurants.id, restaurantId)),
      columns: { id: true },
    });
    if (existing) {
      throw new ActionError("Slug already exists for another restaurant.");
    }

    await db
      .update(restaurants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId));

    // A replaced or removed logo / share image leaves its old file behind.
    await deleteUploadedFiles([
      previousLogoUrl !== data.logoUrl ? previousLogoUrl : null,
      adminOnly.ogImage !== data.ogImage ? adminOnly.ogImage : null,
    ]);

    revalidateRestaurantPages();
  });
}
