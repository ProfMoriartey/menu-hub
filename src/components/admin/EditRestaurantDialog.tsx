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
import { cn } from "~/lib/utils";

import { restaurantSchema, type SocialMediaLinks, type DeliveryAppLinks } from "~/lib/schemas";
import { RestaurantForm } from "~/components/admin/RestaurantForm";

import type { Restaurant } from "~/types/restaurant";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
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

  const [currentName, setCurrentName] = useState(restaurant.name ?? "");

  const [isRestaurantActive, setIsRestaurantActive] = useState(restaurant.isActive ?? true);
  const [isRestaurantDisplayed, setIsRestaurantDisplayed] = useState(restaurant.isDisplayed ?? true);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(restaurant.logoUrl ?? null);

  const [currentCurrency, setCurrentCurrency] = useState(restaurant.currency ?? "");
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(restaurant.phoneNumber ?? "");
  const [currentDescription, setCurrentDescription] = useState(restaurant.description ?? "");
  const [currentTheme, setCurrentTheme] = useState(restaurant.theme ?? "");
  const [currentTypeOfEstablishment, setCurrentTypeOfEstablishment] = useState(restaurant.typeOfEstablishment ?? "");
  const [newRestaurantCountry, setNewRestaurantCountry] = useState(restaurant.country ?? "");

  // --- NEW STATES ---
  const [currentMapUrl, setCurrentMapUrl] = useState(restaurant.mapUrl ?? "");
  const [currentMetaTitle, setCurrentMetaTitle] = useState(restaurant.metaTitle ?? "");
  const [currentMetaDescription, setCurrentMetaDescription] = useState(restaurant.metaDescription ?? "");
  
  // Cast existing JSON or provide empty objects to match the schema
  const [currentSocialMedia, setCurrentSocialMedia] = useState<SocialMediaLinks>(
    (restaurant.socialMedia as SocialMediaLinks) ?? {}
  );
  
  const [currentDeliveryApps, setCurrentDeliveryApps] = useState<DeliveryAppLinks>(
    (restaurant.deliveryApps as DeliveryAppLinks) ?? {}
  );

  // Helper handlers for nested objects
  const handleSocialMediaChange = (key: keyof SocialMediaLinks, value: string) => {
    setCurrentSocialMedia((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeliveryAppsChange = (key: keyof DeliveryAppLinks, value: string) => {
    setCurrentDeliveryApps((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    setFormErrors({});

    formData.set("name", currentName);
    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", logoPreviewUrl ?? ""); 
    formData.set("currency", currentCurrency);
    formData.set("phoneNumber", currentPhoneNumber);
    formData.set("description", currentDescription);
    formData.set("theme", currentTheme);
    formData.set("typeOfEstablishment", currentTypeOfEstablishment);
    formData.set("country", newRestaurantCountry);

    // --- APPEND NEW FIELDS ---
    formData.set("mapUrl", currentMapUrl);
    formData.set("metaTitle", currentMetaTitle);
    formData.set("metaDescription", currentMetaDescription);
    // Stringify the JSON objects before sending
    formData.set("socialMedia", JSON.stringify(currentSocialMedia));
    formData.set("deliveryApps", JSON.stringify(currentDeliveryApps));

    const values = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      country: formData.get("country") as string | null,
      foodType: formData.get("foodType") as string | null,
      address: formData.get("address") as string | null,
      isActive: formData.get("isActive") as string, 
      isDisplayed: formData.get("isDisplayed") as string | null, 
      logoUrl: formData.get("logoUrl") as string | null,
      currency: formData.get("currency") as string,
      phoneNumber: formData.get("phoneNumber") as string | null,
      description: formData.get("description") as string | null,
      theme: formData.get("theme") as string | null,
      typeOfEstablishment: formData.get("typeOfEstablishment") as string | null,
      // --- VALIDATE NEW FIELDS ---
      mapUrl: formData.get("mapUrl") as string | null,
      metaTitle: formData.get("metaTitle") as string | null,
      metaDescription: formData.get("metaDescription") as string | null,
      socialMedia: currentSocialMedia,
      deliveryApps: currentDeliveryApps,
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
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "mr-2",
            "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground", 
          )}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
            
            currentName={currentName}
            onNameChange={setCurrentName}
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
            onDescriptionChange={setCurrentDescription}
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
            currentTypeOfEstablishment={currentTypeOfEstablishment}
            onTypeOfEstablishmentChange={setCurrentTypeOfEstablishment}
            currentCountry={newRestaurantCountry}
            onCountryChange={setNewRestaurantCountry}

            // --- PASS NEW PROPS ---
            currentMapUrl={currentMapUrl}
            onMapUrlChange={setCurrentMapUrl}
            currentMetaTitle={currentMetaTitle}
            onMetaTitleChange={setCurrentMetaTitle}
            currentMetaDescription={currentMetaDescription}
            onMetaDescriptionChange={setCurrentMetaDescription}
            
            currentSocialMedia={currentSocialMedia}
            onSocialMediaChange={handleSocialMediaChange}
            
            currentDeliveryApps={currentDeliveryApps}
            onDeliveryAppsChange={handleDeliveryAppsChange}
          />

          {formErrors.general && (
            <p className="text-destructive col-span-full mt-4 text-center text-sm">
              {formErrors.general}
            </p>
          )}

          <DialogFooter className="col-span-full pt-4">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}