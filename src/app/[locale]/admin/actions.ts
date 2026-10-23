// app/admin/actions.ts
'use server';

import { db } from '~/server/db';
import { usersToRestaurants } from '~/server/db/schema';
import { isSystemAdmin } from '~/app/actions/auth';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';

async function requireAdmin() {
  if (!(await isSystemAdmin())) {
    throw new Error('Only system administrators can change restaurant access.');
  }
}

// Errors are thrown so the admin page can show them next to the action.
export async function assignRestaurantToUser(clerkUserId: string, restaurantId: string) {
  await requireAdmin();

  if (!clerkUserId || !restaurantId) {
    throw new Error('Pick a restaurant to give access to.');
  }

  try {
    await db.insert(usersToRestaurants)
      .values({
        userId: clerkUserId,
        restaurantId: restaurantId,
        accessLevel: 'editor', // Default access
      })
      // Use onConflictDoUpdate to handle cases where a user is already assigned
      .onConflictDoUpdate({
        target: [usersToRestaurants.userId, usersToRestaurants.restaurantId],
        set: { accessLevel: 'editor' },
      });
  } catch (error) {
    console.error('Assignment error:', error);
    throw new Error("Couldn't give access to that restaurant.");
  }

  revalidatePath('/[locale]/admin/users', 'layout');
}

export async function revokeRestaurantAccess(clerkUserId: string, restaurantId: string) {
  await requireAdmin();

  if (!clerkUserId || !restaurantId) {
    throw new Error('Missing user or restaurant.');
  }

  try {
    await db.delete(usersToRestaurants)
      .where(
        and(
          eq(usersToRestaurants.userId, clerkUserId),
          eq(usersToRestaurants.restaurantId, restaurantId)
        )
      );
  } catch (error) {
    console.error('Revocation error:', error);
    throw new Error("Couldn't remove access.");
  }

  revalidatePath('/[locale]/admin/users', 'layout');
}
