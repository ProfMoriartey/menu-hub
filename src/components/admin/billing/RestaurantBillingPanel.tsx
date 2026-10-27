// src/components/admin/billing/RestaurantBillingPanel.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { Check, CircleAlert, Trash2 } from "lucide-react";
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
import { Field, FormSection } from "~/components/forms/fields";
import { ConfirmDialog } from "~/components/menu-editor/ConfirmDialog";
import { BillingStatusBadge } from "~/components/admin/billing/BillingStatusBadge";
import { deletePayment, recordPayment, saveBillingPlan } from "~/app/actions/billing";
import {
  BILLING_CURRENCIES,
  PAYMENT_METHODS,
  coversUntil,
  formatDay,
  formatMoney,
  isDay,
  methodLabel,
  nextPeriodStart,
  type BillingStatus,
} from "~/lib/billing";
import type { BillingPlan, PaymentRow } from "~/server/billing";

interface RestaurantBillingPanelProps {
  restaurantId: string;
  plan: BillingPlan | null;
  payments: PaymentRow[];
  paidUntil: string | null;
  today: string;
  status: BillingStatus;
}

/**
 * The admin Billing tab: where the restaurant stands, the plan agreed with
 * it, recording a payment received and the payments so far.
 */
export function RestaurantBillingPanel(props: RestaurantBillingPanelProps) {
  const { plan, paidUntil, status } = props;
  const locale = useLocale();

  return (
    <div className="space-y-6">
      <section className="bg-card border-border flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border px-6 py-4 shadow-sm">
        <BillingStatusBadge status={status} className="text-sm" />
        <p className="text-sm">
          {paidUntil ? (
            <>
              Paid until <strong>{formatDay(paidUntil, locale)}</strong>
            </>
          ) : (
            <span className="text-muted-foreground">No payments recorded yet</span>
          )}
        </p>
        {plan?.planName && (
          <p className="text-muted-foreground text-sm">
            {plan.planName}
            {plan.monthlyPrice && ` · ${formatMoney(plan.monthlyPrice, plan.currency, locale)} a month`}
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlanForm {...props} />
        {/* Starts afresh after each payment, from the new paid-until date. */}
        <PaymentForm key={`${paidUntil}-${props.payments.length}`} {...props} />
      </div>

      <PaymentHistory payments={props.payments} />
    </div>
  );
}

function SaveState({ error, saved }: { error: string | null; saved: boolean }) {
  if (error)
    return (
      <span className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
        <CircleAlert className="h-4 w-4 shrink-0" /> {error}
      </span>
    );
  if (saved)
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400" role="status">
        <Check className="h-4 w-4" /> Saved
      </span>
    );
  return null;
}

function PlanForm({ restaurantId, plan }: RestaurantBillingPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    planName: plan?.planName ?? "",
    monthlyPrice: plan?.monthlyPrice ?? "",
    currency: plan?.currency ?? "TRY",
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
    <form onSubmit={submit}>
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
          <Field label="Monthly price" htmlFor="plan-price" hint="0 for a free plan.">
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
        </div>
      </FormSection>
    </form>
  );
}

function PaymentForm({ restaurantId, plan, paidUntil, today }: RestaurantBillingPanelProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const price = plan?.monthlyPrice ? Number(plan.monthlyPrice) : null;
  const priceFor = (months: number) => (price ? String(Math.round(price * months * 100) / 100) : "");

  const initial = () => ({
    paidOn: today,
    months: 1,
    coversFrom: nextPeriodStart(paidUntil, today),
    amount: priceFor(1),
    currency: plan?.currency ?? "TRY",
    method: "bank_transfer",
    note: "",
  });
  const [values, setValues] = useState(initial);
  // The period start and amount follow the payment day and months until
  // they're changed by hand.
  const [fromEdited, setFromEdited] = useState(false);
  const [amountEdited, setAmountEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<ReturnType<typeof initial>>) => {
    setSaved(false);
    setValues((v) => {
      const next = { ...v, ...patch };
      if (!fromEdited && patch.paidOn && isDay(patch.paidOn))
        next.coversFrom = nextPeriodStart(paidUntil, patch.paidOn);
      if (!amountEdited && patch.months) next.amount = priceFor(patch.months);
      return next;
    });
  };

  const validMonths = Number.isInteger(values.months) && values.months >= 1 && values.months <= 36;
  const until = isDay(values.coversFrom) && validMonths ? coversUntil(values.coversFrom, values.months) : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await recordPayment(restaurantId, values);
      if (!result.ok) return setError(result.error);
      setSaved(true);
      setFromEdited(false);
      setAmountEdited(false);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit}>
      <FormSection
        id="payment"
        title="Record a payment"
        description="When the restaurant pays you, by bank transfer, cash or otherwise."
      >
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
            hint={paidUntil ? "The day after the paid period ends, so there's no gap." : "Nothing paid before: from the payment day."}
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
          <Field label="Amount" htmlFor="pay-amount" hint={price ? "Filled in from the plan's price." : undefined}>
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
              required
            />
          </Field>
          <Field label="Currency" htmlFor="pay-currency">
            <CurrencySelect id="pay-currency" value={values.currency} onChange={(currency) => set({ currency })} />
          </Field>
        </div>
        <Field label="Note" htmlFor="pay-note" hint="Optional, e.g. the transfer's reference.">
          <Input
            id="pay-note"
            value={values.note}
            onChange={(e) => set({ note: e.target.value })}
            maxLength={500}
          />
        </Field>
        {until && (
          <p className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
            Pays for <strong>{formatDay(values.coversFrom, locale)}</strong> –{" "}
            <strong>{formatDay(until, locale)}</strong>
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending || !until || !values.amount.trim()}>
            {isPending ? "Saving…" : "Record payment"}
          </Button>
          <SaveState error={error} saved={saved} />
        </div>
      </FormSection>
    </form>
  );
}

function PaymentHistory({ payments }: { payments: PaymentRow[] }) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <FormSection id="history" title="Payments" description="Newest first. Deleting one also moves the paid-until date back.">
      {payments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
      ) : (
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-muted-foreground text-start text-xs uppercase">
              <tr className="border-border border-b">
                <th className="px-6 py-2 text-start font-medium">Paid on</th>
                <th className="px-3 py-2 text-end font-medium">Amount</th>
                <th className="px-3 py-2 text-start font-medium">Pays for</th>
                <th className="px-3 py-2 text-start font-medium">Method</th>
                <th className="px-3 py-2 text-start font-medium">Note</th>
                <th className="px-6 py-2" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-border border-b last:border-0">
                  <td className="px-6 py-2.5 whitespace-nowrap">{formatDay(p.paidOn, locale)}</td>
                  <td className="px-3 py-2.5 text-end font-medium whitespace-nowrap tabular-nums">
                    {formatMoney(p.amount, p.currency, locale)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {formatDay(p.coversFrom, locale)} – {formatDay(p.coversUntil, locale)}
                  </td>
                  <td className="px-3 py-2.5">{methodLabel(p.method)}</td>
                  <td className="text-muted-foreground max-w-[16rem] truncate px-3 py-2.5">{p.note}</td>
                  <td className="px-6 py-2.5 text-end">
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete payment">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Delete this payment?"
                      description={`${formatMoney(p.amount, p.currency, locale)} paid on ${formatDay(p.paidOn, locale)}. Only delete a payment recorded by mistake.`}
                      confirmLabel="Delete payment"
                      onConfirm={async () => {
                        const result = await deletePayment(p.id);
                        if (result.ok) router.refresh();
                        return result;
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FormSection>
  );
}

function CurrencySelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {BILLING_CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
