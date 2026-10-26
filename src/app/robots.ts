// src/app/robots.ts
import type { MetadataRoute } from "next";
import { routing } from "~/i18n/routing";
import { getPublicOrigin } from "~/server/public-origin";

// Signed-in areas have nothing for search engines, and /r/ links only
// forward to menus (crawling them would also hit the scan counter).
const PRIVATE_PAGES = ["/admin", "/dashboard", "/sign-in"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getPublicOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/r/",
        ...PRIVATE_PAGES,
        ...routing.locales.flatMap((locale) =>
          PRIVATE_PAGES.map((page) => `/${locale}${page}`),
        ),
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
