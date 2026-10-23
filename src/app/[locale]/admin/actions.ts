// app/admin/actions.ts
'use server';

import { db } from '~/server/db';
import { users, usersToRestaurants } from '~/server/db/schema';
import { isSystemAdmin } from '~/app/actions/auth';
import { ACCESS_LEVELS, type AccessLevel } from '~/lib/access';
import { ActionError, type ActionResult } from '~/lib/action-result';
import { runAction } from '~/server/run-action';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';

async function requireAdmin() {
  if (!(await isSystemAdmin())) {
    throw new ActionError('adminOnly');
  }
}

function requireAccessLevel(value: string): AccessLevel {
  if (!(ACCESS_LEVELS as readonly string[]).includes(value)) {
    throw new ActionError('unknownAccessLevel');
  }
  return value as AccessLevel;
}

// Assigning an existing pair updates its access level instead.
export async function assignRestaurantToUser(
  clerkUserId: string,
  restaurantId: string,
  accessLevel: string,
): Promise<ActionResult> {
  return runAction("grantAccessFailed", async () => {
    await requireAdmin();
    const level = requireAccessLevel(accessLevel);

    if (!clerkUserId || !restaurantId) {
      throw new ActionError('pickRestaurant');
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

    revalidatePath('/[locale]/admin', 'layout');
  });
}

export async function revokeRestaurantAccess(
  clerkUserId: string,
  restaurantId: string,
): Promise<ActionResult> {
  return runAction("removeAccessFailed", async () => {
    await requireAdmin();

    if (!clerkUserId || !restaurantId) {
      throw new ActionError('missingRestaurant');
    }

    await db.delete(usersToRestaurants)
      .where(
        and(
          eq(usersToRestaurants.userId, clerkUserId),
          eq(usersToRestaurants.restaurantId, restaurantId)
        )
      );

    revalidatePath('/[locale]/admin', 'layout');
  });
}

/**
 * Deletes the user's Clerk account (they can no longer sign in) and their
 * row here, which also removes all their restaurant access (cascade).
 * The user.deleted webhook that Clerk sends afterwards finds nothing left.
 */
export async function deleteUser(clerkUserId: string): Promise<ActionResult> {
  return runAction("deleteUserFailed", async () => {
    await requireAdmin();
    if (!clerkUserId) throw new ActionError('missingUser');

    const { userId: currentUserId } = await auth();
    if (clerkUserId === currentUserId) {
      throw new ActionError("cantDeleteSelf");
    }

    const client = await clerkClient();
    try {
      const clerkUser = await client.users.getUser(clerkUserId);
      if (clerkUser.publicMetadata?.role === 'admin') {
        throw new ActionError('cantDeleteAdmin');
      }
      await client.users.deleteUser(clerkUserId);
    } catch (error) {
      // Already gone from Clerk: still remove what's left in our database.
      const notFound = isClerkAPIResponseError(error) && error.status === 404;
      if (!notFound) throw error;
    }

    await db.delete(users).where(eq(users.id, clerkUserId));
    // No revalidatePath: it would re-render the deleted user's page as a 404
    // before the caller navigates back to the (per-request) users list.
  });
}
