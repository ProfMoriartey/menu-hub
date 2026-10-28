// src/server/public-branch.ts
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "~/i18n/navigation";
import { getPublicBranches, getRestaurantBySlug } from "~/server/public-menu";
import { EMPTY_LOCATION, visibleBranches, type BranchLocation } from "~/server/branches";
import { describeOpenStatus } from "~/components/public/OpeningHours";
import { countryName } from "~/lib/countries";
import type { BranchChoice } from "~/components/public/BranchPicker";

/*
 * Which branch a public page is about. A restaurant with one branch has no
 * branch pages: /lokanta shows that branch. With several, /lokanta is the
 * whole restaurant (guests pick a branch) and /lokanta/kadikoy one branch.
 */

export type PublicBranch = Awaited<ReturnType<typeof getPublicBranches>>[number];

// Under a restaurant: the menu (""), or its about page.
export type BranchSubpage = "" | "/about";

const locationOf = ({ id: _id, name: _name, slug: _slug, ...location }: PublicBranch): BranchLocation =>
  location;

/** What guests call a branch: its name, else its city. */
export const branchLabel = (branch: Pick<PublicBranch, "name" | "city">, fallback: string) =>
  branch.name ?? branch.city ?? fallback;

/**
 * The restaurant (with the location of the branch the page is about, or
 * none on a several-branch restaurant's own page), its branches and the
 * page's base path. "missing" when the restaurant or branch doesn't exist;
 * "redirect" when the branch page should be the restaurant's (an only
 * branch).
 */
export async function findBranchPage(restaurantSlug: string, branchSlug: string | null) {
  const restaurant = await getRestaurantBySlug(restaurantSlug);
  if (!restaurant) return { kind: "missing" as const };
  // Branches beyond the plan's limit don't have pages.
  const branches = visibleBranches(await getPublicBranches(restaurant.id), restaurant.maxBranches);
  const isMulti = branches.length > 1;

  const branch = branchSlug
    ? branches.find((b) => b.slug === branchSlug)
    : isMulti
      ? null
      : branches[0] ?? null;
  if (branch === undefined) return { kind: "missing" as const };
  if (branchSlug && !isMulti) return { kind: "redirect" as const, to: `/${restaurant.slug}` };

  return {
    kind: "page" as const,
    restaurant: { ...restaurant, ...(branch ? locationOf(branch) : EMPTY_LOCATION) },
    branches,
    branch,
    isMulti,
    // Where this page's links (menu, about) start.
    base: branch && isMulti ? `/${restaurant.slug}/${branch.slug}` : `/${restaurant.slug}`,
  };
}

/** The branch picker's list, with whether each branch is open now. */
export async function branchChoices(
  restaurantSlug: string,
  branches: PublicBranch[],
  current: PublicBranch | null,
  subpage: BranchSubpage,
): Promise<BranchChoice[]> {
  const [t, locale] = await Promise.all([getTranslations("PublicMenu"), getLocale()]);
  const now = new Date();
  return branches.map((branch) => {
    const open =
      branch.openingHours && branch.timeZone
        ? describeOpenStatus(branch.openingHours, branch.timeZone, now, t, locale)
        : null;
    return {
      id: branch.id,
      href: `/${restaurantSlug}/${branch.slug}${subpage}`,
      label: branchLabel(branch, t("mainBranch")),
      place: [branch.address ?? branch.city, countryName(branch.country, locale)]
        .filter(Boolean)
        .join(" · "),
      open: open && {
        isOpen: open.isOpen,
        label: [open.label, open.detail].filter(Boolean).join(" · "),
      },
      current: branch.id === current?.id,
    };
  });
}

/** findBranchPage for a page: a 404 or a redirect when it isn't one. */
export async function getBranchPage(
  restaurantSlug: string,
  branchSlug: string | null,
  subpage: BranchSubpage,
) {
  const found = await findBranchPage(restaurantSlug, branchSlug);
  if (found.kind === "missing") notFound();
  if (found.kind === "redirect") {
    return redirect({ href: `${found.to}${subpage}`, locale: await getLocale() });
  }
  return found;
}
