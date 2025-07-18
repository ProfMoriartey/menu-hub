// src/app/actions/category.ts
"use server";

import { db } from "~/server/db";
import { categories } from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// Import schemas from the shared schemas file (now without async exports)
import { createCategorySchema, updateCategorySchema } from "~/lib/schemas"; // CORRECT IMPORT PATH

// Server Action to add a new category
export async function addCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string;

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
  const restaurantId = formData.get("restaurantId") as string; // Needed for revalidation

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
      .where(eq(categories.id, validationResult.data.id));

    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error(
      `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Server Action to delete a category
export async function deleteCategory(categoryId: string, restaurantId: string) {
  try {
    await db.delete(categories).where(eq(categories.id, categoryId));
    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category.");
  }
}