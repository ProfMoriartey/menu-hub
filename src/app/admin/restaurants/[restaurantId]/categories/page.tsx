// app/admin/restaurants/[restaurantId]/categories/page.tsx
import { db } from "~/server/db";
import { categories, restaurants } from "~/server/db/schema"; // Import both schemas
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { eq, and } from "drizzle-orm"; // Import 'and' for combined conditions
import { z } from "zod";
import { notFound } from "next/navigation"; // To handle non-existent restaurantId
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
import { Trash2, Pencil } from "lucide-react"; // Icons

// NEW: Edit Category Dialog Component (will be created next)
import { EditCategoryDialog } from "~/components/admin/EditCategoryDialog";

// Zod schema for adding a category
const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  restaurantId: z.string().uuid(), // Ensure restaurantId is a valid UUID
});

// Zod schema for updating a category
const updateCategorySchema = z.object({
  id: z.string().uuid(), // Category ID
  name: z.string().min(1, { message: "Category name is required." }),
  restaurantId: z.string().uuid(), // Restaurant ID
});

// Server Action to add a new category
async function addCategory(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string;

  const validationResult = createCategorySchema.safeParse({
    name,
    restaurantId,
  });

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error.errors);
    throw new Error("Invalid input for category creation.");
  }

  try {
    await db.insert(categories).values({
      name: validationResult.data.name,
      restaurantId: validationResult.data.restaurantId,
    });

    // Revalidate the specific path for this restaurant's categories
    revalidatePath(`/admin/restaurants/${restaurantId}/categories`);
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error(
      `Failed to add category: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Server Action to update a category
async function updateCategory(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const restaurantId = formData.get("restaurantId") as string; // Needed for revalidation

  const validationResult = updateCategorySchema.safeParse({
    id,
    name,
    restaurantId,
  });

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error.errors);
    throw new Error(
      validationResult.error.errors.map((e) => e.message).join(", "),
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

    revalidatePath(`/admin/restaurants/${restaurantId}/categories`); // Revalidate
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error(
      `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Server Action to delete a category
async function deleteCategory(categoryId: string, restaurantId: string) {
  "use server";

  try {
    await db.delete(categories).where(eq(categories.id, categoryId));
    revalidatePath(`/admin/restaurants/${restaurantId}/categories`); // Revalidate
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category.");
  }
}

// Main Categories Page Component (Server Component)
export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  // Fetch the restaurant details to display its name
  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurantDetails) {
    notFound(); // If restaurant doesn't exist, show 404 page
  }

  // Fetch categories for this specific restaurant
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantId),
    orderBy: (categories, { asc }) => [asc(categories.order)], // Order by the 'order' column
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Manage Categories for {restaurantDetails.name}
      </h1>
      <p className="text-lg text-gray-600">Restaurant ID: {restaurantId}</p>{" "}
      {/* For debugging/info */}
      {/* Add New Category Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>
            Create a new menu category for {restaurantDetails.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addCategory} className="space-y-4">
            {/* Hidden input for restaurantId */}
            <input type="hidden" name="restaurantId" value={restaurantId} />
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Appetizers"
                required
              />
            </div>
            {/* No 'order' input for now, it's serial. If you want manual order, you'd add an input here. */}
            <Button type="submit">Add Category</Button>
          </form>
        </CardContent>
      </Card>
      {/* List of Existing Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            A list of all categories for {restaurantDetails.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allCategories.length === 0 ? (
            <p className="text-gray-500">
              No categories added yet for this restaurant. Use the form above to
              add one!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.order}</TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex items-center justify-end space-x-2 text-right">
                        {/* Edit Button with Dialog */}
                        <EditCategoryDialog
                          category={category}
                          restaurantId={restaurantId}
                          updateCategoryAction={updateCategory}
                        />

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
                                <strong> {category.name} </strong> category and
                                all its associated menu items from your
                                database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <form
                                  action={async () => {
                                    "use server";
                                    await deleteCategory(
                                      category.id,
                                      restaurantId,
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
