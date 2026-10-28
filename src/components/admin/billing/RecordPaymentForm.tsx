// src/components/admin/billing/RecordPaymentForm.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Field } from "~/components/forms/fields";
import { CurrencySelect, SaveState } from "~/components/admin/billing/billing-fields";
import { recordPayment } from "~/app/actions/billing";
import {
  PAYMENT_METHODS,
  coversUntil,
  formatDay,
  isDay,
  nextPeriodStart,
} from "~/lib/billing";
import type { BillingRestaurant } from "~/server/billing";

type PaymentTarget = Pick<BillingRestaurant, "id" | "name" | "plan" | "paidUntil">;

/** Filled in already, e.g. by a pending month's "Mark paid". */
export interface PaymentPrefill {
  restaurantId: string;
  coversFrom?: string;
}

interface RecordPaymentFormProps {
  restaurants: PaymentTarget[];
  prefill: PaymentPrefill | null;
  today: string;
  onSaved: () => void;
}

/**
 * Records a payment received from any restaurant. Choosing one fills in
 * its price, currency and where the period starts (right after what it
 * has paid for); everything stays editable.
 */
export function RecordPaymentForm({ restaurants, prefill, today, onSaved }: RecordPaymentFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const defaultsFor = (id: string, paidOn: string, months: number) => {
    const r = restaurants.find((x) => x.id === id);
    const price = r?.plan?.monthlyPrice ? Number(r.plan.monthlyPrice) : null;
    return {
      coversFrom: r ? nextPeriodStart(r.plan, r.paidUntil, paidOn) : paidOn,
      amount: price ? String(Math.round(price * months * 100) / 100) : "",
      currency: r?.plan?.currency ?? "TRY",
    };
  };

  const blank = (restaurantId: string) => ({
    restaurantId,
    paidOn: today,
    months: 1,
    method: "bank_transfer",
    note: "",
    ...defaultsFor(restaurantId, today, 1),
  });
  const known = prefill && restaurants.some((r) => r.id === prefill.restaurantId);
  const [values, setValues] = useState(() => {
    const start = blank(known ? prefill.restaurantId : "");
    return prefill?.coversFrom ? { ...start, coversFrom: prefill.coversFrom } : start;
  });
  // The period start and amount follow the restaurant, payment day and
  // months until they're changed by hand (a prefilled month counts).
  const [fromEdited, setFromEdited] = useState(Boolean(prefill?.coversFrom));
  const [amountEdited, setAmountEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof values>) => {
    setValues((v) => {
      const next = { ...v, ...patch };
      const changed = patch.restaurantId !== undefined || patch.paidOn !== undefined || patch.months !== undefined;
      if (changed && isDay(next.paidOn)) {
        const d = defaultsFor(next.restaurantId, next.paidOn, next.months || 1);
        if (patch.restaurantId !== undefined || !fromEdited) next.coversFrom = d.coversFrom;
        if (patch.restaurantId !== undefined || !amountEdited) next.amount = d.amount;
        if (patch.restaurantId !== undefined) next.currency = d.currency;
      }
      return next;
    });
    if (patch.restaurantId !== undefined) {
      setFromEdited(false);
      setAmountEdited(false);
    }
  };

  const restaurant = restaurants.find((r) => r.id === values.restaurantId);
  const validMonths = Number.isInteger(values.months) && values.months >= 1 && values.months <= 36;
  const until = isDay(values.coversFrom) && validMonths ? coversUntil(values.coversFrom, values.months) : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setError(null);
    const { restaurantId, ...payment } = values;
    startTransition(async () => {
      const result = await recordPayment(restaurantId, payment);
      if (!result.ok) return setError(result.error);
      router.refresh();
      onSaved();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Restaurant" htmlFor="pay-restaurant" required>
        <Select value={values.restaurantId} onValueChange={(restaurantId) => set({ restaurantId })}>
          <SelectTrigger id="pay-restaurant" className="w-full">
            <SelectValue placeholder="Choose a restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
                {r.plan?.planName ? ` · ${r.plan.planName}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Paid on" htmlFor="pay-date">
          <Input
            id="pay-date"
            type="date"
            value={values.paidOn}
            onChange={(e) => set({ paidOn: e.target.value })}
            max={today}
          />
        </Field>
        <Field label="Months paid for" htmlFor="pay-months">
          <Input
            id="pay-months"
            type="number"
            min={1}
            max={36}
            value={values.months}
            onChange={(e) => set({ months: Number(e.target.value) })}
          />
        </Field>
        <Field
          label="Period starts"
          htmlFor="pay-from"
          hint={restaurant?.paidUntil ? "The day after the paid period ends, so there's no gap." : undefined}
        >
          <Input
            id="pay-from"
            type="date"
            value={values.coversFrom}
            onChange={(e) => {
              setFromEdited(true);
              set({ coversFrom: e.target.value });
            }}
          />
        </Field>
        <Field label="Amount" htmlFor="pay-amount" hint={restaurant?.plan?.monthlyPrice ? "Plan price × months." : undefined}>
          <Input
            id="pay-amount"
            inputMode="decimal"
            value={values.amount}
            onChange={(e) => {
              setAmountEdited(true);
              set({ amount: e.target.value });
            }}
            placeholder="e.g. 750"
            dir="ltr"
          />
        </Field>
        <Field label="Currency" htmlFor="pay-currency">
          <CurrencySelect id="pay-currency" value={values.currency} onChange={(currency) => set({ currency })} />
        </Field>
        <Field label="Method" htmlFor="pay-method">
          <Select value={values.method} onValueChange={(method) => set({ method })}>
            <SelectTrigger id="pay-method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Note" htmlFor="pay-note" hint="Optional, e.g. the transfer's reference.">
        <Input id="pay-note" value={values.note} onChange={(e) => set({ note: e.target.value })} maxLength={500} />
      </Field>

      {restaurant && until && (
        <p className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
          {restaurant.name}: pays for <strong>{formatDay(values.coversFrom, locale)}</strong> –{" "}
          <strong>{formatDay(until, locale)}</strong>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending || !restaurant || !until || !values.amount.trim()}>
          {isPending ? "Saving…" : "Record payment"}
        </Button>
        <SaveState error={error} saved={false} />
      </div>
    </form>
  );
}
