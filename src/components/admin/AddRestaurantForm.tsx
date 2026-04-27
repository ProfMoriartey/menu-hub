"use client";

import { useRef, useState, useEffect } from "react";
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
import { cn } from "~/lib/utils";
import { useTranslations } from "next-intl";
import { restaurantSchema, type SocialMediaLinks, type DeliveryAppLinks } from "~/lib/schemas";
import { RestaurantForm } from "~/components/admin/RestaurantForm";

interface AddRestaurantFormProps {
  addRestaurantAction: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const t = useTranslations("AdminRestaurants");
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn("bg-primary text-primary-foreground hover:bg-primary/90")}
    >
      {pending ? "Adding..." : "Add Restaurant"}
    </Button>
  );
}

export function AddRestaurantForm({
  addRestaurantAction,
}: AddRestaurantFormProps) {
  const t = useTranslations("AdminRestaurants");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantCountry, setNewRestaurantCountry] = useState("");
  const [isNewRestaurantActive, setIsNewRestaurantActive] = useState(true);
  const [isNewRestaurantDisplayed, setIsNewRestaurantDisplayed] = useState(true);
  const [newRestaurantLogoUrl, setNewRestaurantLogoUrl] = useState<string | null>(null);
  const [newRestaurantCurrency, setNewRestaurantCurrency] = useState("USD");
  const [newRestaurantPhoneNumber, setNewRestaurantPhoneNumber] = useState("");
  const [newRestaurantDescription, setNewRestaurantDescription] = useState("");
  const [newRestaurantTheme, setNewRestaurantTheme] = useState("classic");
  const [newRestaurantTypeOfEstablishment, setNewRestaurantTypeOfEstablishment] = useState("");
  
  // 🛑 ADDED: State for foodType
  const [newRestaurantFoodType, setNewRestaurantFoodType] = useState("");

  const [currentMapUrl, setCurrentMapUrl] = useState("");
  const [currentMetaTitle, setCurrentMetaTitle] = useState("");
  const [currentMetaDescription, setCurrentMetaDescription] = useState("");
  
  const [currentSocialMedia, setCurrentSocialMedia] = useState<SocialMediaLinks>({});
  const [currentDeliveryApps, setCurrentDeliveryApps] = useState<DeliveryAppLinks>({});

  const handleSocialMediaChange = (key: keyof SocialMediaLinks, value: string) => {
    setCurrentSocialMedia((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeliveryAppsChange = (key: keyof DeliveryAppLinks, value: string) => {
    setCurrentDeliveryApps((prev) => ({ ...prev, [key]: value }));
  };

  const addFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isAddDialogOpen) {
      setFormErrors({});
    }
  }, [isAddDialogOpen]);

  const handleAddSubmit = async (formData: FormData) => {
    setFormErrors({});

    formData.set("name", newRestaurantName);
    formData.set("country", newRestaurantCountry);
    formData.set("isActive", isNewRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isNewRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", newRestaurantLogoUrl ?? "");
    formData.set("currency", newRestaurantCurrency);
    formData.set("phoneNumber", newRestaurantPhoneNumber);
    formData.set("description", newRestaurantDescription);
    formData.set("theme", newRestaurantTheme);
    formData.set("typeOfEstablishment", newRestaurantTypeOfEstablishment);
    
    // 🛑 ADDED: Inject foodType into FormData
    formData.set("foodType", newRestaurantFoodType);

    formData.set("mapUrl", currentMapUrl);
    formData.set("metaTitle", currentMetaTitle);
    formData.set("metaDescription", currentMetaDescription);
    formData.set("socialMedia", JSON.stringify(currentSocialMedia));
    formData.set("deliveryApps", JSON.stringify(currentDeliveryApps));

    const values = {
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
      await addRestaurantAction(formData);
      setIsAddDialogOpen(false);
      addFormRef.current?.reset();
      setFormErrors({});

      setNewRestaurantName("");
      setNewRestaurantCountry("");
      setIsNewRestaurantActive(true);
      setIsNewRestaurantDisplayed(true);
      setNewRestaurantLogoUrl(null);
      setNewRestaurantCurrency("USD");
      setNewRestaurantPhoneNumber("");
      setNewRestaurantDescription("");
      setNewRestaurantTheme("classic");
      setNewRestaurantTypeOfEstablishment("");
      setNewRestaurantFoodType("");
      
      setCurrentMapUrl("");
      setCurrentMetaTitle("");
      setCurrentMetaDescription("");
      setCurrentSocialMedia({});
      setCurrentDeliveryApps({});
      
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : t("addForm.addFailed"),
      });
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "w-full md:w-1/3",
            "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          Add New Restaurant
        </Button>
      </DialogTrigger>
      {/* 🛑 FIX: Make Dialog Full Screen */}
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new restaurant.
          </DialogDescription>
        </DialogHeader>
        
        {/* 🛑 FIX: Make form area scrollable */}
        <form
          ref={addFormRef}
          action={handleAddSubmit}
          className="flex-1 overflow-y-auto pr-4 py-4"
        >
          <RestaurantForm
            formErrors={formErrors}
            currentName={newRestaurantName}
            onNameChange={setNewRestaurantName}
            currentCountry={newRestaurantCountry}
            onCountryChange={setNewRestaurantCountry}
            onLogoUrlChange={setNewRestaurantLogoUrl}
            onIsActiveChange={setIsNewRestaurantActive}
            onIsDisplayedChange={setIsNewRestaurantDisplayed}
            currentIsActive={isNewRestaurantActive}
            currentIsDisplayed={isNewRestaurantDisplayed}
            currentLogoUrl={newRestaurantLogoUrl}
            currentCurrency={newRestaurantCurrency}
            onCurrencyChange={setNewRestaurantCurrency}
            currentPhoneNumber={newRestaurantPhoneNumber}
            onPhoneNumberChange={setNewRestaurantPhoneNumber}
            currentDescription={newRestaurantDescription}
            onDescriptionChange={setNewRestaurantDescription}
            currentTheme={newRestaurantTheme}
            onThemeChange={setNewRestaurantTheme}
            currentTypeOfEstablishment={newRestaurantTypeOfEstablishment}
            onTypeOfEstablishmentChange={setNewRestaurantTypeOfEstablishment}
            
            // 🛑 ADDED: Pass the missing foodType props
            currentFoodType={newRestaurantFoodType}
            onFoodTypeChange={setNewRestaurantFoodType}

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
            <p className="text-destructive mt-4 text-center text-sm">
              {formErrors.general}
            </p>
          )}

          <DialogFooter className="pt-8 pb-4 shrink-0 mt-auto">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}