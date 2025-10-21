// src/components/dashboard/AddMenuItemClient.tsx
"use client";

import React, { useState, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addMenuItem } from "~/app/actions/menu-item";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";
import Image from "next/image";
import type { DietaryLabel } from "~/types/restaurant";
import { ALL_DIETARY_LABELS } from "~/lib/menu-item-schemas";

// --- TYPE DEFINITIONS ---

interface FormState {
  message: string;
  success: boolean;
}

const initialState: FormState = {
  message: "",
  success: false,
};

interface AddMenuItemFormProps {
  restaurantId: string;
  categoryId: string;
  onSuccess: () => void; // Handler to close form/reset state in parent (MenuItemManager)
}

interface SubmitButtonProps {
  // This interface is defined correctly
  label: string;
}

// --- Submit Button Component ---
function SubmitButton({ label }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-indigo-700 disabled:opacity-50"
    >
      {pending ? "Processing..." : label}
    </button>
  );
}

// --- Wrapper Action ---
async function wrapAddAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Client-side validation is skipped here for brevity, relying on server validation,
  // but this is where you'd run Zod.

  // You must inject the image URL and dietary labels before calling the Server Action
  // because they are managed by client state, not native inputs.
  const imageUrl = (formData.get("image-url-state") as string) || "";
  const dietaryLabelsJson =
    (formData.get("dietary-labels-state") as string) || "[]";

  formData.set("imageUrl", imageUrl);
  formData.set("dietaryLabels", dietaryLabelsJson);

  try {
    await addMenuItem(formData);
    return { message: "Item added successfully.", success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `Failed: ${message}`, success: false };
  }
}

// --- Main Component ---
export function AddMenuItemClient({
  restaurantId,
  categoryId,
  onSuccess,
}: AddMenuItemFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedDietaryLabels, setSelectedDietaryLabels] = useState<
    DietaryLabel[]
  >([]);

  // Bind the action
  const [state, formAction] = useFormState(wrapAddAction, initialState);

  // Reset form after successful submission
  React.useEffect(() => {
    if (state.success) {
      setImageUrl(null);
      setSelectedDietaryLabels([]);
      // Call the parent handler to close the form/refresh list
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const handleDietaryLabelChange = (label: DietaryLabel, checked: boolean) => {
    setSelectedDietaryLabels((prevLabels) => {
      if (checked) {
        return [...prevLabels, label];
      } else {
        return prevLabels.filter((l) => l !== label);
      }
    });
  };

  return (
    <div className="rounded-xl border border-dashed border-green-300 bg-green-50 p-6 shadow-inner">
      <h4 className="mb-4 text-lg font-semibold text-green-800">
        New Item Details
      </h4>

      {state.message && (
        <div
          className={`mb-4 rounded p-3 ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {state.message}
        </div>
      )}

      {/* The form must be a standalone unit */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="restaurantId" defaultValue={restaurantId} />
        <input type="hidden" name="categoryId" defaultValue={categoryId} />

        {/* Hidden inputs to pass state-controlled values to the Server Action */}
        <input type="hidden" name="image-url-state" value={imageUrl ?? ""} />
        <input
          type="hidden"
          name="dietary-labels-state"
          value={JSON.stringify(selectedDietaryLabels)}
        />

        {/* Form Fields */}
        <Input type="text" name="name" required placeholder="Item Name" />
        <Input
          type="text"
          name="price"
          required
          placeholder="Price (e.g., 12.99)"
        />
        <Textarea
          name="description"
          rows={2}
          placeholder="Description (optional)"
        />
        <Textarea
          name="ingredients"
          rows={1}
          placeholder="Ingredients (optional)"
        />

        {/* Dietary Labels */}
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Dietary Labels
          </Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {ALL_DIETARY_LABELS.map((label) => (
              <div key={label} className="flex items-center space-x-2">
                <Checkbox
                  id={`add-dietary-${label}`}
                  checked={selectedDietaryLabels.includes(label)}
                  onCheckedChange={(checked) =>
                    handleDietaryLabelChange(label, !!checked)
                  }
                />
                <Label htmlFor={`add-dietary-${label}`} className="text-sm">
                  {label.charAt(0).toUpperCase() +
                    label.slice(1).replace(/-/g, " ")}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2 border-t border-green-200 pt-2">
          <Label className="block text-sm font-medium">Item Image</Label>
          {imageUrl && (
            <div className="relative h-24 w-24 overflow-hidden rounded-md border">
              <Image
                src={imageUrl}
                alt="Preview"
                width={96}
                height={96}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-0 right-0 rounded-bl-lg bg-black/50 p-1 text-white"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0 && res[0]) {
                setImageUrl(res[0].url);
              }
            }}
            onUploadError={(error: Error) =>
              console.error(`Upload ERROR: ${error.message}`)
            }
          />
        </div>

        <div className="flex justify-end pt-4">
          <SubmitButton label="Create Item" />
        </div>
      </form>
    </div>
  );
}
