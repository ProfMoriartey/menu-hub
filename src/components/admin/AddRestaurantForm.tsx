// src/components/admin/AddRestaurantForm.tsx
"use client";

import { useRef, useState } from "react";
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
import { useFormStatus } from "react-dom";

// Import the schema from the shared schemas file
import { restaurantSchema } from "~/lib/schemas";
// Import the new shared form component
import { RestaurantForm } from "~/components/admin/RestaurantForm";

interface AddRestaurantFormProps {
  addRestaurantAction: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Restaurant"}
    </Button>
  );
}

export function AddRestaurantForm({
  addRestaurantAction,
}: AddRestaurantFormProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isNewRestaurantActive, setIsNewRestaurantActive] = useState(true);
  const [isNewRestaurantDisplayed, setIsNewRestaurantDisplayed] =
    useState(true);
  const [newRestaurantLogoUrl, setNewRestaurantLogoUrl] = useState<
    string | null
  >(null);

  const addFormRef = useRef<HTMLFormElement>(null);

  const handleAddSubmit = async (formData: FormData) => {
    setFormErrors({});

    formData.set("isActive", isNewRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isNewRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", newRestaurantLogoUrl ?? "");

    const values = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string | null,
      foodType: formData.get("foodType") as string | null,
      address: formData.get("address") as string | null,
      isActive: formData.get("isActive") as string,
      isDisplayed: formData.get("isDisplayed") as string | null,
      logoUrl: formData.get("logoUrl") as string | null,
    };

    const result = restaurantSchema.safeParse(values);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((_e) => {
        const key =
          Array.isArray(_e.path) && typeof _e.path[0] === "string"
            ? _e.path[0]
            : "general";
        errors[key] = _e.message;
      });
      setFormErrors(errors);
      return;
    }

    try {
      await addRestaurantAction(formData);
      setIsAddDialogOpen(false);
      addFormRef.current?.reset();
      setFormErrors({});
      setIsNewRestaurantActive(true);
      setIsNewRestaurantDisplayed(true);
      setNewRestaurantLogoUrl(null);
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : "Add failed.",
      });
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-1/3">Add New Restaurant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new restaurant.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={addFormRef}
          action={handleAddSubmit}
          className="grid gap-4 py-4"
        >
          {/* Use the shared RestaurantForm component */}
          <RestaurantForm
            formErrors={formErrors}
            onLogoUrlChange={setNewRestaurantLogoUrl}
            onIsActiveChange={setIsNewRestaurantActive}
            onIsDisplayedChange={setIsNewRestaurantDisplayed}
            currentIsActive={isNewRestaurantActive}
            currentIsDisplayed={isNewRestaurantDisplayed}
            currentLogoUrl={newRestaurantLogoUrl}
          />

          {formErrors.general && (
            <p className="col-span-full mt-4 text-center text-sm text-red-500">
              {formErrors.general}
            </p>
          )}

          <DialogFooter className="col-span-full">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
