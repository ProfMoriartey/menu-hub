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

const getFileKey = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return url.split("/f/")[1] ?? null;
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
    dietaryLabels: getStringValue(formData, "dietaryLabels"),
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
    dietaryLabels: getStringValue(formData, "dietaryLabels"),
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
      .where(eq(menuItems.id, validatedData.id));

    if (
      existingItem?.imageUrl &&
      validatedData.imageUrl &&
      existingItem.imageUrl !== validatedData.imageUrl
    ) {
      const fileKey = getFileKey(existingItem.imageUrl);
      if (fileKey) {
        await utapi.deleteFiles(fileKey);
      }
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

    revalidatePath(`/dashboard/${restaurantId}/edit`);
    revalidatePath(
      `/admin/restaurants/${validatedData.restaurantId}/categories/${validatedData.categoryId}/menu-items`,
    );
  } catch (error) {
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
      .where(eq(menuItems.id, menuItemId));

    if (existingItem?.imageUrl) {
      const fileKey = getFileKey(existingItem.imageUrl);
      if (fileKey) {
        await utapi.deleteFiles(fileKey);
      }
    }

    await db.delete(menuItems).where(
      and(
        eq(menuItems.id, menuItemId),
        eq(menuItems.restaurantId, restaurantId)
      )
    );
    
    revalidatePath(`/dashboard/${restaurantId}/edit`);
    revalidatePath(
      `/admin/restaurants/${restaurantId}/categories/${categoryId}/menu-items`,
    );
  } catch (error) {
    throw new Error("Failed to delete menu item.");
  }
}

export async function updateMenuItemOrder(
  items: { id: string, order: number }[],
  restaurantId: string
) {
  try {
    await checkAuthorization(restaurantId);
    
    await Promise.all(
      items.map((item) =>
        db
          .update(menuItems)
          .set({ order: item.order })
          .where(eq(menuItems.id, item.id))
      )
    );

    revalidatePath(`/dashboard/${restaurantId}/edit`);
  } catch (error) {
    throw new Error("Failed to update menu item order.");
  }
}