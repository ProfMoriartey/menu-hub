// src/components/menu-editor/MenuItemList.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
import {
  ArrowRightLeft,
  CopyPlus,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { unwrap } from "~/lib/action-result";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/menu-editor/ConfirmDialog";
import {
  MenuItemDialog,
  type AdminMenuItem,
} from "~/components/menu-editor/MenuItemDialog";
import { DIETARY_LABEL_KEYS } from "~/lib/dietary-labels";
import { missingNames, type MenuLanguages } from "~/lib/menu-languages";
import { MissingTranslations } from "~/components/menu-languages/MissingTranslations";
import {
  ReorderStatus,
  useReorderState,
} from "~/components/menu-editor/ReorderStatus";
import {
  deleteMenuItem,
  duplicateMenuItem,
  setMenuItemAvailability,
  updateMenuItemOrder,
} from "~/app/actions/menu-item";
import {
  AvailabilityBadge,
  AvailabilitySelect,
} from "~/components/menu-editor/availability";
import type { ItemAvailability } from "~/lib/menu-item-schemas";
import { cn } from "~/lib/utils";

function DeleteItemButton({
  item,
  restaurantId,
  categoryId,
}: {
  item: AdminMenuItem;
  restaurantId: string;
  categoryId: string;
}) {
  const t = useTranslations("MenuEditor.items");

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={t("deleteLabel", { name: item.name })}
          title={t("deleteTitle")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      }
      title={t("deleteConfirmTitle", { name: item.name })}
      description={t("deleteConfirmText")}
      confirmLabel={t("deleteButton")}
      onConfirm={() => deleteMenuItem(item.id, restaurantId, categoryId)}
    />
  );
}

function ItemRow({
  item,
  currency,
  languages,
  restaurantId,
  categoryId,
  onEdit,
  onDuplicated,
}: {
  item: AdminMenuItem;
  currency: string;
  languages: MenuLanguages | null;
  restaurantId: string;
  categoryId: string;
  onEdit: () => void;
  onDuplicated: (copy: AdminMenuItem) => void;
}) {
  const t = useTranslations("MenuEditor");
  const tAvailability = useTranslations("Availability");
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Shown at once; put back if saving fails. Follows the server data after.
  const [availability, setAvailability] = useState(item.availability);
  const [rowError, setRowError] = useState<string | null>(null);
  const [isSavingAvailability, startAvailabilityTransition] = useTransition();
  useEffect(() => setAvailability(item.availability), [item.availability]);

  const [isDuplicating, startDuplicateTransition] = useTransition();
  const duplicate = () => {
    setRowError(null);
    startDuplicateTransition(async () => {
      const result = await duplicateMenuItem(item.id, restaurantId);
      if (result.ok) onDuplicated(result.data);
      else setRowError(result.error);
    });
  };

  const changeAvailability = (next: ItemAvailability) => {
    if (next === availability) return;
    const previous = availability;
    setAvailability(next);
    setRowError(null);
    startAvailabilityTransition(async () => {
      const result = await setMenuItemAvailability(item.id, restaurantId, next);
      if (!result.ok) {
        setAvailability(previous);
        setRowError(result.error);
      }
    });
  };

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
        aria-label={t("items.reorderLabel", { name: item.name })}
        className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 -ms-1 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded outline-none focus-visible:ring-[3px] active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="group flex min-w-0 flex-1 items-center gap-3 text-start outline-none sm:gap-4"
      >
        <div className="bg-muted border-border relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <UtensilsCrossed
              className="text-muted-foreground h-5 w-5"
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p
              className={cn(
                "truncate font-medium group-hover:underline group-focus-visible:underline",
                availability === "hidden" && "text-muted-foreground",
              )}
            >
              {item.name}
            </p>
            <AvailabilityBadge availability={availability} />
          </div>
          {item.description && (
            <p className="text-muted-foreground line-clamp-1 text-sm">
              {item.description}
            </p>
          )}
          <MissingTranslations
            languages={missingNames(item.translations, languages)}
          />
          {item.dietaryLabels && item.dietaryLabels.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.dietaryLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                >
                  {t(`dietary.${DIETARY_LABEL_KEYS[label]}`)}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="shrink-0 text-end font-medium tabular-nums">
          {item.price}{" "}
          <span className="text-muted-foreground text-sm font-normal">
            {currency}
          </span>
        </p>
      </button>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center">
          <AvailabilitySelect
            value={availability}
            onChange={changeAvailability}
            disabled={isSavingAvailability}
            label={tAvailability("changeLabel", { name: item.name })}
            className="h-8 w-auto gap-1.5 px-2 text-xs"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={t("items.editLabel", { name: item.name })}
            title={t("items.edit")}
            className="hidden sm:inline-flex"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={duplicate}
            disabled={isDuplicating}
            aria-label={t("items.duplicateLabel", { name: item.name })}
            title={t("items.duplicate")}
          >
            <CopyPlus className="h-4 w-4" />
          </Button>
          <DeleteItemButton
            item={item}
            restaurantId={restaurantId}
            categoryId={categoryId}
          />
        </div>
        {rowError && (
          <p
            className="text-destructive max-w-56 text-end text-xs"
            role="alert"
          >
            {rowError}
          </p>
        )}
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
  // Every category of the restaurant, so items can be moved between them.
  categories: { id: string; slug: string; name: string }[];
  // Where this restaurant's category pages live, e.g. "/dashboard/marios/menu".
  basePath: string;
  // The menu's languages when translations are on (lib/menu-languages).
  languages: MenuLanguages | null;
}

export function MenuItemList({
  items: initialItems,
  restaurantId,
  categoryId,
  categoryName,
  currency,
  categories,
  basePath,
  languages,
}: MenuItemListProps) {
  const t = useTranslations("MenuEditor.items");
  const tReorder = useTranslations("MenuEditor.reorder");
  const [items, setItems] = useState(initialItems);
  const [orderState, setOrderState] = useReorderState();
  // null = closed, "new" = adding, otherwise the item being edited.
  const [dialogItem, setDialogItem] = useState<AdminMenuItem | "new" | null>(
    null,
  );
  // An item saved into another category leaves this list; say where it went.
  const [elsewhere, setElsewhere] = useState<{
    name: string;
    categoryId: string;
    isNew: boolean;
  } | null>(null);
  const elsewhereCategory =
    elsewhere && categories.find((c) => c.id === elsewhere.categoryId);

  // Adds, edits and deletes refresh the server data; pick it up here.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
      unwrap(
        await updateMenuItemOrder(
          reordered.map((item, index) => ({ id: item.id, order: index })),
          restaurantId,
        ),
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
          <Plus className="h-4 w-4" /> {t("add")}
        </Button>
        <ReorderStatus
          state={orderState}
          onDismiss={() => setOrderState("idle")}
        />
      </div>

      {elsewhereCategory && (
        <div
          role="status"
          className="bg-primary/5 border-primary/20 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-2.5 text-sm"
        >
          <ArrowRightLeft
            className="text-primary h-4 w-4 shrink-0"
            aria-hidden
          />
          <span>
            {t(elsewhere.isNew ? "addedElsewhereNotice" : "movedNotice", {
              name: elsewhere.name,
              category: elsewhereCategory.name,
            })}
          </span>
          <Link
            href={`${basePath}/${elsewhereCategory.slug}`}
            className="text-primary font-medium hover:underline"
          >
            {t("openCategory", { category: elsewhereCategory.name })}
          </Link>
          <button
            type="button"
            onClick={() => setElsewhere(null)}
            aria-label={tReorder("dismiss")}
            className="text-muted-foreground hover:text-foreground ms-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <UtensilsCrossed className="text-muted-foreground mb-3 h-9 w-9" />
          <p className="font-medium">
            {t("emptyTitle", { category: categoryName })}
          </p>
          <p className="text-muted-foreground mt-1 mb-5 max-w-sm text-sm">
            {t("emptyText")}
          </p>
          <Button variant="outline" onClick={() => setDialogItem("new")}>
            <Plus className="h-4 w-4" /> {t("addFirst")}
          </Button>
        </div>
      ) : (
        <>
          <div className="border-border overflow-hidden rounded-xl border shadow-sm">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul>
                  {items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      currency={currency}
                      languages={languages}
                      restaurantId={restaurantId}
                      categoryId={categoryId}
                      onEdit={() => setDialogItem(item)}
                      // Open the copy straight away to rename and adjust it.
                      onDuplicated={(copy) => setDialogItem(copy)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
          {items.length > 1 && (
            <p className="text-muted-foreground text-xs">{t("dragHint")}</p>
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
        categories={categories}
        languages={languages}
        onSaved={(saved) =>
          setElsewhere(saved.categoryId === categoryId ? null : saved)
        }
      />
    </div>
  );
}
