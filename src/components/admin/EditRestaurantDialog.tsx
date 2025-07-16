// src/components/admin/EditRestaurantDialog.tsx
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
import { Pencil } from "lucide-react"; // Edit icon
import { z } from "zod"; // For validation
import { useFormStatus } from "react-dom"; // For pending state of Server Action

// Define the shape of a restaurant for type safety
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schema for form validation
const updateRestaurantSchema = z.object({
  id: z.string().uuid(), // ID is required for update
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Restaurant slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
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

// EditRestaurantDialog component
interface EditRestaurantDialogProps {
  restaurant: Restaurant;
  updateRestaurantAction: (formData: FormData) => Promise<void>; // Server Action prop
}

export function EditRestaurantDialog({
  restaurant,
  updateRestaurantAction,
}: EditRestaurantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    slug?: string;
    general?: string;
  }>({});

  // Function to handle form submission and validation
  const handleSubmit = async (formData: FormData) => {
    setFormErrors({}); // Clear previous errors

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    const validationResult = updateRestaurantSchema.safeParse({
      id,
      name,
      slug,
    });

    if (!validationResult.success) {
      const errors: { name?: string; slug?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "name") errors.name = err.message;
        if (err.path[0] === "slug") errors.slug = err.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await updateRestaurantAction(formData);
      setIsOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Error updating restaurant:", error);
      setFormErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to update restaurant.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogDescription>
            Make changes to &quot;{restaurant.name}&quot; here. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          {/* Hidden input for ID */}
          <input type="hidden" name="id" value={restaurant.id} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={restaurant.name}
              className="col-span-3"
              required
            />
            {formErrors.name && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug" className="text-right">
              Slug
            </Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={restaurant.slug}
              className="col-span-3"
              required
            />
            {formErrors.slug && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.slug}
              </p>
            )}
            <p className="col-span-4 text-right text-sm text-gray-500">
              Lowercase, alphanumeric, hyphens only.
            </p>
          </div>
          {formErrors.general && (
            <p className="col-span-4 text-center text-sm text-red-500">
              {formErrors.general}
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
