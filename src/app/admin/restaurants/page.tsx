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
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
  address: z.string().optional(),
  country: z.string().optional(),
  foodType: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

// Server Action to add a new restaurant
async function addRestaurant(formData: FormData) {
  "use server";

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    address: formData.get("address"),
    country: formData.get("country"),
    foodType: formData.get("foodType"),
    isActive: formData.get("isActive") === "on",
  };

  const result = restaurantSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    throw new Error(
      "Invalid input: " + result.error.errors.map((e) => e.message).join(", "),
    );
  }

  const { name, slug, address, country, foodType, isActive } = result.data;

  const existing = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });

  if (existing) {
    throw new Error("Slug already exists.");
  }

  await db.insert(restaurants).values({
    name,
    slug,
    address,
    country,
    foodType,
    isActive,
  });

  revalidatePath("/admin/restaurants");
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

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    address: formData.get("address"),
    country: formData.get("country"),
    foodType: formData.get("foodType"),
    isActive: formData.get("isActive") === "on",
  };

  const result = restaurantSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    throw new Error(
      "Invalid input: " + result.error.errors.map((e) => e.message).join(", "),
    );
  }

  const { id, name, slug, address, country, foodType, isActive } = result.data;

  const existing = await db.query.restaurants.findFirst({
    where: (restaurant, { and, eq, ne }) =>
      and(eq(restaurant.slug, slug), ne(restaurant.id, id!)),
  });

  if (existing) {
    throw new Error("Slug already exists.");
  }

  await db
    .update(restaurants)
    .set({
      name,
      slug,
      address,
      country,
      foodType,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, id!));

  revalidatePath("/admin/restaurants");
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
