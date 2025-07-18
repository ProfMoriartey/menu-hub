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
import { Pencil } from "lucide-react";
import { useFormStatus } from "react-dom";

// Import the shared schema
import { restaurantSchema } from "~/lib/schemas";
// Import the new shared form component
import { RestaurantForm } from "~/components/admin/RestaurantForm";

import type { Restaurant } from "~/types/restaurant";

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

  // Initialize states with existing restaurant data
  const [isRestaurantActive, setIsRestaurantActive] = useState(
    restaurant.isActive ?? true,
  );
  const [isRestaurantDisplayed, setIsRestaurantDisplayed] = useState(
    restaurant.isDisplayed ?? true,
  );
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    restaurant.logoUrl ?? null,
  );

  // NEW STATES: Initialize with existing data, default to empty string for null/undefined
  const [currentCurrency, setCurrentCurrency] = useState(
    restaurant.currency ?? "",
  );
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(
    restaurant.phoneNumber ?? "",
  );
  const [currentDescription, setCurrentDescription] = useState(
    restaurant.description ?? "",
  );
  const [currentTheme, setCurrentTheme] = useState(restaurant.theme ?? "");
  const [currentTypeOfEstablishment, setCurrentTypeOfEstablishment] = useState(
    restaurant.typeOfEstablishment ?? "",
  );

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    // Set all boolean/nullable string states onto formData for server action
    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", logoPreviewUrl ?? ""); // Use the state URL, not default
    // NEW: Set new field values onto formData
    formData.set("currency", currentCurrency);
    formData.set("phoneNumber", currentPhoneNumber);
    formData.set("description", currentDescription);
    formData.set("theme", currentTheme);
    formData.set("typeOfEstablishment", currentTypeOfEstablishment);

    // Create a 'values' object to pass to Zod for validation
    // Ensure all fields from the schema are present, even if null
    const values = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string | null,
      foodType: formData.get("foodType") as string | null,
      address: formData.get("address") as string | null,
      isActive: formData.get("isActive") as string, // Zod `coerce.boolean` expects string "on" or ""
      isDisplayed: formData.get("isDisplayed") as string | null, // Zod expects string "on" or ""
      logoUrl: formData.get("logoUrl") as string | null,
      // NEW: Include new field values for schema validation
      currency: formData.get("currency") as string,
      phoneNumber: formData.get("phoneNumber") as string | null,
      description: formData.get("description") as string | null,
      theme: formData.get("theme") as string | null,
      typeOfEstablishment: formData.get("typeOfEstablishment") as string | null,
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
      await updateRestaurantAction(formData);
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
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogDescription>
            Update info for &quot;{restaurant.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={restaurant.id} />

          {/* Use the shared RestaurantForm component and pass all required props */}
          <RestaurantForm
            initialData={restaurant}
            formErrors={formErrors}
            onLogoUrlChange={setLogoPreviewUrl}
            onIsActiveChange={setIsRestaurantActive}
            onIsDisplayedChange={setIsRestaurantDisplayed}
            currentIsActive={isRestaurantActive}
            currentIsDisplayed={isRestaurantDisplayed}
            currentLogoUrl={logoPreviewUrl}
            // NEW: Pass new field states and handlers
            currentCurrency={currentCurrency}
            onCurrencyChange={setCurrentCurrency}
            currentPhoneNumber={currentPhoneNumber}
            onPhoneNumberChange={setCurrentPhoneNumber}
            currentDescription={currentDescription}
            onDescriptionChange={setCurrentDescription}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            currentTypeOfEstablishment={currentTypeOfEstablishment}
            onTypeOfEstablishmentChange={setCurrentTypeOfEstablishment}
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
