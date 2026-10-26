// app/admin/restaurants/[restaurantSlug]/menu/page.tsx
import { menuLanguagesOf } from "~/lib/menu-languages";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCategorySummaries } from "~/server/menu-data";
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader";
import { CategoryList } from "~/components/menu-editor/CategoryList";

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

  const summaries = await getCategorySummaries(restaurant.id);
  const totalItems = summaries.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader restaurant={restaurant} activeTab="menu" />
      <div>
        <h2 className="text-xl font-semibold">Categories</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {summaries.length === 1
            ? "1 category"
            : `${summaries.length} categories`}{" "}
          · {totalItems === 1 ? "1 item" : `${totalItems} items`}. Open a
          category to manage its items.
        </p>
      </div>
      <CategoryList
        restaurantId={restaurant.id}
        languages={menuLanguagesOf(restaurant)}
        basePath={`/admin/restaurants/${restaurant.slug}/menu`}
        categories={summaries}
      />
    </div>
  );
}
