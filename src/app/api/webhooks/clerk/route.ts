// app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { type UserJSON, type WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { NextResponse } from "next/server";
import { env } from "~/env";

// This handler will not be cached
// export const runtime = "edge";

// The address the user picked as primary, falling back to the first one.
function primaryEmail(user: UserJSON): string | null {
  const primary = user.email_addresses.find((e) => e.id === user.primary_email_address_id);
  return (primary ?? user.email_addresses[0])?.email_address ?? null;
}

export async function POST(req: Request) {
  // 1. Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // Get the raw body for signature verification
  const body = await req.text();

  // 2. Create a new Svix instance with your secret
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not set in environment.");
    return new Response("Error: Server configuration missing secret", { status: 500 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 3. Verify the payload signature
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Invalid signature", { status: 400 });
  }

  // 4. Keep our users table in step with Clerk. A failure returns 500 so
  // Clerk retries the event later.
  try {
    switch (evt.type) {
      // Created and updated both upsert: an update for a user we never
      // stored (e.g. created before the webhook existed) adds them.
      case "user.created":
      case "user.updated": {
        const { id, created_at } = evt.data;
        const email = primaryEmail(evt.data);
        await db
          .insert(users)
          .values({ id, email, createdAt: new Date(created_at) })
          .onConflictDoUpdate({ target: users.id, set: { email } });
        console.log(`User ${id} synced (${evt.type}).`);
        break;
      }

      // Deleting the row also removes their restaurant access (cascade).
      case "user.deleted": {
        const { id } = evt.data;
        if (!id) {
          return new Response("Error: Missing user ID in payload", { status: 400 });
        }
        await db.delete(users).where(eq(users.id, id));
        console.log(`User ${id} deleted.`);
        break;
      }
    }
  } catch (error) {
    console.error(`Error handling ${evt.type}:`, error);
    return new Response(`Error processing ${evt.type}`, { status: 500 });
  }

  // 5. Respond to Clerk
  return NextResponse.json({ success: true }, { status: 200 });
}
