// app/[restaurantSlug]/item/[itemSlug]/page.tsx
import { db } from "~/server/db";
import { menuItems, restaurants } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { permanentRedirect } from "~/i18n/navigation";
import { isUuid } from "~/lib/slug";
import { MenuItemDisplayClient } from "~/components/public/MenuItemDisplayClient";
import { getTranslations } from "next-intl/server"; // ADDED: Import getTranslations

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemSlug: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { restaurantSlug, itemSlug } = await params;

  // ADDED: Fetch translations for this page
  const t = await getTranslations("menuItemDetailPage");

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    columns: { id: true },
  });
  if (!restaurant) notFound();

  const itemDetails = await db.query.menuItems.findFirst({
    where: and(eq(menuItems.restaurantId, restaurant.id), eq(menuItems.slug, itemSlug)),
    with: {
      restaurant: true,
      category: true,
    },
  });

  if (!itemDetails) {
    // Item links used to end in the item's id; send those to the slug URL.
    if (isUuid(itemSlug)) {
      const legacy = await db.query.menuItems.findFirst({
        where: and(eq(menuItems.restaurantId, restaurant.id), eq(menuItems.id, itemSlug)),
        columns: { slug: true },
      });
      if (legacy) {
        permanentRedirect({
          href: `/${restaurantSlug}/item/${legacy.slug}`,
          locale: await getLocale(),
        });
      }
    }
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
