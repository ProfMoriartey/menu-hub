// app/[locale]/[restaurantSlug]/[branchSlug]/page.tsx
import { MenuPage, menuPageMetadata } from "../_pages/menu-page";

type Props = { params: Promise<{ restaurantSlug: string; branchSlug: string }> };

export async function generateMetadata({ params }: Props) {
  return menuPageMetadata(await params);
}

export default async function BranchMenuPage({ params }: Props) {
  return <MenuPage {...await params} />;
}
