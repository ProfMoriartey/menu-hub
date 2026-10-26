// src/server/public-metadata.ts
import type { Metadata } from "next";
import { routing } from "~/i18n/routing";
import { getPublicOrigin } from "~/server/public-origin";

/**
 * Title, description, link-preview card and language links for a public
 * restaurant page. `path` has no locale ("/my-cafe/about"): each language
 * version links to the others, and the locale-free address is the default
 * (the middleware sends visitors to their own language).
 *
 * URLs are absolute and built from the public origin, so previews never
 * point at localhost or a preview deployment when NEXT_PUBLIC_APP_URL is set.
 */
export async function publicPageMetadata({
  locale,
  path,
  title,
  description,
  image,
  siteName,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  // A photo makes a big preview card; a logo, a small one.
  image?: { url: string; large: boolean } | null;
  siteName: string;
}): Promise<Metadata> {
  const origin = await getPublicOrigin();
  const url = `${origin}/${locale}${path}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${origin}/${l}${path}`]),
  );
  languages["x-default"] = `${origin}${path}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName,
      locale,
      images: image ? [{ url: image.url, alt: title }] : undefined,
    },
    twitter: {
      card: image?.large ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

/**
 * The restaurant's preview image: the share image set in the admin form
 * (meant for big cards), else the logo (a small square card), else none.
 */
export function restaurantPreviewImage(restaurant: {
  ogImage: string | null;
  logoUrl: string | null;
}) {
  if (restaurant.ogImage) return { url: restaurant.ogImage, large: true };
  if (restaurant.logoUrl) return { url: restaurant.logoUrl, large: false };
  return null;
}

/** Shortens text for a meta description at a word boundary. */
export function clip(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}
