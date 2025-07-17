// app/admin/restaurants/page.tsx
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod"; // Keep Zod for server-side validation in Server Actions

// NEW IMPORT: RestaurantManagementClient
import { RestaurantManagementClient } from "~/components/admin/RestaurantManagementClient";

// Zod schema for form validation (for add and update, used by Server Actions)
const restaurantSchema = z.object({
  id: z.string().uuid().optional(), // Optional for create, required for update
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
});

// Server Action to add a new restaurant
async function addRestaurant(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  const validationResult = restaurantSchema.safeParse({ name, slug });

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error.errors);
    throw new Error(
      "Invalid input for restaurant creation: " +
        validationResult.error.errors.map((e) => e.message).join(", "),
    );
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

// Server Action to delete a restaurant
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

// Server Action to update a restaurant
async function updateRestaurant(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  const validationResult = restaurantSchema.safeParse({ id, name, slug });

  if (!validationResult.success) {
    console.error("Validation failed:", validationResult.error.errors);
    throw new Error(
      "Invalid input for restaurant update: " +
        validationResult.error.errors.map((e) => e.message).join(", "),
    );
  }

  try {
    const existingRestaurantWithSameSlug = await db.query.restaurants.findFirst(
      {
        where: (restaurant, { and: drizzleAnd, eq: drizzleEq, ne }) =>
          drizzleAnd(
            drizzleEq(restaurant.slug, validationResult.data.slug),
            ne(restaurant.id, validationResult.data.id!), // Use ! for non-null assertion since it's optional in schema
          ),
      },
    );

    if (existingRestaurantWithSameSlug) {
      throw new Error(
        "A restaurant with this slug already exists. Please choose a different one.",
      );
    }

    await db
      .update(restaurants)
      .set({
        name: validationResult.data.name,
        slug: validationResult.data.slug,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, validationResult.data.id!)); // Use ! for non-null assertion

    revalidatePath("/admin/restaurants");
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw new Error(
      `Failed to update restaurant: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// Main Admin Restaurants Page Component (Server Component)
export default async function AdminRestaurantsPage() {
  // Fetch all restaurants from the database
  const allRestaurants = await db.query.restaurants.findMany({
    orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Restaurants</h1>
      {/* Render the Client Component and pass data and Server Actions */}
      <RestaurantManagementClient
        initialRestaurants={allRestaurants}
        addRestaurantAction={addRestaurant}
        deleteRestaurantAction={deleteRestaurant}
        updateRestaurantAction={updateRestaurant}
      />
    </div>
  );
}
