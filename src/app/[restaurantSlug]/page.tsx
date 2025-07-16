// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
// NEW: Client Component for Category Navigation and Menu Display
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";

// Define the props type for this page - Updated for Next.js App Router
interface PageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Main Restaurant Menu Page Component (Server Component)
export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

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

  // Prepare data for the client component
  const menuData = {
    restaurant: {
      id: restaurantDetails.id,
      name: restaurantDetails.name,
      slug: restaurantDetails.slug,
    },
    categories: categoriesWithMenuItems.map((cat) => ({
      id: cat.id,
      name: cat.name,
      order: cat.order,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        ingredients: item.ingredients,
        isVegetarian: item.isVegetarian,
        isGlutenFree: item.isGlutenFree,
        imageUrl: item.imageUrl,
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
