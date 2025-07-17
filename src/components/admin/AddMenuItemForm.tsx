"use client"; // This is a Client Component

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox"; // Keep Checkbox for dietary labels
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UploadButton } from "~/utils/uploadthing";
import { z } from "zod";
import { useFormStatus } from "react-dom";
import Image from "next/image";

// Import the DietaryLabel type from your shared types
// Import the DietaryLabel type from your shared types
import type { DietaryLabel } from "~/types/restaurant"; // Ensure this path is correct
// Ensure this path is correct

// Define the possible dietary labels (matching your Drizzle enum)
const ALL_DIETARY_LABELS: DietaryLabel[] = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
];

// Zod schema for adding a menu item (re-defined here for client-side validation)
const createMenuItemSchema = z.object({
  name: z.string().min(1, { message: "Menu item name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  // Corrected price to be a string, matching Drizzle schema
  price: z.string().min(1, { message: "Price is required." }),
  ingredients: z.string().min(1, { message: "Ingredients are required." }),
  // Changed to dietaryLabels array
  dietaryLabels: z
    .array(z.enum(ALL_DIETARY_LABELS as [string, ...string[]]))
    .optional(),
  imageUrl: z
    .string()
    .url({ message: "Image URL is required and must be a valid URL." }),
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

// SubmitButton component to show loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Menu Item"}
    </Button>
  );
}

interface AddMenuItemFormProps {
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  addMenuItemAction: (formData: FormData) => Promise<void>;
}

export function AddMenuItemForm({
  restaurantId,
  categoryId,
  categoryName,
  addMenuItemAction,
}: AddMenuItemFormProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  // Changed to a single state for dietary labels (array of strings)
  const [selectedDietaryLabels, setSelectedDietaryLabels] = useState<
    DietaryLabel[]
  >([]);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  const [displayImageUrl, setDisplayImageUrl] = useState<string>("");
  const fallbackImageUrl = `https://placehold.co/128x128/E0E0E0/333333?text=No+Image`;

  // Function to handle checkbox changes for dietary labels
  const handleDietaryLabelChange = (label: DietaryLabel, checked: boolean) => {
    setSelectedDietaryLabels((prevLabels) => {
      if (checked) {
        return [...prevLabels, label];
      } else {
        return prevLabels.filter((l) => l !== label);
      }
    });
  };

  const handleSubmit = async (formData: FormData) => {
    setFormErrors([]);

    // Remove old boolean fields, add new dietaryLabels as JSON string
    // formData.set("isVegetarian", isVegetarian ? "on" : ""); // REMOVED
    // formData.set("isGlutenFree", isGlutenFree ? "on" : ""); // REMOVED
    formData.set("dietaryLabels", JSON.stringify(selectedDietaryLabels)); // NEW

    formData.set("imageUrl", imageUrl);

    const validationResult = createMenuItemSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"), // Price is now a string
      ingredients: formData.get("ingredients"),
      // Pass the dietaryLabels array directly to Zod
      dietaryLabels: selectedDietaryLabels, // NEW
      imageUrl: imageUrl,
      restaurantId: restaurantId,
      categoryId: categoryId,
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.errors);
      return;
    }

    try {
      await addMenuItemAction(formData);
      formRef.current?.reset();
      setImageUrl("");
      setDisplayImageUrl("");
      setSelectedDietaryLabels([]); // Reset dietary labels state
      setFormErrors([]);
    } catch (error) {
      console.error("Error adding menu item:", error);
      setFormErrors([
        {
          message:
            error instanceof Error ? error.message : "Failed to add menu item.",
          path: ["general"],
          code: "custom",
        },
      ]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Menu Item</CardTitle>
        <CardDescription>
          Create a new dish for the &quot;{categoryName}&quot; category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="restaurantId" value={restaurantId} />
          <input type="hidden" name="categoryId" value={categoryId} />

          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Classic Margherita"
              required
            />
            {formErrors.find((e) => e.path[0] === "name") && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "name")?.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="A delicious pizza with fresh basil and mozzarella."
              required
            />
            {formErrors.find((e) => e.path[0] === "description") && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "description")?.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="text" // Changed to text as per Drizzle schema
              placeholder="e.g., 12.99"
              required
            />
            {formErrors.find((e) => e.path[0] === "price") && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "price")?.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              placeholder="Tomato sauce, mozzarella, fresh basil, olive oil."
              required
            />
            {formErrors.find((e) => e.path[0] === "ingredients") && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "ingredients")?.message}
              </p>
            )}
          </div>

          {/* NEW: Dietary Labels Section */}
          <div>
            <Label>Dietary Labels</Label>
            <div className="flex flex-wrap gap-4 py-2">
              {ALL_DIETARY_LABELS.map((label) => (
                <div key={label} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dietary-${label}`}
                    checked={selectedDietaryLabels.includes(label)}
                    onCheckedChange={(checked) =>
                      handleDietaryLabelChange(label, !!checked)
                    }
                  />
                  <Label htmlFor={`dietary-${label}`}>
                    {label.charAt(0).toUpperCase() +
                      label.slice(1).replace(/-/g, " ")}{" "}
                    {/* Capitalize and replace hyphens */}
                  </Label>
                </div>
              ))}
            </div>
            {formErrors.find((e) => e.path[0] === "dietaryLabels") && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "dietaryLabels")?.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="imageUrl">Item Image</Label>
            {displayImageUrl && (
              <div className="mb-2">
                <Image
                  src={displayImageUrl}
                  alt="Uploaded Preview"
                  width={128}
                  height={128}
                  className="rounded-md object-cover"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImageUrl;
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>
            )}
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0 && res[0]) {
                  setImageUrl(res[0].url);
                  setDisplayImageUrl(res[0].url);
                } else {
                  setFormErrors([
                    {
                      message:
                        "Upload completed, but no file URL was received.",
                      path: ["imageUrl"],
                      code: "custom",
                    },
                  ]);
                }
              }}
              onUploadError={(error: Error) => {
                setFormErrors([
                  {
                    message: `Upload ERROR: ${error.message}`,
                    path: ["imageUrl"],
                    code: "custom",
                  },
                ]);
              }}
            />
            {formErrors.find((e) => e.path[0] === "imageUrl") && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "imageUrl")?.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Upload an image for the menu item.
            </p>
          </div>

          {formErrors.find((e) => e.path[0] === "general") && (
            <p className="text-center text-sm text-red-500">
              {formErrors.find((e) => e.path[0] === "general")?.message}
            </p>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
