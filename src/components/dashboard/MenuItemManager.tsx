"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "~/app/actions/menu-item";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button"; // Import Shadcn Button

import { EditMenuItemClient } from "./EditMenuItemClient";
import { AddMenuItemClient } from "./AddMenuItemClient";

import type { MenuItem } from "~/types/restaurant";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

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

// --- Submit Button Component (No longer needed, but kept as placeholder) ---
// This component should ideally be removed as all buttons now use Shadcn's Button.
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      variant="default" // Use theme variant
    >
      {pending ? "Processing..." : label}
    </Button>
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
    // Uses card colors for item container
    <div className="border-border bg-card flex flex-col items-start justify-between rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="mb-2 sm:mb-0">
        <h4 className="text-md text-foreground font-semibold">
          {item.name} - {item.price}
        </h4>
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onEdit}
          variant="secondary"
          size="icon"
          className="h-8 w-8"
        >
          <Pencil className="text-secondary-foreground h-4 w-4" />
        </Button>
        <Button
          onClick={handleDelete}
          variant="destructive"
          size="icon"
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {deleteState.message && (
        <p
          className={cn(
            "mt-2 w-full text-xs sm:absolute sm:top-full sm:left-0 sm:mt-0",
            // Use semantic colors for feedback messages
            deleteState.success ? "text-primary" : "text-destructive",
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [deleteState, deleteFormAction] = useFormState(
    deleteWrapperAction,
    initialState,
  );

  const boundUpdateAction = wrapMenuItemAction.bind(null, updateMenuItem);
  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );

  return (
    <div className="space-y-4">
      {/* 1. Add New Menu Item Button/Form Toggle */}
      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        variant="secondary" // Use secondary for non-destructive actions
        className="w-full sm:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {showAddForm ? "Hide Add Item Form" : "Add New Menu Item"}
      </Button>

      {/* 2. RENDER THE ADD ITEM CLIENT COMPONENT */}
      {showAddForm && (
        <div className="border-border bg-secondary/20 rounded-lg border p-4">
          <AddMenuItemClient
            restaurantId={restaurantId}
            categoryId={categoryId}
            onSuccess={() => {
              setShowAddForm(false);
              // Trigger item list refresh here if needed
            }}
          />
        </div>
      )}

      {/* 3. List of Existing Items */}
      <div className="border-border space-y-3 border-t pt-4">
        {" "}
        {/* Use border-border */}
        {initialMenuItems.length === 0 ? (
          <p className="text-muted-foreground">No items in this category.</p>
        ) : (
          initialMenuItems.map((item) => (
            <React.Fragment key={item.id}>
              {editingItemId === item.id ? (
                // 🛑 RENDER EDIT FORM
                <EditMenuItemClient
                  menuItem={item}
                  onCancel={() => setEditingItemId(null)}
                  formAction={updateFormAction}
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

      {/* 4. Display global update/delete feedback outside of list */}
      {updateState.message && (
        <p
          className={cn(
            "text-sm",
            updateState.success ? "text-primary" : "text-destructive",
          )}
        >
          {updateState.message}
        </p>
      )}
    </div>
  );
}

// NOTE: The `AddMenuItemClient` component would need similar theme adjustments.
// You should ensure the `AddMenuItemClient` component uses the same semantic styles.
