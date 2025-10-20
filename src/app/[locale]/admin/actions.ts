// app/admin/actions.ts
'use server';

import { db } from '~/server/db';
import { usersToRestaurants } from '~/server/db/schema';
import { auth } from '@clerk/nextjs/server';

export async function assignRestaurantToUser(clerkUserId: string, restaurantId: string) {
  // 1. HIGHLY CRITICAL: Ensure the caller is an admin
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";
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