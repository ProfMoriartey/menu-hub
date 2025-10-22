"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "~/app/actions/category";
import { cn } from "~/lib/utils";

import type { Category } from "~/types/restaurant";

import MenuItemManager from "./MenuItemManager";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronDown, Pencil, Trash2, PlusCircle } from "lucide-react";

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
  variant?: "default" | "destructive" | "outline" | "secondary";
}

interface CategoryItemProps {
  category: Category;
  restaurantId: string;
}

// --- 1. Submit Button Component (Uses Shadcn Button) ---
function SubmitButton({ label, variant = "default" }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      variant={variant}
      className="w-full sm:w-auto"
    >
      {pending ? "Processing..." : label}
    </Button>
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
async function deleteCategoryWrapperAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const categoryId = formData.get("categoryId") as string;
    const restaurantId = formData.get("restaurantId") as string;

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
  const [isExpanded, setIsExpanded] = useState(false);

  const boundUpdateAction = wrapCategoryAction.bind(null, updateCategory);

  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );

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
      const formData = new FormData();
      formData.set("categoryId", category.id);
      formData.set("restaurantId", restaurantId);
      deleteFormAction(formData);
    }
  };

  return (
    <div className="border-border bg-card rounded-lg border shadow-md transition-shadow hover:shadow-lg">
      {/* Top Header Section - Clickable Area */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-foreground text-lg font-semibold">
            {category.name}
          </h3>
          <span className="text-muted-foreground text-sm">
            ({(category.menuItems ?? []).length} Items)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Edit/Delete Buttons using Shadcn Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            variant="secondary"
            size="icon"
            className="h-8 w-8"
          >
            <Pencil className="text-secondary-foreground h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            variant="destructive"
            size="icon"
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Expansion Indicator */}
          <ChevronDown
            className={cn(
              "text-muted-foreground h-5 w-5 transform transition-transform duration-200",
              isExpanded ? "rotate-180" : "",
            )}
          />
        </div>
      </div>

      {/* Expansion Content - Menu Item Manager */}
      {isExpanded && (
        <div className="border-border bg-secondary/30 border-t p-4">
          <MenuItemManager
            categoryId={category.id}
            restaurantId={restaurantId}
            initialMenuItems={category.menuItems ?? []}
          />
        </div>
      )}

      {/* Editing Form (rendered conditionally) */}
      {isEditing && (
        <div className="border-border bg-muted/50 border-t p-4">
          <form action={updateFormAction} className="space-y-3">
            <input type="hidden" name="id" defaultValue={category.id} />
            <input
              type="hidden"
              name="restaurantId"
              defaultValue={restaurantId}
            />

            <Input
              type="text"
              name="name"
              required
              defaultValue={category.name}
              placeholder="Category Name"
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <SubmitButton label="Save Category" variant="default" />
            </div>
            {updateState.message && (
              <p
                className={cn(
                  "pt-1 text-xs",
                  updateState.success ? "text-primary" : "text-destructive",
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
            deleteState.success ? "text-primary" : "text-destructive",
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false); // New state for dropdown
  const boundAddAction = wrapCategoryAction.bind(null, addCategory);

  const [addState, addFormAction] = useFormState(boundAddAction, initialState);

  // Close the form if successfully submitted
  React.useEffect(() => {
    if (addState.success) {
      setIsAddFormOpen(false);
    }
  }, [addState.success]);

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. Collapsible Add New Category Form */}
      <div className="border-border bg-card rounded-xl border shadow-md">
        {/* Toggle Button/Header */}
        <button
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="text-foreground hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left text-lg font-semibold transition-colors"
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="text-primary h-5 w-5" />
            <span>Add New Category</span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 transform transition-transform duration-200",
              isAddFormOpen ? "rotate-180" : "",
            )}
          />
        </button>

        {/* Form Content (Conditionally Rendered) */}
        {isAddFormOpen && (
          <div className="border-border bg-secondary/20 border-t p-6">
            <form
              action={addFormAction}
              className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
            >
              <input
                type="hidden"
                name="restaurantId"
                defaultValue={restaurantId}
              />
              <Input
                type="text"
                name="name"
                required
                className="flex-grow"
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
                  addState.success ? "text-primary" : "text-destructive",
                )}
              >
                {addState.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. List of Existing Categories */}
      <div className="space-y-4">
        <h2 className="text-foreground text-2xl font-semibold">
          Existing Categories
        </h2>

        {initialCategories.length === 0 ? (
          <div className="border-border text-muted-foreground bg-card rounded-lg border p-6 text-center">
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

// NOTE: Placeholder components and types were removed from the final block for clarity.
