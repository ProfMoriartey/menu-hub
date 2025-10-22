// src/components/dashboard/RestaurantDetailsForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { updateRestaurant } from "~/app/actions/restaurant";
import { cn } from "~/lib/utils";
import { restaurantSchema } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

// 🛑 IMPORT THE REUSABLE FORM AND BUTTONS
import { RestaurantForm } from "~/components/admin/RestaurantForm"; // Assuming this path or similar is correct
import { Button } from "~/components/ui/button"; // Assuming your button component is here
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

// --- Submit Button Component (REUSED from Admin form logic) ---
function SubmitButton() {
  // Use useFormStatus directly here if needed, or define it in a separate file
  return (
    <Button
      type="submit"
      // disabled={pending} // You would use useFormStatus here
      className={cn(
        "bg-primary rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50",
      )}
    >
      Save Changes
    </Button>
  );
}

// --- Form Wrapper Action ---
async function formWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    // ... all fields collected here for Zod validation (copied from previous response)
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
      message: "Validation failed. Check the fields.",
      errors,
    };
  }

  try {
    await updateRestaurant(formData);
    return {
      success: true,
      message: "Restaurant details updated successfully.",
      errors: {},
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Update failed: ${message}`, errors: {} };
  }
}

// --- Main Form Component ---
export default function RestaurantDetailsForm({
  restaurant,
}: RestaurantDetailsFormProps) {
  // 🛑 REPLICATE ALL STATE FROM ADMIN DIALOG HERE
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
        formAction(new FormData());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success, formAction]);

  // Use a wrapper function for handleSubmit to inject state values into FormData
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
    formData.set("theme", currentTheme); // This is still state-controlled, so it's fine.
    formData.set("typeOfEstablishment", currentTypeOfEstablishment);
    formData.set("country", currentCountry);

    // 🛑 CRITICAL FIX: INJECT STATIC, READ-ONLY FIELDS
    // These fields are required by Zod but are not visible/editable in the User Form.
    formData.set("slug", restaurant.slug);
    // Ensure isActive/isDisplayed are set, even if they are controlled by state later
    formData.set("isActive", restaurant.isActive ? "on" : "");
    formData.set("isDisplayed", restaurant.isDisplayed ? "on" : "");
    formData.set("theme", restaurant.theme ?? "classic");
    formData.set("foodType", restaurant.foodType ?? "");

    // Note: If you removed theme from the state, you must inject it here too:
    // formData.set("theme", restaurant.theme ?? 'classic');

    formAction(formData);
  };

  return (
    <div className="bg-background max-w-4xl rounded-xl border p-6 shadow-lg">
      <h2 className="text-foreground mb-6 text-2xl font-semibold">
        Restaurant Settings
      </h2>

      {/* State Feedback Message */}
      {state.message && (
        <div
          className={`mb-4 rounded p-3 ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {state.message}
        </div>
      )}

      <form onSubmit={handleSubmitWrapper} className="space-y-6">
        {/* CRITICAL: Hidden ID for Authorization */}
        <input type="hidden" name="id" defaultValue={restaurant.id} />

        {/* 🛑 RENDER THE REUSABLE FORM COMPONENT */}
        <UserRestaurantForm
          // Pass the non-form-controlled data
          initialData={restaurant}
          formErrors={state.errors}
          // Pass down all state and handler functions
          onLogoUrlChange={setLogoUrl}
          onCurrencyChange={setCurrentCurrency}
          onPhoneNumberChange={setCurrentPhoneNumber}
          onDescriptionChange={setCurrentDescription}
          onTypeOfEstablishmentChange={setCurrentTypeOfEstablishment}
          onCountryChange={setCurrentCountry} // Assuming you add this handler to RestaurantFormProps
          // Pass current state values

          currentLogoUrl={logoUrl}
          currentCurrency={currentCurrency}
          currentPhoneNumber={currentPhoneNumber}
          currentDescription={currentDescription}
          currentTypeOfEstablishment={currentTypeOfEstablishment}
          currentCountry={currentCountry} // Assuming you add this prop to RestaurantFormProps
        />

        {/* Save Button */}
        <div className="border-primary flex justify-end border-t pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
