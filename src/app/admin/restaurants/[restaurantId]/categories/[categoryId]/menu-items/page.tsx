// app/admin/restaurants/[restaurantId]/categories/[categoryId]/menu-items/page.tsx
import { db } from "~/server/db";
import { menuItems, categories, restaurants } from "~/server/db/schema";
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
import { Trash2, Pencil } from "lucide-react";
// Removed direct import of 'next/image'

// Import the AddMenuItemForm Client Component
import { AddMenuItemForm } from "~/components/admin/AddMenuItemForm";
// NEW IMPORT: ResponsiveImage Client Component
import { ResponsiveImage } from "~/components/shared/ResponsiveImage";

import { z } from "zod";

// Define the props type for this page (remains the same)
interface PageProps {
  params: {
    restaurantId: string;
    categoryId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Zod schema for adding a menu item (remains here for server-side validation)
const createMenuItemSchema = z.object({
  name: z.string().min(1, { message: "Menu item name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "Price must be a positive number." }),
  ),
  ingredients: z.string().min(1, { message: "Ingredients are required." }),
  isVegetarian: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  isGlutenFree: z
    .string()
    .optional()
    .transform((val) => val === "on"),
  imageUrl: z
    .string()
    .url({ message: "Image URL is required and must be a valid URL." }),
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

// Server Action to add a new menu item (remains here)
async function addMenuItem(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const ingredients = formData.get("ingredients") as string;
  const isVegetarian = formData.get("isVegetarian");
  const isGlutenFree = formData.get("isGlutenFree");
  const imageUrl = formData.get("imageUrl") as string;
  const restaurantId = formData.get("restaurantId") as string;
  const categoryId = formData.get("categoryId") as string;

  const validationResult = createMenuItemSchema.safeParse({
    name,
    description,
    price,
    ingredients,
    isVegetarian,
    isGlutenFree,
    imageUrl,
    restaurantId,
    categoryId,
  });

  if (!validationResult.success) {
    console.error(
      "Server-side validation failed:",
      validationResult.error.errors,
    );
    throw new Error(
      "Server-side validation failed: " +
        validationResult.error.errors.map((e) => e.message).join(", "),
    );
  }

  try {
    await db.insert(menuItems).values({
      name: validationResult.data.name,
      description: validationResult.data.description,
      price: validationResult.data.price,
      ingredients: validationResult.data.ingredients,
      isVegetarian: validationResult.data.isVegetarian,
      isGlutenFree: validationResult.data.isGlutenFree,
      imageUrl: validationResult.data.imageUrl,
      restaurantId: validationResult.data.restaurantId,
      categoryId: validationResult.data.categoryId,
    });

    revalidatePath(
      `/admin/restaurants/${restaurantId}/categories/${categoryId}/menu-items`,
    );
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw new Error(
      `Failed to add menu item: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Server Action to delete a menu item (existing)
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

// Main Menu Items Page Component (Server Component)
export default async function AdminMenuItemsPage({ params }: PageProps) {
  const { restaurantId, categoryId } = params;

  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  const categoryDetails = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, categoryId),
      eq(categories.restaurantId, restaurantId),
    ),
  });

  if (!restaurantDetails || !categoryDetails) {
    notFound();
  }

  const allMenuItems = await db.query.menuItems.findMany({
    where: and(
      eq(menuItems.categoryId, categoryId),
      eq(menuItems.restaurantId, restaurantId),
    ),
    orderBy: (menuItems, { asc }) => [asc(menuItems.name)],
  });

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

      {/* List of Existing Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Menu Items</CardTitle>
          <CardDescription>
            A list of all dishes in the "{categoryDetails.name}" category.
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
                        {/* USE THE NEW CLIENT COMPONENT HERE */}
                        <ResponsiveImage
                          src={item.imageUrl}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {item.isVegetarian && (
                          <span className="mr-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Veg
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            GF
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="flex items-center justify-end space-x-2 text-right">
                        {/* Placeholder for Edit button (will be EditMenuItemDialog) */}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>

                        {/* Delete Button with Confirmation Dialog */}
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
