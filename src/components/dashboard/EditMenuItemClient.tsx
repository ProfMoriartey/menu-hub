"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";
// Replaced next/image with CustomImage placeholder
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { UploadButton } from "~/utils/uploadthing";
import { XCircle } from "lucide-react";
import { cn } from "~/lib/utils";

// 🛑 Import the specific Multi-Select Component
import { DietaryLabelSelect, type DietaryLabel } from "./DietaryLabelSelect";
import Image from "next/image";

// Local component to replace next/image
const CustomImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    className={className}
    style={{ width: "100%", height: "100%" }}
  />
);

// --- TYPE DEFINITIONS ---
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

interface EditMenuItemClientProps {
  menuItem: MenuItem;
  onCancel: () => void;
  formAction: (formData: FormData) => void;
  formErrors: z.ZodIssue[];
}

// --- Submit Button Component ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="default" // Uses bg-primary/default
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
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    menuItem.imageUrl ?? null,
  );
  const [selectedDietaryLabels, setSelectedDietaryLabels] = useState<
    DietaryLabel[]
  >(menuItem.dietaryLabels ?? []);

  const handleSubmitWrapper = (formData: FormData) => {
    formData.set("imageUrl", currentImageUrl ?? "");
    formData.set("dietaryLabels", JSON.stringify(selectedDietaryLabels));
    formData.set("restaurantId", menuItem.restaurantId);
    formData.set("categoryId", menuItem.categoryId);

    formAction(formData);
  };

  const getError = (path: string) =>
    formErrors.find((e) => e.path[0] === path)?.message;

  return (
    // Use theme-aware colors for the form container
    <form
      action={handleSubmitWrapper}
      className="border-border bg-card grid grid-cols-1 gap-x-6 gap-y-6 rounded-lg border p-4 md:grid-cols-3" // Increased gap-y and theme colors
    >
      {/* Hidden inputs */}
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
      <div className="space-y-6 md:col-span-2">
        {" "}
        {/* Consistent space-y-6 */}
        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={menuItem.name} required />
          {getError("name") && (
            <p className="text-destructive mt-1 text-sm">{getError("name")}</p>
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
            placeholder="e.g., 12.99"
            required
          />
          {getError("price") && (
            <p className="text-destructive mt-1 text-sm">{getError("price")}</p>
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
            placeholder="Short description for the menu."
          />
          {getError("description") && (
            <p className="text-destructive mt-1 text-sm">
              {getError("description")}
            </p>
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
            placeholder="Comma-separated list (e.g., flour, eggs, butter)"
          />
          {getError("ingredients") && (
            <p className="text-destructive mt-1 text-sm">
              {getError("ingredients")}
            </p>
          )}
        </div>
        {/* Dietary Labels - MULTI-SELECT */}
        <div className="border-border space-y-2 border-t pt-4">
          {" "}
          {/* Used border-border and pt-4 for separation */}
          <Label>Dietary Labels</Label>
          <DietaryLabelSelect
            selectedLabels={selectedDietaryLabels}
            onLabelsChange={setSelectedDietaryLabels}
          />
          {getError("dietaryLabels") && (
            <p className="text-destructive mt-1 text-sm">
              {getError("dietaryLabels")}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Image Upload and Actions */}
      <div className="space-y-6 pt-4 md:col-span-1 md:pt-0">
        {" "}
        {/* Consistent space-y-6 */}
        {/* Item Image */}
        <div className="space-y-2">
          <Label>Item Image</Label>
          {currentImageUrl ? (
            <div className="border-border relative h-28 w-28 overflow-hidden rounded-md border">
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
            // Fallback block uses theme-aware colors
            <div className="border-border bg-muted text-muted-foreground flex h-28 w-28 items-center justify-center rounded-md border text-sm">
              No Image
            </div>
          )}
          <UploadButton
            endpoint="imageUploader"
            // Apply UploadThing semantic theme overrides
            className={cn(
              "ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-primary-foreground",
              "ut-allowed-content:text-muted-foreground",
              "ut-container:border-border ut-container:hover:bg-accent/10",
              "ut-readying:bg-muted ut-readying:text-muted-foreground",
              "ut-label:text-foreground",
            )}
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
            <p className="text-destructive mt-1 text-sm">
              {getError("imageUrl")}
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-border flex justify-end space-x-2 border-t pt-4 md:col-span-3">
        {" "}
        {/* Used border-border */}
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}

// NOTE: Placeholder components and types were removed from the final block for clarity.
