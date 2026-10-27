// src/app/actions/restaurant.ts
"use server";

import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { deleteUploadedFiles } from "~/server/uploads";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePublicRestaurant } from "~/server/public-menu";
import { MAIN_BRANCH, saveMainBranch } from "~/server/branches";
import type { ZodIssue } from "zod";
import { checkOwnerAuthorization, isSystemAdmin } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { runAction } from "~/server/run-action";

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
  city: getStringValue(formData, "city")?.trim() ?? null,
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

// Validated restaurant fields, split into the restaurant's own and those
// that live on its main branch (server/branches).
const splitLocation = <T extends Record<string, unknown>>({
  address,
  city,
  country,
  phoneNumber,
  mapUrl,
  deliveryApps,
  ...restaurant
}: T & {
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phoneNumber?: string | null;
  mapUrl?: string | null;
  deliveryApps?: unknown;
}) => ({
  restaurant,
  location: { address, city, country, phoneNumber, mapUrl, deliveryApps },
});

// The forms validate first, so this mostly catches a bad slug sent by hand.
const invalidInput = (issues: ZodIssue[]) =>
  new ActionError(issues.some((issue) => issue.path[0] === "slug") ? "slugInvalid" : "invalidInput");

export async function addRestaurant(formData: FormData): Promise<ActionResult> {
  return runAction("createRestaurantFailed", async () => {
    if (!(await isSystemAdmin())) {
      throw new ActionError("adminOnly");
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
      throw new ActionError("slugTaken");
    }

    const { restaurant, location } = splitLocation(data);
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(restaurants)
        .values(restaurant)
        .returning({ id: restaurants.id });
      await saveMainBranch(tx, created!.id, location);
    });
    revalidatePublicRestaurant();
  });
}

export async function deleteRestaurant(restaurantId: string): Promise<ActionResult> {
  return runAction("deleteRestaurantFailed", async () => {
    if (!(await isSystemAdmin())) {
      throw new ActionError("adminOnly");
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
    if (!restaurant) throw new ActionError("restaurantNotFound");

    await db.delete(restaurants).where(eq(restaurants.id, restaurantId));
    await deleteUploadedFiles([
      restaurant.logoUrl,
      restaurant.ogImage,
      ...items.map((item) => item.imageUrl),
    ]);

    revalidatePublicRestaurant(restaurantId);
  });
}

export async function updateRestaurant(formData: FormData): Promise<ActionResult> {
  return runAction("saveRestaurantFailed", async () => {
    const restaurantId = getStringValue(formData, "id");
    if (!restaurantId) {
      throw new ActionError("missingRestaurant");
    }
    const role = await checkOwnerAuthorization(restaurantId);

    const submitted = { id: restaurantId, ...readRestaurantFields(formData) };

    const row = await db.query.restaurants.findFirst({
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
        foodType: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
      with: { branches: { ...MAIN_BRANCH.branches, columns: { country: true } } },
    });
    if (!row) throw new ActionError("restaurantNotFound");
    const { branches: [mainBranch], logoUrl: previousLogoUrl, ...restaurantAdminOnly } = row;
    // The country, on the main branch, is admin-only too.
    const adminOnly = { ...restaurantAdminOnly, country: mainBranch?.country ?? null };

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
      throw new ActionError("slugTaken");
    }

    const { restaurant, location } = splitLocation(data);
    await db.transaction(async (tx) => {
      await tx
        .update(restaurants)
        .set({ ...restaurant, updatedAt: new Date() })
        .where(eq(restaurants.id, restaurantId));
      await saveMainBranch(tx, restaurantId, location);
    });

    // A replaced or removed logo / share image leaves its old file behind.
    await deleteUploadedFiles([
      previousLogoUrl !== data.logoUrl ? previousLogoUrl : null,
      adminOnly.ogImage !== data.ogImage ? adminOnly.ogImage : null,
    ]);

    revalidatePublicRestaurant(restaurantId);
  });
}
