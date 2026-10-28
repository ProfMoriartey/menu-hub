// src/components/dashboard/DashboardRestaurantHeader.tsx
import { getTranslations } from "next-intl/server";
import { ChevronRight, ExternalLink, Eye } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { canEditDetails, type RestaurantRole } from "~/lib/access";
import { cn } from "~/lib/utils";
import type { Restaurant } from "~/types/restaurant";

interface DashboardRestaurantHeaderProps {
  restaurant: Pick<Restaurant, "name" | "slug" | "logoUrl" | "isActive">;
  role: RestaurantRole;
  activeTab: "menu" | "details" | "share" | "team" | "colors" | "plan";
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
  const tabs = [
    { id: "menu", label: t("menuTab"), href: `${base}/menu` },
    // Everyone with access shares the menu, editors included.
    { id: "share", label: t("shareTab"), href: `${base}/share` },
    // Owners manage the team here; editors see who's on it and can leave.
    { id: "team", label: t("teamTab"), href: `${base}/team` },
    // Editors manage the menu only, so they don't get a details tab.
    ...(canEditDetails(role)
      ? [
          { id: "details", label: t("detailsTab"), href: `${base}/edit` },
          // The colours page explains itself when an admin hasn't enabled it.
          { id: "colors", label: t("colorsTab"), href: `${base}/colors` },
          // The plan, going live and asking for another plan.
          { id: "plan", label: t("planTab"), href: `${base}/plan` },
        ]
      : []),
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
    <div className="mb-8 space-y-5">
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <RestaurantLogo restaurant={restaurant} size="lg" />
          <div className="min-w-0">
            <h1 className="text-foreground truncate text-3xl font-bold tracking-tight">
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
        {/* Not live yet: the same page opens as a preview only they can see. */}
        <Button variant="outline" asChild>
          <Link href={`/${restaurant.slug}`} target="_blank">
            {restaurant.isActive ? t("viewLive") : t("preview")}{" "}
            {restaurant.isActive ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Link>
        </Button>
      </div>

      <nav
        aria-label={t("menuTab")}
        className="border-border flex gap-1 border-b"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
