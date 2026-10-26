// src/server/invites.ts
import { createHash, randomBytes } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "~/server/db";
import { restaurantInvites } from "~/server/db/schema";
import { getPublicOrigin } from "~/server/public-origin";

// Long enough to forward around in a chat and still be used in time, short
// enough that a forgotten link in an old chat stops working.
export const INVITE_DAYS = 7;

// Plenty for one restaurant's staff, low enough to stop a runaway script.
export const MAX_OPEN_INVITES = 20;

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** A new random token for an invitation link, and its stored hash. */
export function newInviteToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

/**
 * The link an owner sends. No language in it: the middleware opens it in
 * the invitee's own language.
 */
export async function inviteUrl(token: string) {
  return `${await getPublicOrigin()}/invite/${token}`;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * "30 October" in the reader's language, for "expires on …". Formatted on
 * the server with a fixed time zone, so the page never differs from what
 * the browser would render.
 */
export function formatInviteDate(date: Date | string, locale: string) {
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** "kaito@gmail.com" → "ka•••@gmail.com": enough to pick the right account. */
export function maskEmail(email: string) {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, Math.min(2, name.length))}•••@${domain}`;
}

/**
 * The signed-in user's verified email addresses, lower-cased. Invitations
 * are only accepted for one of these: an unverified address proves nothing.
 */
export async function getVerifiedEmails(userId: string): Promise<string[]> {
  const user = await (await clerkClient()).users.getUser(userId);
  return user.emailAddresses
    .filter((address) => address.verification?.status === "verified")
    .map((address) => normalizeEmail(address.emailAddress));
}

const inviteColumns = {
  id: true,
  restaurantId: true,
  email: true,
  expiresAt: true,
} as const;

const restaurantColumns = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
} as const;

/** An unexpired invitation by the token in its link, with its restaurant. */
export async function findInviteByToken(token: string) {
  if (!/^[\w-]{20,100}$/.test(token)) return null;
  return (
    (await db.query.restaurantInvites.findFirst({
      where: and(
        eq(restaurantInvites.tokenHash, hashToken(token)),
        gt(restaurantInvites.expiresAt, new Date()),
      ),
      columns: inviteColumns,
      with: { restaurant: { columns: restaurantColumns } },
    })) ?? null
  );
}

/** An unexpired invitation by id, with its restaurant. */
export async function findInviteById(inviteId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(inviteId)) return null;
  return (
    (await db.query.restaurantInvites.findFirst({
      where: and(
        eq(restaurantInvites.id, inviteId),
        gt(restaurantInvites.expiresAt, new Date()),
      ),
      columns: inviteColumns,
      with: { restaurant: { columns: restaurantColumns } },
    })) ?? null
  );
}

/** Unexpired invitations for any of these addresses (the invitee's view). */
export async function findInvitesForEmails(emails: string[]) {
  if (emails.length === 0) return [];
  return db.query.restaurantInvites.findMany({
    where: and(
      inArray(restaurantInvites.email, emails),
      gt(restaurantInvites.expiresAt, new Date()),
    ),
    columns: inviteColumns,
    with: { restaurant: { columns: restaurantColumns } },
  });
}

/**
 * A restaurant's open invitations, oldest first. Expired ones are deleted on
 * the way, so the list and the open-invitation limit only count live links.
 */
export async function getOpenInvites(restaurantId: string) {
  await db
    .delete(restaurantInvites)
    .where(
      and(
        eq(restaurantInvites.restaurantId, restaurantId),
        lte(restaurantInvites.expiresAt, new Date()),
      ),
    );
  return db.query.restaurantInvites.findMany({
    where: eq(restaurantInvites.restaurantId, restaurantId),
    columns: { id: true, email: true, createdAt: true, expiresAt: true },
    orderBy: (invites, { asc }) => [asc(invites.createdAt)],
  });
}

export type OpenInvite = Awaited<ReturnType<typeof getOpenInvites>>[number];
