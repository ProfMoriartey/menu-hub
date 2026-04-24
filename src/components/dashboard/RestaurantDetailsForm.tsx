"use client";

import React, { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { updateRestaurant } from "~/app/actions/restaurant";
import { cn } from "~/lib/utils";
import { restaurantSchema, type SocialMediaLinks, type DeliveryAppLinks } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

import { Button } from "~/components/ui/button";
import { UserRestaurantForm } from "./UserRestaurantForm";

interface FormState {
  message: string;
  success: boolean;
  errors: Record<string, string>;
}

const initialState: FormState = {
  message: "",
  success: false,
  errors: {},
};

interface RestaurantDetailsFormProps {
  restaurant: Restaurant;
}

function SubmitButton() {
  const t = useTranslations("RestaurantForm");
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50",
      )}
    >
      {pending ? t("buttonSaving") : t("buttonSaveChanges")}
    </Button>
  );
}

async function formWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    address: formData.get("address") as string | null,
    country: formData.get("country") as string | null,
    foodType: formData.get("foodType") as string | null,
    isActive: formData.get("isActive") === "on",
    isDisplayed: formData.get("isDisplayed") === "on",
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
    // Note: Zod will handle these as objects once parsed in the logic below, 
    // but for the sake of safeParse, we use the raw strings from FormData or keep as is.
    socialMedia: JSON.parse(formData.get("socialMedia") as string || "{}"),
    deliveryApps: JSON.parse(formData.get("deliveryApps") as string || "{}"),
  };

  const result = restaurantSchema.safeParse(values);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((_e) => {
      if (typeof _e.path[0] === "string") {
        errors[_e.path[0]] = _e.message;
      }
    });
    return { success: false, message: "validationFailed", errors };
  }

  try {
    await updateRestaurant(formData);
    return { success: true, message: "updateSuccess", errors: {} };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknownError";
    return { success: false, message: `updateFailedPrefix:${message}`, errors: {} };
  }
}

export default function RestaurantDetailsForm({ restaurant }: RestaurantDetailsFormProps) {
  const t = useTranslations("RestaurantForm");

  // Existing States
  const [isRestaurantActive] = useState(restaurant.isActive ?? true);
  const [isRestaurantDisplayed] = useState(restaurant.isDisplayed ?? true);
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl ?? null);
  const [currentCurrency, setCurrentCurrency] = useState(restaurant.currency ?? "USD");
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(restaurant.phoneNumber ?? "");
  const [currentDescription, setCurrentDescription] = useState(restaurant.description ?? "");
  const [currentTheme] = useState(restaurant.theme ?? "classic");
  const [currentTypeOfEstablishment, setCurrentTypeOfEstablishment] = useState(restaurant.typeOfEstablishment ?? "");
  const [currentCountry, setCurrentCountry] = useState(restaurant.country ?? "");

  // --- NEW STATES FOR CLIENT DASHBOARD ---
  const [currentMapUrl, setCurrentMapUrl] = useState(restaurant.mapUrl ?? "");
  const [currentMetaTitle, setCurrentMetaTitle] = useState(restaurant.metaTitle ?? "");
  const [currentMetaDescription, setCurrentMetaDescription] = useState(restaurant.metaDescription ?? "");
  const [currentSocialMedia, setCurrentSocialMedia] = useState<SocialMediaLinks>(
    (restaurant.socialMedia as SocialMediaLinks) ?? {}
  );
  const [currentDeliveryApps, setCurrentDeliveryApps] = useState<DeliveryAppLinks>(
    (restaurant.deliveryApps as DeliveryAppLinks) ?? {}
  );

  const [state, formAction] = useFormState(formWrapperAction, initialState);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        formAction(new FormData());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success, formAction]);

  const handleSocialMediaChange = (key: keyof SocialMediaLinks, value: string) => {
    setCurrentSocialMedia((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeliveryAppsChange = (key: keyof DeliveryAppLinks, value: string) => {
    setCurrentDeliveryApps((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.set("id", restaurant.id);
    formData.set("slug", restaurant.slug);
    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", logoUrl ?? "");
    formData.set("currency", currentCurrency);
    formData.set("phoneNumber", currentPhoneNumber);
    formData.set("description", currentDescription);
    formData.set("theme", currentTheme);
    formData.set("typeOfEstablishment", currentTypeOfEstablishment);
    formData.set("country", currentCountry);

    // --- INJECT NEW FIELDS ---
    formData.set("mapUrl", currentMapUrl);
    formData.set("metaTitle", currentMetaTitle);
    formData.set("metaDescription", currentMetaDescription);
    formData.set("socialMedia", JSON.stringify(currentSocialMedia));
    formData.set("deliveryApps", JSON.stringify(currentDeliveryApps));

    formAction(formData);
  };

  const getTranslatedStatusMessage = (currentState: FormState) => {
    const key = currentState.message;
    if (key.startsWith("updateFailedPrefix")) {
      const errorCode = key.split(":")[1] ?? "unknownError";
      return t("messages.updateFailed", { error: t(errorCode) });
    }
    return t(`messages.${key}`);
  };

  return (
    <div className="bg-card border-border max-w-5xl rounded-xl border p-6 shadow-lg">
      <h2 className="text-foreground mb-6 text-2xl font-semibold">
        {t("mainTitle")}
      </h2>

      {state.message && (
        <div className={cn("mb-4 rounded p-3 text-sm", state.success ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
          {getTranslatedStatusMessage(state)}
        </div>
      )}

      <form onSubmit={handleSubmitWrapper} className="space-y-6">
        <UserRestaurantForm
          initialData={restaurant}
          formErrors={state.errors}
          onLogoUrlChange={setLogoUrl}
          onCurrencyChange={setCurrentCurrency}
          onPhoneNumberChange={setCurrentPhoneNumber}
          onDescriptionChange={setCurrentDescription}
          onTypeOfEstablishmentChange={setCurrentTypeOfEstablishment}
          onCountryChange={setCurrentCountry}
          currentLogoUrl={logoUrl}
          currentCurrency={currentCurrency}
          currentPhoneNumber={currentPhoneNumber}
          currentDescription={currentDescription}
          currentTypeOfEstablishment={currentTypeOfEstablishment}
          currentCountry={currentCountry}
          
          // --- PASS NEW PROPS TO USER FORM ---
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

        <div className="border-border flex justify-end border-t pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}