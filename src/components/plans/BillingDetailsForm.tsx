// src/components/plans/BillingDetailsForm.tsx
"use client";

import { useState, useTransition, type ComponentProps, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Check, CircleAlert, Lock } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Field } from "~/components/forms/fields";
import { saveBillingDetails } from "~/app/actions/billing-details";
import {
  BILLING_KINDS,
  billingDetailsErrors,
  type BillingDetailsField,
  type BillingDetailsInput,
} from "~/lib/billing-details";
import type { CountryOption } from "~/lib/countries";
import { cn } from "~/lib/utils";

const NOT_SET = "none";

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

  const inTurkey = values.country === "TR";
  const company = values.kind === "company";
  const text = (field: BillingDetailsField, props: ComponentProps<typeof Input> = {}) => (
    <Input
      id={`billing-${field}`}
      value={values[field]}
      onChange={(e) => set({ [field]: e.target.value })}
      aria-invalid={errors[field] ? true : undefined}
      {...props}
    />
  );

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
        <div role="radiogroup" aria-label={t("kind")} className="bg-muted inline-flex rounded-full p-1">
          {BILLING_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              role="radio"
              aria-checked={values.kind === kind}
              onClick={() => set({ kind })}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium",
                values.kind === kind ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t(`kinds.${kind}`)}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={company ? t("companyName") : t("fullName")}
            htmlFor="billing-legalName"
            required
            error={errors.legalName}
            className="sm:col-span-2"
          >
            {text("legalName", { maxLength: 256, autoComplete: company ? "organization" : "name" })}
          </Field>
          <Field label={t("country")} htmlFor="billing-country" required error={errors.country}>
            <Select value={values.country || NOT_SET} onValueChange={(v) => set({ country: v === NOT_SET ? "" : v })}>
              <SelectTrigger id="billing-country" className="w-full" aria-invalid={errors.country ? true : undefined}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NOT_SET}>{t("choose")}</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label={inTurkey ? (company ? t("vkn") : t("tckn")) : t("taxNumber")}
            htmlFor="billing-taxNumber"
            required={inTurkey}
            error={errors.taxNumber}
            hint={inTurkey ? undefined : t("taxNumberHint")}
          >
            {text("taxNumber", { maxLength: 32, inputMode: inTurkey ? "numeric" : undefined, dir: "ltr" })}
          </Field>
          {inTurkey && company && (
            <Field label={t("taxOffice")} htmlFor="billing-taxOffice" required error={errors.taxOffice}>
              {text("taxOffice", { maxLength: 128 })}
            </Field>
          )}
          <Field
            label={t("address")}
            htmlFor="billing-address"
            required
            error={errors.address}
            className="sm:col-span-2"
          >
            <Textarea
              id="billing-address"
              rows={2}
              value={values.address}
              onChange={(e) => set({ address: e.target.value })}
              maxLength={1000}
              autoComplete="street-address"
              aria-invalid={errors.address ? true : undefined}
            />
          </Field>
          <Field label={t("city")} htmlFor="billing-city" required error={errors.city}>
            {text("city", { maxLength: 128, autoComplete: "address-level2" })}
          </Field>
          <Field label={t("postalCode")} htmlFor="billing-postalCode" error={errors.postalCode}>
            {text("postalCode", { maxLength: 16, autoComplete: "postal-code", dir: "ltr" })}
          </Field>
          <Field
            label={t("invoiceEmail")}
            htmlFor="billing-invoiceEmail"
            required
            error={errors.invoiceEmail}
            hint={t("invoiceEmailHint")}
          >
            {text("invoiceEmail", { type: "email", maxLength: 256, autoComplete: "email", dir: "ltr" })}
          </Field>
          <Field label={t("phone")} htmlFor="billing-phone" error={errors.phone}>
            {text("phone", { type: "tel", maxLength: 50, autoComplete: "tel", dir: "ltr" })}
          </Field>
        </div>

        <p className="text-muted-foreground flex items-start gap-2 text-xs">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {t("noCard")}
        </p>

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
