// app/[locale]/[restaurantSlug]/page.tsx
import { setRequestLocale } from "next-intl/server";
import { MenuPage, menuPageMetadata } from "./_pages/menu-page";

type Props = { params: Promise<{ locale: string; restaurantSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, restaurantSlug } = await params;
  setRequestLocale(locale);
  return menuPageMetadata({ restaurantSlug, branchSlug: null });
}

export default async function RestaurantMenuPage({ params }: Props) {
  const { locale, restaurantSlug } = await params;
  setRequestLocale(locale);
  return <MenuPage restaurantSlug={restaurantSlug} branchSlug={null} />;
}
