// src/app/actions/category.ts
"use server";

import { db } from "~/server/db";
import { categories } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
// Removed unused 'sql' import
import { and, eq } from "drizzle-orm"; 
import { checkAuthorization } from "~/app/actions/auth";

import { createCategorySchema, updateCategorySchema } from "~/lib/schemas";

export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string;

  try {
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  const validationResult = createCategorySchema.safeParse({
    name,
    restaurantId,
  });

  if (!validationResult.success) {
    console.error("Validation failed (addCategory):", validationResult.error.errors);
    throw new Error("Invalid input for category creation.");
  }

  try {
    await db.insert(categories).values({
      name: validationResult.data.name,
      restaurantId: validationResult.data.restaurantId,
    });

    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
    revalidatePath(`/dashboard/${restaurantId}/edit`); 
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error(
      `Failed to add category: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string;

  try {
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  const validationResult = updateCategorySchema.safeParse({
    id,
    name,
    restaurantId,
  });

  if (!validationResult.success) {
    console.error("Validation failed (updateCategory):", validationResult.error.errors);
    throw new Error(
      validationResult.error.errors.map((_e) => _e.message).join(", "),
    );
  }

  try {
    await db
      .update(categories)
      .set({
        name: validationResult.data.name,
        updatedAt: new Date(),
      })
      // 🛑 FIX: Enforced the data integrity check
      .where(
        and(
          eq(categories.id, validationResult.data.id),
          eq(categories.restaurantId, validationResult.data.restaurantId)
        )
      );

    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
    revalidatePath(`/dashboard/${restaurantId}/edit`);
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error(
      `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function deleteCategory(categoryId: string, restaurantId: string) {
  try {
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  try {
    await db.delete(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.restaurantId, restaurantId)
        )
      );
      
    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
    revalidatePath(`/dashboard/${restaurantId}/edit`);
    
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category.");
  }
}

export async function reorderCategories(formData: FormData) {
  const restaurantId = formData.get("restaurantId") as string;
  const orderedIdsJson = formData.get("orderedIds") as string;
  
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required.");
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }
  
  let orderedIds: unknown; 

  try {
    orderedIds = JSON.parse(orderedIdsJson); 
  } catch (e) {
    throw new Error("Invalid format for ordered IDs payload.");
  }
  
  if (!Array.isArray(orderedIds) || orderedIds.some(id => typeof id !== 'string')) {
    throw new Error("Invalid format for ordered IDs array. Expected string[].");
  }

  const finalOrderedIds: string[] = orderedIds as string[];

  // 🛑 FIX: Build and execute queries inside the transaction
  try {
    await db.transaction(async (tx) => {
      await Promise.all(
        finalOrderedIds.map((id, index) =>
          tx
            .update(categories)
            .set({ order: index })
            .where(
              and(
                eq(categories.id, id),
                eq(categories.restaurantId, restaurantId)
              )
            )
        )
      );
    });

    revalidatePath(`/dashboard/${restaurantId}/edit`);
    
  } catch (error) {
    console.error("Error reordering categories:", error);
    throw new Error("Failed to reorder categories due to a database error.");
  }
}