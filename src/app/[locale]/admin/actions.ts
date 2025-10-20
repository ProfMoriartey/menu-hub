// app/admin/actions.ts
'use server';

import { db } from '~/server/db';
import { usersToRestaurants } from '~/server/db/schema';
import { auth } from '@clerk/nextjs/server';

import { revalidatePath } from 'next/cache'; 
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';

// Server Action now accepts FormData as required by the HTML form method="POST"
export async function assignRestaurantToUser(formData: FormData) {
  // Extract data from the FormData object
  const clerkUserId = formData.get('clerkUserId') as string;
  const restaurantId = formData.get('restaurantId') as string;

  // --- 1. Security Check (RBAC) ---
const { sessionClaims } = await auth();
const metadata = sessionClaims && 'metadata' in sessionClaims ? sessionClaims.metadata : null;
const role = metadata && typeof metadata === 'object' && 'role' in metadata ? metadata.role : null;
const isAdmin = role === "admin";
  if (!isAdmin) {
    // Fail fast and do not proceed with the database operation
    throw new Error("ADMIN ACCESS REQUIRED"); 
  }

  // --- 2. Input Validation (Basic) ---
  if (!clerkUserId || !restaurantId) {
    console.error("Missing required fields for assignment.");
    return; // Return silently
  }

  // --- 3. Perform the assignment (ABAC Setup) ---
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

    console.log(`User ${clerkUserId} assigned to restaurant ${restaurantId}.`);
    // NOTE: Function returns void (no explicit return value) to satisfy Next.js form action typing.
    
    revalidatePath(`/admin/users/${clerkUserId}`); 
    // redirect(`/admin/users/${clerkUserId}`);
  } catch (error) {
    console.error("Assignment error:", error);
    // In a production app, you might log this error and redirect with a failure status.
  }
}

export async function revokeRestaurantAccess(formData: FormData) {
  const clerkUserId = formData.get('clerkUserId') as string;
  const restaurantId = formData.get('restaurantId') as string;

  // 1. Security Check (RBAC) - Reuse the existing admin check logic
  const { sessionClaims } = await auth();
const metadata = sessionClaims && 'metadata' in sessionClaims ? sessionClaims.metadata : null;
const role = metadata && typeof metadata === 'object' && 'role' in metadata ? metadata.role : null;
const isAdmin = role === "admin";

  if (!isAdmin) {
    throw new Error("ADMIN ACCESS REQUIRED");
  }

  // 2. Input Validation
  if (!clerkUserId || !restaurantId) {
    console.error("Missing required fields for revocation.");
    return;
  }

  // 3. Perform the DELETION
  try {
    await db.delete(usersToRestaurants)
      .where(
        and(
          eq(usersToRestaurants.userId, clerkUserId),
          eq(usersToRestaurants.restaurantId, restaurantId)
        )
      );

    console.log(`Access revoked: User ${clerkUserId} from restaurant ${restaurantId}.`);

    // 4. Revalidate and Redirect (CRITICAL for instant UI update)
    revalidatePath(`/admin/users/${clerkUserId}`);
   
  } catch (error) {
    console.error("Revocation error:", error);
  }
}