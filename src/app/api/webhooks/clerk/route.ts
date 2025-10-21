// app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";
import { db } from "~/server/db"; 
import { users } from "~/server/db/schema"; 
import { NextResponse } from "next/server";
import { env } from "~/env"; 

// This handler will not be cached
// export const runtime = "edge"; 

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

  const eventType = evt.type;

  // 4. Handle the user.created event
  if (eventType === "user.created") {
    // Type Narrowing: evt.data is guaranteed to be a UserJSON object here
    const { id, email_addresses, created_at } = evt.data; 

    if (!id) {
      return new Response("Error: Missing user ID in payload", { status: 400 });
    }

    try {
      // Safely insert the new user into your Drizzle table
      await db.insert(users).values({
        id: id, // Clerk ID
        email: email_addresses?.[0]?.email_address, // Use optional chaining for safety
        createdAt: new Date(created_at),
      })
      .onConflictDoNothing();

      console.log(`User ${id} successfully synced to database.`);
    } catch (error) {
      console.error(`Error inserting user ${id} into database:`, error);
      return new Response("Error processing user creation", { status: 500 });
    }
  }
  
  // 5. Respond to Clerk
  return NextResponse.json({ success: true }, { status: 200 });
}
