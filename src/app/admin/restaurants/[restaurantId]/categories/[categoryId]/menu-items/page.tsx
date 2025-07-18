// src/app/admin/restaurants/[restaurantId]/categories/[categoryId]/menu-items/page.tsx
import { db } from "~/server/db";
import {
  menuItems,
  categories,
  restaurants,
  dietaryLabelEnum,
} from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { notFound } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { AddMenuItemForm } from "~/components/admin/AddMenuItemForm";
import Image from "next/image";
import { EditMenuItemDialog } from "~/components/admin/EditMenuItemDialog";
import type { DietaryLabel } from "~/types/restaurant";

const ALL_DIETARY_LABELS: DietaryLabel[] = dietaryLabelEnum.enumValues;

const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.string().min(1),
  ingredients: z.string().nullable().optional(),
  dietaryLabels: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return null;

      // Use a nested Zod schema to safely parse the JSON
      const dietaryLabelsArraySchema = z.array(
        z.enum(ALL_DIETARY_LABELS as [DietaryLabel, ...DietaryLabel[]]),
      );

      try {
        const parsed: unknown = JSON.parse(val);
        const result = dietaryLabelsArraySchema.safeParse(parsed);
        return result.success ? result.data : null;
      } catch {
        return null;
      }
    })
    .nullable()
    .optional(),
  imageUrl: z.string().url().nullable().optional(),
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

const updateMenuItemSchema = createMenuItemSchema.extend({
  id: z.string().uuid(),
});

async function addMenuItem(formData: FormData) {
  "use server";

  const getStringValue = (key: string): string | null => {
    const value = formData.get(key);
    return typeof value === "string" ? value : null;
  };

  const rawData = {
    name: getStringValue("name"),
    description: getStringValue("description"),
    price: getStringValue("price"),
    ingredients: getStringValue("ingredients"),
    dietaryLabels: getStringValue("dietaryLabels"),
    imageUrl: getStringValue("imageUrl"),
    restaurantId: getStringValue("restaurantId") ?? "",
    categoryId: getStringValue("categoryId") ?? "",
  };

  const result = createMenuItemSchema.safeParse(rawData);
  if (!result.success) {
    console.error("Validation failed (addMenuItem):", result.error.errors);
    throw new Error(result.error.errors.map((e) => e.message).join(", "));
  }

  // After this point, TypeScript knows result.data is of the type defined by createMenuItemSchema
  const validatedData = result.data;

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

async function updateMenuItem(formData: FormData) {
  "use server";

  const getStringValue = (key: string): string | null => {
    const value = formData.get(key);
    return typeof value === "string" ? value : null;
  };

  const rawData = {
    id: getStringValue("id"),
    name: getStringValue("name"),
    description: getStringValue("description"),
    price: getStringValue("price"),
    ingredients: getStringValue("ingredients"),
    dietaryLabels: getStringValue("dietaryLabels"),
    imageUrl: getStringValue("imageUrl"),
    restaurantId: getStringValue("restaurantId") ?? "",
    categoryId: getStringValue("categoryId") ?? "",
  };

  const result = updateMenuItemSchema.safeParse(rawData);
  if (!result.success) {
    console.error("Validation failed (updateMenuItem):", result.error.errors);
    throw new Error(result.error.errors.map((e) => e.message).join(", "));
  }

  try {
    await db
      .update(menuItems)
      .set({
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        ingredients: result.data.ingredients,
        dietaryLabels: result.data.dietaryLabels,
        imageUrl: result.data.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, result.data.id));

    revalidatePath(
      `/admin/restaurants/${result.data.restaurantId}/categories/${result.data.categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw new Error(
      `Failed to update menu item: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
async function deleteMenuItem(
  menuItemId: string,
  restaurantId: string,
  categoryId: string,
) {
  "use server";
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

export default async function AdminMenuItemsPage({
  params,
}: {
  params: Promise<{ restaurantId: string; categoryId: string }>;
}) {
  const { restaurantId, categoryId } = await params;

  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  const categoryDetails = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, categoryId),
      eq(categories.restaurantId, restaurantId),
    ),
  });

  if (!restaurantDetails || !categoryDetails) notFound();

  const allMenuItems = await db.query.menuItems.findMany({
    where: and(
      eq(menuItems.categoryId, categoryId),
      eq(menuItems.restaurantId, restaurantId),
    ),
    orderBy: (menuItems, { asc }) => [asc(menuItems.name)],
  });

  const fallbackImageUrl = `https://placehold.co/64x64/E0E0E0/333333?text=No+Img`;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Manage Menu Items for {categoryDetails.name}
      </h1>
      <p className="text-lg text-gray-600">
        Restaurant: {restaurantDetails.name} (ID: {restaurantId}) <br />
        Category: {categoryDetails.name} (ID: {categoryId})
      </p>

      <AddMenuItemForm
        restaurantId={restaurantId}
        categoryId={categoryId}
        categoryName={categoryDetails.name}
        addMenuItemAction={addMenuItem}
      />

      <Card>
        <CardHeader>
          <CardTitle>Existing Menu Items</CardTitle>
          <CardDescription>
            A list of all dishes in the &quot;{categoryDetails.name}&quot;
            category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allMenuItems.length === 0 ? (
            <p className="text-gray-500">
              No menu items added yet for this category. Use the form above to
              add one!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Dietary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allMenuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Image
                          src={item.imageUrl ?? fallbackImageUrl}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>
                        {item.dietaryLabels && item.dietaryLabels.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.dietaryLabels.map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800"
                              >
                                {label.charAt(0).toUpperCase() +
                                  label.slice(1).replace(/-/g, " ")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </TableCell>
                      <TableCell className="flex items-center justify-end space-x-2 text-right">
                        <EditMenuItemDialog
                          menuItem={item}
                          updateMenuItemAction={updateMenuItem}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the
                                <strong> {item.name} </strong> menu item from
                                your database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <form
                                  action={async () => {
                                    "use server";
                                    await deleteMenuItem(
                                      item.id,
                                      restaurantId,
                                      categoryId,
                                    );
                                  }}
                                >
                                  <Button variant="destructive" type="submit">
                                    Delete
                                  </Button>
                                </form>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
