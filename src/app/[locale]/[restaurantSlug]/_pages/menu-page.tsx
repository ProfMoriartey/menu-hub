// app/[locale]/[restaurantSlug]/_pages/menu-page.tsx
// The menu page, for a restaurant (/lokanta) and for one of its branches
// (/lokanta/kadikoy): the same menu; the branch's hours and map are on
// its About page.
import { getPublicMenu } from "~/server/public-menu";
import { branchChoices, branchLabel, findBranchPage, getBranchPage } from "~/server/public-branch";
import { BranchPicker } from "~/components/public/BranchPicker";
import { MenuDisplayClient } from "~/components/public/MenuDisplayClient";
import type { MenuItem } from "~/types/restaurant";
import type { PublicMenuData } from "~/components/public/menu-types";
import { formatPrice } from "~/lib/format-price";
import {
  allMenuLanguages,
  contentLanguage as contentLanguageOf,
  menuLanguagesOf,
} from "~/lib/menu-languages";
import {
  localizeCategory,
  localizeDescription,
  localizeItem,
} from "~/server/localize-menu";
import type { SocialMediaLinks } from "~/lib/schemas";
import { Link } from "~/i18n/navigation";
import { cn } from "~/lib/utils";
import { isLive } from "~/lib/access";
import { PublicPageControls } from "~/components/public/PublicPageControls";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "~/components/ui/button";
import {
  Info,
  Instagram,
  Facebook,
  Twitter,
  Music2,
  Globe,
} from "lucide-react";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import type { Metadata } from "next";
import { cachedPageOrigin } from "~/server/public-origin";
import {
  clip,
  publicPageMetadata,
  restaurantPreviewImage,
} from "~/server/public-metadata";
import {
  jsonLd,
  restaurantStructuredData,
} from "~/server/menu-structured-data";

interface MenuPageProps {
  restaurantSlug: string;
  // Null on the restaurant's own page.
  branchSlug: string | null;
}

/** The text, trimmed, or undefined when there is none. */
const filled = (text: string | null | undefined) =>
  text?.trim() ? text.trim() : undefined;

export async function menuPageMetadata({
  restaurantSlug,
  branchSlug,
}: MenuPageProps): Promise<Metadata> {
  const found = await findBranchPage(restaurantSlug, branchSlug);
  if (found.kind !== "page") return {};
  const { restaurant, branch, isMulti, base } = found;
  const t = await getTranslations("PublicMenu");
  const locale = await getLocale();
  const languages = menuLanguagesOf(restaurant);
  // The admin form's SEO title and description win over the defaults (they
  // aren't translated, so only on main-language pages when translating),
  // except on a branch's page, which is named after the branch.
  const onBranch = isMulti && branch !== null;
  const useSeoFields = (!languages || locale === languages.main) && !onBranch;
  const name = onBranch
    ? t("branchTitle", { name: restaurant.name, branch: branchLabel(branch, t("mainBranch")) })
    : restaurant.name;
  return publicPageMetadata({
    locale,
    path: base,
    // filled(): the admin form saves an empty field as "", which would
    // otherwise give the menu a blank tab title and link preview.
    title:
      (useSeoFields ? filled(restaurant.metaTitle) : undefined) ??
      t("metaMenuTitle", { name }),
    description: clip(
      (useSeoFields ? filled(restaurant.metaDescription) : undefined) ??
        filled(localizeDescription(restaurant, languages, locale).text) ??
        t("metaMenuDescription", { name: restaurant.name }),
    ),
    image: restaurantPreviewImage(restaurant),
    siteName: restaurant.name,
    menuLanguages: languages && allMenuLanguages(languages),
  });
}

export async function MenuPage({ restaurantSlug, branchSlug }: MenuPageProps) {
  const t = await getTranslations("restaurantMenuPage");
  const tMenu = await getTranslations("PublicMenu");

  const {
    restaurant: rawData,
    branches,
    branch,
    isMulti,
    base,
  } = await getBranchPage(restaurantSlug, branchSlug, "");

  // The JSON column is untyped in the database schema.
  const restaurantDetails = {
    ...rawData,
    socialMedia: rawData.socialMedia as SocialMediaLinks | null,
  };

  const locale = await getLocale();
  const origin = cachedPageOrigin();
  const menu = await getPublicMenu(restaurantDetails.id);
  const choices = isMulti
    ? await branchChoices(restaurantDetails.slug, branches, branch, "")
    : [];
  // Translations, when an admin has turned them on for this restaurant.
  const languages = menuLanguagesOf(restaurantDetails);
  const description = localizeDescription(restaurantDetails, languages, locale);

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
      description: description.text,
    },
    // Guests only see categories that have something in them.
    categories: menu
      .filter((category) => category.menuItems.length > 0)
      .map(({ menuItems, ...category }) => ({
        ...localizeCategory(category, languages, locale),
        menuItems: [...menuItems]
          .sort((x, y) => availableFirst(x) - availableFirst(y))
          .map((item) => ({
            ...localizeItem(item, languages, locale),
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
      {/* Compact on purpose, phones first: guests come from a QR code and
          are already at the restaurant, so the header is just who it is and
          the controls. The description, hours and map are on About. */}
      <header className="menu-header border-border border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* The logo opens the details page too, like the Details button. */}
            <Link
              href={`${base}/about`}
              aria-label={t("restaurantDetailsButton")}
              className="block shrink-0 transition-transform active:scale-95"
            >
              <RestaurantLogo
                restaurant={restaurantDetails}
                className="h-12 w-12 rounded-xl text-base sm:h-16 sm:w-16 sm:text-xl"
                imageSizes="(min-width: 640px) 64px, 48px"
                priority
              />
            </Link>

            <div className="min-w-0 flex-1">
              {/* Up to three lines: the name is what guests look for first, so
                  it isn't cut short to make room for the controls. */}
              <h1 className="text-foreground line-clamp-3 text-xl leading-tight font-bold break-words text-balance sm:text-3xl">
                {restaurantDetails.name}
              </h1>

              {/* The branch (when there are several), details and socials,
                  as small buttons in one row. */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {isMulti && (
                  <BranchPicker
                    restaurantName={restaurantDetails.name}
                    branches={choices}
                    allHref={`/${restaurantDetails.slug}`}
                    onAll={branch === null}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 max-w-full border-transparent px-2.5 text-xs"
                  />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 rounded-full px-2.5 text-xs font-medium"
                  asChild
                >
                  <Link href={`${base}/about`}>
                    <Info className="h-3.5 w-3.5" aria-hidden />
                    {t("restaurantDetailsButton")}
                  </Link>
                </Button>

                {socialLinks.map(({ url, label, Icon }) => (
                  <Button
                    key={label}
                    variant="secondary"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-7 w-7 rounded-full"
                    asChild
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <PublicPageControls compact className="-me-2 shrink-0" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* Search engines read this; previews of unpublished menus get none. */}
        {isLive(restaurantDetails) && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd(
                restaurantStructuredData({
                  restaurant: {
                    ...restaurantDetails,
                    description: description.text,
                  },
                  categories: menuData.categories,
                  inLanguage: languages
                    ? (contentLanguageOf(languages, locale) ?? undefined)
                    : undefined,
                  pageUrl: `${origin}/${locale}${base}`,
                  branches:
                    isMulti && !branch
                      ? branches.map((b) => ({
                          ...b,
                          name: tMenu("branchTitle", {
                            name: restaurantDetails.name,
                            branch: branchLabel(b, tMenu("mainBranch")),
                          }),
                          url: `${origin}/${locale}/${restaurantDetails.slug}/${b.slug}`,
                        }))
                      : undefined,
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
