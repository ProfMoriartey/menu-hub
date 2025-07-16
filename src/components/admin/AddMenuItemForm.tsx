// src/components/admin/AddMenuItemForm.tsx
"use client"; // This is a Client Component

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UploadButton } from "~/utils/uploadthing"; // Your Uploadthing component
import { z } from "zod";
import { useFormStatus } from "react-dom"; // For pending state of Server Action
import Image from "next/image"; // NEW: Import Next.js Image component
// REMOVED: import { ResponsiveImage } from "~/components/shared/ResponsiveImage";

// Zod schema for adding a menu item (re-defined here for client-side validation)
const createMenuItemSchema = z.object({
  name: z.string().min(1, { message: "Menu item name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "Price must be a positive number." }),
  ),
  ingredients: z.string().min(1, { message: "Ingredients are required." }),
  isVegetarian: z.boolean().optional(), // Now boolean directly from state
  isGlutenFree: z.boolean().optional(), // Now boolean directly from state
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
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  // State to manage the image source for Next.js Image component
  const [displayImageUrl, setDisplayImageUrl] = useState<string>("");
  // Fallback image URL
  const fallbackImageUrl = `https://placehold.co/128x128/E0E0E0/333333?text=No+Image`;

  const handleSubmit = async (formData: FormData) => {
    setFormErrors([]);

    formData.set("isVegetarian", isVegetarian ? "on" : "");
    formData.set("isGlutenFree", isGlutenFree ? "on" : "");
    formData.set("imageUrl", imageUrl);

    const validationResult = createMenuItemSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      ingredients: formData.get("ingredients"),
      isVegetarian: isVegetarian,
      isGlutenFree: isGlutenFree,
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
      setImageUrl(""); // Clear internal state
      setDisplayImageUrl(""); // Clear display state
      setIsVegetarian(false);
      setIsGlutenFree(false);
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
              type="number"
              step="0.01"
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVegetarian"
                name="isVegetarian"
                checked={isVegetarian}
                onCheckedChange={(checked) => setIsVegetarian(!!checked)}
              />
              <Label htmlFor="isVegetarian">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isGlutenFree"
                name="isGlutenFree"
                checked={isGlutenFree}
                onCheckedChange={(checked) => setIsGlutenFree(!!checked)}
              />
              <Label htmlFor="isGlutenFree">Gluten-Free</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Item Image</Label>
            {/* Display uploaded image preview using Next.js Image */}
            {displayImageUrl && ( // Use displayImageUrl for rendering
              <div className="mb-2">
                <Image
                  src={displayImageUrl} // Use state for src
                  alt="Uploaded Preview"
                  width={128}
                  height={128}
                  className="rounded-md object-cover"
                  onError={(e) => {
                    // onError is fine in Client Component
                    e.currentTarget.src = fallbackImageUrl;
                    e.currentTarget.onerror = null; // Prevent infinite loop
                  }}
                />
              </div>
            )}
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0 && res[0]) {
                  setImageUrl(res[0].url); // Update internal state for form submission
                  setDisplayImageUrl(res[0].url); // Update state for image preview
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
