// src/components/dashboard/RestaurantDetailsForm.tsx
"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateRestaurant } from "~/app/actions/restaurant"; // Your secured Server Action

import type { Restaurant } from "~/types/restaurant";

// --- 1. Define Props and State Types ---
interface FormState {
  message: string;
  success: boolean;
  errors?: Record<string, string>;
}

// Initial state for useFormState
const initialState: FormState = {
  message: "",
  success: false,
};

// --- 2. Submit Button Component ---
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="w-full rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

// --- 3. Wrapper Action for useFormState ---
// We use a wrapper function because the formAction expected by useFormState must
// return a state object, but updateRestaurant returns void.

async function formWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await updateRestaurant(formData);
    // On successful update, return success state
    return {
      success: true,
      message: "Restaurant details updated successfully.",
    };
  } catch (error) {
    // On failure (e.g., Auth failure, Validation failure)
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Error: ${errorMessage}` };
  }
}

// --- 4. Main Component ---
export default function RestaurantDetailsForm({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  // Use the wrapper action to manage state
  const [state, formAction] = useFormState(formWrapperAction, initialState);

  // Use useEffect to clear the success message after a few seconds (optional UX enhancement)
  React.useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        // Reset state to clear message
        formAction(new FormData()); // A safe way to trigger state update without sending data
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success, formAction]);

  return (
    <div className="max-w-3xl rounded-xl border bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        Basic Information
      </h2>

      {/* State Feedback Message */}
      {state.message && (
        <div
          className={`mb-4 rounded p-3 ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Hidden Field for Authorization/Identification (ID used by updateRestaurant) */}
        <input type="hidden" name="id" defaultValue={restaurant.id} />
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          {/* 1. Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Restaurant Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={restaurant.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* 2. Slug (Read-only after creation for safety) */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700"
            >
              Menu Slug (URL)
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              readOnly
              defaultValue={restaurant.slug}
              className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 shadow-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Slug is read-only.</p>
          </div>
        </div>

        {/* 3. Description (Mobile-friendly width) */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            defaultValue={restaurant.description ?? ""}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-6">
          {/* 4. Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              defaultValue={restaurant.address ?? ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          {/* 5. Currency */}
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700"
            >
              Currency
            </label>
            <input
              type="text"
              name="currency"
              id="currency"
              defaultValue={restaurant.currency || "USD"}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          {/* 6. Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              defaultValue={restaurant.phoneNumber ?? ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end border-t border-gray-100 pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
