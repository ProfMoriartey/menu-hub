// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
// NEW: Client Component for Category Navigation and Menu Display
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
// Import shared types for clarity and consistency
import type { Restaurant, Category, MenuItem } from "~/types/restaurant";

// Define the props type for this page - Updated for Next.js App Router
interface PageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

// Main Restaurant Menu Page Component (Server Component)
export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params; // params is already an object, no await needed

  // 1. Fetch Restaurant Details
  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });

  if (!restaurantDetails) {
    notFound(); // Show 404 if restaurant doesn't exist
  }

  // 2. Fetch Categories and their associated Menu Items
  // Drizzle's relations allow fetching nested data efficiently
  const categoriesWithMenuItems = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantDetails.id),
    orderBy: (categories, { asc }) => [asc(categories.order)], // Order categories
    with: {
      menuItems: {
        where: eq(menuItems.restaurantId, restaurantDetails.id), // Ensure items belong to this restaurant
        orderBy: (menuItems, { asc }) => [asc(menuItems.name)], // Order menu items within each category
      },
    },
  });

  // Prepare data for the client component, ensuring types align with shared interfaces
  const menuData: {
    restaurant: Pick<Restaurant, "id" | "name" | "slug">; // Only pick necessary restaurant fields
    categories: (Category & {
      menuItems: MenuItem[];
    })[];
  } = {
    restaurant: {
      id: restaurantDetails.id,
      name: restaurantDetails.name,
      slug: restaurantDetails.slug,
    },
    categories: categoriesWithMenuItems.map((cat) => ({
      id: cat.id,
      name: cat.name,
      order: cat.order,
      restaurantId: cat.restaurantId, // Include required Category fields
      createdAt: cat.createdAt, // Include required Category fields
      updatedAt: cat.updatedAt, // Include required Category fields
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description, // Now nullable
        price: item.price, // Now string
        ingredients: item.ingredients, // Now nullable
        dietaryLabels: item.dietaryLabels, // <-- NEW: Include dietaryLabels
        imageUrl: item.imageUrl, // Now nullable
        // Include other fields from MenuItem interface if needed, e.g., createdAt, updatedAt
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        restaurantId: item.restaurantId, // Required by MenuItem interface
        categoryId: item.categoryId, // Required by MenuItem interface
      })),
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Restaurant Header */}
      <header className="bg-white p-4 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">
          {restaurantDetails.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">Browse our delicious menu</p>
      </header>

      {/* Main Menu Display (Client Component) */}
      <main className="container mx-auto px-4 py-8">
        {menuData.categories.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p>No menu items available for this restaurant yet.</p>
            <p>Please check back later!</p>
          </div>
        ) : (
          <MenuDisplayClient menuData={menuData} />
        )}
      </main>
    </div>
  );
}
