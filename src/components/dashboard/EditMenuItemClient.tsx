// src/components/dashboard/EditMenuItemClient.tsx
"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";
import { cn } from "~/lib/utils";

// 🛑 Import the specific Multi-Select Component
import { DietaryLabelSelect, type DietaryLabel } from "./DietaryLabelSelect";

// --- TYPE DEFINITIONS (Matching your updated application types) ---
// This should match the MenuItem type in ~/types/restaurant.ts
interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  ingredients: string | null;
  dietaryLabels: DietaryLabel[] | null;
  imageUrl: string | null;
}

// Props interface for the component
interface EditMenuItemClientProps {
  menuItem: MenuItem;
  // Handler passed from the parent to toggle back to view mode
  onCancel: () => void;
  // The Server Action wrapper created in MenuItemManager
  formAction: (formData: FormData) => void;
  formErrors: z.ZodIssue[]; // For displaying server-side errors
}

// Fallback image URL
const fallbackImageUrl = `https://placehold.co/128x128/E0E0E0/333333?text=No+Image`;

// --- Submit Button Component ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-indigo-600 hover:bg-indigo-700"
    >
      {pending ? "Saving..." : "Save Item"}
    </Button>
  );
}

// --- Main Form Component ---
export function EditMenuItemClient({
  menuItem,
  onCancel,
  formAction,
  formErrors,
}: EditMenuItemClientProps) {
  // State for image URL and dietary labels (Allow null for clearing image)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    menuItem.imageUrl ?? null,
  );
  const [selectedDietaryLabels, setSelectedDietaryLabels] = useState<
    DietaryLabel[]
  >(menuItem.dietaryLabels ?? []);

  // Function to handle form submission
  const handleSubmitWrapper = (formData: FormData) => {
    // 1. Inject state-managed values into FormData
    // Coalesce to "" for FormData.set compliance (handles null)
    formData.set("imageUrl", currentImageUrl ?? "");

    // Inject the validated dietary labels array as a JSON string
    formData.set("dietaryLabels", JSON.stringify(selectedDietaryLabels));

    formData.set("restaurantId", menuItem.restaurantId);
    formData.set("categoryId", menuItem.categoryId);

    // 2. Pass the augmented FormData to the bound Server Action
    formAction(formData);
  };

  const getError = (path: string) =>
    formErrors.find((e) => e.path[0] === path)?.message;

  return (
    <form
      action={handleSubmitWrapper}
      className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border bg-gray-50 p-4 py-4 md:grid-cols-3"
    >
      {/* Hidden inputs for authorization and identity */}
      <input type="hidden" name="id" defaultValue={menuItem.id} />
      <input
        type="hidden"
        name="restaurantId"
        defaultValue={menuItem.restaurantId}
      />
      <input
        type="hidden"
        name="categoryId"
        defaultValue={menuItem.categoryId}
      />

      {/* LEFT COLUMN: Name, Price, Ingredients, Description */}
      <div className="space-y-4 md:col-span-2">
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={menuItem.name} required />
          {getError("name") && (
            <p className="text-sm text-red-500">{getError("name")}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="text"
            defaultValue={menuItem.price}
            required
          />
          {getError("price") && (
            <p className="text-sm text-red-500">{getError("price")}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={menuItem.description ?? ""}
            rows={2}
          />
          {getError("description") && (
            <p className="text-sm text-red-500">{getError("description")}</p>
          )}
        </div>

        {/* Ingredients */}
        <div>
          <Label htmlFor="ingredients">Ingredients</Label>
          <Textarea
            id="ingredients"
            name="ingredients"
            defaultValue={menuItem.ingredients ?? ""}
            rows={1}
          />
          {getError("ingredients") && (
            <p className="text-sm text-red-500">{getError("ingredients")}</p>
          )}
        </div>

        {/* Dietary Labels - 🛑 INTEGRATED MULTI-SELECT */}
        <div className="space-y-2 border-t border-gray-200 pt-2">
          <Label>Dietary Labels</Label>
          <DietaryLabelSelect
            selectedLabels={selectedDietaryLabels}
            onLabelsChange={setSelectedDietaryLabels}
          />
          {getError("dietaryLabels") && (
            <p className="text-sm text-red-500">{getError("dietaryLabels")}</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Image Upload and Actions */}
      <div className="space-y-4 pt-4 md:col-span-1 md:pt-0">
        {/* Item Image */}
        <div className="space-y-2">
          <Label>Item Image</Label>
          {currentImageUrl ? (
            <div className="relative h-28 w-28 overflow-hidden rounded-md border">
              <Image
                src={currentImageUrl}
                alt={menuItem.name}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => setCurrentImageUrl(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-md border bg-gray-200 text-sm text-gray-500">
              No Image
            </div>
          )}
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0 && res[0]) {
                setCurrentImageUrl(res[0].url);
              }
            }}
            onUploadError={(error: Error) =>
              console.error(`UPLOAD ERROR: ${error.message}`)
            }
          />
          {getError("imageUrl") && (
            <p className="text-sm text-red-500">{getError("imageUrl")}</p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end space-x-2 border-t pt-4 md:col-span-3">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
