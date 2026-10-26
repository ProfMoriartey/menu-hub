// app/[restaurantSlug]/page.tsx
import { getPublicMenu, getRestaurantBySlug } from "~/server/public-menu";
import { notFound } from "next/navigation";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { MenuItem } from "~/types/restaurant";
import type { PublicMenuData } from "~/components/public/menu-types";
import { formatPrice } from "~/lib/format-price";
import type { SocialMediaLinks } from "~/lib/schemas";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { PublicPageControls } from "~/components/public/PublicPageControls";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import {
  Info,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Music2,
  Globe,
} from "lucide-react";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import type { Metadata } from "next";
import { getPublicOrigin } from "~/server/public-origin";
import {
  clip,
  publicPageMetadata,
  restaurantPreviewImage,
} from "~/server/public-metadata";
import {
  jsonLd,
  restaurantStructuredData,
} from "~/server/menu-structured-data";

interface PageProps {
  params: Promise<{
    restaurantSlug: string;
    itemId?: string;
  }>;
  searchParams?: Promise<
    Readonly<Record<string, string | string[] | undefined>>
  >;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const restaurant = await getRestaurantBySlug((await params).restaurantSlug);
  if (!restaurant) return {};
  const t = await getTranslations("PublicMenu");
  // The admin form's SEO title and description win over the defaults.
  return publicPageMetadata({
    locale: await getLocale(),
    path: `/${restaurant.slug}`,
    title:
      restaurant.metaTitle ?? t("metaMenuTitle", { name: restaurant.name }),
    description: clip(
      restaurant.metaDescription ??
        restaurant.description ??
        t("metaMenuDescription", { name: restaurant.name }),
    ),
    image: restaurantPreviewImage(restaurant),
    siteName: restaurant.name,
  });
}

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const t = await getTranslations("restaurantMenuPage");
  const tMenu = await getTranslations("PublicMenu");

  const rawData = await getRestaurantBySlug(restaurantSlug);

  if (!rawData) {
    notFound();
  }

  // The JSON column is untyped in the database schema.
  const restaurantDetails = {
    ...rawData,
    socialMedia: rawData.socialMedia as SocialMediaLinks | null,
  };

  const locale = await getLocale();
  const origin = await getPublicOrigin();
  const menu = await getPublicMenu(restaurantDetails.id);

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
    categories: menu
      .filter((category) => category.menuItems.length > 0)
      .map((category) => ({
        ...category,
        menuItems: [...category.menuItems]
          .sort((x, y) => availableFirst(x) - availableFirst(y))
          .map((item) => ({
            ...item,
            displayPrice: formatPrice(
              item.price,
              restaurantDetails.currency,
              locale,
            ),
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
            <h1 className="text-foreground text-4xl font-bold">
              {restaurantDetails.name}
            </h1>
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
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  asChild
                >
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
                <div
                  className="bg-border mx-1 hidden h-5 w-px sm:block"
                  aria-hidden
                />
              )}

              {socialLinks.map(({ url, label, Icon }) => (
                <Button
                  key={label}
                  variant="secondary"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
                  asChild
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                  >
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
        {/* Search engines read this; previews of unpublished menus get none. */}
        {restaurantDetails.isActive && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd(
                restaurantStructuredData({
                  restaurant: restaurantDetails,
                  categories: menuData.categories,
                  pageUrl: `${origin}/${locale}/${restaurantDetails.slug}`,
                  itemUrl: (itemSlug) =>
                    `${origin}/${locale}/${restaurantDetails.slug}/item/${itemSlug}`,
                }),
              ),
            }}
          />
        )}
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
