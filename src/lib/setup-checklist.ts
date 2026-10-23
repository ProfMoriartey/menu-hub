// src/lib/setup-checklist.ts
// The getting-started checklist for a restaurant. Every step is worked out
// from data the restaurant already has, so it completes itself as the owner
// makes progress; nothing is ticked by hand.

export interface SetupFacts {
  hasLogo: boolean;
  hasDescription: boolean;
  categoryCount: number;
  // Items guests can see (available or sold out).
  visibleItemCount: number;
  isActive: boolean;
  scanCount: number;
}

export const SETUP_STEPS = ["logo", "description", "categories", "items", "live", "scan"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

// Steps that change restaurant details, which only owners and admins can do.
export const OWNER_STEPS: readonly SetupStep[] = ["logo", "description"];

export function isStepDone(step: SetupStep, facts: SetupFacts): boolean {
  switch (step) {
    case "logo":
      return facts.hasLogo;
    case "description":
      return facts.hasDescription;
    case "categories":
      return facts.categoryCount > 0;
    case "items":
      return facts.visibleItemCount > 0;
    case "live":
      return facts.isActive;
    case "scan":
      return facts.scanCount > 0;
  }
}

export interface SetupProgress {
  done: number;
  total: number;
  complete: boolean;
  // Everything a restaurant can do itself is done; it only needs publishing.
  readyToGoLive: boolean;
}

export function setupProgress(facts: SetupFacts): SetupProgress {
  const done = SETUP_STEPS.filter((step) => isStepDone(step, facts)).length;
  // The first scan can only happen once the menu is live, so it isn't
  // required before publishing.
  const beforeLive = SETUP_STEPS.filter((step) => step !== "live" && step !== "scan");
  return {
    done,
    total: SETUP_STEPS.length,
    complete: done === SETUP_STEPS.length,
    readyToGoLive: !facts.isActive && beforeLive.every((step) => isStepDone(step, facts)),
  };
}
