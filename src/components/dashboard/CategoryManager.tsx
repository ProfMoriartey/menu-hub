// src/components/dashboard/CategoryManager.tsx
"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "~/app/actions/category";
import { cn } from "~/lib/utils";
// Assuming you have a component library for visual elements

// --- TYPE DEFINITIONS ---

interface MenuItemData {
  id: string;
}

interface CategoryData {
  id: string;
  name: string;
  menuItems: MenuItemData[];
  // Add other category properties if needed
}

interface FormState {
  message: string;
  success: boolean;
}

// Initial state for useFormState
const initialState: FormState = {
  message: "",
  success: false,
};

interface CategoryManagerProps {
  restaurantId: string;
  initialCategories: CategoryData[];
}

interface SubmitButtonProps {
  label: string;
}

interface CategoryItemProps {
  category: CategoryData;
  restaurantId: string;
}

// --- Sub-component for form submission status ---
function SubmitButton({ label }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-indigo-700 disabled:opacity-50"
    >
      {pending ? "Processing..." : label}
    </button>
  );
}

// --- Wrapper action to integrate Server Actions with useFormState ---
// This handles the void return type of your Server Actions and provides UI feedback.
async function wrapCategoryAction(
  action: (
    formData: FormData,
  ) =>
    | Promise<void>
    | ((
        itemId: string,
        restaurantId: string,
        categoryId: string,
      ) => Promise<void>),
  prevState: FormState, // Accepts the current state from useFormState
  formData: FormData, // Accepts the new form payload
): Promise<FormState> {
  try {
    // Determine the correct function call based on arguments (same logic as before)
    if (action.length === 3) {
      // For delete, which requires separate positional arguments
      const categoryId = formData.get("categoryId") as string;
      const restaurantId = formData.get("restaurantId") as string;
      // Note: Delete action only takes two arguments, but we keep the wrapper flexible
      await (
        action as (categoryId: string, restaurantId: string) => Promise<void>
      )(categoryId, restaurantId);
    } else {
      // For add/update, which takes FormData
      await (action as (formData: FormData) => Promise<void>)(formData);
    }

    // Success State
    return { message: "Action completed successfully.", success: true };
  } catch (error) {
    // Error State
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during submission.";
    return { message: `Failed: ${message}`, success: false };
  }
}

// --- Component to display a single category and its actions ---
function CategoryItem({ category, restaurantId }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Create bound actions for useFormState
  const boundUpdateAction = wrapCategoryAction.bind(null, updateCategory);
  const boundDeleteAction = wrapCategoryAction.bind(null, (formData) =>
    deleteCategory(
      formData.get("categoryId") as string,
      formData.get("restaurantId") as string,
    ),
  );

  // State for Update Form
  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );

  // State for Delete Form
  const [deleteState, deleteFormAction] = useFormState(
    boundDeleteAction,
    initialState,
  );

  // You would typically use a confirmation dialog here instead of a raw form.
  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the category: ${category.name}?`,
      )
    ) {
      // Create FormData dynamically for delete action
      const formData = new FormData();
      formData.set("categoryId", category.id);
      formData.set("restaurantId", restaurantId);
      deleteFormAction(formData);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {isEditing ? (
        // --- Edit Mode Form ---
        <form action={updateFormAction} className="space-y-3">
          <input type="hidden" name="id" defaultValue={category.id} />
          <input
            type="hidden"
            name="restaurantId"
            defaultValue={restaurantId}
          />

          <input
            type="text"
            name="name"
            required
            defaultValue={category.name}
            className="block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Category Name"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <SubmitButton label="Save Category" />
          </div>
          {updateState.message && (
            <p
              className={cn(
                "text-xs",
                updateState.success ? "text-green-600" : "text-red-600",
              )}
            >
              {updateState.message}
            </p>
          )}
        </form>
      ) : (
        // --- View Mode ---
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">
              Items: {category.menuItems.length}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {/* Display messages for delete action outside of the main flow */}
      {deleteState.message && (
        <p
          className={cn(
            "mt-2 text-xs",
            deleteState.success ? "text-green-600" : "text-red-600",
          )}
        >
          {deleteState.message}
        </p>
      )}
    </div>
  );
}

// --- Main Category Manager Component ---
export default function CategoryManager({
  restaurantId,
  initialCategories,
}: CategoryManagerProps) {
  // Create bound action for Add Category Form
  const boundAddAction = wrapCategoryAction.bind(null, addCategory);

  // State for the Add New Category Form
  const [addState, addFormAction] = useFormState(boundAddAction, initialState);

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. Add New Category Form */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 shadow-inner">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Add New Category
        </h3>

        <form
          action={addFormAction}
          className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
        >
          <input
            type="hidden"
            name="restaurantId"
            defaultValue={restaurantId}
          />
          <input
            type="text"
            name="name"
            required
            className="flex-grow rounded-md border-gray-300 shadow-sm"
            placeholder="e.g., Appetizers, Main Dishes, Drinks"
            // Reset input value after successful submission (UX enhancement)
            key={addState.success ? "success" : "error"}
          />
          <SubmitButton label="Add Category" />
        </form>
        {addState.message && (
          <p
            className={cn(
              "mt-2 text-sm",
              addState.success ? "text-green-600" : "text-red-600",
            )}
          >
            {addState.message}
          </p>
        )}
      </div>

      {/* 2. List of Existing Categories */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Existing Categories
        </h2>

        {initialCategories.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-gray-500">
            No categories found. Start by adding one above.
          </div>
        ) : (
          <div className="space-y-3">
            {initialCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                restaurantId={restaurantId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
