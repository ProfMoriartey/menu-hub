// app/[locale]/[restaurantSlug]/layout.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "~/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getRestaurantBySlug } from "~/server/queries";
import { getRestaurantRole } from "~/app/actions/auth";
import { PreviewBanner } from "~/components/public/PreviewBanner";

interface DynamicPublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}

// A menu that isn't live yet must never show up in search results.
export async function generateMetadata({
  params,
}: Pick<DynamicPublicLayoutProps, "params">): Promise<Metadata> {
  const restaurant = await getRestaurantBySlug((await params).restaurantSlug);
  return restaurant && !restaurant.isActive ? { robots: { index: false, follow: false } } : {};
}

/**
 * @description Public Route Gate for every public menu page (menu, /about,
 * /item). Active restaurants are open to everyone. Inactive ones are only
 * shown, as a preview, to people who can manage them; everyone else is sent
 * to the restaurants list.
 */
export default async function DynamicPublicLayout({
  children,
  params,
}: DynamicPublicLayoutProps) {
  const restaurantSlug = (await params).restaurantSlug;

  // 1. Fetch the restaurant (cached for this request; the pages reuse it)
  const restaurant = await getRestaurantBySlug(restaurantSlug);

  // 2. Check existence
  if (!restaurant) {
    // If the slug doesn't exist, return 404
    return notFound();
  }

  // 3. Live: everyone sees it. (Only inactive menus check who is asking, so
  // the public pages guests visit don't depend on sign-in at all.)
  if (restaurant.isActive) {
    return <>{children}</>;
  }

  // 4. Not live yet: owners, editors and admins get a preview.
  if (await getRestaurantRole(restaurant.id)) {
    return (
      <>
        <PreviewBanner restaurantSlug={restaurant.slug} />
        {children}
      </>
    );
  }

  return redirect({ href: "/restaurants", locale: await getLocale() });
}
