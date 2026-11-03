/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Renamed pages: Themes became Features, Restaurants became Menus. Keep
  // shared links working.
  async redirects() {
    return [
      { source: "/themes", destination: "/features", permanent: true },
      {
        source: "/:locale(en|tr|ar|es|ru)/themes",
        destination: "/:locale/features",
        permanent: true,
      },
      { source: "/restaurants", destination: "/menus", permanent: true },
      {
        source: "/:locale(en|tr|ar|es|ru)/restaurants",
        destination: "/:locale/menus",
        permanent: true,
      },
    ];
  },
  images: {
    // Smaller files than WebP alone, for guests on mobile data.
    formats: ["image/avif", "image/webp"],
    // Uploaded photos never change (a new photo gets a new URL), so the
    // resized copies can be kept for a month (Next.js re-checks every 60s by default).
    minimumCacheTTL: 2592000,
    remotePatterns: [
      // UploadThing: legacy file URLs and current per-app URLs
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "placehold.co" },
      // Clerk profile photos (admin users pages)
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
