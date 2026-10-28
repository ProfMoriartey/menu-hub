// src/components/plans/OwnerPlanControls.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, Clock, Globe, EyeOff, PauseCircle } from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { usePlanMoney } from "~/components/plans/PlanFeatures";
import { cancelPlanChange, requestPlanChange, setRestaurantLive } from "~/app/actions/plan-requests";
import { MONTHS_PAID_PER_YEAR, TIERS, TIER_FEATURES, periodPrice, type Tier } from "~/lib/plans";
import { cn } from "~/lib/utils";

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="text-destructive inline-flex items-center gap-1.5 text-sm" role="alert">
      <CircleAlert className="h-4 w-4 shrink-0" /> {error}
    </p>
  );
}

/**
 * Putting the menu live or taking it offline, once the sign-up is
 * approved. Until then, it says it's waiting. While an admin has paused
 * the menu, it says why and can only take it offline.
 */
export function GoLiveCard({
  restaurantId,
  isActive,
  approved,
  pausedReason,
}: {
  restaurantId: string;
  isActive: boolean;
  approved: boolean;
  // Set while an admin has paused the menu: "unpaid" or "other".
  pausedReason: string | null;
}) {
  const t = useTranslations("OwnerPlan");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const change = (live: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await setRestaurantLive(restaurantId, live);
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  };

  return (
    <section
      id="live"
      aria-labelledby="live-title"
      className="bg-card border-border scroll-mt-24 space-y-3 rounded-xl border p-5 shadow-sm sm:p-6"
    >
      <h2 id="live-title" className="flex items-center gap-2 text-base font-semibold">
        {pausedReason ? (
          <PauseCircle className="h-4 w-4 text-red-600" aria-hidden />
        ) : isActive ? (
          <Globe className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden />
        )}
        {pausedReason ? t("pausedTitle") : isActive ? t("liveTitle") : t("offlineTitle")}
      </h2>
      {pausedReason ? (
        <div className="space-y-3">
          <p className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/5 p-3 text-sm">
            <PauseCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
            {pausedReason === "unpaid" ? t("pausedUnpaid") : t("pausedOther")}
          </p>
          {isActive && (
            <Button variant="outline" onClick={() => change(false)} disabled={isPending}>
              {isPending ? t("saving") : t("takeOffline")}
            </Button>
          )}
        </div>
      ) : !approved ? (
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {t("waitingApproval")}
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">{isActive ? t("liveText") : t("offlineText")}</p>
          <Button
            variant={isActive ? "outline" : "default"}
            onClick={() => change(!isActive)}
            disabled={isPending}
          >
            {isPending ? t("saving") : isActive ? t("takeOffline") : t("goLive")}
          </Button>
        </>
      )}
      <ErrorLine error={error} />
    </section>
  );
}

/**
 * Asking for another plan (or yearly billing): it reaches an admin, who
 * gets in touch about the price. An open request can be withdrawn.
 */
export function PlanChangeForm({
  restaurantId,
  current,
  currentCycle,
  openRequest,
}: {
  restaurantId: string;
  current: Tier | null;
  currentCycle: string;
  openRequest: { tier: string; billingCycle: string } | null;
}) {
  const t = useTranslations("OwnerPlan");
  const tPlans = useTranslations("Plans");
  const router = useRouter();
  const money = usePlanMoney();
  const [isPending, startTransition] = useTransition();
  const [tier, setTier] = useState<Tier>(current === "business" ? "business" : current === "pro" ? "business" : "pro");
  const [cycle, setCycle] = useState<"monthly" | "yearly">(currentCycle === "yearly" ? "yearly" : "monthly");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestPlanChange(restaurantId, { tier, billingCycle: cycle, note });
      if (!result.ok) return setError(result.error);
      setNote("");
      router.refresh();
    });
  };
  const cancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelPlanChange(restaurantId);
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  };
  const unchanged = tier === current && cycle === (currentCycle === "yearly" ? "yearly" : "monthly");

  return (
    <section
      aria-labelledby="change-title"
      className="bg-card border-border space-y-4 rounded-xl border p-5 shadow-sm sm:p-6"
    >
      <div>
        <h2 id="change-title" className="text-base font-semibold">
          {t("changeTitle")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("changeText")}</p>
      </div>

      {openRequest ? (
        <div className="bg-primary/5 border-primary/20 space-y-3 rounded-lg border p-4">
          <p className="flex items-start gap-2 text-sm">
            <Clock className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t("requestOpen", {
              plan: TIER_FEATURES[openRequest.tier as Tier]?.label ?? openRequest.tier,
              cycle: tPlans(openRequest.billingCycle === "yearly" ? "yearly" : "monthly").toLowerCase(),
            })}
          </p>
          <Button variant="ghost" size="sm" onClick={cancel} disabled={isPending}>
            {t("withdraw")}
          </Button>
        </div>
      ) : (
        <>
          <div role="radiogroup" aria-label={t("changeTitle")} className="grid gap-2 sm:grid-cols-3">
            {TIERS.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={tier === id}
                onClick={() => setTier(id)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-start",
                  tier === id ? "border-primary bg-primary/5 ring-primary/30 ring-1" : "border-border hover:bg-accent/40",
                )}
              >
                <span className="block font-semibold">
                  {TIER_FEATURES[id].label}
                  {id === current && <span className="text-muted-foreground ms-1 text-xs font-normal">· {t("current")}</span>}
                </span>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {cycle === "yearly"
                    ? tPlans("perYear", { price: money(periodPrice(TIER_FEATURES[id].price, "yearly")) })
                    : tPlans("perMonth", { price: money(TIER_FEATURES[id].price) })}
                </span>
              </button>
            ))}
          </div>
          <div role="radiogroup" aria-label={t("cycleLabel")} className="bg-muted inline-flex rounded-full p-1">
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
                {tPlans(c)}
                {c === "yearly" && (
                  <span className="text-primary ms-1 text-xs">
                    {tPlans("yearlySave", { count: 12 - MONTHS_PAID_PER_YEAR })}
                  </span>
                )}
              </button>
            ))}
          </div>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            aria-label={t("notePlaceholder")}
            maxLength={1000}
          />
          <Button onClick={send} disabled={isPending || unchanged}>
            {isPending ? t("saving") : t("sendRequest")}
          </Button>
        </>
      )}
      <ErrorLine error={error} />
    </section>
  );
}
