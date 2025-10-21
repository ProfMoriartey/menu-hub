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
import { cn } from "~/lib/utils"; // ADDED: Import cn utility

// Import the shared schema
import { restaurantSchema } from "~/lib/schemas";
// Import the new shared form component
import { RestaurantForm } from "~/components/admin/RestaurantForm";

import type { Restaurant } from "~/types/restaurant";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    // UPDATED: Submit Button uses semantic colors
    <Button
      type="submit"
      disabled={pending}
      className={cn("bg-primary text-primary-foreground hover:bg-primary/90")}
    >
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

  const [newRestaurantCountry, setNewRestaurantCountry] = useState("");

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
    formData.set("country", newRestaurantCountry);

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
        {/* UPDATED: Trigger Button uses semantic colors */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "mr-2",
            "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground", // Outline variant often uses secondary colors
          )}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      {/* DialogContent and its children (Header, Title, Description, Footer)
          typically inherit their colors from Shadcn's default styling, which
          should be based on your globals.css variables (bg-popover, text-popover-foreground, etc.). */}
      <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          {/* DialogTitle and DialogDescription should pick up text-popover-foreground */}
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogDescription>
            Update info for &quot;{restaurant.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="id" value={restaurant.id} />

          <RestaurantForm
            initialData={restaurant}
            formErrors={formErrors}
            onLogoUrlChange={setLogoPreviewUrl}
            onIsActiveChange={setIsRestaurantActive}
            onIsDisplayedChange={setIsRestaurantDisplayed}
            currentIsActive={isRestaurantActive}
            currentIsDisplayed={isRestaurantDisplayed}
            currentLogoUrl={logoPreviewUrl}
            currentCurrency={currentCurrency}
            onCurrencyChange={setCurrentCurrency}
            currentPhoneNumber={currentPhoneNumber}
            onPhoneNumberChange={setCurrentPhoneNumber}
            currentDescription={currentDescription}
            onCountryChange={setNewRestaurantCountry}
            onDescriptionChange={setCurrentDescription}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            currentTypeOfEstablishment={currentTypeOfEstablishment}
            onTypeOfEstablishmentChange={setCurrentTypeOfEstablishment}
            currentCountry={""}
          />

          {formErrors.general && (
            // UPDATED: Error message uses semantic destructive color
            <p className="text-destructive col-span-full mt-4 text-center text-sm">
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
