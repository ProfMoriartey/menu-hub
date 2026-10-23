// src/app/actions/menu-items.ts
"use server";

import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { checkAuthorization } from "~/app/actions/auth";
import { ActionError, runAction, type ActionResult } from "~/lib/action-result";
import { UTApi } from "uploadthing/server";

import {
  createMenuItemSchema,
  updateMenuItemSchema,
  type CreateMenuItemData,
  type UpdateMenuItemData,
} from "~/lib/menu-item-schemas";
import { uniqueSlug } from "~/lib/slug";

const utapi = new UTApi();

// Slugs used by the restaurant's other menu items.
async function takenItemSlugs(restaurantId: string, exceptId?: string) {
  const rows = await db
    .select({ id: menuItems.id, slug: menuItems.slug })
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId));
  return rows.filter((row) => row.id !== exceptId).map((row) => row.slug);
}

const getStringValue = (formData: FormData, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
};

// Helper to safely parse stringified arrays from FormData
const getJsonArrayValue = (formData: FormData, key: string): unknown => {
  const value = formData.get(key);
  if (typeof value === "string" && value.trim() !== "") {
    try {
      return JSON.parse(value) as unknown;
    } catch (e) {
      console.error(`Failed to parse JSON array for ${key}:`, e);
      return [];
    }
  }
  return [];
};

const getFileKey = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return url.split("/f/")[1] ?? null;
};

// Best effort: a failed file cleanup should not fail the database change.
const deleteUploadedFile = async (url: string | null | undefined) => {
  const fileKey = getFileKey(url);
  if (!fileKey) return;
  try {
    await utapi.deleteFiles(fileKey);
  } catch (error) {
    console.error("Failed to delete uploaded file:", fileKey, error);
  }
};

// Menus appear on public pages, the dashboard and the admin panel.
const revalidateMenuPages = () => revalidatePath("/[locale]", "layout");

export async function addMenuItem(formData: FormData): Promise<ActionResult> {
  return runAction("Couldn't add the menu item.", async () => {
    const restaurantId = getStringValue(formData, "restaurantId");
    if (!restaurantId) throw new ActionError("Missing restaurant.");
    await checkAuthorization(restaurantId);

    const result = await createMenuItemSchema.safeParseAsync({
      name: getStringValue(formData, "name"),
      description: getStringValue(formData, "description"),
      price: getStringValue(formData, "price"),
      ingredients: getStringValue(formData, "ingredients"),
      dietaryLabels: getJsonArrayValue(formData, "dietaryLabels"),
      imageUrl: getStringValue(formData, "imageUrl"),
      restaurantId,
      categoryId: getStringValue(formData, "categoryId") ?? "",
    });
    if (!result.success) {
      throw new ActionError(result.error.errors.map((e) => e.message).join(", "));
    }

    const validatedData: CreateMenuItemData = result.data;
    await db.insert(menuItems).values({
      ...validatedData,
      slug: uniqueSlug(validatedData.name, await takenItemSlugs(restaurantId), "item"),
    });

    revalidateMenuPages();
  });
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  return runAction("Couldn't save the menu item.", async () => {
    const restaurantId = getStringValue(formData, "restaurantId");
    if (!restaurantId) throw new ActionError("Missing restaurant.");
    await checkAuthorization(restaurantId);

    const result = await updateMenuItemSchema.safeParseAsync({
      id: getStringValue(formData, "id"),
      name: getStringValue(formData, "name"),
      description: getStringValue(formData, "description"),
      price: getStringValue(formData, "price"),
      ingredients: getStringValue(formData, "ingredients"),
      dietaryLabels: getJsonArrayValue(formData, "dietaryLabels"),
      imageUrl: getStringValue(formData, "imageUrl"),
      restaurantId,
      categoryId: getStringValue(formData, "categoryId") ?? "",
    });
    if (!result.success) {
      throw new ActionError(result.error.errors.map((e) => e.message).join(", "));
    }

    const validatedData: UpdateMenuItemData = result.data;

    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, validatedData.id), eq(menuItems.restaurantId, restaurantId)));
    if (!existingItem) throw new ActionError("Menu item not found.");

    // The slug is part of the public item URL, so only a rename changes it.
    const slug =
      existingItem.name === validatedData.name
        ? existingItem.slug
        : uniqueSlug(validatedData.name, await takenItemSlugs(restaurantId, existingItem.id), "item");

    await db
      .update(menuItems)
      .set({
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        ingredients: validatedData.ingredients,
        dietaryLabels: validatedData.dietaryLabels,
        imageUrl: validatedData.imageUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(menuItems.id, validatedData.id), eq(menuItems.restaurantId, restaurantId)));

    // Covers both a replaced photo and a removed one.
    if (existingItem.imageUrl && existingItem.imageUrl !== validatedData.imageUrl) {
      await deleteUploadedFile(existingItem.imageUrl);
    }

    revalidateMenuPages();
  });
}

export async function deleteMenuItem(
  menuItemId: string,
  restaurantId: string,
  // No longer needed (revalidation covers every page); kept for existing callers.
  _categoryId?: string,
): Promise<ActionResult> {
  return runAction("Couldn't delete the menu item.", async () => {
    if (!restaurantId) throw new ActionError("Missing restaurant.");
    await checkAuthorization(restaurantId);

    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, menuItemId), eq(menuItems.restaurantId, restaurantId)));
    if (!existingItem) throw new ActionError("Menu item not found.");

    await db
      .delete(menuItems)
      .where(and(eq(menuItems.id, menuItemId), eq(menuItems.restaurantId, restaurantId)));

    await deleteUploadedFile(existingItem.imageUrl);

    revalidateMenuPages();
  });
}

export async function updateMenuItemOrder(
  items: { id: string; order: number }[],
  restaurantId: string,
): Promise<ActionResult> {
  return runAction("Couldn't save the new order.", async () => {
    await checkAuthorization(restaurantId);

    await db.transaction(async (tx) => {
      await Promise.all(
        items.map((item) =>
          tx
            .update(menuItems)
            .set({ order: item.order })
            .where(and(eq(menuItems.id, item.id), eq(menuItems.restaurantId, restaurantId))),
        ),
      );
    });

    revalidateMenuPages();
  });
}
