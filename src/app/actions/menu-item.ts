// src/app/actions/menu-item.ts
"use server";

import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// Import schemas and types from the new menu-item-schemas file
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  type CreateMenuItemData,
  type UpdateMenuItemData,
} from "~/lib/menu-item-schemas"; // CHANGED IMPORT PATH

// Helper to safely get string values from FormData
const getStringValue = (formData: FormData, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
};

// ... (rest of addMenuItem, updateMenuItem, deleteMenuItem functions remain the same)
// Ensure safeParseAsync is used where schema has async transform.
// The code provided earlier for these functions already uses safeParseAsync, so no changes needed there.

export async function addMenuItem(formData: FormData) {
  // ... (existing code for addMenuItem)
  const rawData = {
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description"),
    price: getStringValue(formData, "price"),
    ingredients: getStringValue(formData, "ingredients"),
    dietaryLabels: getStringValue(formData, "dietaryLabels"),
    imageUrl: getStringValue(formData, "imageUrl"),
    restaurantId: getStringValue(formData, "restaurantId") ?? "",
    categoryId: getStringValue(formData, "categoryId") ?? "",
  };

  const result = await createMenuItemSchema.safeParseAsync(rawData); // Keep safeParseAsync
  if (!result.success) {
    console.error("Validation failed (addMenuItem):", result.error.errors);
    throw new Error(result.error.errors.map((_e) => _e.message).join(", "));
  }

  const validatedData: CreateMenuItemData = result.data;

  try {
    await db.insert(menuItems).values({
      ...validatedData,
    });
    revalidatePath(
      `/admin/restaurants/${validatedData.restaurantId}/categories/${validatedData.categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw new Error(
      `Failed to add menu item: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function updateMenuItem(formData: FormData) {
  // ... (existing code for updateMenuItem)
  const rawData = {
    id: getStringValue(formData, "id"),
    name: getStringValue(formData, "name"),
    description: getStringValue(formData, "description"),
    price: getStringValue(formData, "price"),
    ingredients: getStringValue(formData, "ingredients"),
    dietaryLabels: getStringValue(formData, "dietaryLabels"),
    imageUrl: getStringValue(formData, "imageUrl"),
    restaurantId: getStringValue(formData, "restaurantId") ?? "",
    categoryId: getStringValue(formData, "categoryId") ?? "",
  };

  const result = await updateMenuItemSchema.safeParseAsync(rawData); // Keep safeParseAsync
  if (!result.success) {
    console.error("Validation failed (updateMenuItem):", result.error.errors);
    throw new Error(result.error.errors.map((_e) => _e.message).join(", "));
  }

  const validatedData: UpdateMenuItemData = result.data;

  try {
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
      .where(eq(menuItems.id, validatedData.id));

    revalidatePath(
      `/admin/restaurants/${validatedData.restaurantId}/categories/${validatedData.categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw new Error(
      `Failed to update menu item: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function deleteMenuItem(
  menuItemId: string,
  restaurantId: string,
  categoryId: string,
) {
  // ... (existing code for deleteMenuItem)
  try {
    await db.delete(menuItems).where(eq(menuItems.id, menuItemId));
    revalidatePath(
      `/admin/restaurants/${restaurantId}/categories/${categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw new Error("Failed to delete menu item.");
  }
}