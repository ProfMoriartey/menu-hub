// src/app/actions/onboarding.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, like } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import {
  billingDetails,
  planRequests,
  restaurantBilling,
  restaurants,
  users,
  usersToRestaurants,
} from "~/server/db/schema";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { isCountryCode } from "~/lib/countries";
import { addMonths, billingToday, SIGNUP_PAYMENT_METHODS } from "~/lib/billing";
import { billingDetailsErrors, billingDetailsSchema, normalizeBillingDetails } from "~/lib/billing-details";
import { FREE_MONTHS, isOfferedTier } from "~/lib/plans";
import { RESERVED_SLUGS } from "~/lib/schemas";
import { slugify, uniqueSlug } from "~/lib/slug";
import { isVenueType } from "~/lib/venue-types";
import { saveMainBranch } from "~/server/branches";
import { syncEntitlements } from "~/server/plans";
import { revalidatePublicRestaurant } from "~/server/public-menu";
import { runAction } from "~/server/run-action";

/*
 * Sign-up: someone creates their own restaurant, picking a plan and how
 * they'd like to pay. They own it and can build the menu and put it live
 * straight away: the first FREE_MONTHS are free, then the menu goes
 * offline until an admin records a payment (server/plans). The sign-up is
 * kept, already approved, for the admin's records. One per account: more
 * restaurants go through an admin.
 */

const startSchema = z.object({
  name: z.string().trim().min(1).max(256),
  typeOfEstablishment: z.string().refine((v) => v === "" || isVenueType(v)),
  currency: z.string().regex(/^[A-Z]{3}$/),
  city: z.string().trim().max(128),
  country: z.string().refine(isCountryCode),
  phone: z.string().trim().min(5).max(50),
  tier: z.string().refine(isOfferedTier),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.enum(SIGNUP_PAYMENT_METHODS),
  note: z.string().trim().max(1000),
  // Who invoices go to: new details, or a copy of those of another
  // restaurant the person owns.
  billing: z.union([z.object({ reuseFrom: z.string().uuid() }), billingDetailsSchema]),
});

export async function createOwnRestaurant(input: unknown): Promise<ActionResult<{ slug: string }>> {
  return runAction("createOwnRestaurantFailed", async () => {
    const { userId } = await auth();
    if (!userId) throw new ActionError("signInAgain");
    const parsed = startSchema.safeParse(input);
    if (!parsed.success) throw new ActionError("invalidInput");
    const data = parsed.data;
    const billing = await billingFor(userId, data.billing);

    // One free start per account (a sign-up dismissed by an admin counts).
    const earlier = await db.query.planRequests.findFirst({
      where: and(eq(planRequests.requestedBy, userId), eq(planRequests.kind, "signup")),
      columns: { id: true },
    });
    if (earlier) throw new ActionError("restaurantLimit");

    // The menu address comes from the name, with a number when it's
    // taken; owners don't choose it (an admin can change it later).
    const base = slugify(data.name) || "restaurant";
    const similar = await db
      .select({ slug: restaurants.slug })
      .from(restaurants)
      .where(like(restaurants.slug, `${base}%`));
    const slug = uniqueSlug(data.name, [...RESERVED_SLUGS, ...similar.map((r) => r.slug)], "restaurant");

    // The Clerk webhook normally adds the account; it may not have yet.
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null;
    await db.insert(users).values({ id: userId, email }).onConflictDoNothing();

    const restaurantId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(restaurants)
        .values({
          name: data.name,
          slug,
          typeOfEstablishment: data.typeOfEstablishment || null,
          currency: data.currency,
          isActive: false,
          isDisplayed: false,
        })
        .returning({ id: restaurants.id });
      const id = created!.id;
      await saveMainBranch(tx, id, {
        city: data.city || null,
        country: data.country,
        phoneNumber: data.phone,
      });
      await tx.insert(usersToRestaurants).values({ userId, restaurantId: id, accessLevel: "owner" });
      // Billing starts once the free months are over.
      await tx.insert(restaurantBilling).values({
        restaurantId: id,
        tier: data.tier,
        billingCycle: data.billingCycle,
        startsOn: addMonths(billingToday(), FREE_MONTHS),
        offlineWhenUnpaid: true,
      });
      await tx.insert(billingDetails).values({ restaurantId: id, ...billing, updatedBy: userId });
      await tx.insert(planRequests).values({
        restaurantId: id,
        kind: "signup",
        tier: data.tier,
        billingCycle: data.billingCycle,
        paymentMethod: data.paymentMethod,
        contactPhone: data.phone,
        note: data.note || null,
        requestedBy: userId,
        resolution: "approved",
        resolvedAt: new Date(),
      });
      return id;
    });

    // The plan's features, so they can build with them right away, and
    // the last free day.
    await syncEntitlements(restaurantId);
    revalidatePublicRestaurant(restaurantId);
    return { slug };
  });
}

/**
 * The billing details to save with a new restaurant: those sent, once
 * checked, or a copy of another restaurant's that this person owns.
 */
async function billingFor(userId: string, billing: z.infer<typeof startSchema>["billing"]) {
  if (!("reuseFrom" in billing)) {
    if (Object.keys(billingDetailsErrors(billing)).length > 0) throw new ActionError("invalidInput");
    return normalizeBillingDetails(billing);
  }
  const owned = await db.query.usersToRestaurants.findFirst({
    where: and(
      eq(usersToRestaurants.userId, userId),
      eq(usersToRestaurants.restaurantId, billing.reuseFrom),
      eq(usersToRestaurants.accessLevel, "owner"),
    ),
    columns: { restaurantId: true },
  });
  const source =
    owned &&
    (await db.query.billingDetails.findFirst({
      where: eq(billingDetails.restaurantId, billing.reuseFrom),
    }));
  if (!source) throw new ActionError("invalidInput");
  return {
    kind: source.kind,
    legalName: source.legalName,
    taxNumber: source.taxNumber,
    taxOffice: source.taxOffice,
    address: source.address,
    city: source.city,
    postalCode: source.postalCode,
    country: source.country,
    invoiceEmail: source.invoiceEmail,
    phone: source.phone,
  };
}
