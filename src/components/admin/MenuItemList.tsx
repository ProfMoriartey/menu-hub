// src/components/admin/MenuItemList.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "~/components/ui/button";
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
import { MenuItemDialog, type AdminMenuItem } from "~/components/admin/MenuItemDialog";
import { ReorderStatus, useReorderState } from "~/components/admin/ReorderStatus";
import { deleteMenuItem, updateMenuItemOrder } from "~/app/actions/menu-item";
import { cn } from "~/lib/utils";

const formatLabel = (label: string) =>
  label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " ");

function DeleteItemButton({
  item,
  restaurantId,
  categoryId,
}: {
  item: AdminMenuItem;
  restaurantId: string;
  categoryId: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete ${item.name}`}
          title="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{item.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            It will be removed from the menu, along with its photo. This can&apos;t be undone.
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
                Delete item
              </Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ItemRow({
  item,
  currency,
  restaurantId,
  categoryId,
  onEdit,
}: {
  item: AdminMenuItem;
  currency: string;
  restaurantId: string;
  categoryId: string;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-card border-border relative flex items-center gap-3 border-b px-3 py-3 last:border-b-0 sm:gap-4 sm:px-4",
        isDragging && "ring-primary/40 z-10 rounded-lg shadow-lg ring-2",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item.name}`}
        className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 -ml-1 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded outline-none focus-visible:ring-[3px] active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="group flex min-w-0 flex-1 items-center gap-3 text-left outline-none sm:gap-4"
      >
        <div className="bg-muted border-border relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <UtensilsCrossed className="text-muted-foreground h-5 w-5" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium group-hover:underline group-focus-visible:underline">
            {item.name}
          </p>
          {item.description && (
            <p className="text-muted-foreground line-clamp-1 text-sm">{item.description}</p>
          )}
          {item.dietaryLabels && item.dietaryLabels.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.dietaryLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                >
                  {formatLabel(label)}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="shrink-0 text-right font-medium tabular-nums">
          {item.price} <span className="text-muted-foreground text-sm font-normal">{currency}</span>
        </p>
      </button>

      <div className="flex shrink-0 items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label={`Edit ${item.name}`}
          title="Edit"
          className="hidden sm:inline-flex"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <DeleteItemButton item={item} restaurantId={restaurantId} categoryId={categoryId} />
      </div>
    </li>
  );
}

interface MenuItemListProps {
  items: AdminMenuItem[];
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  currency: string;
}

export function MenuItemList({
  items: initialItems,
  restaurantId,
  categoryId,
  categoryName,
  currency,
}: MenuItemListProps) {
  const [items, setItems] = useState(initialItems);
  const [orderState, setOrderState] = useReorderState();
  // null = closed, "new" = adding, otherwise the item being edited.
  const [dialogItem, setDialogItem] = useState<AdminMenuItem | "new" | null>(null);

  // Adds, edits and deletes refresh the server data; pick it up here.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const previous = items;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    setOrderState("saving");

    try {
      await updateMenuItemOrder(
        reordered.map((item, index) => ({ id: item.id, order: index })),
        restaurantId,
      );
      setOrderState("saved");
    } catch {
      setItems(previous);
      setOrderState("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button onClick={() => setDialogItem("new")}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
        <ReorderStatus state={orderState} onDismiss={() => setOrderState("idle")} />
      </div>

      {items.length === 0 ? (
        <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <UtensilsCrossed className="text-muted-foreground mb-3 h-9 w-9" />
          <p className="font-medium">No items in {categoryName} yet</p>
          <p className="text-muted-foreground mt-1 mb-5 max-w-sm text-sm">
            Add dishes or drinks with a price, and optionally a photo and description.
          </p>
          <Button variant="outline" onClick={() => setDialogItem("new")}>
            <Plus className="h-4 w-4" /> Add the first item
          </Button>
        </div>
      ) : (
        <>
          <div className="border-border overflow-hidden rounded-xl border shadow-sm">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <ul>
                  {items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      currency={currency}
                      restaurantId={restaurantId}
                      categoryId={categoryId}
                      onEdit={() => setDialogItem(item)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
          {items.length > 1 && (
            <p className="text-muted-foreground text-xs">
              Drag the handle to change the order guests see. Click an item to edit it.
            </p>
          )}
        </>
      )}

      <MenuItemDialog
        open={dialogItem !== null}
        onOpenChange={(open) => !open && setDialogItem(null)}
        item={dialogItem && dialogItem !== "new" ? dialogItem : undefined}
        restaurantId={restaurantId}
        categoryId={categoryId}
        categoryName={categoryName}
        currency={currency}
      />
    </div>
  );
}
