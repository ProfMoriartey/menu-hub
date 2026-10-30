// app/[locale]/[restaurantSlug]/[branchSlug]/page.tsx
import { setRequestLocale } from "next-intl/server";
import { MenuPage, menuPageMetadata } from "../_pages/menu-page";

type Props = { params: Promise<{ locale: string; restaurantSlug: string; branchSlug: string }> };

// Rendered on first visit and cached, like the restaurant's own pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { locale, restaurantSlug, branchSlug } = await params;
  setRequestLocale(locale);
  return menuPageMetadata({ restaurantSlug, branchSlug });
}

export default async function BranchMenuPage({ params }: Props) {
  const { locale, restaurantSlug, branchSlug } = await params;
  setRequestLocale(locale);
  return <MenuPage restaurantSlug={restaurantSlug} branchSlug={branchSlug} />;
}
