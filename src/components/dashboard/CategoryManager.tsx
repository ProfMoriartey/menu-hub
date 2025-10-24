"use client";

import React, { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl"; // Import next-intl hook
import {
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "~/app/actions/category";
import { cn } from "~/lib/utils";

import type { Category } from "~/types/restaurant";

import MenuItemManager from "./MenuItemManager";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ChevronDown, Pencil, Trash2, PlusCircle } from "lucide-react";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  // Using verticalListSortingStrategy is fine for a stack of cards
} from "@dnd-kit/sortable";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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
  const t = useTranslations("CategoryManager");
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      variant={variant}
      className="w-full sm:w-auto"
    >
      {pending ? t("processing") : label}
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
    // Use fixed success key
    return { message: "updateSuccess", success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknownError";
    // Use fixed error key
    return { message: `updateFailedPrefix: ${message}`, success: false };
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

    // Use fixed success key
    return { message: "deleteSuccess", success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknownError";
    // Use fixed error key
    return { message: `deleteFailedPrefix: ${message}`, success: false };
  }
}

interface SortableCategoryItemProps extends CategoryItemProps {
  isDragging: boolean;
  attributes: React.HTMLAttributes<HTMLDivElement>;
  listeners: React.HTMLAttributes<HTMLDivElement>;
}

function SortableCategoryItem({ category, restaurantId }: CategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // 🛑 Listeners are applied to the entire item for drag capability 🛑
      {...listeners}
      className={cn(
        "border-border bg-card cursor-grab rounded-lg border shadow-md transition-shadow hover:shadow-lg",
        isDragging ? "shadow-xl ring-2 ring-indigo-500" : "",
      )}
    >
      {/* Render the core Category Item UI inside the draggable element */}
      <CategoryItem category={category} restaurantId={restaurantId} />
    </div>
  );
}

// --- 4. Component to display a single category and its actions ---
function CategoryItem({ category, restaurantId }: CategoryItemProps) {
  const t = useTranslations("CategoryManager.item"); // Item-specific keys

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
    // Replaced window.confirm with t()
    if (window.confirm(t("confirmDelete", { categoryName: category.name }))) {
      const formData = new FormData();
      formData.set("categoryId", category.id);
      formData.set("restaurantId", restaurantId);
      deleteFormAction(formData);
    }
  };

  return (
    <div className="w-full">
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
            {/* Using t() for the item count text */}
            {t("itemCount", { count: (category.menuItems ?? []).length })}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Edit Button */}
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
          {/* Delete Button */}
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
              placeholder={t("placeholderName")}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                {t("cancelButton")}
              </Button>
              <SubmitButton label={t("saveButton")} variant="default" />
            </div>
            {updateState.message && (
              <p
                className={cn(
                  "pt-1 text-xs",
                  updateState.success ? "text-primary" : "text-destructive",
                )}
              >
                {/* Localized success/error messages */}
                {updateState.success
                  ? t("messages.updateSuccess")
                  : t("messages.updateFailed", {
                      error: t(
                        updateState.message.split(": ")[1] ?? "unknownError",
                      ), // 🛑 FIX: Use ?? 'unknownError'
                    })}
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
          {/* Localized success/error messages */}
          {deleteState.success
            ? t("messages.deleteSuccess")
            : t("messages.deleteFailed", {
                error: t(deleteState.message.split(": ")[1] ?? "unknownError"),
              })}
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
  const t = useTranslations("CategoryManager"); // Base namespace

  const [items, setItems] = useState<Category[]>(
    // Ensure initial items are sorted by 'order'
    [...initialCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );
  const categoryIds = useMemo(() => items.map((c) => c.id), [items]);
  const [isSaving, setIsSaving] = useState(false);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const boundAddAction = wrapCategoryAction.bind(null, addCategory);

  const [addState, addFormAction] = useFormState(boundAddAction, initialState);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((c) => c.id === active.id);
      const newIndex = items.findIndex((c) => c.id === over!.id);
      const newOrderedItems = arrayMove(items, oldIndex, newIndex);

      // a. Update local state for immediate visual feedback
      setItems(newOrderedItems);

      // b. Send new order to server action
      const finalOrderedIds = newOrderedItems.map((c) => c.id);

      try {
        setIsSaving(true);
        const formData = new FormData();
        formData.set("restaurantId", restaurantId);
        formData.set("orderedIds", JSON.stringify(finalOrderedIds));

        await reorderCategories(formData);
      } catch (error) {
        console.error("Failed to save new category order:", error);
        // Optionally revert state on error
      } finally {
        setIsSaving(false);
      }
    }
  }

  // Close the form if successfully submitted
  React.useEffect(() => {
    if (addState.success) {
      setIsAddFormOpen(false);
    }
  }, [addState.success]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-4xl space-y-8">
        {isSaving && (
          <div className="rounded-lg bg-indigo-100 p-2 text-center text-sm text-indigo-700">
            Saved
          </div>
        )}
        {/* 1. Collapsible Add New Category Form */}
        <div className="border-border bg-card rounded-xl border shadow-md">
          {/* Toggle Button/Header */}
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="text-foreground hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left text-lg font-semibold transition-colors"
          >
            <div className="flex items-center space-x-3">
              <PlusCircle className="text-primary h-5 w-5" />
              {/* Translated Header */}
              <span>{t("addForm.headerTitle")}</span>
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
                  placeholder={t("addForm.placeholderName")}
                  key={addState.success ? "success" : "error"}
                />
                <SubmitButton label={t("addForm.addButton")} />
              </form>
              {addState.message && (
                <p
                  className={cn(
                    "mt-2 text-sm",
                    addState.success ? "text-primary" : "text-destructive",
                  )}
                >
                  {/* Localized success/error messages */}
                  {addState.success
                    ? t("messages.addSuccess")
                    : t("messages.addFailed", {
                        error: t(
                          addState.message.split(": ")[1] ?? "unknownError",
                        ),
                      })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2. List of Existing Categories */}
        <div className="space-y-4">
          {/* Translated List Header */}
          <h2 className="text-foreground text-2xl font-semibold">
            {t("listTitle")}
          </h2>

          {initialCategories.length === 0 ? (
            // Translated Empty State
            <div className="border-border text-muted-foreground bg-card rounded-lg border p-6 text-center">
              {t("emptyListMessage")}
            </div>
          ) : (
            <SortableContext
              items={categoryIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {items.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    category={category}
                    restaurantId={restaurantId}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </DndContext>
  );
}
