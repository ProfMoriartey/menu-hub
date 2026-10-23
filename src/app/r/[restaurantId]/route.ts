// app/r/[restaurantId]/route.ts
//
// Permanent menu links: what printed QR codes point to. They name the
// restaurant by id, which never changes, and forward to its current menu
// address, so renaming the slug never breaks a code on a table. Every scan
// passes through here, which is also where scan counting would go later.
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { isUuid } from "~/lib/slug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const { restaurantId } = await params;

  const restaurant = isUuid(restaurantId)
    ? await db.query.restaurants.findFirst({
        where: eq(restaurants.id, restaurantId),
        columns: { slug: true },
      })
    : undefined;

  // No language prefix: the next-intl middleware picks the guest's language
  // on the next request. A deleted restaurant goes to the restaurant list.
  const target = new URL(restaurant ? `/${restaurant.slug}` : "/restaurants", request.url);

  // Temporary and uncached, so a changed slug takes effect on the next scan.
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
