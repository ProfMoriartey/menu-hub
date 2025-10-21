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

import type { Category } from "~/types/restaurant"; // 🛑 Import Category and MenuItem types

import MenuItemManager from "./MenuItemManager";

// --- TYPE DEFINITIONS ---

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
  initialCategories: Category[];
}

interface SubmitButtonProps {
  label: string;
}

interface CategoryItemProps {
  category: Category;
  restaurantId: string;
}

// --- 1. Submit Button Component ---
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

// --- 2. Wrapper Action for FormData Actions (Add/Update) ---
type ServerAction = (formData: FormData) => Promise<void>;

async function wrapCategoryAction(
  action: ServerAction,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await action(formData);
    return { message: "Action completed successfully.", success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during submission.";
    return { message: `Failed: ${message}`, success: false };
  }
}

// --- 3. Wrapper Action for Delete (Positional Args) ---
// This explicitly wraps the two-argument deleteCategory action for useFormState.
async function deleteCategoryWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const categoryId = formData.get("categoryId") as string;
    const restaurantId = formData.get("restaurantId") as string;

    // Call the original, secured two-argument Server Action
    await deleteCategory(categoryId, restaurantId);

    return { message: "Category deleted successfully.", success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during deletion.";
    return { message: `Failed: ${message}`, success: false };
  }
}

// --- 4. Component to display a single category and its actions ---
function CategoryItem({ category, restaurantId }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // 🛑 NEW STATE FOR EXPANSION

  // Create bound actions for useFormState
  const boundUpdateAction = wrapCategoryAction.bind(null, updateCategory);

  // State for Update Form
  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );

  // State for Delete Form - Using the specific delete wrapper
  const [deleteState, deleteFormAction] = useFormState(
    deleteCategoryWrapperAction,
    initialState,
  );

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
      deleteFormAction(formData); // Execute the action with FormData
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Top Header Section */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {category.name}
          </h3>
          <span className="text-sm text-gray-500">
            ({(category.menuItems ?? []).length} Items)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Edit/Delete Buttons for the Category */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white transition-colors hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>

          {/* Expansion Indicator */}
          <svg
            className={cn(
              "h-5 w-5 transform text-gray-500 transition-transform duration-200",
              isExpanded ? "rotate-180" : "",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expansion Content - Menu Item Manager */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          <MenuItemManager
            categoryId={category.id}
            restaurantId={restaurantId}
            initialMenuItems={category.menuItems ?? []}
          />
        </div>
      )}

      {/* Editing Form (rendered conditionally) */}
      {isEditing && (
        <div className="border-t bg-yellow-50/50 p-4">
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
        </div>
      )}

      {/* Display messages for delete action outside of the main flow */}
      {deleteState.message && (
        <p
          className={cn(
            "p-4 text-xs",
            deleteState.success ? "text-green-600" : "text-red-600",
          )}
        >
          {deleteState.message}
        </p>
      )}
    </div>
  );
}
// --- 5. Main Category Manager Component ---
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
