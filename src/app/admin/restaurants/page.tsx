import { db } from "~/server/db"; // Assuming your Drizzle client is exported from '@/db/index.ts' or similar
import { restaurants } from "~/server/db/schema"; // Import your restaurants schema
import { Button } from "~/components/ui/button"; // Shadcn UI Button
import { Input } from "~/components/ui/input"; // Shadcn UI Input
import { Label } from "~/components/ui/label"; // Shadcn UI Label
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"; // Shadcn UI Card
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"; // Shadcn UI Table
import { revalidatePath } from "next/cache"; // For revalidating data after mutation
import { eq } from "drizzle-orm"; // Drizzle ORM utility for equality checks
import { z } from "zod"; // For form validation
import { redirect } from "next/navigation"; // For redirecting after successful creation

// Zod schema for form validation
const createRestaurantSchema = z.object({
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
});

// Server Action to add a new restaurant
// This function runs on the server and interacts with the database.
async function addRestaurant(formData: FormData) {
  "use server"; // Mark this function as a Server Action

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  // Validate the input using Zod
  const validationResult = createRestaurantSchema.safeParse({ name, slug });

  if (!validationResult.success) {
    // In a real application, you'd handle these errors more gracefully,
    // perhaps by returning them to the client component to display.
    console.error("Validation failed:", validationResult.error.errors);
    // For now, we'll just throw an error or redirect back.
    // A more robust solution would involve using a state management library or
    // passing errors back via a different mechanism (e.g., useFormState hook).
    throw new Error("Invalid input for restaurant creation.");
  }

  try {
    // Check if slug already exists
    const existingRestaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, validationResult.data.slug),
    });

    if (existingRestaurant) {
      throw new Error(
        "A restaurant with this slug already exists. Please choose a different one.",
      );
    }

    // Insert the new restaurant into the database
    await db.insert(restaurants).values({
      name: validationResult.data.name,
      slug: validationResult.data.slug,
    });

    // Revalidate the path to show the newly added restaurant immediately
    revalidatePath("/admin/restaurants");
    // Optionally redirect after successful creation
    // redirect('/admin/restaurants'); // Uncomment if you want to redirect to a clean state
  } catch (error) {
    console.error("Error adding restaurant:", error);
    // Again, in a production app, you'd return a user-friendly error message.
    throw new Error(
      `Failed to add restaurant: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Main Admin Restaurants Page Component (Server Component)
export default async function AdminRestaurantsPage() {
  // Fetch all restaurants from the database
  // This runs on the server.
  const allRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)], // Order by name
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Restaurants</h1>

      {/* Add New Restaurant Card */}
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

      {/* List of Existing Restaurants */}
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
                      <TableCell className="text-right">
                        {/* Placeholder for Edit and Delete buttons */}
                        <Button variant="outline" size="sm" className="mr-2">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
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
