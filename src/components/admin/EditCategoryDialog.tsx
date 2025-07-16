// src/components/admin/EditCategoryDialog.tsx
"use client";

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
import { Pencil } from "lucide-react";
import { z } from "zod";
import { useFormStatus } from "react-dom";

// Define the shape of a category for type safety
interface Category {
  id: string;
  restaurantId: string;
  name: string;
  order: number; // Include order as it's in the schema
  createdAt: Date;
  updatedAt: Date | null;
}

// Zod schema for form validation
const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Category name is required." }),
  restaurantId: z.string().uuid(), // Pass restaurantId for the Server Action
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

interface EditCategoryDialogProps {
  category: Category;
  restaurantId: string; // Pass restaurantId to the dialog
  updateCategoryAction: (formData: FormData) => Promise<void>;
}

export function EditCategoryDialog({
  category,
  restaurantId,
  updateCategoryAction,
}: EditCategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    general?: string;
  }>({});

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    // Add restaurantId to formData for validation and revalidation in Server Action
    formData.append("restaurantId", restaurantId);

    const validationResult = updateCategorySchema.safeParse({
      id,
      name,
      restaurantId,
    });

    if (!validationResult.success) {
      const errors: { name?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "name") errors.name = err.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await updateCategoryAction(formData);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      setFormErrors({
        general:
          error instanceof Error ? error.message : "Failed to update category.",
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
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to &quot;{category.name}&quot; here. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={category.id} />
          {/* restaurantId is passed via prop and appended to formData in handleSubmit */}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={category.name}
              className="col-span-3"
              required
            />
            {formErrors.name && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.name}
              </p>
            )}
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
