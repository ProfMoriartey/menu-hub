// src/server/qr-scans.ts
// QR code scan counts: visits to the permanent /r/<id> link, one row per
// restaurant per day. Nothing about the person scanning is stored.
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { qrScanDays } from "~/server/db/schema";

// Days are counted in UTC.
const dayString = (date: Date) => date.toISOString().slice(0, 10);

// Chat apps and social sites fetch a link to show a preview when it's shared;
// those requests aren't scans. A visitor without any user agent isn't a phone.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|skype|linkedin|embedly|vkshare|pinterest|curl|wget|python-requests|headless/i;

export function isLikelyBot(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

/** Adds one scan to today's count for the restaurant. */
export async function recordScan(restaurantId: string): Promise<void> {
  await db
    .insert(qrScanDays)
    .values({ restaurantId, day: dayString(new Date()), count: 1 })
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

export async function getScanStats(restaurantId: string): Promise<ScanStats> {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 29));

  const [recent, [all]] = await Promise.all([
    db
      .select({ day: qrScanDays.day, count: qrScanDays.count })
      .from(qrScanDays)
      .where(and(eq(qrScanDays.restaurantId, restaurantId), gte(qrScanDays.day, dayString(start)))),
    db
      .select({ total: sql<number>`coalesce(sum(${qrScanDays.count}), 0)::int` })
      .from(qrScanDays)
      .where(eq(qrScanDays.restaurantId, restaurantId)),
  ]);

  const byDay = new Map(recent.map((row) => [row.day, row.count]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = dayString(new Date(start.getTime() + i * 86_400_000));
    return { day, count: byDay.get(day) ?? 0 };
  });

  return {
    last7: days.slice(-7).reduce((sum, d) => sum + d.count, 0),
    last30: days.reduce((sum, d) => sum + d.count, 0),
    total: all?.total ?? 0,
    days,
  };
}
