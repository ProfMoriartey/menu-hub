// src/app/actions/category.ts
"use server";

import { db } from "~/server/db";
import { categories, menuItems } from "~/server/db/schema";
import { deleteUploadedFiles } from "~/server/uploads";
import { revalidatePublicMenu } from "~/server/public-menu";
import { and, eq } from "drizzle-orm";
import { checkAuthorization } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { runAction } from "~/server/run-action";

import { createCategorySchema, updateCategorySchema } from "~/lib/schemas";
import { uniqueSlug } from "~/lib/slug";

// Slugs used by the restaurant's other categories.
async function takenCategorySlugs(restaurantId: string, exceptId?: string) {
  const rows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(eq(categories.restaurantId, restaurantId));
  return rows.filter((row) => row.id !== exceptId).map((row) => row.slug);
}

export async function addCategory(formData: FormData): Promise<ActionResult> {
  return runAction("addCategoryFailed", async () => {
    const restaurantId = formData.get("restaurantId") as string;
    await checkAuthorization(restaurantId);

    const validationResult = createCategorySchema.safeParse({
      name: formData.get("name"),
      restaurantId,
    });
    if (!validationResult.success) {
      throw new ActionError("categoryNameRequired");
    }

    const { name } = validationResult.data;
    await db.insert(categories).values({
      name,
      slug: uniqueSlug(name, await takenCategorySlugs(restaurantId), "category"),
      restaurantId,
    });

    revalidatePublicMenu(restaurantId);
  });
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  return runAction("renameCategoryFailed", async () => {
    const restaurantId = formData.get("restaurantId") as string;
    await checkAuthorization(restaurantId);

    const validationResult = updateCategorySchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      restaurantId,
    });
    if (!validationResult.success) {
      throw new ActionError("categoryNameRequired");
    }

    const { id: categoryId, name: newName } = validationResult.data;
    const existing = await db.query.categories.findFirst({
      where: and(eq(categories.id, categoryId), eq(categories.restaurantId, restaurantId)),
      columns: { name: true, slug: true },
    });
    if (!existing) throw new ActionError("categoryNotFound");

    // The slug follows the name, so only a rename changes it.
    const slug =
      existing.name === newName
        ? existing.slug
        : uniqueSlug(newName, await takenCategorySlugs(restaurantId, categoryId), "category");

    await db
      .update(categories)
      .set({ name: newName, slug, updatedAt: new Date() })
      .where(and(eq(categories.id, categoryId), eq(categories.restaurantId, restaurantId)));

    revalidatePublicMenu(restaurantId);
  });
}

export async function deleteCategory(categoryId: string, restaurantId: string): Promise<ActionResult> {
  return runAction("deleteCategoryFailed", async () => {
    await checkAuthorization(restaurantId);

    // The delete cascades to the category's items; keep their photo URLs first.
    const items = await db.query.menuItems.findMany({
      where: and(eq(menuItems.categoryId, categoryId), eq(menuItems.restaurantId, restaurantId)),
      columns: { imageUrl: true },
    });

    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.restaurantId, restaurantId)));
    await deleteUploadedFiles(items.map((item) => item.imageUrl));

    revalidatePublicMenu(restaurantId);
  });
}

export async function reorderCategories(formData: FormData): Promise<ActionResult> {
  return runAction("reorderFailed", async () => {
    const restaurantId = formData.get("restaurantId") as string;
    if (!restaurantId) throw new ActionError("missingRestaurant");
    await checkAuthorization(restaurantId);

    let orderedIds: unknown;
    try {
      orderedIds = JSON.parse(formData.get("orderedIds") as string);
    } catch {
      throw new ActionError("invalidOrder");
    }
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
      throw new ActionError("invalidOrder");
    }

    await db.transaction(async (tx) => {
      await Promise.all(
        (orderedIds as string[]).map((id, index) =>
          tx
            .update(categories)
            .set({ order: index })
            .where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId))),
        ),
      );
    });

    revalidatePublicMenu(restaurantId);
  });
}
