// app/[locale]/[restaurantSlug]/preview/route.ts
// The dashboard's "Preview" and "View live menu" links. Public menus are
// cached and sent to every guest the same, so they never look at who is
// asking. For a menu that isn't live yet (or is paused), this turns on draft
// mode for people who can manage it: their requests skip the cache and the
// menu layout shows them the preview. Everyone else just lands on the menu.
import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getRestaurantRole } from "~/app/actions/auth";
import { getRestaurantBySlug } from "~/server/public-menu";
import { isLive } from "~/lib/access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; restaurantSlug: string }> },
) {
  const { locale, restaurantSlug } = await params;
  const restaurant = await getRestaurantBySlug(restaurantSlug);

  if (
    restaurant &&
    !isLive(restaurant) &&
    (await getRestaurantRole(restaurant.id))
  ) {
    (await draftMode()).enable();
  }

  return NextResponse.redirect(
    new URL(`/${locale}/${restaurantSlug}`, request.url),
  );
}
