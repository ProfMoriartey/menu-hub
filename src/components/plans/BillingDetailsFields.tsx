// src/components/plans/BillingDetailsFields.tsx
"use client";

import { type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
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
import {
  BILLING_KINDS,
  type BillingDetailsField,
  type BillingDetailsInput,
} from "~/lib/billing-details";
import type { CountryOption } from "~/lib/countries";
import { cn } from "~/lib/utils";

const NOT_SET = "none";

/**
 * Who invoices are made out to (lib/billing-details), as controlled fields:
 * the owner's Plan tab (BillingDetailsForm) and sign-up's second step.
 * Inputs are `${idPrefix}-${field}`, so a form can focus the first error.
 * Ends with a line saying no card is asked for here.
 */
export function BillingDetailsFields({
  values,
  errors,
  onChange,
  countries,
  idPrefix = "billing",
}: {
  values: BillingDetailsInput;
  // Messages, by field.
  errors: Partial<Record<BillingDetailsField, string>>;
  onChange: (patch: Partial<BillingDetailsInput>) => void;
  countries: CountryOption[];
  idPrefix?: string;
}) {
  const t = useTranslations("BillingDetails");
  const id = (field: BillingDetailsField) => `${idPrefix}-${field}`;
  const inTurkey = values.country === "TR";
  const company = values.kind === "company";
  const text = (field: BillingDetailsField, props: ComponentProps<typeof Input> = {}) => (
    <Input
      id={id(field)}
      value={values[field]}
      onChange={(e) => onChange({ [field]: e.target.value })}
      aria-invalid={errors[field] ? true : undefined}
      {...props}
    />
  );

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label={t("kind")} className="bg-muted inline-flex rounded-[14px] p-1">
        {BILLING_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={values.kind === kind}
            onClick={() => onChange({ kind })}
            className={cn(
              "rounded-[10px] px-4 py-1.5 text-sm font-medium",
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
          htmlFor={id("legalName")}
          required
          error={errors.legalName}
          className="sm:col-span-2"
        >
          {text("legalName", { maxLength: 256, autoComplete: company ? "organization" : "name" })}
        </Field>
        <Field label={t("country")} htmlFor={id("country")} required error={errors.country}>
          <Select value={values.country || NOT_SET} onValueChange={(v) => onChange({ country: v === NOT_SET ? "" : v })}>
            <SelectTrigger id={id("country")} className="w-full" aria-invalid={errors.country ? true : undefined}>
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
          htmlFor={id("taxNumber")}
          required={inTurkey}
          error={errors.taxNumber}
          hint={inTurkey ? undefined : t("taxNumberHint")}
        >
          {text("taxNumber", { maxLength: 32, inputMode: inTurkey ? "numeric" : undefined, dir: "ltr" })}
        </Field>
        {inTurkey && company && (
          <Field label={t("taxOffice")} htmlFor={id("taxOffice")} required error={errors.taxOffice}>
            {text("taxOffice", { maxLength: 128 })}
          </Field>
        )}
        <Field label={t("address")} htmlFor={id("address")} required error={errors.address} className="sm:col-span-2">
          <Textarea
            id={id("address")}
            rows={2}
            value={values.address}
            onChange={(e) => onChange({ address: e.target.value })}
            maxLength={1000}
            autoComplete="street-address"
            aria-invalid={errors.address ? true : undefined}
          />
        </Field>
        <Field label={t("city")} htmlFor={id("city")} required error={errors.city}>
          {text("city", { maxLength: 128, autoComplete: "address-level2" })}
        </Field>
        <Field label={t("postalCode")} htmlFor={id("postalCode")} error={errors.postalCode}>
          {text("postalCode", { maxLength: 16, autoComplete: "postal-code", dir: "ltr" })}
        </Field>
        <Field
          label={t("invoiceEmail")}
          htmlFor={id("invoiceEmail")}
          required
          error={errors.invoiceEmail}
          hint={t("invoiceEmailHint")}
        >
          {text("invoiceEmail", { type: "email", maxLength: 256, autoComplete: "email", dir: "ltr" })}
        </Field>
        <Field label={t("phone")} htmlFor={id("phone")} error={errors.phone}>
          {text("phone", { type: "tel", maxLength: 50, autoComplete: "tel", dir: "ltr" })}
        </Field>
      </div>

      <p className="text-muted-foreground flex items-start gap-2 text-xs">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {t("noCard")}
      </p>
    </div>
  );
}
