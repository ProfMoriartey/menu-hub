// src/components/admin/EditRestaurantDialog.tsx
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

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  country?: string;
  foodType?: string;
  createdAt: Date;
  updatedAt: Date | null;
}

const updateRestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Restaurant name is required." }),
  slug: z
    .string()
    .min(1, { message: "Slug is required." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
  country: z.string().min(1, { message: "Country is required." }),
  foodType: z.string().min(1, { message: "Food type is required." }),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

interface EditRestaurantDialogProps {
  restaurant: Restaurant;
  updateRestaurantAction: (formData: FormData) => Promise<void>;
}

export function EditRestaurantDialog({
  restaurant,
  updateRestaurantAction,
}: EditRestaurantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    slug?: string;
    country?: string;
    foodType?: string;
    general?: string;
  }>({});

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    const values = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string,
      foodType: formData.get("foodType") as string,
    };

    const validation = updateRestaurantSchema.safeParse(values);

    if (!validation.success) {
      const errors: typeof formErrors = {};
      validation.error.errors.forEach((err) => {
        const key = err.path[0] as keyof typeof formErrors;
        errors[key] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await updateRestaurantAction(formData);
      setIsOpen(false);
    } catch (error) {
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
            Make changes to "{restaurant.name}". Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country" className="text-right">
              Country
            </Label>
            <Input
              id="country"
              name="country"
              defaultValue={restaurant.country}
              className="col-span-3"
              required
            />
            {formErrors.country && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.country}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="foodType" className="text-right">
              Food Type
            </Label>
            <Input
              id="foodType"
              name="foodType"
              defaultValue={restaurant.foodType}
              className="col-span-3"
              required
            />
            {formErrors.foodType && (
              <p className="col-span-4 text-right text-sm text-red-500">
                {formErrors.foodType}
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
