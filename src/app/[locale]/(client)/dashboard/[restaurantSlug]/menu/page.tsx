// app/[locale]/(client)/dashboard/[restaurantSlug]/menu/page.tsx
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDashboardRestaurant } from "~/server/dashboard-restaurant";
import { getCategorySummaries } from "~/server/menu-data";
import { DashboardRestaurantHeader } from "~/components/dashboard/DashboardRestaurantHeader";
import { CategoryList } from "~/components/menu-editor/CategoryList";
import { SetupChecklist } from "~/components/dashboard/SetupChecklist";
import { getSetupFactsFor } from "~/server/setup-facts";
import { canEditDetails } from "~/lib/access";

export const metadata: Metadata = {
  title: "Menu Editor | Menupedia",
  description: "Manage your restaurant menu, categories, and items.",
};

export default async function DashboardMenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;
  const { restaurant, role } = await getDashboardRestaurant(restaurantSlug);
  const t = await getTranslations("DashboardRestaurant");

  const [summaries, setupFacts] = await Promise.all([
    getCategorySummaries(restaurant.id),
    getSetupFactsFor(restaurant),
  ]);
  const totalItems = summaries.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <>
      <DashboardRestaurantHeader restaurant={restaurant} role={role} activeTab="menu" />
      <div className="space-y-6">
        {/* Disappears once every step is done. */}
        <SetupChecklist
          restaurant={restaurant}
          facts={setupFacts}
          canEditDetails={canEditDetails(role)}
          firstCategorySlug={summaries[0]?.slug ?? null}
        />
        <div>
          <h2 className="text-xl font-semibold">{t("categoriesTitle")}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("categoriesSummary", { categories: summaries.length, items: totalItems })}
          </p>
        </div>
        <CategoryList
          restaurantId={restaurant.id}
          basePath={`/dashboard/${restaurant.slug}/menu`}
          categories={summaries}
        />
      </div>
    </>
  );
}
