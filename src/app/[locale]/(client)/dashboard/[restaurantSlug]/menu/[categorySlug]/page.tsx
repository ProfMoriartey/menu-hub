// app/[locale]/(client)/dashboard/[restaurantSlug]/menu/[categorySlug]/page.tsx
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getCategoryWithItems } from "~/server/menu-data";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { CategorySwitcher } from "~/components/menu-editor/CategorySwitcher";
import { MenuItemList } from "~/components/menu-editor/MenuItemList";

export const metadata: Metadata = {
  title: "Menu Editor | Menupedia",
  description: "Manage your restaurant menu, categories, and items.",
};

export default async function DashboardCategoryItemsPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; categorySlug: string }>;
}) {
  const { restaurantSlug, categorySlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);
  const t = await getTranslations("DashboardRestaurant");

  const data = await getCategoryWithItems(restaurant.id, categorySlug);
  if (!data) notFound();
  const { category, allCategories, items } = data;

  const basePath = `/dashboard/${restaurant.slug}/menu`;

  return (
    <>
      <DashboardRestaurantHeader
        restaurant={restaurant}
        role={role}
        activeTab="menu"
        trail={[{ label: category.name }]}
      />
      <div className="space-y-6">
        <CategorySwitcher
          categories={allCategories}
          currentId={category.id}
          basePath={basePath}
          label={t("categoriesNav")}
        />
        <div>
          <h2 className="text-xl font-semibold">{category.name}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("itemsSummary", { count: items.length, currency: restaurant.currency })}
          </p>
        </div>
        <MenuItemList
          items={items}
          restaurantId={restaurant.id}
          categoryId={category.id}
          categoryName={category.name}
          currency={restaurant.currency}
          categories={allCategories}
          basePath={basePath}
        />
      </div>
    </>
  );
}
