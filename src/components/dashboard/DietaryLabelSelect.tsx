// src/components/dashboard/DietaryLabelSelect.tsx
"use client";

import React from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

// Ensure this matches the enum values in your Drizzle schema
export type DietaryLabel =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "nut-free";

const ALL_DIETARY_LABELS: DietaryLabel[] = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
];

interface DietaryLabelSelectProps {
  selectedLabels: DietaryLabel[];
  onLabelsChange: (labels: DietaryLabel[]) => void;
}

/**
 * @description Provides a controlled multi-select for dietary labels.
 */
export function DietaryLabelSelect({
  selectedLabels,
  onLabelsChange,
}: DietaryLabelSelectProps) {
  const handleToggle = (label: DietaryLabel, checked: boolean) => {
    onLabelsChange(
      checked
        ? [...selectedLabels, label]
        : selectedLabels.filter((l) => l !== label),
    );
  };

  const formatLabel = (label: string) => {
    return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 py-2">
      {ALL_DIETARY_LABELS.map((label) => (
        <div key={label} className="flex items-center space-x-2">
          <Checkbox
            id={`dietary-${label}`}
            checked={selectedLabels.includes(label)}
            onCheckedChange={(checked) => handleToggle(label, !!checked)}
          />
          <Label
            htmlFor={`dietary-${label}`}
            className="cursor-pointer text-sm font-normal"
          >
            {formatLabel(label)}
          </Label>
        </div>
      ))}
    </div>
  );
}
