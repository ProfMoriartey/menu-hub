// app/admin/actions.ts
'use server';

import { db } from '~/server/db';
import { usersToRestaurants } from '~/server/db/schema';
import { isSystemAdmin } from '~/app/actions/auth';
import { ACCESS_LEVELS, type AccessLevel } from '~/lib/access';
import { ActionError, runAction, type ActionResult } from '~/lib/action-result';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';

async function requireAdmin() {
  if (!(await isSystemAdmin())) {
    throw new ActionError('Only system administrators can change restaurant access.');
  }
}

function requireAccessLevel(value: string): AccessLevel {
  if (!(ACCESS_LEVELS as readonly string[]).includes(value)) {
    throw new ActionError('Unknown access level.');
  }
  return value as AccessLevel;
}

// Assigning an existing pair updates its access level instead.
export async function assignRestaurantToUser(
  clerkUserId: string,
  restaurantId: string,
  accessLevel: string,
): Promise<ActionResult> {
  return runAction("Couldn't give access to that restaurant.", async () => {
    await requireAdmin();
    const level = requireAccessLevel(accessLevel);

    if (!clerkUserId || !restaurantId) {
      throw new ActionError('Pick a restaurant to give access to.');
    }

    await db.insert(usersToRestaurants)
      .values({
        userId: clerkUserId,
        restaurantId: restaurantId,
        accessLevel: level,
      })
      .onConflictDoUpdate({
        target: [usersToRestaurants.userId, usersToRestaurants.restaurantId],
        set: { accessLevel: level },
      });

    revalidatePath('/[locale]/admin/users', 'layout');
  });
}

export async function revokeRestaurantAccess(
  clerkUserId: string,
  restaurantId: string,
): Promise<ActionResult> {
  return runAction("Couldn't remove access.", async () => {
    await requireAdmin();

    if (!clerkUserId || !restaurantId) {
      throw new ActionError('Missing user or restaurant.');
    }

    await db.delete(usersToRestaurants)
      .where(
        and(
          eq(usersToRestaurants.userId, clerkUserId),
          eq(usersToRestaurants.restaurantId, restaurantId)
        )
      );

    revalidatePath('/[locale]/admin/users', 'layout');
  });
}
