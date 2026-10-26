// src/app/actions/restaurant-settings.ts
"use server";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { checkOwnerAuthorization, isSystemAdmin } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { isValidTimeZone, parseOpeningHours } from "~/lib/opening-hours";
import { parseColorTheme } from "~/lib/color-theme";
import { isMenuDesign } from "~/lib/menu-design";
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

/**
 * Owners and admins, once an admin has enabled custom colours: the light
 * and dark palettes. `null` goes back to the site's default colours.
 */
export async function updateColorTheme(
  restaurantId: string,
  theme: unknown,
): Promise<ActionResult> {
  return runAction("saveColorFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    const parsed = theme === null ? null : parseColorTheme(theme);
    if (theme !== null && !parsed) throw new ActionError("invalidColor");
    const row = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: { brandColorEnabled: true },
    });
    if (!row) throw new ActionError("restaurantNotFound");
    if (!row.brandColorEnabled) throw new ActionError("brandColorOff");

    await db
      .update(restaurants)
      .set({
        colorTheme: parsed,
        // A theme (or going back to the defaults) replaces the older single
        // brand colour for good.
        brandColor: null,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}

/**
 * Owners and admins: how the public menu lays out its dishes
 * (lib/menu-design). Unlike custom colours, every restaurant can choose.
 */
export async function updateMenuDesign(
  restaurantId: string,
  design: string,
): Promise<ActionResult> {
  return runAction("saveDesignFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    if (!isMenuDesign(design)) throw new ActionError("invalidDesign");
    await db
      .update(restaurants)
      .set({ theme: design, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurantId));
    revalidatePublicRestaurant(restaurantId);
  });
}
