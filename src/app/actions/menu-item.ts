// src/app/actions/menu-items.ts
"use server";

import { db } from "~/server/db";
import { categories, menuItems } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { checkAuthorization } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { runAction } from "~/server/run-action";

import {
  createMenuItemSchema,
  updateMenuItemSchema,
  type CreateMenuItemData,
  type UpdateMenuItemData,
} from "~/lib/menu-item-schemas";
import { uniqueSlug } from "~/lib/slug";
import { deleteUploadedFiles } from "~/server/uploads";

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

// A request can name any category id, so check it is one of this
// restaurant's before filing an item under it.
async function requireCategoryOf(restaurantId: string, categoryId: string) {
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.restaurantId, restaurantId)),
    columns: { id: true },
  });
  if (!category) throw new ActionError("invalidCategory");
}

// Items added or moved into a category go to its end.
async function nextItemOrder(categoryId: string) {
  const [row] = await db
    .select({ max: sql<number | null>`max(${menuItems.order})` })
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId));
  return (row?.max ?? -1) + 1;
}

// Menus appear on public pages, the dashboard and the admin panel.
const revalidateMenuPages = () => revalidatePath("/[locale]", "layout");

export async function addMenuItem(formData: FormData): Promise<ActionResult> {
  return runAction("addItemFailed", async () => {
    const restaurantId = getStringValue(formData, "restaurantId");
    if (!restaurantId) throw new ActionError("missingRestaurant");
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
      throw new ActionError("invalidItem");
    }

    const validatedData: CreateMenuItemData = result.data;
    await requireCategoryOf(restaurantId, validatedData.categoryId);

    await db.insert(menuItems).values({
      ...validatedData,
      slug: uniqueSlug(validatedData.name, await takenItemSlugs(restaurantId), "item"),
      order: await nextItemOrder(validatedData.categoryId),
    });

    revalidateMenuPages();
  });
}

export async function updateMenuItem(formData: FormData): Promise<ActionResult> {
  return runAction("saveItemFailed", async () => {
    const restaurantId = getStringValue(formData, "restaurantId");
    if (!restaurantId) throw new ActionError("missingRestaurant");
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
      throw new ActionError("invalidItem");
    }

    const validatedData: UpdateMenuItemData = result.data;

    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, validatedData.id), eq(menuItems.restaurantId, restaurantId)));
    if (!existingItem) throw new ActionError("itemNotFound");

    // Moving to another category: it must be this restaurant's, and the
    // item goes to the end of it.
    const moved = validatedData.categoryId !== existingItem.categoryId;
    if (moved) await requireCategoryOf(restaurantId, validatedData.categoryId);

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
        ...(moved && {
          categoryId: validatedData.categoryId,
          order: await nextItemOrder(validatedData.categoryId),
        }),
        updatedAt: new Date(),
      })
      .where(and(eq(menuItems.id, validatedData.id), eq(menuItems.restaurantId, restaurantId)));

    // Covers both a replaced photo and a removed one.
    if (existingItem.imageUrl && existingItem.imageUrl !== validatedData.imageUrl) {
      await deleteUploadedFiles([existingItem.imageUrl]);
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
  return runAction("deleteItemFailed", async () => {
    if (!restaurantId) throw new ActionError("missingRestaurant");
    await checkAuthorization(restaurantId);

    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, menuItemId), eq(menuItems.restaurantId, restaurantId)));
    if (!existingItem) throw new ActionError("itemNotFound");

    await db
      .delete(menuItems)
      .where(and(eq(menuItems.id, menuItemId), eq(menuItems.restaurantId, restaurantId)));

    await deleteUploadedFiles([existingItem.imageUrl]);

    revalidateMenuPages();
  });
}

export async function updateMenuItemOrder(
  items: { id: string; order: number }[],
  restaurantId: string,
): Promise<ActionResult> {
  return runAction("reorderFailed", async () => {
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
