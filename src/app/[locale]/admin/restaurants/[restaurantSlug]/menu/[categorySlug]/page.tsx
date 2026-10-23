// app/admin/restaurants/[restaurantSlug]/menu/[categorySlug]/page.tsx
import { db } from "~/server/db"
import { restaurants } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { getCategoryWithItems } from "~/server/menu-data"
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader"
import { CategorySwitcher } from "~/components/menu-editor/CategorySwitcher"
import { MenuItemList } from "~/components/menu-editor/MenuItemList"

export default async function AdminCategoryItemsPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string, categorySlug: string }>
}) {
  const { restaurantSlug, categorySlug } = await params

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
  })
  if (!restaurant) notFound()

  const data = await getCategoryWithItems(restaurant.id, categorySlug)
  if (!data) notFound()
  const { category, allCategories, items } = data

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader
        restaurant={restaurant}
        activeTab="menu"
        trail={[{ label: category.name }]}
      />

      <CategorySwitcher
        categories={allCategories}
        currentId={category.id}
        basePath={`/admin/restaurants/${restaurant.slug}/menu`}
        label="Categories"
      />

      <div>
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {items.length === 1 ? "1 item" : `${items.length} items`} · Prices in{" "}
          {restaurant.currency}
        </p>
      </div>

      <MenuItemList
        items={items}
        restaurantId={restaurant.id}
        categoryId={category.id}
        categoryName={category.name}
        currency={restaurant.currency}
        categories={allCategories}
        basePath={`/admin/restaurants/${restaurant.slug}/menu`}
      />
    </div>
  )
}
