/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The old Themes page became Features; keep shared links working.
  async redirects() {
    return [
      { source: "/themes", destination: "/features", permanent: true },
      {
        source: "/:locale(en|tr|ar|es|ru)/themes",
        destination: "/:locale/features",
        permanent: true,
      },
    ];
  },
  images: {
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
