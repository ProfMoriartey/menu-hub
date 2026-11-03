// src/lib/billing-details.ts
// Who a restaurant's invoices are made out to (schema.ts billingDetails):
// the rules the owner's form and the save action share. No card details
// here: an online payment provider takes those on its own page.
import { z } from "zod";
import { isCountryCode } from "~/lib/countries";

export const BILLING_KINDS = ["company", "individual"] as const;
export type BillingKind = (typeof BILLING_KINDS)[number];

export interface BillingDetailsInput {
  kind: BillingKind;
  legalName: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  invoiceEmail: string;
  phone: string;
}

/** The shape a form sends; billingDetailsErrors() checks the values. */
export const billingDetailsSchema = z.object({
  kind: z.enum(BILLING_KINDS),
  legalName: z.string(),
  taxNumber: z.string(),
  taxOffice: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  invoiceEmail: z.string(),
  phone: z.string(),
});

export type BillingDetailsField = keyof BillingDetailsInput;
// Message keys in the BillingDetails namespace.
export type BillingDetailsError = "required" | "vkn" | "tckn" | "tooLong" | "email";

const MAX: Record<BillingDetailsField, number> = {
  kind: 16,
  legalName: 256,
  taxNumber: 32,
  taxOffice: 128,
  address: 1000,
  city: 128,
  postalCode: 16,
  country: 2,
  invoiceEmail: 256,
  phone: 50,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * What's wrong with the details, a message key per field (none = valid).
 * In Turkey invoices need a tax number: a company's VKN (10 digits) with
 * its tax office, or a person's TCKN (11 digits). Elsewhere it's optional.
 */
export function billingDetailsErrors(
  input: BillingDetailsInput,
): Partial<Record<BillingDetailsField, BillingDetailsError>> {
  const errors: Partial<Record<BillingDetailsField, BillingDetailsError>> = {};
  const value = (field: BillingDetailsField) => input[field].trim();
  for (const field of Object.keys(MAX) as BillingDetailsField[]) {
    if (value(field).length > MAX[field]) errors[field] = "tooLong";
  }
  for (const field of ["legalName", "address", "city", "invoiceEmail"] as const) {
    if (!value(field)) errors[field] = "required";
  }
  if (!isCountryCode(input.country)) errors.country = "required";
  if (!BILLING_KINDS.includes(input.kind)) errors.kind = "required";
  if (value("invoiceEmail") && !EMAIL.test(value("invoiceEmail"))) errors.invoiceEmail = "email";

  if (input.country === "TR") {
    const company = input.kind === "company";
    if (!/^\d+$/.test(value("taxNumber")) || value("taxNumber").length !== (company ? 10 : 11))
      errors.taxNumber = company ? "vkn" : "tckn";
    if (company && !value("taxOffice")) errors.taxOffice = "required";
  }
  return errors;
}

/** The details trimmed, with empty optional fields as null, for saving. */
export function normalizeBillingDetails(input: BillingDetailsInput) {
  const optional = (value: string) => value.trim() || null;
  return {
    kind: input.kind,
    legalName: input.legalName.trim(),
    taxNumber: optional(input.taxNumber),
    // A tax office only means something for a company in Turkey.
    taxOffice: input.country === "TR" && input.kind === "company" ? optional(input.taxOffice) : null,
    address: input.address.trim(),
    city: input.city.trim(),
    postalCode: optional(input.postalCode),
    country: input.country,
    invoiceEmail: input.invoiceEmail.trim(),
    phone: optional(input.phone),
  };
}
