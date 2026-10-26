// src/server/qr-scans.ts
// QR code scan counts: visits to the permanent /r/<id> link, one row per
// restaurant per day. Nothing about the person scanning is stored.
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { qrScanDays } from "~/server/db/schema";
import { zonedDay } from "~/lib/opening-hours";

// Days are counted in the restaurant's time zone once it has one (set with
// its opening hours), so a late-evening scan counts on the guest's day.
// Without one they are UTC days, as they always were.
const DAY_MS = 86_400_000;
const shiftDay = (day: string, days: number) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);

// Chat apps and social sites fetch a link to show a preview when it's shared;
// those requests aren't scans. A visitor without any user agent isn't a phone.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|skype|linkedin|embedly|vkshare|pinterest|curl|wget|python-requests|headless/i;

export function isLikelyBot(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

/** Adds one scan to today's count for the restaurant. */
export async function recordScan(
  restaurantId: string,
  timeZone: string | null,
): Promise<void> {
  await db
    .insert(qrScanDays)
    .values({ restaurantId, day: zonedDay(new Date(), timeZone), count: 1 })
    .onConflictDoUpdate({
      target: [qrScanDays.restaurantId, qrScanDays.day],
      set: { count: sql`${qrScanDays.count} + 1` },
    });
}

export interface ScanStats {
  last7: number;
  last30: number;
  total: number;
  // The last 30 days, oldest first, with zeros for days without scans.
  days: { day: string; count: number }[];
}

export async function getScanStats(
  restaurantId: string,
  timeZone: string | null,
): Promise<ScanStats> {
  const start = shiftDay(zonedDay(new Date(), timeZone), -29);

  const [recent, [all]] = await Promise.all([
    db
      .select({ day: qrScanDays.day, count: qrScanDays.count })
      .from(qrScanDays)
      .where(
        and(
          eq(qrScanDays.restaurantId, restaurantId),
          gte(qrScanDays.day, start),
        ),
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${qrScanDays.count}), 0)::int`,
      })
      .from(qrScanDays)
      .where(eq(qrScanDays.restaurantId, restaurantId)),
  ]);

  const byDay = new Map(recent.map((row) => [row.day, row.count]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = shiftDay(start, i);
    return { day, count: byDay.get(day) ?? 0 };
  });

  return {
    last7: days.slice(-7).reduce((sum, d) => sum + d.count, 0),
    last30: days.reduce((sum, d) => sum + d.count, 0),
    total: all?.total ?? 0,
    days,
  };
}
