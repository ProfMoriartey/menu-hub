// app/admin/restaurants/page.tsx
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema"; // Ensure categories and menuItems are imported
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  address: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  foodType: z.string().nullable().optional(),
  isActive: z.coerce.boolean().default(true),
  isDisplayed: z.coerce.boolean().default(true),
  logoUrl: z.string().url().nullable().optional(),
});

// Server Action to add a new restaurant
async function addRestaurant(formData: FormData) {
  "use server";

  const rawData = {
    name: formData.get("name") as string | null,
    slug: formData.get("slug") as string | null,
    address: formData.get("address") as string | null,
    country: formData.get("country") as string | null,
    foodType: formData.get("foodType") as string | null,
    isActive: formData.get("isActive") === "on",
    isDisplayed: formData.get("isDisplayed") === "on",
    logoUrl: formData.get("logoUrl") as string | null,
  };

  const result = restaurantSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    throw new Error(
      "Invalid input: " +
        result.error.errors.map((_e) => _e.message).join(", "),
    );
  }

  const {
    name,
    slug,
    address,
    country,
    foodType,
    isActive,
    isDisplayed,
    logoUrl,
  } = result.data;

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
    isDisplayed,
    logoUrl,
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
    id: formData.get("id") as string | null,
    name: formData.get("name") as string | null,
    slug: formData.get("slug") as string | null,
    address: formData.get("address") as string | null,
    country: formData.get("country") as string | null,
    foodType: formData.get("foodType") as string | null,
    isActive: formData.get("isActive") === "on",
    isDisplayed: formData.get("isDisplayed") === "on",
    logoUrl: formData.get("logoUrl") as string | null,
  };

  const result = restaurantSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    throw new Error(
      "Invalid input: " +
        result.error.errors.map((_e) => _e.message).join(", "),
    );
  }

  const {
    id,
    name,
    slug,
    address,
    country,
    foodType,
    isActive,
    isDisplayed,
    logoUrl,
  } = result.data;

  const existing = await db.query.restaurants.findFirst({
    where: (restaurant, { and, eq: drizzleEq, ne }) =>
      and(drizzleEq(restaurant.slug, slug), ne(restaurant.id, id!)),
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
      isDisplayed,
      logoUrl,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, id!));

  revalidatePath("/admin/restaurants");
}

// Main Admin Restaurants Page Component (Server Component)
export default async function AdminRestaurantsPage() {
  // Fetch all restaurants from the database, including categories and menuItems
  const allRestaurants = await db.query.restaurants.findMany({
    with: {
      // <-- ADDED THIS 'with' CLAUSE
      categories: {
        with: {
          menuItems: true,
        },
      },
    },
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
