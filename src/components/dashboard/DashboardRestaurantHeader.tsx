// src/components/dashboard/DashboardRestaurantHeader.tsx
import { getTranslations } from "next-intl/server";
import { ChevronRight, ExternalLink, Eye } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PlatedLogo } from "~/components/shared/Plate";
import { DashboardTabsMenu, type DashboardTab } from "~/components/dashboard/DashboardTabsMenu";
import { canEditDetails, isLive, type RestaurantRole } from "~/lib/access";
import type { Restaurant } from "~/types/restaurant";

interface DashboardRestaurantHeaderProps {
  restaurant: Pick<Restaurant, "name" | "slug" | "logoUrl" | "isActive" | "pausedAt" | "liveUntil">;
  role: RestaurantRole;
  activeTab: "menu" | "details" | "colors" | "languages" | "branches" | "share" | "team" | "plan";
  // Extra breadcrumb steps after the restaurant, e.g. a category.
  trail?: { label: string; href?: string }[];
}

export async function DashboardRestaurantHeader({
  restaurant,
  role,
  activeTab,
  trail = [],
}: DashboardRestaurantHeaderProps) {
  const t = await getTranslations("DashboardRestaurant");
  const tRoles = await getTranslations("Dashboard.accessLevels");

  const base = `/dashboard/${restaurant.slug}`;
  // In the order an owner works: set up the menu and the restaurant, then
  // share; the team and the plan are rare visits. Editors manage the menu
  // only, so they see Menu, Share & stats and Team.
  const owner = canEditDetails(role);
  const tabs: DashboardTab[] = [
    { id: "menu", label: t("menuTab"), href: `${base}/menu` },
    ...(owner
      ? [
          { id: "details", label: t("detailsTab"), href: `${base}/edit` },
          // Experimental (a flask in the menu, a note on the page): every
          // plan has these for now (lib/plans). The colours page explains
          // itself when an admin hasn't enabled it.
          { id: "colors", label: t("colorsTab"), href: `${base}/colors`, experimental: true },
          { id: "languages", label: t("languagesTab"), href: `${base}/languages`, experimental: true },
          { id: "branches", label: t("branchesTab"), href: `${base}/branches`, experimental: true },
        ]
      : []),
    // Everyone with access shares the menu, editors included.
    { id: "share", label: t("shareTab"), href: `${base}/share` },
    // Owners manage the team here; editors see who's on it and can leave.
    { id: "team", label: t("teamTab"), href: `${base}/team` },
    // The plan, going live and asking for another plan.
    ...(owner ? [{ id: "plan", label: t("planTab"), href: `${base}/plan` }] : []),
  ];

  const crumbs = [
    { label: t("dashboard"), href: "/dashboard" },
    {
      label: restaurant.name,
      href: trail.length > 0 ? `${base}/menu` : undefined,
    },
    ...trail,
  ];

  // System admins see the dashboard too; show them as owners.
  const roleLabel = tRoles(role === "editor" ? "editor" : "owner");

  return (
    <div className="mb-8 space-y-4">
      {/* Only deeper pages (a category) need the way back; on the tabs the
          top bar's Dashboard link does it. */}
      {trail.length > 0 && (
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
            {crumbs.map((crumb, i) => (
              <li key={i} className="flex min-w-0 items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 rtl:rotate-180"
                    aria-hidden
                  />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground truncate" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <PlatedLogo restaurant={restaurant} />
          <div className="min-w-0">
            <h1 className="text-foreground truncate text-2xl font-bold tracking-tight">
              {restaurant.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="text-muted-foreground font-mono text-sm"
                dir="ltr"
              >
                /{restaurant.slug}
              </span>
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The sections in one menu, beside the way to the guests' page. */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 sm:max-w-72">
          <DashboardTabsMenu
            tabs={tabs}
            activeId={activeTab}
            label={t("sectionsLabel")}
            experimentalLabel={t("experimental")}
          />
        </div>
        {/* Not live yet: the same page opens as a preview only they can see. */}
        <Button variant="outline" className="h-11 shrink-0" asChild>
          <Link href={`/${restaurant.slug}/preview`} target="_blank">
            {isLive(restaurant) ? t("viewLive") : t("preview")}{" "}
            {isLive(restaurant) ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
}
