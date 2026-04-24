"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { EditMenuItemDialog } from "~/components/admin/EditMenuItemDialog";
import { deleteMenuItem, updateMenuItemOrder, updateMenuItem } from "~/app/actions/menu-item";
import type { InferSelectModel } from "drizzle-orm";
import { menuItems } from "~/server/db/schema";

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  } from "@dnd-kit/core";
import type {

  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type MenuItemType = InferSelectModel<typeof menuItems>;

interface MenuItemsTableProps {
  menuItems: MenuItemType[];
  restaurantId: string;
  categoryId: string;
}

// Sub-component for individual draggable rows
function SortableTableRow({ item, restaurantId, categoryId }: { item: MenuItemType, restaurantId: string, categoryId: string }) {
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

  const fallbackImageUrl = `https://placehold.co/64x64/E0E0E0/333333?text=No+Img`;

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted" : ""}>
      <TableCell className="w-[50px]">
        <Button
          variant="ghost"
          size="icon"
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </Button>
      </TableCell>
      <TableCell>
        <Image
          src={item.imageUrl ?? fallbackImageUrl}
          alt={item.name}
          width={64}
          height={64}
          className="rounded-md object-cover"
        />
      </TableCell>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>${item.price}</TableCell>
      <TableCell>
        {item.dietaryLabels && item.dietaryLabels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.dietaryLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800"
              >
                {label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " ")}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-500">None</span>
        )}
      </TableCell>
      <TableCell className="flex items-center justify-end space-x-2 text-right">
        <EditMenuItemDialog
          menuItem={item}
          updateMenuItemAction={updateMenuItem}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                <strong> {item.name} </strong> menu item from your database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <form
                  action={async () => {
                    await deleteMenuItem(item.id, restaurantId, categoryId);
                  }}
                >
                  <Button variant="destructive" type="submit">
                    Delete
                  </Button>
                </form>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export function MenuItemsTable({
  menuItems: initialMenuItems,
  restaurantId,
  categoryId,
}: MenuItemsTableProps) {
  const [items, setItems] = useState(initialMenuItems);

  // Sync state if props change (e.g., after a deletion or addition)
  useEffect(() => {
    setItems(initialMenuItems);
  }, [initialMenuItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Prepare the payload for the database update
        const updatedOrderPayload = newItems.map((item, index) => ({
          id: item.id,
          order: index,
        }));

        // Call the server action to persist the new order
        updateMenuItemOrder(updatedOrderPayload, restaurantId).catch((err) => {
          console.error("Failed to update order:", err);
          // Optional: Revert state here if the API call fails
        });

        return newItems;
      });
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-gray-500">
        No menu items added yet for this category. Use the form above to add one!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Dietary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableTableRow 
                  key={item.id} 
                  item={item} 
                  restaurantId={restaurantId} 
                  categoryId={categoryId} 
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}