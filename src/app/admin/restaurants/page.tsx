// app/admin/restaurants/page.tsx
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
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
import { eq } from "drizzle-orm";
import { z } from "zod";
import { redirect } from "next/navigation";
// NEW IMPORTS FOR DELETE CONFIRMATION
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
import { Trash2 } from "lucide-react"; // For the delete icon

// NEW IMPORT for Edit Dialog
import { EditRestaurantDialog } from "~/components/admin/EditRestaurantDialog";
import Link from "next/link";

// Zod schema for form validation (existing - for create)
const createRestaurantSchema = z.object({
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
});

// Zod schema for update validation (similar to create, but includes ID)
const updateRestaurantSchema = z.object({
  id: z.string().uuid(), // ID is required for update
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
});

// Server Action to add a new restaurant (existing)
async function addRestaurant(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  const validationResult = createRestaurantSchema.safeParse({ name, slug });

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error.errors);
    throw new Error("Invalid input for restaurant creation.");
  }

  try {
    const existingRestaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, validationResult.data.slug),
    });

    if (existingRestaurant) {
      throw new Error(
        "A restaurant with this slug already exists. Please choose a different one.",
      );
    }

    await db.insert(restaurants).values({
      name: validationResult.data.name,
      slug: validationResult.data.slug,
    });

    revalidatePath("/admin/restaurants");
  } catch (error) {
    console.error("Error adding restaurant:", error);
    throw new Error(
      `Failed to add restaurant: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Server Action to delete a restaurant (existing)
async function deleteRestaurant(restaurantId: string) {
  "use server";

  try {
    await db.delete(restaurants).where(eq(restaurants.id, restaurantId));
    revalidatePath("/admin/restaurants");
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw new Error("Failed to delete restaurant.");
  }
}

// NEW SERVER ACTION: Update a restaurant
async function updateRestaurant(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  // Validate the input using Zod
  const validationResult = updateRestaurantSchema.safeParse({ id, name, slug });

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error.errors);
    // Throw error to be caught by the client component's handleSubmit
    throw new Error(
      validationResult.error.errors.map((e) => e.message).join(", "),
    );
  }

  try {
    // Check for duplicate slug, excluding the current restaurant being updated
    const existingRestaurantWithSameSlug = await db.query.restaurants.findFirst(
      {
        where: (restaurant, { and, eq, ne }) =>
          and(
            eq(restaurant.slug, validationResult.data.slug),
            ne(restaurant.id, validationResult.data.id),
          ),
      },
    );

    if (existingRestaurantWithSameSlug) {
      throw new Error(
        "A restaurant with this slug already exists. Please choose a different one.",
      );
    }

    // Update the restaurant in the database
    await db
      .update(restaurants)
      .set({
        name: validationResult.data.name,
        slug: validationResult.data.slug,
        updatedAt: new Date(), // Manually update updatedAt timestamp
      })
      .where(eq(restaurants.id, validationResult.data.id));

    revalidatePath("/admin/restaurants"); // Revalidate to update the list
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw new Error(
      `Failed to update restaurant: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Main Admin Restaurants Page Component (Server Component)
export default async function AdminRestaurantsPage() {
  const allRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Restaurants</h1>

      {/* Add New Restaurant Card (existing) */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Restaurant</CardTitle>
          <CardDescription>
            Create a new restaurant entry in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addRestaurant} className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Pizza Palace"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                placeholder="e.g., pizza-palace (lowercase, hyphens only)"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be used in the URL: `/yourdomain.com/pizza-palace`
              </p>
            </div>
            <Button type="submit">Add Restaurant</Button>
          </form>
        </CardContent>
      </Card>

      {/* List of Existing Restaurants (updated for edit) */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Restaurants</CardTitle>
          <CardDescription>
            A list of all restaurants currently in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allRestaurants.length === 0 ? (
            <p className="text-gray-500">
              No restaurants added yet. Use the form above to add one!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRestaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">
                        {restaurant.name}
                      </TableCell>
                      <TableCell>{restaurant.slug}</TableCell>
                      <TableCell>
                        {new Date(restaurant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex items-center justify-end space-x-2 text-right">
                        <Link
                          href={`/admin/restaurants/${restaurant.id}/categories`}
                          passHref
                        >
                          <Button variant="secondary" size="sm">
                            Categories
                          </Button>
                        </Link>
                        {/* Edit Button with Dialog */}
                        <EditRestaurantDialog
                          restaurant={restaurant}
                          updateRestaurantAction={updateRestaurant}
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
                                <strong> {restaurant.name} </strong> restaurant
                                and all its associated categories and menu items
                                from your database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <form
                                  action={async () => {
                                    "use server";
                                    await deleteRestaurant(restaurant.id);
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
