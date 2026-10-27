// app/[locale]/[restaurantSlug]/[branchSlug]/about/page.tsx
import { AboutPage, aboutPageMetadata } from "../../_pages/about-page";

type Props = { params: Promise<{ restaurantSlug: string; branchSlug: string }> };

export async function generateMetadata({ params }: Props) {
  return aboutPageMetadata(await params);
}

export default async function BranchAboutPage({ params }: Props) {
  return <AboutPage {...await params} />;
}
