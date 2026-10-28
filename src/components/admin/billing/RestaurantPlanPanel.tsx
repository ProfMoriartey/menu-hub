// src/components/admin/billing/RestaurantPlanPanel.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Receipt } from "lucide-react";
import { Link, useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field, FormSection } from "~/components/forms/fields";
import { CurrencySelect, SaveState } from "~/components/admin/billing/billing-fields";
import { saveBillingPlan } from "~/app/actions/billing";
import type { BillingPlan } from "~/server/billing";

/**
 * A restaurant's Plan tab: the plan agreed with it, and nothing else.
 * Payments are on the Payments page (the link opens it for this restaurant).
 */
export function RestaurantPlanPanel({ restaurantId, plan }: { restaurantId: string; plan: BillingPlan | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    planName: plan?.planName ?? "",
    monthlyPrice: plan?.monthlyPrice ?? "",
    currency: plan?.currency ?? "TRY",
    startsOn: plan?.startsOn ?? "",
    notes: plan?.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<typeof values>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...patch }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveBillingPlan(restaurantId, values);
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <FormSection
        id="plan"
        title="Plan"
        description="What was agreed with the restaurant. Leave the name empty if it isn't billed."
      >
        <Field label="Plan name" htmlFor="plan-name">
          <Input
            id="plan-name"
            value={values.planName}
            onChange={(e) => set({ planName: e.target.value })}
            placeholder="e.g. Standard"
            maxLength={64}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Monthly price" htmlFor="plan-price" hint="0 for a free plan. 1.250,50 or 1250.5.">
            <Input
              id="plan-price"
              inputMode="decimal"
              value={values.monthlyPrice}
              onChange={(e) => set({ monthlyPrice: e.target.value })}
              placeholder="e.g. 750"
              dir="ltr"
            />
          </Field>
          <Field label="Currency" htmlFor="plan-currency">
            <CurrencySelect id="plan-currency" value={values.currency} onChange={(currency) => set({ currency })} />
          </Field>
        </div>
        <Field
          label="Billed from"
          htmlFor="plan-start"
          hint="The first day the restaurant pays for. Each month from then on is due until a payment covers it."
        >
          <Input
            id="plan-start"
            type="date"
            value={values.startsOn}
            onChange={(e) => set({ startsOn: e.target.value })}
            className="sm:max-w-xs"
          />
        </Field>
        <Field label="Notes" htmlFor="plan-notes" hint="Only admins see these, e.g. the agreement or who to contact.">
          <Textarea
            id="plan-notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set({ notes: e.target.value })}
            maxLength={2000}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save plan"}
          </Button>
          <SaveState error={error} saved={saved} />
          <Button variant="ghost" className="ms-auto" asChild>
            <Link href={`/admin/payments?restaurant=${restaurantId}`}>
              <Receipt className="h-4 w-4" /> This restaurant&apos;s payments
            </Link>
          </Button>
        </div>
      </FormSection>
    </form>
  );
}
