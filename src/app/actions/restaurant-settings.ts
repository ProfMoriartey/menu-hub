// src/app/actions/restaurant-settings.ts
"use server";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { checkOwnerAuthorization, isSystemAdmin } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { isValidTimeZone, parseOpeningHours } from "~/lib/opening-hours";
import { isBrandColor } from "~/lib/brand-color";
import { runAction } from "~/server/run-action";
import { revalidatePublicRestaurant } from "~/server/public-menu";

/*
 * Opening hours, time zone and brand colour. Owners and admins change them;
 * the brand colour is a feature a system admin turns on per restaurant.
 */

/**
 * The time zone (needed for "open now" and for which day a QR scan counts
 * on) and the weekly hours. `hours: null` removes them from the public pages.
 */
export async function updateOpeningHours(
  restaurantId: string,
  input: { timeZone: string; hours: unknown },
): Promise<ActionResult> {
  return runAction("saveHoursFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    if (!isValidTimeZone(input.timeZone))
      throw new ActionError("invalidTimeZone");
    const hours = input.hours === null ? null : parseOpeningHours(input.hours);
    if (input.hours !== null && !hours) throw new ActionError("invalidHours");

    await db
      .update(restaurants)
      .set({
        timeZone: input.timeZone,
        openingHours: hours,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}

/** Admin only. Off goes back to the theme's colour but keeps the choice. */
export async function setBrandColorEnabled(
  restaurantId: string,
  enabled: boolean,
): Promise<ActionResult> {
  return runAction("saveColorFailed", async () => {
    if (!(await isSystemAdmin())) throw new ActionError("adminOnly");
    await db
      .update(restaurants)
      .set({ brandColorEnabled: enabled === true, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}

/** Owners and admins, once enabled. `null` goes back to the theme's colour. */
export async function updateBrandColor(
  restaurantId: string,
  color: string | null,
): Promise<ActionResult> {
  return runAction("saveColorFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    if (color !== null && !isBrandColor(color))
      throw new ActionError("invalidColor");
    const row = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: { brandColorEnabled: true },
    });
    if (!row) throw new ActionError("restaurantNotFound");
    if (!row.brandColorEnabled) throw new ActionError("brandColorOff");

    await db
      .update(restaurants)
      .set({ brandColor: color?.toLowerCase() ?? null, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}
