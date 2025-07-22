// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { Restaurant, Category, MenuItem } from "~/types/restaurant";
import Link from "next/link";
// Removed Button import if not used elsewhere in this specific file,
// as the ThemeToggle uses its own Button.
// import { Button } from "~/components/ui/button";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle"; // ADDED: Import ThemeToggle

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
      categories: true,
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

  const fallbackLogoUrl = `https://placehold.co/100x100/E0E0E0/333333?text=Logo`;

  const themeClass = `theme-${restaurantDetails.theme || "default"}`;

  return (
    <div className={cn("min-h-screen", themeClass)}>
      <header className="bg-card p-4 shadow-sm">
        <div className="container mx-auto flex flex-col items-center sm:flex-row sm:items-start sm:justify-between sm:space-x-4">
          {/* Leftmost Block: Restaurant Logo - NOW A LINK TO ABOUT PAGE */}
          {restaurantDetails.logoUrl && (
            <Link
              href={`/${restaurantDetails.slug}/about`}
              passHref
              className="mb-4 flex-shrink-0 sm:mr-4 sm:mb-0"
            >
              <div className="border-border relative h-24 w-24 cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
                <Image
                  src={restaurantDetails.logoUrl}
                  alt={`${restaurantDetails.name} Logo`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            </Link>
          )}

          {/* Middle Block: Restaurant Name and Description (flex-grow to take available space) */}
          <div className="mb-4 flex-grow text-center sm:mb-0 sm:text-left">
            <h1 className="text-foreground text-4xl font-bold">
              {restaurantDetails.name}
            </h1>
            {restaurantDetails.description ? (
              <p className="text-muted-foreground mt-2 text-lg">
                {restaurantDetails.description}
              </p>
            ) : (
              <p className="text-muted-foreground mt-2 text-lg">
                Browse our delicious menu
              </p>
            )}
          </div>

          {/* Rightmost Block: Theme Toggle Button */}
          <div className="flex-shrink-0 sm:self-center">
            <ThemeToggle /> {/* ADDED: Theme Toggle Button */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {menuData.categories.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            <p>No menu items available for this restaurant yet.</p>
            <p>Please check back later!</p>
          </div>
        ) : (
          <MenuDisplayClient
            menuData={menuData}
            theme={restaurantDetails.theme || "default"}
          />
        )}
      </main>
    </div>
  );
}
