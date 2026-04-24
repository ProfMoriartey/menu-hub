"use client";

import React, { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemOrder,
} from "~/app/actions/menu-item";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { EditMenuItemClient } from "./EditMenuItemClient";
import { AddMenuItemClient } from "./AddMenuItemClient";

import type { MenuItem } from "~/types/restaurant";
import { PlusCircle, Pencil, Trash2, GripVertical } from "lucide-react";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface CategoryProps {
  categoryId: string;
  restaurantId: string;
  initialMenuItems: MenuItem[];
}

interface FormState {
  message: string;
  success: boolean;
}

const initialState: FormState = {
  message: "",
  success: false,
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      variant="default"
    >
      {pending ? "Processing..." : label}
    </Button>
  );
}

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
    const message = error instanceof Error ? error.message : "An unknown error occurred during submission.";
    return { message: `Failed: ${message}`, success: false };
  }
}

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
    const message = error instanceof Error ? error.message : "An unknown error occurred during deletion.";
    return { message: `Failed: ${message}`, success: false };
  }
}

interface SortableMenuItemItemProps {
  item: MenuItem;
  categoryId: string;
  restaurantId: string;
  onEdit: () => void;
  deleteState: FormState;
  deleteFormAction: (formData: FormData) => void;
}

function SortableMenuItemItem({
  item,
  categoryId,
  restaurantId,
  onEdit,
  deleteState,
  deleteFormAction,
}: SortableMenuItemItemProps) {
  const t = useTranslations("MenuItemManager.item");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? "relative" as const : "static" as const,
  };

  const handleDelete = () => {
    if (window.confirm(t("confirmDelete", { itemName: item.name }))) {
      const formData = new FormData();
      formData.set("menuItemId", item.id);
      formData.set("restaurantId", restaurantId);
      formData.set("categoryId", categoryId);
      deleteFormAction(formData);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border bg-card flex flex-col items-start justify-between rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center",
        isDragging ? "bg-muted shadow-lg ring-2 ring-indigo-500" : ""
      )}
    >
      <div className="mb-2 flex items-center space-x-3 sm:mb-0">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </Button>
        <div>
          <h4 className="text-md text-foreground font-semibold">
            {item.name} - {item.price}
          </h4>
          <p className="text-muted-foreground text-sm">{item.description}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button onClick={onEdit} variant="secondary" size="icon" className="h-8 w-8">
          <Pencil className="text-secondary-foreground h-4 w-4" />
        </Button>
        <Button onClick={handleDelete} variant="destructive" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {deleteState.message && (
        <p className={cn("mt-2 w-full text-xs sm:absolute sm:top-full sm:left-0 sm:mt-0", deleteState.success ? "text-primary" : "text-destructive")}>
          {deleteState.message}
        </p>
      )}
    </div>
  );
}

export default function MenuItemManager({
  categoryId,
  restaurantId,
  initialMenuItems,
}: CategoryProps) {
  const t = useTranslations("MenuItemManager");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [items, setItems] = useState(initialMenuItems);

  useEffect(() => {
    setItems(initialMenuItems);
  }, [initialMenuItems]);

  const [deleteState, deleteFormAction] = useFormState(
    deleteWrapperAction,
    initialState,
  );

  const boundUpdateAction = wrapMenuItemAction.bind(null, updateMenuItem);
  const [updateState, updateFormAction] = useFormState(
    boundUpdateAction,
    initialState,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(currentItems, oldIndex, newIndex);
        
        const updatedOrderPayload = newItems.map((item, index) => ({
          id: item.id,
          order: index,
        }));

        updateMenuItemOrder(updatedOrderPayload, restaurantId).catch((err) => {
          console.error("Failed to update menu item order:", err);
        });

        return newItems;
      });
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        variant="secondary"
        className="w-full sm:w-auto"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        {showAddForm ? t("hideFormButton") : t("addItemButton")}
      </Button>

      {showAddForm && (
        <div className="border-border bg-secondary/20 rounded-lg border p-4">
          <AddMenuItemClient
            restaurantId={restaurantId}
            categoryId={categoryId}
            onSuccess={() => {
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      <div className="border-border space-y-3 border-t pt-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground">{t("emptyListMessage")}</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  {editingItemId === item.id ? (
                    <EditMenuItemClient
                      menuItem={item}
                      onCancel={() => setEditingItemId(null)}
                      formAction={updateFormAction}
                      formErrors={[]}
                    />
                  ) : (
                    <SortableMenuItemItem
                      item={item}
                      categoryId={categoryId}
                      restaurantId={restaurantId}
                      onEdit={() => setEditingItemId(item.id)}
                      deleteState={deleteState}
                      deleteFormAction={deleteFormAction}
                    />
                  )}
                </React.Fragment>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {updateState.message && (
        <p className={cn("text-sm", updateState.success ? "text-primary" : "text-destructive")}>
          {updateState.message}
        </p>
      )}
    </div>
  );
}