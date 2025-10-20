// app/admin/actions.ts
'use server';

import { db } from '~/server/db';
import { usersToRestaurants } from '~/server/db/schema';
import { auth } from '@clerk/nextjs/server';

export async function assignRestaurantToUser(clerkUserId: string, restaurantId: string) {
  // 1. HIGHLY CRITICAL: Ensure the caller is an admin
const { sessionClaims } = await auth();
const metadata = sessionClaims && 'metadata' in sessionClaims ? sessionClaims.metadata : null;
const role = metadata && typeof metadata === 'object' && 'role' in metadata ? metadata.role : null;
const isAdmin = role === "admin";
  if (!isAdmin) {
    throw new Error("ADMIN ACCESS REQUIRED"); // Fail fast
  }

  // 2. Perform the assignment (Resource-level ABAC setup)
  try {
    await db.insert(usersToRestaurants)
      .values({
        userId: clerkUserId,
        restaurantId: restaurantId,
        accessLevel: 'editor', // Default access
      })
      // Use onConflict to handle cases where a user is already assigned
      .onConflictDoUpdate({
        target: [usersToRestaurants.userId, usersToRestaurants.restaurantId],
        set: { accessLevel: 'editor' }, 
      });

    return { success: true, message: `User ${clerkUserId} assigned to restaurant ${restaurantId}.` };

  } catch (error) {
    console.error("Assignment error:", error);
    return { success: false, message: "Failed to assign restaurant." };
  }
}