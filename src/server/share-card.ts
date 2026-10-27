// src/server/share-card.ts
import { getTranslations } from "next-intl/server";
import { getShareTargets } from "~/server/public-origin";

/**
 * What a table card shows for `branchId` (from the print page's ?branch=):
 * that branch's links and "Restaurant – Branch" as its name, or the whole
 * restaurant's when there's no such branch.
 */
export async function tableCardFor(
  restaurant: { id: string; slug: string; name: string },
  branchId: string | string[] | undefined,
) {
  const [targets, t] = await Promise.all([
    getShareTargets(restaurant),
    getTranslations("PublicMenu"),
  ]);
  const target = targets.find((x) => x.branchId !== null && x.branchId === branchId) ?? targets[0]!;
  return {
    menuUrl: target.menuUrl,
    permanentUrl: target.permanentUrl,
    name: target.branchId
      ? t("branchTitle", { name: restaurant.name, branch: target.label ?? t("mainBranch") })
      : restaurant.name,
  };
}
