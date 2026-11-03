// src/components/plans/BillingDetailsForm.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleAlert } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { BillingDetailsFields } from "~/components/plans/BillingDetailsFields";
import { saveBillingDetails } from "~/app/actions/billing-details";
import {
  billingDetailsErrors,
  type BillingDetailsField,
  type BillingDetailsInput,
} from "~/lib/billing-details";
import type { CountryOption } from "~/lib/countries";

/**
 * The owner's Plan tab: who invoices are made out to (lib/billing-details).
 * Says plainly that no card is asked for here: once online payments come,
 * cards are entered on the payment provider's page.
 */
export function BillingDetailsForm({
  restaurantId,
  initial,
  countries,
}: {
  restaurantId: string;
  initial: BillingDetailsInput;
  countries: CountryOption[];
}) {
  const t = useTranslations("BillingDetails");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<BillingDetailsField, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<BillingDetailsInput>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as BillingDetailsField];
      return next;
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const found = billingDetailsErrors(values);
    setErrors(Object.fromEntries(Object.entries(found).map(([field, key]) => [field, t(`errors.${key}`)])));
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`billing-${first}`)?.focus();

    startTransition(async () => {
      const result = await saveBillingDetails(restaurantId, values);
      if (!result.ok) return setServerError(result.error);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <section
      id="billing"
      aria-labelledby="billing-title"
      className="bg-card border-border scroll-mt-24 space-y-5 rounded-xl border p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 id="billing-title" className="text-base font-semibold">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("intro")}</p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <BillingDetailsFields values={values} errors={errors} onChange={set} countries={countries} />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("saving") : t("save")}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400" role="status">
              <Check className="h-4 w-4" /> {t("saved")}
            </span>
          )}
          {serverError && (
            <span className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
              <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
