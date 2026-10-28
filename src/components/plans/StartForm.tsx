// src/components/plans/StartForm.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, Phone } from "lucide-react";
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
import { PlanFeatureList, usePlanMoney } from "~/components/plans/PlanFeatures";
import { createOwnRestaurant } from "~/app/actions/onboarding";
import { ActionFailure } from "~/lib/action-result";
import { PAYMENT_METHODS } from "~/lib/billing";
import { MONTHS_PAID_PER_YEAR, TIERS, TIER_FEATURES, periodPrice, type Tier } from "~/lib/plans";
import { slugify } from "~/lib/slug";
import { VENUE_TYPES } from "~/lib/venue-types";
import type { CountryOption } from "~/lib/countries";
import { cn } from "~/lib/utils";

// The currencies a menu's prices can be in (as on the admin form).
const MENU_CURRENCIES = ["TRY", "USD", "EUR", "GBP", "AED", "SAR"];
const NOT_SET = "none";

interface StartFormProps {
  initialTier: Tier;
  initialCycle: "monthly" | "yearly";
  countries: CountryOption[];
  // The visitor's country, as a starting point.
  defaultCountry: string | null;
  // e.g. "menupedia.com/", before the menu address.
  addressPrefix: string;
}

/**
 * Sign-up's form: the plan, the restaurant (name, menu address, type,
 * prices' currency, city, country, phone) and how they'd like to pay.
 * Creates the restaurant and opens its menu editor.
 */
export function StartForm({ initialTier, initialCycle, countries, defaultCountry, addressPrefix }: StartFormProps) {
  const t = useTranslations("Start");
  const tPlans = useTranslations("Plans");
  const tVenue = useTranslations("VenueTypes");
  const router = useRouter();
  const money = usePlanMoney();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    tier: initialTier,
    billingCycle: initialCycle,
    name: "",
    slug: "",
    typeOfEstablishment: "",
    currency: defaultCountry === "TR" ? "TRY" : "USD",
    city: "",
    country: defaultCountry ?? "",
    phone: "",
    paymentMethod: "bank_transfer",
    note: "",
  });
  // The address follows the name until it's edited.
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (patch: Partial<typeof values>) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const found: Record<string, string> = {};
    if (!values.name.trim()) found.name = t("nameRequired");
    if (!/^[a-z0-9-]+$/.test(values.slug)) found.slug = t("slugInvalid");
    if (!values.country) found.country = t("countryRequired");
    if (values.phone.trim().length < 5) found.phone = t("phoneRequired");
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`start-${first}`)?.focus();

    startTransition(async () => {
      const result = await createOwnRestaurant(values);
      if (!result.ok) {
        const error = new ActionFailure(result.error, result.code);
        if (error.code === "slugTaken" || error.code === "slugInvalid") {
          setErrors({ slug: error.message });
          document.getElementById("start-slug")?.focus();
        } else {
          setServerError(error.message);
        }
        return;
      }
      router.push(`/dashboard/${result.data.slug}/menu`);
    });
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-10">
      {/* 1. Plan */}
      <section aria-labelledby="start-plan-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="start-plan-title" className="text-xl font-bold">
            {t("planHeading")}
          </h2>
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
        <div role="radiogroup" aria-label={t("planHeading")} className="grid gap-3 md:grid-cols-3">
          {TIERS.map((tier) => {
            const f = TIER_FEATURES[tier];
            const selected = values.tier === tier;
            return (
              <button
                key={tier}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ tier })}
                className={cn(
                  "bg-card rounded-xl border p-5 text-start transition-colors",
                  "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                  selected ? "border-primary ring-primary/30 ring-2" : "border-border hover:bg-accent/40",
                )}
              >
                <span className="block text-lg font-bold">{f.label}</span>
                <span className="mt-1 block text-2xl font-extrabold tabular-nums">
                  {values.billingCycle === "yearly"
                    ? tPlans("perYear", { price: money(periodPrice(f.price, "yearly")) })
                    : tPlans("perMonth", { price: money(f.price) })}
                </span>
                <PlanFeatureList tier={tier} className="mt-4 space-y-1.5 text-sm" />
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Restaurant */}
      <section aria-labelledby="start-details-title" className="space-y-5">
        <h2 id="start-details-title" className="text-xl font-bold">
          {t("detailsHeading")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("name")} htmlFor="start-name" required error={errors.name}>
            <Input
              id="start-name"
              value={values.name}
              onChange={(e) =>
                set({ name: e.target.value, ...(slugEdited ? {} : { slug: slugify(e.target.value) }) })
              }
              placeholder={t("namePlaceholder")}
              maxLength={256}
              aria-invalid={errors.name ? true : undefined}
            />
          </Field>
          <Field
            label={t("slug")}
            htmlFor="start-slug"
            required
            error={errors.slug}
            hint={t("slugHint")}
          >
            <div
              className={cn(
                "border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 items-center rounded-md border shadow-xs focus-within:ring-[3px]",
                errors.slug && "border-destructive",
              )}
              dir="ltr"
            >
              <span className="text-muted-foreground border-input bg-muted/50 flex h-full items-center rounded-l-md border-r px-3 text-sm">
                {addressPrefix}
              </span>
              <input
                id="start-slug"
                value={values.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
                }}
                aria-invalid={errors.slug ? true : undefined}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />
            </div>
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

      {/* 3. Payment */}
      <section aria-labelledby="start-payment-title" className="space-y-5">
        <h2 id="start-payment-title" className="text-xl font-bold">
          {t("paymentHeading")}
        </h2>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("paymentMethod")}</legend>
          <div role="radiogroup" aria-label={t("paymentMethod")} className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={values.paymentMethod === m.value}
                onClick={() => set({ paymentMethod: m.value })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium",
                  values.paymentMethod === m.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent",
                )}
              >
                {t(`methods.${m.value}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label={t("note")} htmlFor="start-note">
          <Textarea
            id="start-note"
            rows={3}
            value={values.note}
            onChange={(e) => set({ note: e.target.value })}
            placeholder={t("notePlaceholder")}
            maxLength={1000}
          />
        </Field>
        <p className="text-muted-foreground text-sm">{t("afterNote")}</p>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" className="rounded-full px-6" disabled={isPending}>
          {isPending ? t("submitting") : t("submit")}
        </Button>
        {serverError && (
          <p className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
            <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
          </p>
        )}
      </div>
    </form>
  );
}
