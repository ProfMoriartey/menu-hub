"use client";

import React, { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl"; // Import next-intl hook
import { updateRestaurant } from "~/app/actions/restaurant";
import { cn } from "~/lib/utils";
import { restaurantSchema } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

// 🛑 IMPORT THE REUSABLE FORM AND BUTTONS
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

// --- Submit Button Component ---
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

// --- Form Wrapper Action ---
async function formWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // NOTE: Validation logic remains here.
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
  };

  const result = restaurantSchema.safeParse(values);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((_e) => {
      if (typeof _e.path[0] === "string") {
        errors[_e.path[0]] = _e.message;
      }
    });
    return {
      success: false,
      // Fixed key for validation message
      message: "validationFailed",
      errors,
    };
  }

  try {
    await updateRestaurant(formData);
    return {
      success: true,
      // Fixed key for success message
      message: "updateSuccess",
      errors: {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknownError";
    // Fixed key for failure message
    return {
      success: false,
      message: `updateFailedPrefix:${message}`,
      errors: {},
    };
  }
}

// --- Main Form Component ---
export default function RestaurantDetailsForm({
  restaurant,
}: RestaurantDetailsFormProps) {
  const t = useTranslations("RestaurantForm");

  // State replication logic remains the same
  const [isRestaurantActive, setIsRestaurantActive] = useState(
    restaurant.isActive ?? true,
  );
  const [isRestaurantDisplayed, setIsRestaurantDisplayed] = useState(
    restaurant.isDisplayed ?? true,
  );
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl ?? null);
  const [currentCurrency, setCurrentCurrency] = useState(
    restaurant.currency ?? "USD",
  );
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(
    restaurant.phoneNumber ?? "",
  );
  const [currentDescription, setCurrentDescription] = useState(
    restaurant.description ?? "",
  );
  const [currentFoodType, setCurrentFoodType] = useState(
    restaurant.foodType ?? "",
  );
  const [currentTheme, setCurrentTheme] = useState(
    restaurant.theme ?? "classic",
  );
  const [currentTypeOfEstablishment, setCurrentTypeOfEstablishment] = useState(
    restaurant.typeOfEstablishment ?? "",
  );
  const [currentCountry, setCurrentCountry] = useState(
    restaurant.country ?? "",
  );

  const [state, formAction] = useFormState(formWrapperAction, initialState);

  // Clear success message after a delay (UX)
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        // Send a dummy action to reset useFormState without triggering validation/update
        formAction(new FormData());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success, formAction]);

  const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Inject all CONTROLLED STATE VALUES
    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isRestaurantDisplayed ? "on" : "");
    formData.set("logoUrl", logoUrl ?? "");
    formData.set("currency", currentCurrency);
    formData.set("phoneNumber", currentPhoneNumber);
    formData.set("description", currentDescription);
    formData.set("typeOfEstablishment", currentTypeOfEstablishment);
    formData.set("country", currentCountry);

    // CRITICAL: INJECT STATIC, READ-ONLY FIELDS required by Zod
    formData.set("id", restaurant.id);
    formData.set("slug", restaurant.slug);
    formData.set("theme", restaurant.theme ?? "classic");
    formData.set("foodType", restaurant.foodType ?? "");

    // Ensure that isActive/isDisplayed are set even if not controlled by state explicitly in this code block
    formData.set("isActive", isRestaurantActive ? "on" : "");
    formData.set("isDisplayed", isRestaurantDisplayed ? "on" : "");

    formAction(formData);
  };

  const getTranslatedStatusMessage = (currentState: FormState) => {
    const key = currentState.message;
    if (key.startsWith("updateFailedPrefix")) {
      // Extract the error code and translate it (e.g., "updateFailedPrefix:unknownError")
      const errorCode = key.split(":")[1] ?? "unknownError";
      return t("messages.updateFailed", { error: t(errorCode) });
    }
    // Handle validation failure and success directly
    return t(`messages.${key}`);
  };

  return (
    <div className="bg-card border-border max-w-4xl rounded-xl border p-6 shadow-lg">
      <h2 className="text-foreground mb-6 text-2xl font-semibold">
        {t("mainTitle")}
      </h2>

      {/* State Feedback Message */}
      {state.message && (
        <div
          className={cn(
            "mb-4 rounded p-3 text-sm",
            state.success
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {getTranslatedStatusMessage(state)}
        </div>
      )}

      <form onSubmit={handleSubmitWrapper} className="space-y-6">
        {/* CRITICAL: Hidden ID for Authorization */}
        <input type="hidden" name="id" defaultValue={restaurant.id} />

        {/* RENDER THE REUSABLE FORM COMPONENT */}
        <UserRestaurantForm
          initialData={restaurant}
          formErrors={state.errors}
          // Pass down all state and handler functions
          onLogoUrlChange={setLogoUrl}
          onCurrencyChange={setCurrentCurrency}
          onPhoneNumberChange={setCurrentPhoneNumber}
          onDescriptionChange={setCurrentDescription}
          onTypeOfEstablishmentChange={setCurrentTypeOfEstablishment}
          onCountryChange={setCurrentCountry}
          // Pass current state values
          currentLogoUrl={logoUrl}
          currentCurrency={currentCurrency}
          currentPhoneNumber={currentPhoneNumber}
          currentDescription={currentDescription}
          currentTypeOfEstablishment={currentTypeOfEstablishment}
          currentCountry={currentCountry}
        />

        {/* Save Button */}
        <div className="border-border flex justify-end border-t pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
