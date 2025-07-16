// src/components/admin/EditMenuItemDialog.tsx
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
import { Checkbox } from "~/components/ui/checkbox";
import { Pencil } from "lucide-react";
import { z } from "zod";
import { useFormStatus } from "react-dom";
import { UploadButton } from "~/utils/uploadthing"; // Your Uploadthing component
import { ResponsiveImage } from "~/components/shared/ResponsiveImage"; // Re-use our image component

// Define the shape of a menu item for type safety
interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// Zod schema for updating a menu item
const updateMenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Menu item name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "Price must be a positive number." }),
  ),
  ingredients: z.string().min(1, { message: "Ingredients are required." }),
  isVegetarian: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  imageUrl: z
    .string()
    .url({ message: "Image URL is required and must be a valid URL." }),
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
  const [currentImageUrl, setCurrentImageUrl] = useState(menuItem.imageUrl); // State for image URL
  const [isVegetarian, setIsVegetarian] = useState(menuItem.isVegetarian);
  const [isGlutenFree, setIsGlutenFree] = useState(menuItem.isGlutenFree);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);

  const handleSubmit = async (formData: FormData) => {
    setFormErrors([]);

    // Append current state values for checkboxes and image URL
    formData.set("isVegetarian", isVegetarian ? "on" : ""); // Convert boolean to 'on'/'off' for form data
    formData.set("isGlutenFree", isGlutenFree ? "on" : "");
    formData.set("imageUrl", currentImageUrl); // Use the state-managed image URL

    // Append restaurantId and categoryId for server action
    formData.set("restaurantId", menuItem.restaurantId);
    formData.set("categoryId", menuItem.categoryId);

    const validationResult = updateMenuItemSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      ingredients: formData.get("ingredients"),
      isVegetarian: isVegetarian, // Use boolean state directly for Zod validation
      isGlutenFree: isGlutenFree, // Use boolean state directly for Zod validation
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
        {" "}
        {/* Increased width for more content */}
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
            {" "}
            {/* Use items-start for textarea */}
            <Label htmlFor="description" className="pt-2 text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={menuItem.description}
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
              type="number"
              step="0.01"
              defaultValue={menuItem.price}
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
              defaultValue={menuItem.ingredients}
              className="col-span-3"
              required
            />
            {formErrors.find((e) => e.path[0] === "ingredients") && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.find((e) => e.path[0] === "ingredients")?.message}
              </p>
            )}
          </div>

          {/* Dietary Labels */}
          <div className="col-span-4 flex items-center space-x-4 pl-4">
            {" "}
            {/* Adjusted for better alignment */}
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

          {/* Image Upload with Uploadthing */}
          <div className="col-span-4">
            <Label htmlFor="imageUrl">Item Image</Label>
            {currentImageUrl && (
              <div className="mb-2">
                <ResponsiveImage
                  src={currentImageUrl}
                  alt={menuItem.name}
                  width={128} // Larger preview in dialog
                  height={128}
                  className="rounded-md object-cover"
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
