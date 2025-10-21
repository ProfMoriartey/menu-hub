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
// 🛑 IMPORT CLIENT EDITOR
import { EditMenuItemClient } from "./EditMenuItemClient";
// 🛑 Import the Add Item component
import { AddMenuItemClient } from "./AddMenuItemClient";

import type { MenuItem } from "~/types/restaurant";

// --- TYPE DEFINITIONS ---

interface CategoryProps {
  categoryId: string;
  restaurantId: string;
  initialMenuItems: MenuItem[];
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

// --- Submit Button Component (Kept for compatibility) ---
function SubmitButton({ label }: { label: string }) {
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

// 🛑 START OF SHARED WRAPPER FUNCTIONS 🛑

// --- Wrapper Action for FormData Actions (Add/Update) ---
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
async function deleteWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const itemId = formData.get("menuItemId") as string;
    const rId = formData.get("restaurantId") as string;
    const cId = formData.get("categoryId") as string;

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

// 🛑 END OF SHARED WRAPPER FUNCTIONS 🛑

// --- Single Menu Item Component (VIEW MODE and DELETE) ---
function MenuItemItem({
  item,
  categoryId,
  restaurantId,
  onEdit,
  deleteState,
  deleteFormAction,
}: {
  item: MenuItem;
  categoryId: string;
  restaurantId: string;
  onEdit: () => void;
  deleteState: FormState;
  deleteFormAction: (formData: FormData) => void;
}) {
  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the menu item: ${item.name}?`,
      )
    ) {
      const formData = new FormData();
      formData.set("menuItemId", item.id);
      formData.set("restaurantId", restaurantId);
      formData.set("categoryId", categoryId);
      deleteFormAction(formData);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <h4 className="text-md font-semibold text-gray-800">
          {item.name} - {item.price}
        </h4>
        <p className="text-sm text-gray-500">{item.description}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
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
  // State for the Add New Menu Item Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Bound actions for Update and Delete
  const [deleteState, deleteFormAction] = useFormState(
    deleteWrapperAction,
    initialState,
  );

  // Bound actions for Update (used inside EditMenuItemClient)
  const boundUpdateAction = wrapMenuItemAction.bind(null, updateMenuItem);
  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      {/* 1. Add New Menu Item Button/Form Toggle */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-green-700"
      >
        {showAddForm ? "Hide Form" : "+ Add New Menu Item"}
      </button>

      {/* 2. RENDER THE ADD ITEM CLIENT COMPONENT */}
      {showAddForm && (
        <AddMenuItemClient
          restaurantId={restaurantId}
          categoryId={categoryId}
          // The onSuccess callback hides the form and allows the parent to refresh/re-render
          onSuccess={() => {
            setShowAddForm(false);
            // In a production app, you'd trigger a revalidation or state change here
          }}
        />
      )}

      {/* 3. List of Existing Items */}
      <div className="space-y-3 border-t border-gray-100 pt-4">
        {initialMenuItems.length === 0 ? (
          <p className="text-gray-500">No items in this category.</p>
        ) : (
          initialMenuItems.map((item) => (
            <React.Fragment key={item.id}>
              {editingItemId === item.id ? (
                // 🛑 RENDER EDIT FORM
                <EditMenuItemClient
                  menuItem={item}
                  onCancel={() => setEditingItemId(null)}
                  formAction={updateFormAction}
                  // Pass errors (if needed)
                  formErrors={[]}
                />
              ) : (
                // 🛑 RENDER VIEW MODE
                <MenuItemItem
                  item={item}
                  categoryId={categoryId}
                  restaurantId={restaurantId}
                  onEdit={() => setEditingItemId(item.id)}
                  deleteState={deleteState}
                  deleteFormAction={deleteFormAction}
                />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
