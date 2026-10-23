// app/admin/restaurants/[restaurantSlug]/menu/page.tsx
import { db } from "~/server/db";
import { categories, restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { CategoryList, type CategorySummary } from "~/components/admin/CategoryList";

export default async function AdminMenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  });

  if (!restaurant) {
    notFound();
  }

  // Item ids and images are enough for the counts and thumbnails.
  const rows = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurant.id),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    with: {
      menuItems: {
        columns: { id: true, imageUrl: true },
        orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
      },
    },
  });

  const summaries: CategorySummary[] = rows.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    order: category.order,
    itemCount: category.menuItems.length,
    thumbnails: category.menuItems
      .map((item) => item.imageUrl)
      .filter((url): url is string => Boolean(url))
      .slice(0, 3),
  }));

  const totalItems = summaries.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="menu" />
      <div>
        <h2 className="text-xl font-semibold">Categories</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {summaries.length === 1 ? "1 category" : `${summaries.length} categories`} ·{" "}
          {totalItems === 1 ? "1 item" : `${totalItems} items`}. Open a category to manage its items.
        </p>
      </div>
      <CategoryList
        restaurantId={restaurant.id}
        restaurantSlug={restaurant.slug}
        categories={summaries}
      />
    </div>
  );
}
