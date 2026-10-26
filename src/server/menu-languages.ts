// src/server/menu-languages.ts
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurants } from "~/server/db/schema";
import { menuLanguagesOf, type MenuLanguages } from "~/lib/menu-languages";

/** A restaurant's menu languages, or null when translations are off. */
export async function getMenuLanguages(
  restaurantId: string,
): Promise<MenuLanguages | null> {
  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
    columns: {
      multilingualEnabled: true,
      mainLanguage: true,
      extraLanguages: true,
    },
  });
  return row ? menuLanguagesOf(row) : null;
}
