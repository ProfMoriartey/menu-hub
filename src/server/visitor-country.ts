// src/server/visitor-country.ts
import { headers } from "next/headers";
import { env } from "~/env";
import { isCountryCode } from "~/lib/countries";

// Country headers set by the host from the visitor's IP address: Vercel's,
// then Cloudflare's. Nothing asks the visitor for their location.
const COUNTRY_HEADERS = ["x-vercel-ip-country", "cf-ipcountry"];

/**
 * The visitor's country as an ISO code, from the host's IP lookup, or null
 * when the host doesn't say (or says "unknown"/"Tor"). VISITOR_COUNTRY_FALLBACK
 * stands in when there's no header, e.g. in local development.
 */
export async function getVisitorCountry(): Promise<string | null> {
  const requestHeaders = await headers();
  for (const name of COUNTRY_HEADERS) {
    const value = requestHeaders.get(name)?.trim().toUpperCase();
    if (value && isCountryCode(value)) return value;
  }
  const fallback = env.VISITOR_COUNTRY_FALLBACK?.toUpperCase();
  return fallback && isCountryCode(fallback) ? fallback : null;
}
