// src/app/actions/menu-items.ts
"use server";

import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { checkAuthorization } from "~/app/actions/auth";
import { UTApi } from "uploadthing/server";

import {
  createMenuItemSchema,
  updateMenuItemSchema,
  type CreateMenuItemData,
  type UpdateMenuItemData,
} from "~/lib/menu-item-schemas";

const utapi = new UTApi();

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

export async function addMenuItem(formData: FormData) {
  const restaurantId = getStringValue(formData, "restaurantId")!;
  
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required.");
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  const rawData = {
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description"),
    price: getStringValue(formData, "price"),
    ingredients: getStringValue(formData, "ingredients"),
    dietaryLabels: getJsonArrayValue(formData, "dietaryLabels"),
    imageUrl: getStringValue(formData, "imageUrl"),
    restaurantId: restaurantId,
    categoryId: getStringValue(formData, "categoryId") ?? "",
  };

  const result = await createMenuItemSchema.safeParseAsync(rawData);
  if (!result.success) {
    throw new Error(result.error.errors.map((_e) => _e.message).join(", "));
  }

  const validatedData: CreateMenuItemData = result.data;

  try {
    await db.insert(menuItems).values({
      ...validatedData,
    });
    revalidatePath(`/dashboard/${restaurantId}/edit`);
    revalidatePath(
      `/admin/restaurants/${validatedData.restaurantId}/categories/${validatedData.categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Failed to add menu item.", error);
    throw new Error("Failed to add menu item.");
  }
}

export async function updateMenuItem(formData: FormData) {
  const restaurantId = getStringValue(formData, "restaurantId")!;
  
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required.");
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  const rawData = {
    id: getStringValue(formData, "id"),
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description"),
    price: getStringValue(formData, "price"),
    ingredients: getStringValue(formData, "ingredients"),
    dietaryLabels: getJsonArrayValue(formData, "dietaryLabels"),
    imageUrl: getStringValue(formData, "imageUrl"),
    restaurantId: restaurantId,
    categoryId: getStringValue(formData, "categoryId") ?? "",
  };

  const result = await updateMenuItemSchema.safeParseAsync(rawData);
  if (!result.success) {
    throw new Error(result.error.errors.map((_e) => _e.message).join(", "));
  }

  const validatedData: UpdateMenuItemData = result.data;

  try {
    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(
        and(
          eq(menuItems.id, validatedData.id),
          eq(menuItems.restaurantId, restaurantId)
        )
      );

    if (!existingItem) {
      throw new Error("Menu item not found.");
    }

    await db
      .update(menuItems)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        ingredients: validatedData.ingredients,
        dietaryLabels: validatedData.dietaryLabels,
        imageUrl: validatedData.imageUrl,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(menuItems.id, validatedData.id),
          eq(menuItems.restaurantId, restaurantId)
        )
      );

    if (
      existingItem.imageUrl &&
      validatedData.imageUrl &&
      existingItem.imageUrl !== validatedData.imageUrl
    ) {
      await deleteUploadedFile(existingItem.imageUrl);
    }

    revalidatePath(`/dashboard/${restaurantId}/edit`);
    revalidatePath(
      `/admin/restaurants/${validatedData.restaurantId}/categories/${validatedData.categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Failed to update menu item.", error);
    throw new Error("Failed to update menu item.");
  }
}

export async function deleteMenuItem(
  menuItemId: string,
  restaurantId: string,
  categoryId: string,
) {
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required.");
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }
  
  try {
    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(
        and(
          eq(menuItems.id, menuItemId),
          eq(menuItems.restaurantId, restaurantId)
        )
      );

    if (!existingItem) {
      throw new Error("Menu item not found.");
    }

    await db.delete(menuItems).where(
      and(
        eq(menuItems.id, menuItemId),
        eq(menuItems.restaurantId, restaurantId)
      )
    );

    await deleteUploadedFile(existingItem.imageUrl);

    revalidatePath(`/dashboard/${restaurantId}/edit`);
    revalidatePath(
      `/admin/restaurants/${restaurantId}/categories/${categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Failed to delete menu item.", error);
    throw new Error("Failed to delete menu item.");
  }
}

export async function updateMenuItemOrder(
  items: { id: string, order: number }[],
  restaurantId: string
) {
  try {
    await checkAuthorization(restaurantId);

    await db.transaction(async (tx) => {
      await Promise.all(
        items.map((item) =>
          tx
            .update(menuItems)
            .set({ order: item.order })
            .where(
              and(
                eq(menuItems.id, item.id),
                eq(menuItems.restaurantId, restaurantId)
              )
            )
        )
      );
    });

    revalidatePath(`/dashboard/${restaurantId}/edit`);
  } catch (error) {
    console.error("Failed to update menu item order.", error);
    throw new Error("Failed to update menu item order.");
  }
}