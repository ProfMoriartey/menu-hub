// src/server/clerk-profiles.ts
import { clerkClient } from "@clerk/nextjs/server";

// Profile details that only Clerk knows; our users table keeps id and email.
export interface ClerkProfile {
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  lastSignInAt: number | null;
  isAdmin: boolean;
}

const BATCH_SIZE = 100;

/**
 * Looks up Clerk profiles for the given user ids. Users Clerk doesn't know
 * are missing from the map. If Clerk can't be reached the map is empty, so
 * pages fall back to what the database has.
 */
export async function getClerkProfiles(userIds: string[]): Promise<Map<string, ClerkProfile>> {
  const profiles = new Map<string, ClerkProfile>();
  if (userIds.length === 0) return profiles;

  try {
    const client = await clerkClient();
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const { data } = await client.users.getUserList({
        userId: userIds.slice(i, i + BATCH_SIZE),
        limit: BATCH_SIZE,
      });
      for (const user of data) {
        profiles.set(user.id, {
          name: user.fullName ?? user.username,
          email: user.primaryEmailAddress?.emailAddress ?? null,
          // Without an upload Clerk serves a generated avatar; our initials look better.
          imageUrl: user.hasImage ? user.imageUrl : null,
          lastSignInAt: user.lastSignInAt,
          isAdmin: user.publicMetadata?.role === "admin",
        });
      }
    }
  } catch (error) {
    console.error("Failed to load Clerk profiles:", error);
  }

  return profiles;
}
