"use client"; // This is a Client Component

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox"; // Keep Checkbox for dietary labels
import { Pencil } from "lucide-react";
import { z } from "zod";
import { useFormStatus } from "react-dom";
import { UploadButton } from "~/utils/uploadthing";
// REMOVED: import { ResponsiveImage } from "~/components/shared/ResponsiveImage"; // No longer needed, use Next.js Image directly
import Image from "next/image"; // Import Next.js Image component

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

// Define the shape of a menu item for type safety
// IMPORTANT: This interface should ideally be imported from ~/types/restaurant.ts
// For now, I'm updating it here to match the expected structure for this component.
interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null; // Changed to nullable
  price: string; // Changed to string as per Drizzle schema
  ingredients: string | null; // Changed to nullable
  dietaryLabels: DietaryLabel[] | null; // Changed to array of DietaryLabel or null
  imageUrl: string | null; // Changed to nullable
  createdAt: Date;
  updatedAt: Date | null;
}

// Zod schema for updating a menu item
const updateMenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Menu item name is required." }),
  description: z.string().nullable().optional(), // Match MenuItem interface
  // Corrected price to be a string, matching Drizzle schema
  price: z.string().min(1, { message: "Price is required." }),
  ingredients: z.string().nullable().optional(), // Match MenuItem interface
  // Changed to dietaryLabels array
  dietaryLabels: z
    .array(z.enum(ALL_DIETARY_LABELS as [string, ...string[]]))
    .optional(),
  imageUrl: z
    .string()
    .url({ message: "Image URL must be a valid URL." })
    .nullable() // Allow null if image is optional
    .optional(),
  restaurantId: z.string().uuid(), // Needed for revalidation
  categoryId: z.string().uuid(), // Needed for revalidation
});

// SubmitButton component to show loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

interface EditMenuItemDialogProps {
  menuItem: MenuItem;
  updateMenuItemAction: (formData: FormData) => Promise<void>; // Server Action prop
}

export function EditMenuItemDialog({
  menuItem,
  updateMenuItemAction,
}: EditMenuItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(
    menuItem.imageUrl ?? "",
  ); // State for image URL, default to empty string
  // Changed to a single state for dietary labels (array of strings)
  const [selectedDietaryLabels, setSelectedDietaryLabels] = useState<
    DietaryLabel[]
  >(
    menuItem.dietaryLabels ?? [], // Initialize with existing labels
  );
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  // Fallback image URL
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

    formData.set("imageUrl", currentImageUrl); // Use the state-managed image URL

    // Append restaurantId and categoryId for server action
    formData.set("restaurantId", menuItem.restaurantId);
    formData.set("categoryId", menuItem.categoryId);

    const validationResult = updateMenuItemSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"), // Price is now a string
      ingredients: formData.get("ingredients"),
      // Pass the dietaryLabels array directly to Zod
      dietaryLabels: selectedDietaryLabels, // NEW
      imageUrl: currentImageUrl,
      restaurantId: menuItem.restaurantId,
      categoryId: menuItem.categoryId,
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.errors);
      return;
    }

    try {
      await updateMenuItemAction(formData);
      setIsOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Error updating menu item:", error);
      setFormErrors([
        {
          message:
            error instanceof Error
              ? error.message
              : "Failed to update menu item.",
          path: ["general"],
          code: "custom",
        },
      ]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Make changes to &quot;{menuItem.name}&quot; here. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          {/* Hidden input for ID */}
          <input type="hidden" name="id" value={menuItem.id} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={menuItem.name}
              className="col-span-3"
              required
            />
            {formErrors.find((e) => e.path[0] === "name") && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "name")?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="pt-2 text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={menuItem.description ?? ""} // Use nullish coalescing
              className="col-span-3"
              required
            />
            {formErrors.find((e) => e.path[0] === "description") && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "description")?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              name="price"
              type="text" // Changed to text as per Drizzle schema
              defaultValue={menuItem.price} // Price is now a string
              className="col-span-3"
              required
            />
            {formErrors.find((e) => e.path[0] === "price") && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "price")?.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="ingredients" className="pt-2 text-right">
              Ingredients
            </Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              defaultValue={menuItem.ingredients ?? ""} // Use nullish coalescing
              className="col-span-3"
              required
            />
            {formErrors.find((e) => e.path[0] === "ingredients") && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "ingredients")?.message}
              </p>
            )}
          </div>

          {/* NEW: Dietary Labels Section */}
          <div className="col-span-4">
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
                      label.slice(1).replace(/-/g, " ")}
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

          {/* Image Upload with Uploadthing */}
          <div className="col-span-4">
            <Label htmlFor="imageUrl">Item Image</Label>
            {currentImageUrl && (
              <div className="mb-2">
                <Image // Use Next.js Image component
                  src={currentImageUrl}
                  alt={menuItem.name}
                  width={128}
                  height={128}
                  className="rounded-md object-cover"
                  onError={(e) => {
                    // Fallback for Next.js Image
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
                  setCurrentImageUrl(res[0].url);
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
              Upload a new image to replace the current one.
            </p>
          </div>

          {formErrors.find((e) => e.path[0] === "general") && (
            <p className="col-span-4 text-center text-sm text-red-500">
              {formErrors.find((e) => e.path[0] === "general")?.message}
            </p>
          )}

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
