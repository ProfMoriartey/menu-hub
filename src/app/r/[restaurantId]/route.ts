// app/r/[restaurantId]/route.ts
//
// Permanent menu links: what printed QR codes point to. They name the
// restaurant by id, which never changes, and forward to its current menu
// address, so renaming the slug never breaks a code on a table. Every scan
// passes through here, so this is also where scans are counted.
import { after, NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { MAIN_BRANCH, withMainBranch } from "~/server/branches";
import { isUuid } from "~/lib/slug";
import { isLikelyBot, recordScan } from "~/server/qr-scans";

// A phone that scans again within this window counts once.
const REPEAT_WINDOW_SECONDS = 30 * 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const { restaurantId } = await params;

  const row = isUuid(restaurantId)
    ? await db.query.restaurants.findFirst({
        where: eq(restaurants.id, restaurantId),
        columns: { id: true, slug: true },
        with: MAIN_BRANCH,
      })
    : undefined;
  const restaurant = row && withMainBranch(row);

  // No language prefix: the next-intl middleware picks the guest's language
  // on the next request. A deleted restaurant goes to the restaurant list.
  const target = new URL(
    restaurant ? `/${restaurant.slug}` : "/menus",
    request.url,
  );

  // Temporary and uncached, so a changed slug takes effect on the next scan.
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "no-store");

  // Count real scans only: not HEAD requests (Next answers them with this
  // handler), not link previews or bots, and not a repeat from the same phone.
  const repeatCookie = "scanned";
  const countable =
    restaurant &&
    request.method === "GET" &&
    !isLikelyBot(request.headers.get("user-agent")) &&
    !request.cookies.has(repeatCookie);

  if (restaurant && countable) {
    // Scoped to this link and holding no data beyond "1".
    response.cookies.set(repeatCookie, "1", {
      path: `/r/${restaurant.id}`,
      maxAge: REPEAT_WINDOW_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: target.protocol === "https:",
    });
    // After the redirect is sent, so guests never wait for the database.
    after(() =>
      recordScan(restaurant.id, restaurant.timeZone).catch((error) =>
        console.error("Failed to record a QR scan:", error),
      ),
    );
  }

  return response;
}
