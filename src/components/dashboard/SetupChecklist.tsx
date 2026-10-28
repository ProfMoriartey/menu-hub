// src/components/dashboard/SetupChecklist.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, ChevronRight, Rocket } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import {
  isStepDone,
  OWNER_STEPS,
  SETUP_STEPS,
  setupProgress,
  type SetupFacts,
  type SetupStep,
} from "~/lib/setup-checklist";
import { cn } from "~/lib/utils";

interface SetupChecklistProps {
  restaurant: { id: string; slug: string };
  facts: SetupFacts;
  canEditDetails: boolean;
  // The first category's slug, so "Add items" can open it directly.
  firstCategorySlug: string | null;
}

// Collapsing is a per-browser convenience; storage can be unavailable
// (private windows, blocked site data), so every access is guarded.
const storageKey = (restaurantId: string) => `setup-checklist-collapsed:${restaurantId}`;
function readCollapsed(restaurantId: string) {
  try {
    return window.localStorage.getItem(storageKey(restaurantId)) === "1";
  } catch {
    return false;
  }
}
function writeCollapsed(restaurantId: string, collapsed: boolean) {
  try {
    if (collapsed) window.localStorage.setItem(storageKey(restaurantId), "1");
    else window.localStorage.removeItem(storageKey(restaurantId));
  } catch {
    // Not remembered; the panel just opens again next time.
  }
}

export function SetupChecklist({ restaurant, facts, canEditDetails, firstCategorySlug }: SetupChecklistProps) {
  const t = useTranslations("Setup");
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setCollapsed(readCollapsed(restaurant.id)), [restaurant.id]);

  const progress = setupProgress(facts);
  if (progress.complete) return null;

  const base = `/dashboard/${restaurant.slug}`;
  const actions: Record<SetupStep, { href: string; newTab?: boolean } | null> = {
    logo: canEditDetails ? { href: `${base}/edit#logo` } : null,
    description: canEditDetails ? { href: `${base}/edit#basics` } : null,
    categories: { href: `${base}/menu` },
    items: { href: firstCategorySlug ? `${base}/menu/${firstCategorySlug}` : `${base}/menu` },
    // Owners put the menu live from the Plan tab; editors can preview it.
    live: canEditDetails ? { href: `${base}/plan#live` } : { href: `/${restaurant.slug}`, newTab: true },
    scan: { href: `${base}/share` },
  };

  const toggle = () => {
    writeCollapsed(restaurant.id, !collapsed);
    setCollapsed(!collapsed);
  };

  return (
    <section
      aria-labelledby="setup-title"
      className="bg-card border-primary/30 overflow-hidden rounded-xl border shadow-sm"
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
        <Rocket className="text-primary h-5 w-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="setup-title" className="text-base font-semibold">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {progress.readyToGoLive
              ? canEditDetails
                ? t("readyToPublish")
                : t("readyEditor")
              : t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm tabular-nums">
            {t("progress", { done: progress.done, total: progress.total })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="setup-steps"
          >
            {collapsed ? t("show") : t("hide")}
            <ChevronDown className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")} />
          </Button>
        </div>
        {/* Progress bar */}
        <div
          className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.done}
          aria-label={t("progress", { done: progress.done, total: progress.total })}
        >
          <div className="bg-primary h-full rounded-full" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
        </div>
      </header>

      {!collapsed && (
        <ol id="setup-steps" className="border-border divide-border divide-y border-t">
          {SETUP_STEPS.map((step) => {
            const done = isStepDone(step, facts);
            const action = actions[step];
            const ownerOnly = !canEditDetails && OWNER_STEPS.includes(step);
            return (
              <li key={step} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    done ? "border-emerald-600 bg-emerald-600 text-white" : "border-input",
                  )}
                  aria-hidden
                >
                  {done && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", done && "text-muted-foreground line-through")}>
                    <span className="sr-only">{done ? t("done") : t("todo")}: </span>
                    {t(`${step}.title`)}
                  </p>
                  {!done && (
                    <p className="text-muted-foreground text-sm">
                      {ownerOnly
                        ? t("ownerDoesThis")
                        : step === "live"
                          ? t(canEditDetails ? "live.ownerText" : "live.editorText")
                          : t(`${step}.text`)}
                    </p>
                  )}
                </div>
                {!done && action && !ownerOnly && (
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <Link href={action.href} target={action.newTab ? "_blank" : undefined}>
                      {step === "live" && canEditDetails ? t("live.ownerAction") : t(`${step}.action`)}
                      <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </Link>
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
