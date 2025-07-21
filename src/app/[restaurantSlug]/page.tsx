// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { Restaurant, Category, MenuItem } from "~/types/restaurant";
import Link from "next/link";
import { Button } from "~/components/ui/button";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemId: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const restaurantDetails = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    with: {
      categories: true, // Required by Restaurant type
    },
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

  const menuData: {
    restaurant: Pick<
      Restaurant,
      "id" | "name" | "slug" | "currency" | "description"
    >;
    categories: (Category & {
      menuItems: MenuItem[];
    })[];
  } = {
    restaurant: {
      id: restaurantDetails.id,
      name: restaurantDetails.name,
      slug: restaurantDetails.slug,
      currency: restaurantDetails.currency,
      description: restaurantDetails.description,
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
      <header className="bg-white p-4 shadow-sm">
        {/* Main header content wrapper */}
        <div className="container mx-auto flex flex-col items-center sm:flex-row sm:items-start sm:justify-between sm:space-x-4">
          {/* Left Block: Restaurant Name and Description */}
          <div className="mb-4 text-center sm:mb-0 sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900">
              {restaurantDetails.name}
            </h1>
            {restaurantDetails.description ? (
              <p className="mt-2 text-lg text-gray-600">
                {restaurantDetails.description}
              </p>
            ) : (
              <p className="mt-2 text-lg text-gray-600">
                Browse our delicious menu
              </p>
            )}
          </div>

          {/* Right Block: About Restaurant Button */}
          {/* This button is now a direct child of the main flex container */}
          <div className="flex-shrink-0 sm:self-center">
            {" "}
            {/* sm:self-center to align vertically on desktop if flex-start on parent */}
            <Link href={`/${restaurantDetails.slug}/about`} passHref>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                About Restaurant
              </Button>
            </Link>
          </div>
        </div>
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
