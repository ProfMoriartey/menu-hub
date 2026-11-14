// src/components/plans/StartForm.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Banknote, CircleAlert, CreditCard, Phone } from "lucide-react";
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
import { PlanFeatureList, TrialPrice } from "~/components/plans/PlanFeatures";
import { BillingDetailsFields } from "~/components/plans/BillingDetailsFields";
import { createOwnRestaurant } from "~/app/actions/onboarding";
import { SIGNUP_PAYMENT_METHODS } from "~/lib/billing";
import {
  billingDetailsErrors,
  type BillingDetailsField,
  type BillingDetailsInput,
} from "~/lib/billing-details";
import { FREE_MONTHS, MONTHS_PAID_PER_YEAR, TIER_FEATURES, type Tier } from "~/lib/plans";
import { slugify } from "~/lib/slug";
import { VENUE_TYPES } from "~/lib/venue-types";
import type { CountryOption } from "~/lib/countries";
import { cn } from "~/lib/utils";

// The currencies a menu's prices can be in (as on the admin form).
const MENU_CURRENCIES = ["TRY", "USD", "EUR", "GBP", "AED", "SAR"];
const NOT_SET = "none";
// The billing choice for typing in new details (else a restaurant's id).
const NEW_DETAILS = "new";

const PAYMENT_ICONS = { card: CreditCard, cash: Banknote };

/** Another restaurant the person owns, whose billing details can be reused. */
export interface ReusableBilling {
  restaurantId: string;
  restaurantName: string;
  legalName: string;
}

interface StartFormProps {
  initialTier: Tier;
  initialCycle: "monthly" | "yearly";
  countries: CountryOption[];
  // The visitor's country, as a starting point.
  defaultCountry: string | null;
  // e.g. "menupedia.com/", before the menu address.
  addressPrefix: string;
  reusable: ReusableBilling[];
}

/**
 * Sign-up, in two steps. First the restaurant: its name (with a preview of
 * the menu address made from it), type, prices' currency, city, country and
 * phone. Then the plan with its free trial, how they'll pay once it's over
 * (card or cash) and who invoices go to, or the billing details of another
 * restaurant they own. Creates the restaurant at the end and opens its
 * menu editor.
 */
export function StartForm({
  initialTier,
  initialCycle,
  countries,
  defaultCountry,
  addressPrefix,
  reusable,
}: StartFormProps) {
  const t = useTranslations("Start");
  const tPlans = useTranslations("Plans");
  const tBilling = useTranslations("BillingDetails");
  const tVenue = useTranslations("VenueTypes");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState({
    tier: initialTier,
    billingCycle: initialCycle,
    name: "",
    typeOfEstablishment: "",
    currency: defaultCountry === "TR" ? "TRY" : "USD",
    city: "",
    country: defaultCountry ?? "",
    phone: "",
    paymentMethod: "card" as (typeof SIGNUP_PAYMENT_METHODS)[number],
    note: "",
  });
  const [billingChoice, setBillingChoice] = useState(reusable[0]?.restaurantId ?? NEW_DETAILS);
  const [billing, setBilling] = useState<BillingDetailsInput>({
    kind: "company",
    legalName: "",
    taxNumber: "",
    taxOffice: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    invoiceEmail: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [billingErrors, setBillingErrors] = useState<Partial<Record<BillingDetailsField, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (patch: Partial<typeof values>) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };
  const setBillingField = (patch: Partial<BillingDetailsInput>) => {
    setBilling((b) => ({ ...b, ...patch }));
    setBillingErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as BillingDetailsField];
      return next;
    });
  };

  const toStep = (next: 1 | 2) => {
    setStep(next);
    setServerError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 1: the restaurant. Its place starts the billing details off.
  const next = (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!values.name.trim()) found.name = t("nameRequired");
    if (!values.country) found.country = t("countryRequired");
    if (values.phone.trim().length < 5) found.phone = t("phoneRequired");
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`start-${first}`)?.focus();

    setBilling((b) => ({
      ...b,
      country: b.country || values.country,
      city: b.city || values.city,
      phone: b.phone || values.phone,
    }));
    toStep(2);
  };

  // Step 2: plan, payment and billing; creates the restaurant.
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const reuse = billingChoice !== NEW_DETAILS;
    if (!reuse) {
      const found = billingDetailsErrors(billing);
      setBillingErrors(
        Object.fromEntries(Object.entries(found).map(([field, key]) => [field, tBilling(`errors.${key}`)])),
      );
      const first = Object.keys(found)[0];
      if (first) return document.getElementById(`start-billing-${first}`)?.focus();
    }

    startTransition(async () => {
      const result = await createOwnRestaurant({
        ...values,
        billing: reuse ? { reuseFrom: billingChoice } : billing,
      });
      if (!result.ok) return setServerError(result.error);
      router.push(`/dashboard/${result.data.slug}/menu`);
    });
  };

  const stepLabel = (
    <p className="text-muted-foreground text-sm font-medium">{t("stepOf", { step, total: 2 })}</p>
  );
  const errorLine = serverError && (
    <p className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
      <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
    </p>
  );

  if (step === 1) {
    return (
      <form onSubmit={next} noValidate className="mx-auto max-w-3xl space-y-8">
        <section aria-labelledby="start-details-title" className="space-y-5">
          <div>
            {stepLabel}
            <h2 id="start-details-title" className="text-xl font-bold">
              {t("detailsHeading")}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("name")}
              htmlFor="start-name"
              required
              error={errors.name}
              hint={
                <>
                  {t("slug")}:{" "}
                  <span className="text-foreground font-mono" dir="ltr">
                    {addressPrefix}
                    {slugify(values.name) || "…"}
                  </span>
                  <br />
                  {t("slugPreviewHint")}
                </>
              }
            >
              <Input
                id="start-name"
                value={values.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder={t("namePlaceholder")}
                maxLength={256}
                aria-invalid={errors.name ? true : undefined}
              />
            </Field>
            <Field label={t("type")} htmlFor="start-type">
              <Select
                value={values.typeOfEstablishment || NOT_SET}
                onValueChange={(v) => set({ typeOfEstablishment: v === NOT_SET ? "" : v })}
              >
                <SelectTrigger id="start-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_SET}>{t("typeNone")}</SelectItem>
                  {VENUE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {tVenue(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("currency")} htmlFor="start-currency">
              <Select value={values.currency} onValueChange={(currency) => set({ currency })}>
                <SelectTrigger id="start-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("city")} htmlFor="start-city">
              <Input
                id="start-city"
                value={values.city}
                onChange={(e) => set({ city: e.target.value })}
                placeholder={t("cityPlaceholder")}
                maxLength={128}
              />
            </Field>
            <Field label={t("country")} htmlFor="start-country" required error={errors.country}>
              <Select value={values.country || NOT_SET} onValueChange={(v) => set({ country: v === NOT_SET ? "" : v })}>
                <SelectTrigger id="start-country" className="w-full" aria-invalid={errors.country ? true : undefined}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_SET}>{t("typeNone")}</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("phone")} htmlFor="start-phone" required error={errors.phone} hint={t("phoneHint")}>
              <div className="relative" dir="ltr">
                <Phone className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="start-phone"
                  type="tel"
                  value={values.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="+90 555 123 45 67"
                  maxLength={50}
                  className="ps-9"
                  aria-invalid={errors.phone ? true : undefined}
                />
              </div>
            </Field>
          </div>
        </section>

        <Button type="submit" size="lg" className="min-h-11 rounded-full px-6">
          {t("next")}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-10">
      {/* The plan and its free trial */}
      <section aria-labelledby="start-plan-title" className="space-y-4">
        <div>
          {stepLabel}
          <h2 id="start-plan-title" className="text-xl font-bold">
            {t("planHeading")}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label={t("cycleLabel")} className="bg-muted inline-flex rounded-full p-1">
            {(["monthly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                role="radio"
                aria-checked={values.billingCycle === cycle}
                onClick={() => set({ billingCycle: cycle })}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium",
                  values.billingCycle === cycle ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {tPlans(cycle)}
                {cycle === "yearly" && (
                  <span className="text-primary ms-1 text-xs">
                    {tPlans("yearlySave", { count: 12 - MONTHS_PAID_PER_YEAR })}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* The plan chosen on the pricing section (one is offered for now:
            lib/plans OFFERED_TIERS). */}
        <div className="bg-card border-primary ring-primary/30 grid gap-5 rounded-xl border p-5 ring-2 sm:grid-cols-2">
          <div>
            <p className="text-lg font-bold">{TIER_FEATURES[values.tier].label}</p>
            <TrialPrice tier={values.tier} cycle={values.billingCycle} freeMonths={FREE_MONTHS} className="mt-2" />
          </div>
          <PlanFeatureList tier={values.tier} className="space-y-1.5 text-sm" />
        </div>
        <p className="text-muted-foreground text-sm">{t("trialExplain", { count: FREE_MONTHS })}</p>
      </section>

      {/* How they'll pay once the trial is over */}
      <section aria-labelledby="start-payment-title" className="space-y-4">
        <h2 id="start-payment-title" className="text-xl font-bold">
          {t("paymentHeading")}
        </h2>
        <div role="radiogroup" aria-label={t("paymentHeading")} className="grid gap-3 sm:grid-cols-2">
          {SIGNUP_PAYMENT_METHODS.map((method) => {
            const Icon = PAYMENT_ICONS[method];
            const selected = values.paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ paymentMethod: method })}
                className={cn(
                  "bg-card flex items-start gap-3 rounded-xl border p-4 text-start transition-colors",
                  "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                  selected ? "border-primary ring-primary/30 ring-2" : "border-border hover:bg-accent/40",
                )}
              >
                <Icon className="text-primary mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                <span>
                  <span className="block font-semibold">{t(`methods.${method}`)}</span>
                  <span className="text-muted-foreground block text-sm">{t(`methodHints.${method}`)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Who invoices go to */}
      <section aria-labelledby="start-billing-title" className="space-y-4">
        <div>
          <h2 id="start-billing-title" className="text-xl font-bold">
            {tBilling("title")}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("billingIntro")}</p>
        </div>
        {reusable.length > 0 && (
          <div role="radiogroup" aria-label={tBilling("title")} className="space-y-2">
            {[...reusable.map((r) => r.restaurantId), NEW_DETAILS].map((choice) => {
              const source = reusable.find((r) => r.restaurantId === choice);
              return (
                <button
                  key={choice}
                  type="button"
                  role="radio"
                  aria-checked={billingChoice === choice}
                  onClick={() => setBillingChoice(choice)}
                  className={cn(
                    "bg-card flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-colors",
                    billingChoice === choice ? "border-primary ring-primary/30 ring-2" : "border-border hover:bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "h-4 w-4 shrink-0 rounded-full border-2",
                      billingChoice === choice ? "border-primary bg-primary" : "border-muted-foreground/40",
                    )}
                    aria-hidden
                  />
                  {source ? (
                    <span>
                      <span className="block font-medium">{t("reuseBilling", { name: source.restaurantName })}</span>
                      <span className="text-muted-foreground block">{source.legalName}</span>
                    </span>
                  ) : (
                    <span className="font-medium">{t("newBilling")}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {billingChoice === NEW_DETAILS && (
          <BillingDetailsFields
            values={billing}
            errors={billingErrors}
            onChange={setBillingField}
            countries={countries}
            idPrefix="start-billing"
          />
        )}
        <Field label={t("note")} htmlFor="start-note">
          <Textarea
            id="start-note"
            rows={2}
            value={values.note}
            onChange={(e) => set({ note: e.target.value })}
            placeholder={t("notePlaceholder")}
            maxLength={1000}
          />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="lg" className="min-h-11 rounded-full" onClick={() => toStep(1)}>
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("back")}
        </Button>
        <Button type="submit" size="lg" className="min-h-11 rounded-full px-6" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
        {errorLine}
      </div>
    </form>
  );
}
