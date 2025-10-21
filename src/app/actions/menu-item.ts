// src/app/actions/menu-item.ts
"use server";

import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { checkAuthorization } from "~/app/actions/auth";

// Import schemas and types from the new menu-item-schemas file
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  type CreateMenuItemData,
  type UpdateMenuItemData,
} from "~/lib/menu-item-schemas";

// Helper to safely get string values from FormData
const getStringValue = (formData: FormData, key: string): string | null => {
  const value = formData.get(key);
  return typeof value === "string" ? value : null;
};

// ----------------------------------------------------------------------
// 1. ADD MENU ITEM
// ----------------------------------------------------------------------
export async function addMenuItem(formData: FormData) {
  // 🛑 FIX: Use the correct field name 'restaurantId' from the form
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
    dietaryLabels: getStringValue(formData, "dietaryLabels"),
    imageUrl: getStringValue(formData, "imageUrl"),
    // 🛑 Ensure rawData uses the local variable for consistency
    restaurantId: restaurantId, 
    categoryId: getStringValue(formData, "categoryId") ?? "",
  };

  const result = await createMenuItemSchema.safeParseAsync(rawData);
  if (!result.success) {
    console.error("Validation failed (addMenuItem):", result.error.errors);
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
    console.error("Error adding menu item:", error);
    throw new Error(
      `Failed to add menu item: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ----------------------------------------------------------------------
// 2. UPDATE MENU ITEM
// ----------------------------------------------------------------------
export async function updateMenuItem(formData: FormData) {
  // 🛑 FIX: Use the correct field name 'restaurantId' from the form
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
    dietaryLabels: getStringValue(formData, "dietaryLabels"),
    imageUrl: getStringValue(formData, "imageUrl"),
    // 🛑 FIX: Use the local 'restaurantId' variable
    restaurantId: restaurantId, 
    categoryId: getStringValue(formData, "categoryId") ?? "",
  };

  const result = await updateMenuItemSchema.safeParseAsync(rawData);
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
      // Corrected WHERE clause with integrity check
      .where(and(
            eq(menuItems.id, validatedData.id),
            eq(menuItems.restaurantId, restaurantId)))


    revalidatePath(`/dashboard/${restaurantId}/edit`);
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

// ----------------------------------------------------------------------
// 3. DELETE MENU ITEM
// ----------------------------------------------------------------------
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
    await db.delete(menuItems).where(and(
            eq(menuItems.id, menuItemId),
            eq(menuItems.restaurantId, restaurantId)
        ));
    revalidatePath(`/dashboard/${restaurantId}/edit`);
    revalidatePath(
      `/admin/restaurants/${restaurantId}/categories/${categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw new Error("Failed to delete menu item.");
  }
}