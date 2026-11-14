// src/components/plans/PricingSection.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PlanFeatureList, TrialPrice } from "~/components/plans/PlanFeatures";
import { FREE_MONTHS, MONTHS_PAID_PER_YEAR, OFFERED_TIERS, TIER_FEATURES } from "~/lib/plans";
import { cn } from "~/lib/utils";

/**
 * The plans on offer and their prices (lib/plans), monthly or yearly, each
 * with its free months and a button that starts the sign-up on that plan.
 * On the home, Features and Pricing pages, at #pricing.
 */
export function PricingSection({ className }: { className?: string }) {
  const t = useTranslations("Plans");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" aria-labelledby="pricing-title" className={cn("scroll-mt-20", className)}>
      <div className="flex flex-col items-center text-center">
        <h2 id="pricing-title" className="text-3xl font-bold tracking-tight">
          {t("pricingTitle")}
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">{t("pricingIntro", { count: FREE_MONTHS })}</p>
        <div role="radiogroup" aria-label={t("cycleLabel")} className="bg-muted mt-6 inline-flex rounded-[14px] p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cycle === c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-[10px] px-4 py-1.5 text-sm font-medium",
                cycle === c ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t(c)}
              {c === "yearly" && (
                <span className="text-primary ms-1 text-xs">{t("yearlySave", { count: 12 - MONTHS_PAID_PER_YEAR })}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* One plan for now: a single card, centred. */}
      <ul
        className={cn(
          "mt-10 grid gap-4",
          OFFERED_TIERS.length === 1 ? "mx-auto max-w-sm" : "md:grid-cols-3",
        )}
      >
        {OFFERED_TIERS.map((tier) => {
          const f = TIER_FEATURES[tier];
          const popular = OFFERED_TIERS.length > 1 && tier === "pro";
          return (
            <li
              key={tier}
              className={cn(
                "bg-card relative flex flex-col rounded-2xl border p-6 shadow-sm",
                popular ? "border-primary ring-primary/30 ring-2" : "border-border",
              )}
            >
              {popular && (
                <span className="bg-primary text-primary-foreground absolute -top-3 start-6 rounded-full px-3 py-0.5 text-xs font-semibold">
                  {t("popular")}
                </span>
              )}
              <h3 className="text-lg font-bold">{f.label}</h3>
              <TrialPrice tier={tier} cycle={cycle} freeMonths={FREE_MONTHS} className="mt-3" />
              <p className="text-muted-foreground mt-3 text-sm">{t(`tagline.${tier}`)}</p>
              <PlanFeatureList tier={tier} className="mt-5 flex-1 space-y-2 text-sm" />
              <Button
                className="mt-6 w-full rounded-[10px]"
                variant={popular || OFFERED_TIERS.length === 1 ? "default" : "outline"}
                asChild
              >
                <Link href={`/start?plan=${tier}&cycle=${cycle}`}>{t("startTrial")}</Link>
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground mt-6 text-center text-sm">{t("pricingNote")}</p>
    </section>
  );
}
