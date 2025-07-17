"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
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
  address?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

const updateRestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug must be lowercase, alphanumeric, and can contain hyphens.",
    }),
  country: z.string().min(1),
  foodType: z.string().min(1),
  address: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "on"),
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Add state for the isActive switch
  const [isRestaurantActive, setIsRestaurantActive] = useState(
    restaurant.isActive ?? true,
  );

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    // Manually set the isActive field in FormData based on the Switch's state
    formData.set("isActive", isRestaurantActive ? "on" : ""); // Send "on" or an empty string

    const values = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string,
      foodType: formData.get("foodType") as string,
      address: formData.get("address") as string,
      isActive: formData.get("isActive") as string, // This will now be "on" or ""
    };

    const result = updateRestaurantSchema.safeParse(values);

    if (!result.success) {
      // ... (your existing error handling) ...
      return;
    }

    try {
      await updateRestaurantAction(formData); // Pass the modified formData
      setIsOpen(false);
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "Update failed.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mr-2">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogDescription>
            Update info for "{restaurant.name}".
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={restaurant.id} />

          <Label>Name</Label>
          <Input name="name" defaultValue={restaurant.name} required />
          {formErrors.name && (
            <p className="text-sm text-red-500">{formErrors.name}</p>
          )}

          <Label>Slug</Label>
          <Input name="slug" defaultValue={restaurant.slug} required />
          {formErrors.slug && (
            <p className="text-sm text-red-500">{formErrors.slug}</p>
          )}

          <Label>Country</Label>
          <Input name="country" defaultValue={restaurant.country} required />
          {formErrors.country && (
            <p className="text-sm text-red-500">{formErrors.country}</p>
          )}

          <Label>Food Type</Label>
          <Input name="foodType" defaultValue={restaurant.foodType} required />
          {formErrors.foodType && (
            <p className="text-sm text-red-500">{formErrors.foodType}</p>
          )}

          <Label>Address</Label>
          <Input name="address" defaultValue={restaurant.address || ""} />
          {formErrors.address && (
            <p className="text-sm text-red-500">{formErrors.address}</p>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive" // Keep the name attribute for FormData
              checked={isRestaurantActive} // Controlled state
              onCheckedChange={setIsRestaurantActive} // Update state on user interaction
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {formErrors.general && (
            <p className="text-center text-sm text-red-500">
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
