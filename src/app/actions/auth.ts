// src/app/actions/auth.ts
"use server";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { usersToRestaurants } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { canEditDetails, toAccessLevel, type RestaurantRole } from "~/lib/access";
import { ActionError } from "~/lib/action-result";

/**
 * Checks if the current user is a System Administrator (RBAC).
 * System Admin status is determined by publicMetadata set in Clerk.
 * @returns {Promise<boolean>} True if the user has the 'admin' role.
 */
export async function isSystemAdmin(): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

 const { sessionClaims } = await auth();
 const metadata = sessionClaims && 'metadata' in sessionClaims ? sessionClaims.metadata : null;
 const role = metadata && typeof metadata === 'object' && 'role' in metadata ? metadata.role : null;
 const isAdmin = role === "admin";
 
  return isAdmin;
}

// Once per request: the dashboard layout and the page under it both ask.
const roleFor = cache(async (restaurantId: string): Promise<RestaurantRole | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  if (await isSystemAdmin()) return "admin";

  const link = await db.query.usersToRestaurants.findFirst({
    where: and(
      eq(usersToRestaurants.userId, userId),
      eq(usersToRestaurants.restaurantId, restaurantId),
    ),
    columns: { accessLevel: true },
  });

  return link ? toAccessLevel(link.accessLevel) : null;
});

/**
 * The current user's role for a restaurant: "admin" for system admins,
 * otherwise their assigned access level, or null when they have no access.
 */
export async function getRestaurantRole(restaurantId: string): Promise<RestaurantRole | null> {
  return roleFor(restaurantId);
}

/**
 * Menu changes (categories and items): any assigned user, or a system admin.
 * @param {string} restaurantId - The ID of the restaurant resource being accessed.
 * @returns {Promise<RestaurantRole>} The caller's role. Throws if access is denied.
 */
export async function checkAuthorization(restaurantId: string): Promise<RestaurantRole> {
  const { userId } = await auth();

  if (!userId) {
    throw new ActionError("signInAgain");
  }

  const role = await getRestaurantRole(restaurantId);
  if (!role) {
    throw new ActionError("noAccess");
  }
  return role;
}

/**
 * Restaurant detail changes: owners and system admins only. Editors can
 * manage the menu but not the restaurant itself.
 */
export async function checkOwnerAuthorization(restaurantId: string): Promise<RestaurantRole> {
  const role = await checkAuthorization(restaurantId);
  if (!canEditDetails(role)) {
    throw new ActionError("ownerOnly");
  }
  return role;
}