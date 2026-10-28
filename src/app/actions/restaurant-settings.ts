// src/app/actions/restaurant-settings.ts
"use server";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { checkOwnerAuthorization } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { parseColorTheme } from "~/lib/color-theme";
import { isMenuDesign } from "~/lib/menu-design";
import { runAction } from "~/server/run-action";
import { revalidatePublicRestaurant } from "~/server/public-menu";

/*
 * Brand colour and menu design. Owners and admins change them; custom
 * colours come with the restaurant's plan (lib/plans). (Opening
 * hours are per branch: actions/branches.)
 */

/**
 * Owners and admins, when the plan includes custom colours: the light
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
