// app/[locale]/[restaurantSlug]/about/page.tsx
import { AboutPage, aboutPageMetadata } from "../_pages/about-page";

type Props = { params: Promise<{ restaurantSlug: string }> };

export async function generateMetadata({ params }: Props) {
  return aboutPageMetadata({ ...(await params), branchSlug: null });
}

export default async function RestaurantAboutPage({ params }: Props) {
  return <AboutPage {...await params} branchSlug={null} />;
}
