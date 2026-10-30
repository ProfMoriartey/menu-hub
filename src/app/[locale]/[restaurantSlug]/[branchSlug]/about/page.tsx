// app/[locale]/[restaurantSlug]/[branchSlug]/about/page.tsx
import { setRequestLocale } from "next-intl/server";
import { AboutPage, aboutPageMetadata } from "../../_pages/about-page";

type Props = { params: Promise<{ locale: string; restaurantSlug: string; branchSlug: string }> };

// Rendered on first visit and cached, like the restaurant's own pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { locale, restaurantSlug, branchSlug } = await params;
  setRequestLocale(locale);
  return aboutPageMetadata({ restaurantSlug, branchSlug });
}

export default async function BranchAboutPage({ params }: Props) {
  const { locale, restaurantSlug, branchSlug } = await params;
  setRequestLocale(locale);
  return <AboutPage restaurantSlug={restaurantSlug} branchSlug={branchSlug} />;
}
