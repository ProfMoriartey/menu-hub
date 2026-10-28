// src/server/plan-requests.ts
// Reads for owners' requests to an admin (schema.ts planRequests): new
// restaurants waiting for approval and plan changes.
import { and, count, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "~/server/db";
import { planRequests } from "~/server/db/schema";

export type PlanRequestRow = typeof planRequests.$inferSelect;

/** How many requests wait for an admin: the admin menu's count. */
export async function countOpenRequests(): Promise<number> {
  const [row] = await db.select({ n: count() }).from(planRequests).where(isNull(planRequests.resolution));
  return row?.n ?? 0;
}

/**
 * Open requests, or the latest 50 dealt with, newest first, with their
 * restaurant and who asked.
 */
export function getPlanRequests({ open }: { open: boolean }) {
  return db.query.planRequests.findMany({
    where: open ? isNull(planRequests.resolution) : isNotNull(planRequests.resolution),
    orderBy: [desc(open ? planRequests.createdAt : planRequests.resolvedAt)],
    limit: open ? undefined : 50,
    with: {
      restaurant: { columns: { id: true, name: true, slug: true, logoUrl: true } },
      requester: { columns: { email: true } },
    },
  });
}

/**
 * Whether the restaurant may go live: not while its sign-up is waiting for
 * an admin, or was dismissed. Restaurants an admin created have no sign-up.
 */
export async function isApprovedToPublish(restaurantId: string): Promise<boolean> {
  const signup = await db.query.planRequests.findFirst({
    where: and(eq(planRequests.restaurantId, restaurantId), eq(planRequests.kind, "signup")),
    orderBy: [desc(planRequests.createdAt)],
    columns: { resolution: true },
  });
  return !signup || signup.resolution === "approved";
}

/** The restaurant's open requests (its sign-up, a plan change), for its owner. */
export function getOpenRequestsFor(restaurantId: string) {
  return db.query.planRequests.findMany({
    where: and(eq(planRequests.restaurantId, restaurantId), isNull(planRequests.resolution)),
    orderBy: [desc(planRequests.createdAt)],
    columns: { id: true, kind: true, tier: true, billingCycle: true, createdAt: true },
  });
}
