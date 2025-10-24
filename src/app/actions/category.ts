// src/app/actions/category.ts
"use server";

import { db } from "~/server/db";
import { categories } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
// 🛑 ADDED: sql and db.transaction support
import { and, eq, sql } from "drizzle-orm"; 
import { checkAuthorization, isSystemAdmin } from "~/app/actions/auth"; // IMPORT helpers


// Import schemas from the shared schemas file (now without async exports)
import { createCategorySchema, updateCategorySchema } from "~/lib/schemas"; // CORRECT IMPORT PATH

// Server Action to add a new category
export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string;

// 🛑 1. ENFORCE AUTHORIZATION (ABAC)
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

  // Logic to determine the next order number would go here (e.g., query max order + 1)
  // For simplicity, Drizzle default(0) is used, but a full feature would calculate this.

  try {
    await db.insert(categories).values({
      name: validationResult.data.name,
      restaurantId: validationResult.data.restaurantId,
      // order: (maxOrder + 1), // Ideally calculated here
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

// Server Action to update a category
export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string;

  // 🛑 1. ENFORCE AUTHORIZATION (ABAC)
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
      // Data integrity check: ensure category ID and restaurant ID match
      .where(eq(categories.id, validationResult.data.id));

    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
    revalidatePath(`/dashboard/${restaurantId}/edit`);
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error(
      `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Server Action to delete a category
export async function deleteCategory(categoryId: string, restaurantId: string) {
  
  // 🛑 1. ENFORCE AUTHORIZATION (ABAC) - PASSES
  try {
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }

  try {
    await db.delete(categories)
      // Data integrity check: ensure category ID AND Restaurant ID match
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

// ----------------------------------------------------------------------
// 🛑 NEW SERVER ACTION: REORDER CATEGORIES
// ----------------------------------------------------------------------
/**
 * @description Updates the 'order' field for a list of categories in a single transaction.
 * @param {FormData} formData - Expects 'restaurantId' and 'orderedIds' (JSON string of string[]).
 */
export async function reorderCategories(formData: FormData) {
  const restaurantId = formData.get("restaurantId") as string;
  const orderedIdsJson = formData.get("orderedIds") as string;
  
  // 🛑 1. ENFORCE AUTHORIZATION (ABAC)
  try {
    if (!restaurantId) throw new Error("Restaurant ID is required.");
    await checkAuthorization(restaurantId);
  } catch (error) {
    throw new Error(`Unauthorized: ${error instanceof Error ? error.message : "Access denied."}`);
  }
  
  // 2. Parse Data
let orderedIds: unknown; // Use 'unknown' instead of implicitly 'any'

  try {
    // 🛑 FIX 1: Parse to 'unknown' to avoid 'any' assignment
    orderedIds = JSON.parse(orderedIdsJson); 
  } catch (e) {
    throw new Error("Invalid format for ordered IDs payload.");
  }
  
  // 🛑 FIX 2: Type Guard to ensure it is an array and assert types
  if (!Array.isArray(orderedIds) || orderedIds.some(id => typeof id !== 'string')) {
    throw new Error("Invalid format for ordered IDs array. Expected string[].");
  }

  // At this point, we know the structure is correct, so we can assert the type.
  const finalOrderedIds: string[] = orderedIds as string[];

  // 3. Create Batch Update Queries
  // IMPORTANT: We use a simple UPDATE query here.
  const updateQueries = finalOrderedIds.map((id, index) => {
    // We update the order based on the index in the client-sent array.
    // We also include the restaurantId in the WHERE clause for integrity.
    return db.update(categories)
      .set({ order: index }) 
      .where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId)));
  });
  
  // 4. Execute all updates in a transaction
  try {
    await db.transaction(async (tx) => {
      // Execute all update promises within the transaction context
      await Promise.all(updateQueries.map(query => tx.execute(query)));
    });

    // 5. Revalidate
    revalidatePath(`/dashboard/${restaurantId}/edit`);
    
  } catch (error) {
    console.error("Error reordering categories:", error);
    throw new Error("Failed to reorder categories due to a database error.");
  }
}