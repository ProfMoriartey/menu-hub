// src/lib/format-price.ts

// Currency names owners have typed that mean exactly one ISO currency.
// Anything ambiguous (e.g. "دينار", which several countries use) is left out
// and shown as typed.
const CURRENCY_ALIASES: Record<string, string> = {
  TL: "TRY",
  "₺": "TRY",
};

// A plain amount: whole number, or up to two decimals after "." or ",".
// "3.000" isn't matched on purpose: it could be 3 or 3,000.
const PLAIN_AMOUNT = /^(\d+)(?:[.,](\d{1,2}))?$/;

const KNOWN_CURRENCIES = new Set(Intl.supportedValuesOf("currency"));

/**
 * A menu price in the guest's language ("₺459", "$12.50"), or exactly what
 * the owner typed followed by the currency when the price or the currency
 * can't be read without guessing. A wrong price is worse than an unpolished
 * one. Run on the server only: browsers format some currencies slightly
 * differently from Node, which would show up as hydration mismatches.
 */
export function formatPrice(
  price: string,
  currency: string,
  locale: string,
): string {
  const typed = `${price} ${currency}`.trim();
  const amount = PLAIN_AMOUNT.exec(price.trim());
  const code =
    CURRENCY_ALIASES[currency.trim()] ?? currency.trim().toUpperCase();
  if (!amount || !KNOWN_CURRENCIES.has(code)) return typed;

  const hasDecimals = amount[2] !== undefined;
  const value = Number(`${amount[1]}.${amount[2] ?? "0"}`);
  try {
    // Latin digits in every language, matching what the owner typed.
    return new Intl.NumberFormat(`${locale}-u-nu-latn`, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return typed;
  }
}
