// src/components/admin/CategoriesTable.tsx
"use client";

import React, { useState, useMemo } from "react";
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
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell, // IMPORT TableCell
} from "~/components/ui/table";
import { reorderCategories } from "~/app/actions/category";

// Assuming 'Category' type is defined
import type { InferSelectModel } from "drizzle-orm";
import { categories } from "~/server/db/schema";
type CategoryType = InferSelectModel<typeof categories>;

// Import existing CategoryTableRow (now renders TDs, not TR)
import { CategoryTableRow } from "~/components/admin/CategoryTableRow";

// --- Component to render a draggable table row ---
interface SortableRowProps {
  category: CategoryType;
  restaurantId: string;
}

function SortableRow({ category, restaurantId }: SortableRowProps) {
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
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="transition-all duration-150 ease-in-out data-[dragging=true]:shadow-lg data-[dragging=true]:ring-2 data-[dragging=true]:ring-indigo-500"
      data-dragging={isDragging}
    >
      {/* Dotted drag handle area */}
      <TableCell
        className="w-10 cursor-grab text-center"
        {...listeners}
        {...attributes}
      >
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-muted-foreground/50 text-xl font-bold">
            &#x22EE; {/* Vertical ellipsis character */}
          </span>
        </div>
      </TableCell>
      {/* Render the TD's from CategoryTableRow directly */}
      <CategoryTableRow category={category} restaurantId={restaurantId} />
    </TableRow>
  );
}

// --- Main Categories Table Component ---

interface CategoriesTableProps {
  allCategories: CategoryType[];
  restaurantId: string;
  restaurantName: string;
}

export function CategoriesTable({
  allCategories,
  restaurantId,
  restaurantName,
}: CategoriesTableProps) {
  // 1. Local state for reordering (initialized by sorted props)
  const [items, setItems] = useState<CategoryType[]>(
    // Ensure initial items are sorted by 'order' column
    [...allCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedOrder, setLastSavedOrder] = useState<string[]>(
    items.map((c) => c.id),
  );
  const hasOrderChanged = useMemo(() => {
    const currentOrder = items.map((c) => c.id);
    if (currentOrder.length !== lastSavedOrder.length) return true;
    for (let i = 0; i < currentOrder.length; i++) {
      if (currentOrder[i] !== lastSavedOrder[i]) return true;
    }
    return false;
  }, [items, lastSavedOrder]);

  // 2. Setup Dnd Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  // 3. Map IDs for SortableContext (must be an array of string IDs)
  const categoryIds = useMemo(() => items.map((c) => c.id), [items]);

  // 4. Handle Drag End (The Core Logic)
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // a. Calculate new order array locally
      const oldIndex = items.findIndex((c) => c.id === active.id);
      const newIndex = items.findIndex((c) => c.id === over!.id);
      const newOrderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(newOrderedItems);

      // b. Send new order to server action
      const finalOrderedIds = newOrderedItems.map((c) => c.id);

      try {
        setIsSaving(true);
        const formData = new FormData();
        formData.set("restaurantId", restaurantId);
        formData.set("orderedIds", JSON.stringify(finalOrderedIds));

        await reorderCategories(formData);
        setLastSavedOrder(finalOrderedIds); // Update last saved order on success
      } catch (error) {
        console.error("Failed to save new category order:", error);
        // Optionally revert state on error: setItems(oldItems);
      } finally {
        setIsSaving(false);
      }
    }
  }

  if (allCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            A list of all categories for {restaurantName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            No categories added yet for this restaurant. Use the form above to
            add one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            Drag from the left-hand dots to reorder the public display sequence.
          </CardDescription>
        </div>
        {hasOrderChanged && ( // Show saving status only if order has changed
          <Button disabled={isSaving} variant="secondary" size="sm">
            {isSaving ? "Saving Order..." : "Order Saved"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Empty cell for drag handle/icon */}
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={categoryIds}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((category) => (
                    <SortableRow
                      key={category.id}
                      category={category}
                      restaurantId={restaurantId}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </div>
        </DndContext>
      </CardContent>
    </Card>
  );
}
