// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { categories, menuItems } from "~/server/db/schema";
import { getRestaurantBySlug } from "~/server/queries";
import { and, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { Restaurant, MenuItem } from "~/types/restaurant";
import type { PublicMenuData } from "~/components/public/menu-types";
import { formatPrice } from "~/lib/format-price";
import type { SocialMediaLinks } from "~/lib/schemas";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { PublicPageControls } from "~/components/public/PublicPageControls";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { Info, MapPin, Instagram, Facebook, Twitter, Music2, Globe } from "lucide-react";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemId?: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const t = await getTranslations("restaurantMenuPage");
  const tMenu = await getTranslations("PublicMenu");

  const rawData = await getRestaurantBySlug(restaurantSlug);

  if (!rawData) {
    notFound();
  }

  // Cast JSON fields appropriately
  const restaurantDetails = {
    ...rawData,
    categories: [],
    socialMedia: rawData.socialMedia as SocialMediaLinks,
  } as Restaurant;

  const categoriesWithMenuItems = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantDetails.id),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    with: {
      menuItems: {
        // Hidden items aren't on the public menu; sold-out ones are, marked.
        where: and(
          eq(menuItems.restaurantId, restaurantDetails.id),
          ne(menuItems.availability, "hidden"),
        ),
        orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
      },
    },
  });

  const locale = await getLocale();
  // Sold-out items stay on the menu but move after everything still
  // available; otherwise the owner's order is kept.
  const availableFirst = (item: { availability: MenuItem["availability"] }) =>
    item.availability === "sold_out" ? 1 : 0;

  const menuData: PublicMenuData = {
    restaurant: {
      id: restaurantDetails.id,
      name: restaurantDetails.name,
      slug: restaurantDetails.slug,
      currency: restaurantDetails.currency,
      description: restaurantDetails.description,
    },
    // Guests only see categories that have something in them.
    categories: categoriesWithMenuItems
      .filter((cat) => cat.menuItems.length > 0)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        restaurantId: cat.restaurantId,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        menuItems: [...cat.menuItems]
          .sort((x, y) => availableFirst(x) - availableFirst(y))
          .map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: item.price,
            displayPrice: formatPrice(item.price, restaurantDetails.currency, locale),
            ingredients: item.ingredients,
            dietaryLabels: item.dietaryLabels,
            availability: item.availability,
            imageUrl: item.imageUrl,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            restaurantId: item.restaurantId,
            categoryId: item.categoryId,
          })),
      })),
  };

  const socials = restaurantDetails.socialMedia ?? ({} as SocialMediaLinks);
  // Brand names stay untranslated; only "Website" is a word.
  const socialLinks = [
    { url: socials.instagram, label: "Instagram", Icon: Instagram },
    { url: socials.facebook, label: "Facebook", Icon: Facebook },
    { url: socials.twitter, label: "Twitter", Icon: Twitter },
    { url: socials.tiktok, label: "TikTok", Icon: Music2 },
    { url: socials.website, label: tMenu("websiteLabel"), Icon: Globe },
  ].filter((link) => link.url?.trim());

  const themeClass = `theme-${restaurantDetails.theme ?? "default"}`;

  return (
    <div className={cn("relative min-h-screen", themeClass)}>
      {/* Phones: language and theme switches sit in the corner above the header. */}
      <div className="absolute end-4 top-4 z-50 md:hidden">
        <PublicPageControls />
      </div>

      <header className="bg-card relative p-4 pt-14 shadow-sm md:pt-4">
        <div className="container mx-auto flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* The logo opens the details page too, like the Details button. */}
          <Link
            href={`/${restaurantDetails.slug}/about`}
            aria-label={t("restaurantDetailsButton")}
            className="block shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <RestaurantLogo
              restaurant={restaurantDetails}
              className="h-24 w-24 rounded-lg text-3xl shadow-sm"
              imageSizes="96px"
              priority
            />
          </Link>

          <div className="flex-grow text-center sm:text-start">
            <h1 className="text-foreground text-4xl font-bold">{restaurantDetails.name}</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {restaurantDetails.description ?? t("browseMenuDefault")}
            </p>

            {/* Details | Map | Separator | Socials */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 rounded-full px-4 font-medium"
                asChild
              >
                <Link href={`/${restaurantDetails.slug}/about`}>
                  <Info className="h-4 w-4" aria-hidden />
                  {t("restaurantDetailsButton")}
                </Link>
              </Button>

              {restaurantDetails.mapUrl && (
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" asChild>
                  <a
                    href={restaurantDetails.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={tMenu("mapLabel")}
                    title={tMenu("mapLabel")}
                  >
                    <MapPin className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              )}

              {socialLinks.length > 0 && (
                <div className="bg-border mx-1 hidden h-5 w-px sm:block" aria-hidden />
              )}

              {socialLinks.map(({ url, label, Icon }) => (
                <Button
                  key={label}
                  variant="secondary"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
                  asChild
                >
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <div className="hidden shrink-0 sm:self-center md:flex md:items-center">
            <PublicPageControls />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {menuData.categories.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            <p>{t("noMenuItemsAvailable")}</p>
            <p>{t("checkBackLater")}</p>
          </div>
        ) : (
          <MenuDisplayClient
            menuData={menuData}
            theme={restaurantDetails.theme ?? "default"}
          />
        )}
      </main>
    </div>
  );
}