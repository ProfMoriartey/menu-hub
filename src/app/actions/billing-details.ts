// src/app/actions/billing-details.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "~/server/db";
import { billingDetails } from "~/server/db/schema";
import { checkOwnerAuthorization } from "~/app/actions/auth";
import { ActionError, type ActionResult } from "~/lib/action-result";
import { BILLING_KINDS, billingDetailsErrors, normalizeBillingDetails } from "~/lib/billing-details";
import { isUuid } from "~/lib/slug";
import { runAction } from "~/server/run-action";

/*
 * Owners and admins: who the restaurant's invoices are made out to. Saved
 * now so that, once online payments come, they go to the payment provider
 * as they are (cards are entered on the provider's page, never here).
 */

const detailsSchema = z.object({
  kind: z.enum(BILLING_KINDS),
  legalName: z.string(),
  taxNumber: z.string(),
  taxOffice: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  invoiceEmail: z.string(),
  phone: z.string(),
});

export async function saveBillingDetails(restaurantId: string, input: unknown): Promise<ActionResult> {
  return runAction("saveBillingFailed", async () => {
    if (!isUuid(restaurantId)) throw new ActionError("invalidInput");
    await checkOwnerAuthorization(restaurantId);
    const parsed = detailsSchema.safeParse(input);
    if (!parsed.success || Object.keys(billingDetailsErrors(parsed.data)).length > 0)
      throw new ActionError("invalidInput");
    const { userId } = await auth();

    const values = { ...normalizeBillingDetails(parsed.data), updatedBy: userId, updatedAt: new Date() };
    await db
      .insert(billingDetails)
      .values({ restaurantId, ...values })
      .onConflictDoUpdate({ target: billingDetails.restaurantId, set: values });
  });
}
