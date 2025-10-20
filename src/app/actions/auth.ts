// src/app/actions/auth.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { usersToRestaurants } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

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

/**
 * Checks if the current user is authorized to modify a specific restaurant (ABAC).
 * Authorization is granted if the user is a System Admin OR explicitly assigned to the restaurant.
 * @param {string} restaurantId - The ID of the restaurant resource being accessed.
 * @returns {Promise<void>} Throws an error if access is denied.
 */
export async function checkAuthorization(restaurantId: string): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("401: Authentication required.");
  }

  // Check if the user is a System Admin (Global Override)
  if (await isSystemAdmin()) {
    return; // Admin access granted, bypass resource check
  }

  // Check if the user is explicitly linked to the restaurant (Resource ABAC)
  const hasAccess = await db.query.usersToRestaurants.findFirst({
    where: and(
      eq(usersToRestaurants.userId, userId),
      eq(usersToRestaurants.restaurantId, restaurantId),
      // Optional: You could add a check for accessLevel here, e.g., eq(usersToRestaurants.accessLevel, 'editor')
    ),
  });

  if (!hasAccess) {
    throw new Error("403: Not authorized to modify this restaurant.");
  }
}