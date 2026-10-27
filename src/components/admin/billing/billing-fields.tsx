// src/components/admin/billing/billing-fields.tsx
"use client";

import { useTransition } from "react";
import { Check, CircleAlert, Trash2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ConfirmDialog } from "~/components/menu-editor/ConfirmDialog";
import { deletePayment } from "~/app/actions/billing";
import { BILLING_CURRENCIES, formatDay, formatMoney } from "~/lib/billing";

/** "Saved" or the error, after a billing form's save. */
export function SaveState({ error, saved }: { error: string | null; saved: boolean }) {
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

export function CurrencySelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
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

/** Deletes a payment recorded by mistake, after asking. */
export function DeletePaymentButton({
  payment,
}: {
  payment: { id: string; amount: string; currency: string; paidOn: string; restaurantName: string };
}) {
  const router = useRouter();
  const locale = useLocale();
  const [, startTransition] = useTransition();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete payment">
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title="Delete this payment?"
      description={`${formatMoney(payment.amount, payment.currency, locale)} from ${payment.restaurantName}, paid on ${formatDay(payment.paidOn, locale)}. Only delete a payment recorded by mistake: the restaurant's paid-until date moves back.`}
      confirmLabel="Delete payment"
      onConfirm={async () => {
        const result = await deletePayment(payment.id);
        if (result.ok) startTransition(() => router.refresh());
        return result;
      }}
    />
  );
}
