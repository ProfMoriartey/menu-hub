// src/lib/plans.ts
// The plans restaurants pay for, what each includes, and what a
// restaurant may use: its tier's features, changed by any admin override
// (a special deal). Prices are in US dollars.

export const TIERS = ["standard", "pro", "business"] as const;
export type Tier = (typeof TIERS)[number];
export const isTier = (value: unknown): value is Tier => TIERS.includes(value as Tier);

export interface TierFeatures {
  label: string;
  // US dollars a month.
  price: number;
  // Branches included in the price, and the most allowed (null = no limit).
  includedBranches: number;
  maxBranches: number | null;
  // Each branch beyond those included, a month. Standard has none to sell:
  // more branches there only come with a special deal, at no extra cost.
  extraBranchPrice: number;
  customColors: boolean;
  // Menu languages besides the main one (null = all of them).
  extraLanguages: number | null;
}

export const PLAN_CURRENCY = "USD";
// Each branch beyond those included, on Pro and Business, a month.
export const EXTRA_BRANCH_PRICE = 15;
// A year costs 10 months: 2 months free.
export const MONTHS_PAID_PER_YEAR = 10;

export const TIER_FEATURES: Record<Tier, TierFeatures> = {
  standard: {
    label: "Standard",
    price: 25,
    includedBranches: 1,
    maxBranches: 1,
    extraBranchPrice: 0,
    customColors: false,
    extraLanguages: 0,
  },
  pro: {
    label: "Pro",
    price: 45,
    includedBranches: 3,
    maxBranches: 5,
    extraBranchPrice: EXTRA_BRANCH_PRICE,
    customColors: true,
    extraLanguages: 2,
  },
  business: {
    label: "Business",
    price: 120,
    includedBranches: 10,
    maxBranches: null,
    extraBranchPrice: EXTRA_BRANCH_PRICE,
    customColors: true,
    extraLanguages: null,
  },
};

export const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "yearly", label: "Yearly", months: 12 },
] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number]["value"];
export const isBillingCycle = (value: unknown): value is BillingCycle =>
  BILLING_CYCLES.some((c) => c.value === value);
export const cycleMonths = (cycle: string) => (cycle === "yearly" ? 12 : 1);

/** An admin's changes to a tier, for one restaurant. Null = as the tier. */
export interface FeatureOverrides {
  customColors: boolean | null;
  extraLanguages: number | null;
  maxBranches: number | null;
}

export const NO_OVERRIDES: FeatureOverrides = { customColors: null, extraLanguages: null, maxBranches: null };

/** What a restaurant may use: what a restaurant row stores (schema.ts). */
export interface Entitlements {
  customColors: boolean;
  // null = no limit.
  extraLanguages: number | null;
  maxBranches: number | null;
}

/**
 * The tier's features with the overrides on top. A restaurant without a
 * plan gets Standard's (an admin can still override them).
 */
export function entitlements(tier: Tier | null, overrides: FeatureOverrides): Entitlements {
  const base = TIER_FEATURES[tier ?? "standard"];
  return {
    customColors: overrides.customColors ?? base.customColors,
    extraLanguages: overrides.extraLanguages ?? base.extraLanguages,
    maxBranches: overrides.maxBranches ?? base.maxBranches,
  };
}

/** The branches a restaurant is billed for: those it has, up to its limit. */
export const billedBranches = (branchCount: number, maxBranches: number | null) =>
  maxBranches === null ? branchCount : Math.min(branchCount, maxBranches);

/**
 * What a tier costs a month with `branches` branches: its price plus each
 * branch beyond those included.
 */
export function tierMonthlyPrice(tier: Tier, branches: number): number {
  const features = TIER_FEATURES[tier];
  return features.price + Math.max(0, branches - features.includedBranches) * features.extraBranchPrice;
}

/** What one billing period costs: a month, or a year (10 months' price). */
export const periodPrice = (monthly: number, cycle: string) =>
  cycle === "yearly" ? monthly * MONTHS_PAID_PER_YEAR : monthly;

/** A restaurant's plan as saved (schema.ts restaurantBilling). */
export interface PlanSettings {
  tier: string | null;
  billingCycle: string;
  // A special price a month, in `currency`; null = the tier's.
  monthlyPrice: string | null;
  currency: string;
  startsOn: string | null;
}

export interface PlanPricing {
  tier: Tier;
  // What it costs a month, and in which currency.
  monthly: number;
  currency: string;
  // A special price set by an admin, rather than the tier's.
  custom: boolean;
  // The tier's own price and the branches billed beyond those included.
  base: number;
  extraBranches: number;
  // What a period costs (a month, or a year at 10 months' price).
  period: number;
  periodMonths: number;
}

/**
 * What a restaurant on a plan pays, for `branchCount` branches (counted up
 * to its branch limit). Null when it isn't billed.
 */
export function planPricing(
  plan: PlanSettings | null,
  limits: Entitlements,
  branchCount: number,
): PlanPricing | null {
  if (!plan || !isTier(plan.tier)) return null;
  const tier = plan.tier;
  const features = TIER_FEATURES[tier];
  const billed = billedBranches(branchCount, limits.maxBranches);
  // Only branches that cost extra are counted as extra.
  const extraBranches = features.extraBranchPrice > 0 ? Math.max(0, billed - features.includedBranches) : 0;
  const custom = plan.monthlyPrice !== null;
  const monthly = custom ? Number(plan.monthlyPrice) : tierMonthlyPrice(tier, billed);
  return {
    tier,
    monthly,
    currency: custom ? plan.currency : PLAN_CURRENCY,
    custom,
    base: features.price,
    extraBranches,
    period: periodPrice(monthly, plan.billingCycle),
    periodMonths: cycleMonths(plan.billingCycle),
  };
}
