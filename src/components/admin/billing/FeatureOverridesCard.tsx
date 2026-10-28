// src/components/admin/billing/FeatureOverridesCard.tsx
"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Link, useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SaveState } from "~/components/admin/billing/billing-fields";
import { saveFeatureOverrides } from "~/app/actions/billing";
import { MENU_LANGUAGES } from "~/lib/menu-languages";
import { TIER_FEATURES, entitlements, isTier, type FeatureOverrides } from "~/lib/plans";

const FROM_PLAN = "plan";
const MAX_EXTRA = MENU_LANGUAGES.length - 1;

const languagesText = (n: number | null) =>
  n === null || n >= MAX_EXTRA ? "all languages" : n === 0 ? "no extra languages" : `up to ${n} extra`;
const branchesText = (n: number | null) => (n === null ? "no limit" : n === 1 ? "1 branch" : `up to ${n}`);

/**
 * Admin only, on the Details tab: what this restaurant may use, as its plan
 * gives it, with a special deal on top for any feature (colours, extra
 * languages, branches). Anything beyond what's allowed is hidden, not
 * deleted.
 */
export function FeatureOverridesCard({
  restaurantId,
  tier,
  overrides,
  planHref,
}: {
  restaurantId: string;
  tier: string | null;
  overrides: FeatureOverrides;
  planHref: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(overrides);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<FeatureOverrides>) => {
    setSaved(false);
    setValues((v) => ({ ...v, ...patch }));
  };

  const planTier = isTier(tier) ? tier : null;
  const plan = entitlements(planTier, { customColors: null, extraLanguages: null, maxBranches: null });
  const now = entitlements(planTier, values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(overrides);

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveFeatureOverrides(restaurantId, values);
      if (!result.ok) return setError(result.error);
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="bg-card border-border scroll-mt-24 rounded-xl border shadow-sm"
    >
      <header className="border-border border-b px-6 py-4">
        <h2 id="features-title" className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4" aria-hidden /> Features
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {planTier ? `On the ${TIER_FEATURES[planTier].label} plan` : "Not billed: Standard's features"} (
          <Link href={planHref} className="text-primary underline underline-offset-2">
            change the plan
          </Link>
          ). Give this restaurant something extra, or less, without changing its plan. Anything beyond what&apos;s
          allowed is hidden, not deleted.
        </p>
      </header>
      <div className="divide-border divide-y px-6">
        <Row
          title="Custom colours"
          current={now.customColors ? "On" : "Off"}
          special={values.customColors !== null}
        >
          <Select
            value={values.customColors === null ? FROM_PLAN : values.customColors ? "on" : "off"}
            onValueChange={(v) => set({ customColors: v === FROM_PLAN ? null : v === "on" })}
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Custom colours">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FROM_PLAN}>From plan ({plan.customColors ? "on" : "off"})</SelectItem>
              <SelectItem value="on">On</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row
          title="Menu languages"
          current={languagesText(now.extraLanguages)}
          special={values.extraLanguages !== null}
        >
          <Select
            value={values.extraLanguages === null ? FROM_PLAN : String(values.extraLanguages)}
            onValueChange={(v) => set({ extraLanguages: v === FROM_PLAN ? null : Number(v) })}
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Menu languages">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FROM_PLAN}>From plan ({languagesText(plan.extraLanguages)})</SelectItem>
              {Array.from({ length: MAX_EXTRA + 1 }, (_, n) => (
                <SelectItem key={n} value={String(n)}>
                  {n === 0 ? "None" : n === MAX_EXTRA ? "All languages" : `Up to ${n} extra`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row title="Branches" current={branchesText(now.maxBranches)} special={values.maxBranches !== null}>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={values.maxBranches === null ? FROM_PLAN : "custom"}
              onValueChange={(v) => set({ maxBranches: v === FROM_PLAN ? null : (plan.maxBranches ?? 10) })}
            >
              <SelectTrigger className="w-full sm:w-56" aria-label="Branches">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FROM_PLAN}>From plan ({branchesText(plan.maxBranches)})</SelectItem>
                <SelectItem value="custom">A set number</SelectItem>
              </SelectContent>
            </Select>
            {values.maxBranches !== null && (
              <Input
                type="number"
                min={1}
                max={100}
                value={values.maxBranches}
                onChange={(e) => set({ maxBranches: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                aria-label="Most branches"
                className="w-24"
              />
            )}
          </div>
        </Row>
      </div>
      <div className="border-border flex flex-wrap items-center gap-3 border-t px-6 py-4">
        <Button type="button" onClick={save} disabled={isPending || !isDirty}>
          {isPending ? "Saving…" : "Save features"}
        </Button>
        <SaveState error={error} saved={saved} />
      </div>
    </section>
  );
}

function Row({
  title,
  current,
  special,
  children,
}: {
  title: string;
  current: string;
  special: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">
          Now: {current}
          {special && <span className="text-primary font-medium"> · special deal</span>}
        </p>
      </div>
      {children}
    </div>
  );
}
