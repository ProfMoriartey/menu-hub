// app/[locale]/[restaurantSlug]/about/page.tsx
import { setRequestLocale } from "next-intl/server";
import { AboutPage, aboutPageMetadata } from "../_pages/about-page";

type Props = { params: Promise<{ locale: string; restaurantSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, restaurantSlug } = await params;
  setRequestLocale(locale);
  return aboutPageMetadata({ restaurantSlug, branchSlug: null });
}

export default async function RestaurantAboutPage({ params }: Props) {
  const { locale, restaurantSlug } = await params;
  setRequestLocale(locale);
  return <AboutPage restaurantSlug={restaurantSlug} branchSlug={null} />;
}
