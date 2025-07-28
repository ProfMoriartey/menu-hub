// app/[restaurantSlug]/item/[itemId]/page.tsx
import { db } from "~/server/db";
import { menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MenuItemDisplayClient } from "~/components/public/MenuItemDisplayClient";
import { getTranslations } from "next-intl/server"; // ADDED: Import getTranslations

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemId: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemId } = await params;

  // ADDED: Fetch translations for this page
  const t = await getTranslations("menuItemDetailPage");

  const itemDetails = await db.query.menuItems.findFirst({
    where: eq(menuItems.id, itemId),
    with: {
      restaurant: true,
      category: true,
    },
  });

  if (!itemDetails || itemDetails.restaurant.slug !== restaurantSlug) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ADDED: Simple header for the page using translation */}
      <header className="bg-card p-4 text-center shadow-sm">
        <h1 className="mb-2 text-4xl font-bold">{t("pageTitle")}</h1>
        <p className="text-muted-foreground text-lg">
          {itemDetails.name} - {itemDetails.restaurant.name}
        </p>
      </header>
      <main className="container mx-auto px-4 py-8">
        <MenuItemDisplayClient
          item={itemDetails}
          restaurantSlug={restaurantSlug}
          theme={itemDetails.restaurant.theme ?? "default"}
        />
      </main>
    </div>
  );
}
