// src/server/warm-images.ts
// Asks the site's image optimizer for a new photo's common sizes right
// after it's saved, so the first guest gets a cached copy instead of
// waiting while it's fetched from UploadThing and converted (seconds for a
// large photo). Each size and format is cached on its own.
import { after } from "next/server";
import { env } from "~/env";

// What phones ask for (Next.js's default deviceSizes): a dish card's 50vw is
// 640, the dish sheet's 100vw is 828 to 1200 depending on the screen.
const WIDTHS = [640, 828, 1080, 1200];
// next/image's default quality.
const QUALITY = 75;
// The format guests' browsers get (next.config formats: AVIF first).
const ACCEPT = "image/avif,image/webp,*/*";

/**
 * In production, warms the optimizer's cache for a photo after the
 * response is sent. Best effort: a failure only means the first guest
 * waits, as before.
 */
export function warmImage(url: string | null | undefined) {
  if (!url || process.env.NODE_ENV !== "production" || !env.NEXT_PUBLIC_APP_URL) return;
  const origin = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  after(async () => {
    await Promise.allSettled(
      WIDTHS.map(async (width) => {
        const response = await fetch(
          `${origin}/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${QUALITY}`,
          { headers: { Accept: ACCEPT }, cache: "no-store" },
        );
        // Read it through, so the optimizer finishes and caches it.
        await response.arrayBuffer();
      }),
    );
  });
}
