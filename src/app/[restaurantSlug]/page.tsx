// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { Restaurant, Category, MenuItem } from "~/types/restaurant";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });

  if (!restaurantDetails) {
    notFound();
  }

  const categoriesWithMenuItems = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantDetails.id),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    with: {
      menuItems: {
        where: eq(menuItems.restaurantId, restaurantDetails.id),
        orderBy: (menuItems, { asc }) => [asc(menuItems.name)],
      },
    },
  });

  // Prepare data for the client component, ensuring types align with shared interfaces
  const menuData: {
    // UPDATED TYPE: Include 'currency' here
    restaurant: Pick<Restaurant, "id" | "name" | "slug" | "currency">;
    categories: (Category & {
      menuItems: MenuItem[];
    })[];
  } = {
    restaurant: {
      id: restaurantDetails.id,
      name: restaurantDetails.name,
      slug: restaurantDetails.slug,
      // NEW: Pass the currency from restaurantDetails
      currency: restaurantDetails.currency,
    },
    categories: categoriesWithMenuItems.map((cat) => ({
      id: cat.id,
      name: cat.name,
      order: cat.order,
      restaurantId: cat.restaurantId,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        ingredients: item.ingredients,
        dietaryLabels: item.dietaryLabels,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        restaurantId: item.restaurantId,
        categoryId: item.categoryId,
      })),
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white p-4 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">
          {restaurantDetails.name}
        </h1>
        <p className="mt-2 text-lg text-gray-600">Browse our delicious menu</p>
      </header>

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
