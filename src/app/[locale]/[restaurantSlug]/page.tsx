// app/[locale]/[restaurantSlug]/page.tsx
import { MenuPage, menuPageMetadata } from "./_pages/menu-page";

type Props = { params: Promise<{ restaurantSlug: string }> };

export async function generateMetadata({ params }: Props) {
  return menuPageMetadata({ ...(await params), branchSlug: null });
}

export default async function RestaurantMenuPage({ params }: Props) {
  return <MenuPage {...await params} branchSlug={null} />;
}
