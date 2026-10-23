// src/server/public-origin.ts
import { headers } from "next/headers";
import { env } from "~/env";

/**
 * The site's public address for links that leave the app, such as QR codes:
 * NEXT_PUBLIC_APP_URL when set (it should be in production, so codes don't
 * point at a preview deployment), otherwise the address of this request.
 */
export async function getPublicOrigin(): Promise<string> {
  if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

/** The links a restaurant is shared with. */
export async function getShareLinks(restaurant: { id: string; slug: string }) {
  const origin = await getPublicOrigin();
  return {
    // Readable, for typing or posting; changes if the slug changes.
    menuUrl: `${origin}/${restaurant.slug}`,
    // What QR codes encode; forwards to the current menu forever.
    permanentUrl: `${origin}/r/${restaurant.id}`,
  };
}
