// src/components/admin/billing/BillingDetailsCard.tsx
import { FormSection } from "~/components/forms/fields";
import { countryName } from "~/lib/countries";
import type { BillingDetailsRow } from "~/server/billing-details";

/**
 * A restaurant's billing details as its owner filled them in (Plan tab),
 * for the admin's Plan tab: who invoices are made out to.
 */
export function BillingDetailsCard({ details, locale }: { details: BillingDetailsRow | null; locale: string }) {
  const rows: [string, string | null][] = details
    ? [
        [details.kind === "company" ? "Company" : "Person", details.legalName],
        [
          details.country === "TR" ? (details.kind === "company" ? "VKN" : "TCKN") : "Tax number",
          details.taxNumber,
        ],
        ["Tax office", details.taxOffice],
        [
          "Address",
          [details.address, [details.postalCode, details.city].filter(Boolean).join(" "), countryName(details.country, locale)]
            .filter(Boolean)
            .join(", "),
        ],
        ["Invoice email", details.invoiceEmail],
        ["Phone", details.phone],
      ]
    : [];

  return (
    <FormSection
      id="billing-details"
      title="Billing details"
      description="Who invoices are made out to. The owner fills these in on their Plan tab."
    >
      {details ? (
        <dl className="grid max-w-3xl gap-x-6 gap-y-3 text-sm sm:grid-cols-[max-content_1fr]">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium break-words">{value}</dd>
              </div>
            ))}
        </dl>
      ) : (
        <p className="text-muted-foreground text-sm">Not filled in yet.</p>
      )}
    </FormSection>
  );
}
