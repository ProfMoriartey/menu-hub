// src/components/dashboard/MenuItemManager.tsx
"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "~/app/actions/menu-item"; // Secured actions
import { cn } from "~/lib/utils";

// --- TYPE DEFINITIONS ---

interface MenuItemData {
  id: string;
  name: string;
  description: string | null;
  price: string;
  ingredients: string | null;
  imageUrl: string | null;
  dietaryLabels: string[] | null;
}

interface CategoryProps {
  categoryId: string;
  restaurantId: string;
  initialMenuItems: MenuItemData[];
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

interface SubmitButtonProps {
  label: string;
}

// --- Submit Button Component ---
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

// --- Wrapper Action for FormData Actions (Add/Update) ---
// This handles Server Actions that only accept a single FormData payload.
type ServerAction = (formData: FormData) => Promise<void>;

async function wrapMenuItemAction(
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

// --- Specific Wrapper for DELETE Action (Handles Positional Args) ---
// This wrapper accepts the useFormState signature (prevState, formData)
// but delegates the call to the original 3-argument deleteMenuItem action.
async function deleteWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const itemId = formData.get("menuItemId") as string;
    const rId = formData.get("restaurantId") as string;
    const cId = formData.get("categoryId") as string;

    // Call the original 3-argument secured Server Action
    await deleteMenuItem(itemId, rId, cId);

    return { message: "Item deleted successfully.", success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during deletion.";
    return { message: `Failed: ${message}`, success: false };
  }
}

// --- Single Menu Item Component (Edit/View) ---
function MenuItemItem({
  item,
  categoryId,
  restaurantId,
}: {
  item: MenuItemData;
  categoryId: string;
  restaurantId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Bind actions
  const boundUpdateAction = wrapMenuItemAction.bind(null, updateMenuItem);

  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );
  // Use the specific delete wrapper here
  const [deleteState, deleteFormAction] = useFormState(
    deleteWrapperAction,
    initialState,
  );

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the menu item: ${item.name}?`,
      )
    ) {
      // Create FormData dynamically for delete action
      const formData = new FormData();
      formData.set("menuItemId", item.id);
      formData.set("restaurantId", restaurantId);
      formData.set("categoryId", categoryId);
      deleteFormAction(formData); // Execute the action with FormData
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {isEditing ? (
        // --- Edit Mode Form ---
        <form action={updateFormAction} className="space-y-3">
          <input type="hidden" name="id" defaultValue={item.id} />
          <input
            type="hidden"
            name="restaurantId"
            defaultValue={restaurantId}
          />
          <input type="hidden" name="categoryId" defaultValue={categoryId} />

          <h4 className="text-md font-medium text-gray-700">
            Edit {item.name}
          </h4>

          {/* Input: Name */}
          <input
            type="text"
            name="name"
            required
            defaultValue={item.name}
            className="block w-full rounded-md border-gray-300"
            placeholder="Name"
          />

          {/* Input: Price */}
          <input
            type="text"
            name="price"
            required
            defaultValue={item.price}
            className="block w-full rounded-md border-gray-300"
            placeholder="Price"
          />

          {/* Input: Dietary Labels (Needs upgrading) */}
          <input
            type="text"
            name="dietaryLabels"
            defaultValue={item.dietaryLabels?.join(", ") ?? ""}
            className="block w-full rounded-md border-gray-300"
            placeholder="e.g., vegan, gluten-free"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
            <SubmitButton label="Save Item" />
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
            <h4 className="text-md font-semibold text-gray-800">
              {item.name} - {item.price}
            </h4>
            <p className="text-sm text-gray-500">{item.description}</p>
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

// --- Menu Item Manager Component ---
export default function MenuItemManager({
  categoryId,
  restaurantId,
  initialMenuItems,
}: CategoryProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const boundAddAction = wrapMenuItemAction.bind(null, addMenuItem);
  const [addState, addFormAction] = useFormState(boundAddAction, initialState);

  return (
    <div className="space-y-4">
      {/* 1. Add New Menu Item Button/Form Toggle */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-green-700"
      >
        {showAddForm ? "Hide Form" : "+ Add New Menu Item"}
      </button>

      {/* 2. Add New Menu Item Form */}
      {showAddForm && (
        <div className="rounded-xl border border-dashed border-green-300 bg-green-50 p-6 shadow-inner">
          <h4 className="mb-4 text-lg font-semibold text-green-800">
            New Item Details
          </h4>
          <form action={addFormAction} className="space-y-3">
            <input
              type="hidden"
              name="restaurantId"
              defaultValue={restaurantId}
            />
            <input type="hidden" name="categoryId" defaultValue={categoryId} />

            <input
              type="text"
              name="name"
              required
              className="block w-full rounded-md border-gray-300"
              placeholder="Name"
            />
            <input
              type="text"
              name="price"
              required
              className="block w-full rounded-md border-gray-300"
              placeholder="Price (e.g., $12.50)"
            />
            <textarea
              name="description"
              rows={2}
              className="block w-full rounded-md border-gray-300"
              placeholder="Description"
            ></textarea>

            <div className="flex justify-end pt-2">
              <SubmitButton label="Create Item" />
            </div>
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
      )}

      {/* 3. List of Existing Items */}
      <div className="space-y-3 border-t border-gray-100 pt-4">
        {initialMenuItems.length === 0 ? (
          <p className="text-gray-500">No items in this category.</p>
        ) : (
          initialMenuItems.map((item) => (
            <MenuItemItem
              key={item.id}
              item={item}
              categoryId={categoryId}
              restaurantId={restaurantId}
            />
          ))
        )}
      </div>
    </div>
  );
}
