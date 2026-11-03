// src/components/admin/RestaurantAdminHeader.tsx
import { ChevronRight, ExternalLink, Eye } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { StatusBadges } from "~/components/admin/RestaurantCard";
import { RestaurantLogo } from "~/components/shared/RestaurantLogo";
import { cn } from "~/lib/utils";
import type { Restaurant } from "~/types/restaurant";

type HeaderRestaurant = Pick<
  Restaurant,
  "name" | "slug" | "logoUrl" | "isActive" | "isDisplayed"
>;

interface RestaurantAdminHeaderProps {
  restaurant: HeaderRestaurant;
  activeTab: "details" | "menu" | "share" | "colors" | "people" | "plan";
  // Extra breadcrumb steps after the restaurant, e.g. a category.
  trail?: { label: string; href?: string }[];
}

export function RestaurantAdminHeader({
  restaurant,
  activeTab,
  trail = [],
}: RestaurantAdminHeaderProps) {
  const tabs = [
    {
      id: "details",
      label: "Details",
      href: `/admin/restaurants/${restaurant.slug}/edit`,
    },
    {
      id: "menu",
      label: "Menu",
      href: `/admin/restaurants/${restaurant.slug}/menu`,
    },
    {
      id: "share",
      label: "Share",
      href: `/admin/restaurants/${restaurant.slug}/share`,
    },
    {
      id: "colors",
      label: "Appearance",
      href: `/admin/restaurants/${restaurant.slug}/colors`,
    },
    {
      id: "people",
      label: "People",
      href: `/admin/restaurants/${restaurant.slug}/people`,
    },
    {
      id: "plan",
      label: "Plan",
      href: `/admin/restaurants/${restaurant.slug}/plan`,
    },
  ] as const;

  const crumbs = [
    { label: "Restaurants", href: "/admin/restaurants" },
    {
      label: restaurant.name,
      href: trail.length > 0 ? tabs[1].href : undefined,
    },
    ...trail,
  ];

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => (
            <li key={i} className="flex min-w-0 items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
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
              <span className="text-muted-foreground font-mono text-sm">
                /{restaurant.slug}
              </span>
              <StatusBadges restaurant={restaurant} />
            </div>
          </div>
        </div>
        {/* Inactive restaurants open as a preview only people with access see. */}
        <Button variant="outline" asChild>
          <Link href={`/${restaurant.slug}/preview`} target="_blank">
            {restaurant.isActive ? (
              <>
                View live menu <ExternalLink className="h-4 w-4" />
              </>
            ) : (
              <>
                Preview menu <Eye className="h-4 w-4" />
              </>
            )}
          </Link>
        </Button>
      </div>

      <nav
        aria-label="Restaurant sections"
        className="border-border scrollbar-hide flex gap-1 overflow-x-auto border-b"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
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
