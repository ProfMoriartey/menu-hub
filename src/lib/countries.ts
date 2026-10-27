// src/lib/countries.ts

/*
 * Countries are stored as ISO 3166-1 alpha-2 codes and named in the
 * reader's language with Intl.DisplayNames. Rows saved before the list
 * existed may hold a typed name, which is shown as it is.
 *
 * Name countries on the server and pass the text down: browsers ship
 * different name data than Node ("Turkey" or "Türkiye"), which would make
 * server and client renders disagree.
 */
export const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT",
  "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI",
  "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY",
  "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM",
  "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK",
  "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL",
  "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR",
  "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN",
  "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS",
  "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW",
  "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP",
  "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM",
  "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM",
  "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF",
  "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW",
  "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

// Not a type guard: a string that isn't a code is still a string (older
// typed names), which a guard would narrow away.
export const isCountryCode = (value: unknown): boolean =>
  COUNTRY_CODES.includes(value as CountryCode);

const displayNames = new Map<string, Intl.DisplayNames>();
function namesIn(locale: string) {
  let names = displayNames.get(locale);
  if (!names) {
    names = new Intl.DisplayNames([locale], { type: "region" });
    displayNames.set(locale, names);
  }
  return names;
}

/** The country's name in `locale`, or older typed text as it is. */
export function countryName(
  value: string | null | undefined,
  locale: string,
): string | null {
  if (!value) return null;
  if (!isCountryCode(value)) return value;
  try {
    return namesIn(locale).of(value) ?? value;
  } catch {
    return value;
  }
}

/** Every country as { code, name }, sorted by name in `locale`. */
export function countryOptions(locale: string) {
  const collator = new Intl.Collator(locale);
  return COUNTRY_CODES.map((code) => ({
    code,
    name: countryName(code, locale) ?? code,
  })).sort((a, b) => collator.compare(a.name, b.name));
}

export type CountryOption = ReturnType<typeof countryOptions>[number];
