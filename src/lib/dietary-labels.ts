// src/lib/dietary-labels.ts
import type { DietaryLabel } from "~/types/restaurant";

// Matches dietaryLabelEnum in the database schema; values map to their
// translation keys under MenuEditor.dietary. Kept free of other imports so the
// public menu can use it without pulling in the editor or the schema.
export const DIETARY_LABEL_KEYS: Record<DietaryLabel, string> = {
  vegetarian: "vegetarian",
  vegan: "vegan",
  "gluten-free": "glutenFree",
  "dairy-free": "dairyFree",
  "nut-free": "nutFree",
};
