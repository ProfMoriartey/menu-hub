// app/[restaurantSlug]/page.tsx
import { db } from "~/server/db";
import { restaurants, categories, menuItems } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { Restaurant, Category, MenuItem } from "~/types/restaurant";
import type { SocialMediaLinks } from "~/lib/schemas";
import Link from "next/link";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import { Info, MapPin, Instagram, Facebook, Twitter, Music2, Globe } from "lucide-react";

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

  const rawData = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, restaurantSlug),
    with: {
      categories: true,
    },
  });

  if (!rawData) {
    notFound();
  }

  // Cast JSON fields appropriately
  const restaurantDetails = {
    ...rawData,
    socialMedia: rawData.socialMedia as SocialMediaLinks,
  } as Restaurant;

  const categoriesWithMenuItems = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurantDetails.id),
    orderBy: (categories, { asc }) => [asc(categories.order)],
    with: {
      menuItems: {
        where: eq(menuItems.restaurantId, restaurantDetails.id),
        orderBy: (menuItems, { asc }) => [asc(menuItems.order)],
      },
    },
  });

  const menuData: {
    restaurant: Pick<
      Restaurant,
      "id" | "name" | "slug" | "currency" | "description"
    >;
    categories: (Category & {
      menuItems: MenuItem[];
    })[];
  } = {
    restaurant: {
      id: restaurantDetails.id,
      name: restaurantDetails.name,
      slug: restaurantDetails.slug,
      currency: restaurantDetails.currency,
      description: restaurantDetails.description,
    },
    categories: categoriesWithMenuItems.map((cat) => ({
      id: cat.id,
      name: cat.name,
      order: cat.order,
      restaurantId: cat.restaurantId,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        ingredients: item.ingredients,
        dietaryLabels: item.dietaryLabels,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        restaurantId: item.restaurantId,
        categoryId: item.categoryId,
      })),
    })),
  };

  const socials = restaurantDetails.socialMedia ?? ({} as SocialMediaLinks);
  const hasSocials = Object.values(socials).some((url) => url && url.trim() !== "");

  const fallbackLogoUrl = `https://placehold.co/100x100/E0E0E0/333333?text=Logo`;
  const themeClass = `theme-${restaurantDetails.theme ?? "default"}`;

  return (
    <div className={cn("relative min-h-screen", themeClass)}>
      
      {/* Mobile top controls: Only Theme Toggle now */}
      <div className="absolute top-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>

      <header className="bg-card p-4 shadow-sm relative pt-14 md:pt-4">
        <div className="container mx-auto flex flex-col items-center sm:flex-row sm:items-start sm:justify-between sm:space-x-4">
          
          {/* Clickable Logo to Details */}
          <Link
            href={`/${restaurantDetails.slug}/about`}
            passHref
            className="mb-4 flex-shrink-0 sm:mr-4 sm:mb-0 block"
          >
            <div className="border-border relative h-24 w-24 cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-transform hover:scale-105 active:scale-95">
              <Image
                src={restaurantDetails.logoUrl ?? fallbackLogoUrl}
                alt={`${restaurantDetails.name} Logo`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </Link>

          {/* Restaurant Title, Description, and Unified Action Row */}
          <div className="mb-4 flex-grow text-center sm:mb-0 sm:text-left">
            <h1 className="text-foreground text-4xl font-bold">
              {restaurantDetails.name}
            </h1>
            
            {restaurantDetails.description ? (
              <p className="text-muted-foreground mt-2 text-lg">
                {restaurantDetails.description}
              </p>
            ) : (
              <p className="text-muted-foreground mt-2 text-lg">
                {t("browseMenuDefault")}
              </p>
            )}

            {/* Unified Action Row: Details | Map | Separator | Socials */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              
              {/* Details Button */}
              <Link href={`/${restaurantDetails.slug}/about`} passHref>
                <Button variant="secondary" size="sm" className="h-8 rounded-full px-4 font-medium">
                  <Info className="mr-1.5 h-4 w-4" />
                  {t("restaurantDetailsButton")}
                </Button>
              </Link>

              {/* Map Button */}
              {restaurantDetails.mapUrl && (
                <a href={restaurantDetails.mapUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </a>
              )}

              {/* Vertical Separator */}
              {hasSocials && (
                <div className="mx-1 h-5 w-px bg-border hidden sm:block"></div>
              )}

              {/* Social Media Links */}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socials.tiktok && (
                <a href={socials.tiktok} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                    <Music2 className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {socials.website && (
                <a href={socials.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                    <Globe className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* PC Format: Theme Toggle Only */}
          <div className="hidden flex-shrink-0 sm:self-center md:flex md:items-center">
            <ThemeToggle />
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