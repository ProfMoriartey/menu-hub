// src/server/public-origin.ts
import { headers } from "next/headers";
import { env } from "~/env";
import { getPublicBranches } from "~/server/public-menu";
import { visibleBranches } from "~/server/branches";

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

/** The links a restaurant, or one of its branches, is shared with. */
export async function getShareLinks(
  restaurant: { id: string; slug: string },
  branch?: { id: string; slug: string },
) {
  const origin = await getPublicOrigin();
  return {
    // Readable, for typing or posting; changes if a slug changes.
    menuUrl: branch
      ? `${origin}/${restaurant.slug}/${branch.slug}`
      : `${origin}/${restaurant.slug}`,
    // What QR codes encode; forwards to the current menu forever.
    permanentUrl: `${origin}/r/${branch?.id ?? restaurant.id}`,
  };
}

/** Something to make a QR code for: the whole restaurant or one branch. */
export interface ShareTarget {
  // Null for the whole restaurant.
  branchId: string | null;
  slug: string;
  // The branch's name (null for the whole restaurant or an unnamed branch).
  label: string | null;
  menuUrl: string;
  permanentUrl: string;
}

/**
 * The restaurant, then each of its branches when it has several: one code
 * per branch takes guests straight to that branch's page.
 */
export async function getShareTargets(restaurant: {
  id: string;
  slug: string;
  maxBranches: number | null;
}): Promise<ShareTarget[]> {
  const all: ShareTarget = {
    branchId: null,
    slug: restaurant.slug,
    label: null,
    ...(await getShareLinks(restaurant)),
  };
  const branches = visibleBranches(await getPublicBranches(restaurant.id), restaurant.maxBranches);
  if (branches.length < 2) return [all];
  return [
    all,
    ...(await Promise.all(
      branches.map(async (branch) => ({
        branchId: branch.id,
        slug: `${restaurant.slug}-${branch.slug}`,
        label: branch.name ?? branch.city,
        ...(await getShareLinks(restaurant, branch)),
      })),
    )),
  ];
}
