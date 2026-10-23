// src/server/setup-facts.ts
// The data behind the getting-started checklist, for one restaurant or many
// at once (dashboard home, admin list) with one grouped query per table.
import { and, count, inArray, ne, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { categories, menuItems, qrScanDays } from "~/server/db/schema";
import type { SetupFacts } from "~/lib/setup-checklist";

interface RestaurantBasics {
  id: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
}

export async function getSetupFacts(restaurants: RestaurantBasics[]): Promise<Map<string, SetupFacts>> {
  const ids = restaurants.map((r) => r.id);
  const facts = new Map<string, SetupFacts>();
  if (ids.length === 0) return facts;

  const [categoryCounts, itemCounts, scanCounts] = await Promise.all([
    db
      .select({ restaurantId: categories.restaurantId, n: count() })
      .from(categories)
      .where(inArray(categories.restaurantId, ids))
      .groupBy(categories.restaurantId),
    db
      .select({ restaurantId: menuItems.restaurantId, n: count() })
      .from(menuItems)
      .where(and(inArray(menuItems.restaurantId, ids), ne(menuItems.availability, "hidden")))
      .groupBy(menuItems.restaurantId),
    db
      .select({ restaurantId: qrScanDays.restaurantId, n: sql<number>`sum(${qrScanDays.count})::int` })
      .from(qrScanDays)
      .where(inArray(qrScanDays.restaurantId, ids))
      .groupBy(qrScanDays.restaurantId),
  ]);

  const toMap = (rows: { restaurantId: string; n: number }[]) =>
    new Map(rows.map((row) => [row.restaurantId, Number(row.n)]));
  const categoriesBy = toMap(categoryCounts);
  const itemsBy = toMap(itemCounts);
  const scansBy = toMap(scanCounts);

  for (const r of restaurants) {
    facts.set(r.id, {
      hasLogo: Boolean(r.logoUrl),
      hasDescription: Boolean(r.description?.trim()),
      categoryCount: categoriesBy.get(r.id) ?? 0,
      visibleItemCount: itemsBy.get(r.id) ?? 0,
      isActive: r.isActive,
      scanCount: scansBy.get(r.id) ?? 0,
    });
  }
  return facts;
}

export async function getSetupFactsFor(restaurant: RestaurantBasics): Promise<SetupFacts> {
  return (await getSetupFacts([restaurant])).get(restaurant.id)!;
}
