// app/admin/restaurants/[restaurantSlug]/menu/[categorySlug]/page.tsx
import { db } from "~/server/db"
import { menuItems, categories, restaurants } from "~/server/db/schema"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Link } from "~/i18n/navigation"
import { RestaurantAdminHeader } from "~/components/admin/RestaurantAdminHeader"
import { MenuItemList } from "~/components/admin/MenuItemList"
import { cn } from "~/lib/utils"

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

  const allCategories = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurant.id),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    columns: { id: true, slug: true, name: true },
  })

  const category = allCategories.find((c) => c.slug === categorySlug)
  if (!category) notFound()

  const allMenuItems = await db.query.menuItems.findMany({
    where: and(
      eq(menuItems.categoryId, category.id),
      eq(menuItems.restaurantId, restaurant.id),
    ),
    orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
  })

  return (
    <div className="space-y-8">
      <RestaurantAdminHeader
        restaurant={restaurant}
        activeTab="menu"
        trail={[{ label: category.name }]}
      />

      {allCategories.length > 1 && (
        <nav aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {allCategories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/restaurants/${restaurant.slug}/menu/${c.slug}`}
              aria-current={c.id === category.id ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                c.id === category.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      <div>
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {allMenuItems.length === 1 ? "1 item" : `${allMenuItems.length} items`} · Prices in{" "}
          {restaurant.currency}
        </p>
      </div>

      <MenuItemList
        items={allMenuItems}
        restaurantId={restaurant.id}
        categoryId={category.id}
        categoryName={category.name}
        currency={restaurant.currency}
      />
    </div>
  )
}
