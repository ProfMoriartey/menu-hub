// src/app/actions/team.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import {
  restaurantInvites,
  users,
  usersToRestaurants,
} from "~/server/db/schema";
import { checkOwnerAuthorization } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { toAccessLevel } from "~/lib/access";
import { runAction } from "~/server/run-action";
import {
  INVITE_DAYS,
  MAX_OPEN_INVITES,
  findInviteById,
  formatInviteDate,
  getVerifiedEmails,
  inviteUrl,
  newInviteToken,
  normalizeEmail,
} from "~/server/invites";

/*
 * Owners manage their own team: they invite editors by link and remove them;
 * editors can leave. Owners themselves are only added or removed by a system
 * admin (admin People tab), so one owner can never lock another out.
 */

// The dashboard Team tab and the admin People tab both list team members.
const revalidateTeamPages = () => revalidatePath("/[locale]/(site)", "layout");

const emailSchema = z.string().trim().email().max(256);

export interface CreatedInvite {
  url: string;
  // `expires` is formatted for the owner's language (see formatInviteDate).
  invite: { id: string; email: string; expires: string };
}

/**
 * Makes an invitation link for an editor. Inviting the same address again
 * replaces the old link, which stops working. The link is returned only
 * here: the database keeps just a hash of it.
 */
export async function createRestaurantInvite(
  restaurantId: string,
  rawEmail: string,
): Promise<ActionResult<CreatedInvite>> {
  return runAction("createInviteFailed", async () => {
    const role = await checkOwnerAuthorization(restaurantId);
    const parsed = emailSchema.safeParse(rawEmail);
    if (!parsed.success) throw new ActionError("invalidEmail");
    const email = normalizeEmail(parsed.data);

    const member = await db
      .select({ userId: usersToRestaurants.userId })
      .from(usersToRestaurants)
      .innerJoin(users, eq(users.id, usersToRestaurants.userId))
      .where(
        and(
          eq(usersToRestaurants.restaurantId, restaurantId),
          eq(users.email, email),
        ),
      )
      .limit(1);
    if (member.length > 0) throw new ActionError("alreadyMember");

    const [open] = await db
      .select({ n: count() })
      .from(restaurantInvites)
      .where(
        and(
          eq(restaurantInvites.restaurantId, restaurantId),
          gt(restaurantInvites.expiresAt, new Date()),
        ),
      );
    const replacing = await db.query.restaurantInvites.findFirst({
      where: and(
        eq(restaurantInvites.restaurantId, restaurantId),
        eq(restaurantInvites.email, email),
      ),
      columns: { id: true },
    });
    if (!replacing && (open?.n ?? 0) >= MAX_OPEN_INVITES) {
      throw new ActionError("tooManyInvites", { max: MAX_OPEN_INVITES });
    }

    const { userId } = await auth();
    const { token, tokenHash } = newInviteToken();
    const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
    const [invite] = await db
      .insert(restaurantInvites)
      .values({
        restaurantId,
        email,
        tokenHash,
        // System admins may have no row in users; the field is informational.
        invitedBy: role === "admin" ? null : userId,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [restaurantInvites.restaurantId, restaurantInvites.email],
        set: { tokenHash, expiresAt, createdAt: new Date() },
      })
      .returning({ id: restaurantInvites.id });
    if (!invite) throw new ActionError("createInviteFailed");

    revalidateTeamPages();
    return {
      url: await inviteUrl(token),
      invite: {
        id: invite.id,
        email,
        expires: formatInviteDate(expiresAt, await getLocale()),
      },
    };
  });
}

export async function cancelRestaurantInvite(
  restaurantId: string,
  inviteId: string,
): Promise<ActionResult> {
  return runAction("cancelInviteFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    await db
      .delete(restaurantInvites)
      .where(
        and(
          eq(restaurantInvites.id, inviteId),
          eq(restaurantInvites.restaurantId, restaurantId),
        ),
      );
    revalidateTeamPages();
  });
}

/** Removes an editor. Owners can only be removed by a system admin. */
export async function removeRestaurantEditor(
  restaurantId: string,
  memberId: string,
): Promise<ActionResult> {
  return runAction("removeAccessFailed", async () => {
    await checkOwnerAuthorization(restaurantId);
    const where = and(
      eq(usersToRestaurants.restaurantId, restaurantId),
      eq(usersToRestaurants.userId, memberId),
    );
    const link = await db.query.usersToRestaurants.findFirst({
      where,
      columns: { accessLevel: true },
    });
    if (!link) throw new ActionError("memberNotFound");
    if (toAccessLevel(link.accessLevel) === "owner")
      throw new ActionError("ownersByAdminOnly");

    await db.delete(usersToRestaurants).where(where);
    revalidateTeamPages();
  });
}

/**
 * An editor leaves a restaurant. Owners can't: a restaurant should always
 * keep someone who can manage it, so an admin changes owners.
 */
export async function leaveRestaurant(
  restaurantId: string,
): Promise<ActionResult> {
  return runAction("removeAccessFailed", async () => {
    const { userId } = await auth();
    if (!userId) throw new ActionError("signInAgain");
    const where = and(
      eq(usersToRestaurants.restaurantId, restaurantId),
      eq(usersToRestaurants.userId, userId),
    );
    const link = await db.query.usersToRestaurants.findFirst({
      where,
      columns: { accessLevel: true },
    });
    if (!link) throw new ActionError("noAccess");
    if (toAccessLevel(link.accessLevel) === "owner")
      throw new ActionError("ownerCantLeave");

    await db.delete(usersToRestaurants).where(where);
    revalidateTeamPages();
  });
}

/**
 * The invitation, if the signed-in user may answer it: it must still be
 * open and addressed to one of their verified email addresses. Holding the
 * link (or knowing the id) is not enough on its own.
 */
async function inviteForCurrentUser(inviteId: string) {
  const { userId } = await auth();
  if (!userId) throw new ActionError("signInAgain");
  const invite = await findInviteById(inviteId);
  if (!invite) throw new ActionError("inviteInvalid");
  if (!(await getVerifiedEmails(userId)).includes(invite.email)) {
    throw new ActionError("inviteWrongAccount");
  }
  return { userId, invite };
}

/** Joins the restaurant as an editor; returns its slug for the redirect. */
export async function acceptRestaurantInvite(
  inviteId: string,
): Promise<ActionResult<{ slug: string }>> {
  return runAction("respondInviteFailed", async () => {
    const { userId, invite } = await inviteForCurrentUser(inviteId);

    await db.transaction(async (tx) => {
      // Someone who signed up a moment ago may not be in our users table
      // yet (the Clerk webhook fills it in, email included, shortly after).
      await tx.insert(users).values({ id: userId }).onConflictDoNothing();
      // Already on the team (e.g. an owner)? Keep their current role.
      await tx
        .insert(usersToRestaurants)
        .values({
          userId,
          restaurantId: invite.restaurantId,
          accessLevel: "editor",
        })
        .onConflictDoNothing();
      await tx
        .delete(restaurantInvites)
        .where(eq(restaurantInvites.id, invite.id));
    });

    revalidateTeamPages();
    return { slug: invite.restaurant.slug };
  });
}

export async function declineRestaurantInvite(
  inviteId: string,
): Promise<ActionResult> {
  return runAction("respondInviteFailed", async () => {
    const { invite } = await inviteForCurrentUser(inviteId);
    await db
      .delete(restaurantInvites)
      .where(eq(restaurantInvites.id, invite.id));
    revalidateTeamPages();
  });
}
