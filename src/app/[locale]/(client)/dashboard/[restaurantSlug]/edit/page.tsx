// app/[locale]/(app)/dashboard/[restaurantSlug]/edit/page.tsx

import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { type Metadata } from "next";

interface EditPageProps {
  params: { restaurantSlug: string };
}

// 1. Fetch the restaurant data (again) for the page component.
// NOTE: This re-fetch is standard practice when data isn't passed via props.
async function getRestaurantData(slug: string) {
  const restaurant = await db.query.restaurants.findFirst({
    where: eq(schema.restaurants.slug, slug),
    with: {
      categories: {
        with: {
          menuItems: true,
        },
        orderBy: (categories, { asc }) => [asc(categories.order)],
      },
    },
  });

  // The layout should have caught non-existent or unauthorized access,
  // but this check is a safeguard.
  if (!restaurant) {
    notFound();
  }

  return restaurant;
}

export const metadata: Metadata = {
  title: "Menu Editor",
  description: "Edit restaurant details, categories, and menu items.",
};

export default async function RestaurantEditPage({ params }: EditPageProps) {
  const restaurant = await getRestaurantData(params.restaurantSlug);

  // This section needs client components (like Shadcn forms) for interactivity.
  // We will render the Server Component skeleton here.

  return (
    <div className="mx-auto max-w-6xl py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          {restaurant.name} Menu Editor
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Slug: <span className="font-mono text-sm">{restaurant.slug}</span>
        </p>
      </header>

      {/* General Settings Section */}
      <section className="mb-12 rounded-xl border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">
          Restaurant Details
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Update the general information for your restaurant menu.
        </p>
        {/* Placeholder for the Client Component that holds the edit form */}
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 text-gray-500">
          [Restaurant Details Edit Form Component (Client Component)]
        </div>
      </section>

      {/* Categories and Menu Items Section */}
      <section className="rounded-xl border bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">
          Menu Categories ({restaurant.categories.length})
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Organize your menu by category. Drag and drop to reorder.
        </p>

        <div className="space-y-6">
          {restaurant.categories.map((category) => (
            <div
              key={category.id}
              className="rounded-md border-l-4 border-indigo-500 bg-indigo-50 p-4"
            >
              <h3 className="text-xl font-medium text-indigo-700">
                {category.name} ({category.menuItems.length} items)
              </h3>
              <div className="mt-2 pl-4 text-sm text-indigo-600">
                {/* Placeholder for Menu Item List Component */}
                <p>View/Edit {category.menuItems.length} Menu Items</p>
              </div>
            </div>
          ))}

          <div className="mt-6 border-t border-dashed pt-4 text-center">
            {/* Placeholder for Add New Category Button */}
            <button className="font-medium text-indigo-600 hover:text-indigo-800">
              + Add New Category
            </button>
          </div>
        </div>
      </section>

      {/* Responsive Notes */}
      <footer className="mt-12 text-center text-sm text-gray-400">
        Optimized for mobile editing.
      </footer>
    </div>
  );
}
