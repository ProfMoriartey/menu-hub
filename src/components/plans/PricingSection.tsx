// src/components/plans/PricingSection.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { PlanFeatureList, usePlanMoney } from "~/components/plans/PlanFeatures";
import { MONTHS_PAID_PER_YEAR, TIERS, TIER_FEATURES, periodPrice } from "~/lib/plans";
import { cn } from "~/lib/utils";

/**
 * The plans and their prices (lib/plans), monthly or yearly, each with a
 * button that starts the sign-up on that plan. On the home and Features
 * pages, at #pricing.
 */
export function PricingSection({ className }: { className?: string }) {
  const t = useTranslations("Plans");
  const money = usePlanMoney();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" aria-labelledby="pricing-title" className={cn("scroll-mt-20", className)}>
      <div className="flex flex-col items-center text-center">
        <h2 id="pricing-title" className="text-3xl font-bold tracking-tight">
          {t("pricingTitle")}
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl">{t("pricingIntro")}</p>
        <div role="radiogroup" aria-label={t("cycleLabel")} className="bg-muted mt-6 inline-flex rounded-full p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cycle === c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium",
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

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => {
          const f = TIER_FEATURES[tier];
          const popular = tier === "pro";
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
              <p className="mt-2">
                <span className="text-4xl font-extrabold tabular-nums">
                  {money(cycle === "yearly" ? periodPrice(f.price, "yearly") : f.price)}
                </span>
                <span className="text-muted-foreground ms-1 text-sm">
                  {cycle === "yearly" ? t("perYearShort") : t("perMonthShort")}
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{t(`tagline.${tier}`)}</p>
              <PlanFeatureList tier={tier} className="mt-5 flex-1 space-y-2 text-sm" />
              <Button className="mt-6 w-full rounded-full" variant={popular ? "default" : "outline"} asChild>
                <Link href={`/start?plan=${tier}&cycle=${cycle}`}>{t("choose", { plan: f.label })}</Link>
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground mt-6 text-center text-sm">{t("pricingNote")}</p>
    </section>
  );
}
