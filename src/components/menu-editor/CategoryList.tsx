// src/components/menu-editor/CategoryList.tsx
"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
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
import { Check, ChevronRight, GripVertical, LayoutList, Pencil, Plus } from "lucide-react";
import { unwrap } from "~/lib/action-result";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DeleteCategoryDialog } from "~/components/menu-editor/DeleteCategoryDialog";
import { ReorderStatus, useReorderState } from "~/components/menu-editor/ReorderStatus";
import { addCategory, reorderCategories, updateCategory } from "~/app/actions/category";
import { cn } from "~/lib/utils";

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  order: number;
  itemCount: number;
  thumbnails: string[];
}

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function AddCategoryRow({ restaurantId }: { restaurantId: string }) {
  const t = useTranslations("MenuEditor.categories");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
      inputRef.current?.focus();
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("restaurantId", restaurantId);
        formData.set("name", trimmed);
        unwrap(await addCategory(formData));
        setName("");
        setError(null);
        inputRef.current?.focus();
      } catch (err) {
        setError(errorMessage(err, t("addFailed")));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder={t("newPlaceholder")}
          aria-label={t("newLabel")}
          aria-invalid={error ? true : undefined}
          disabled={isPending}
          className="max-w-sm"
        />
        <Button type="submit" disabled={isPending}>
          <Plus className="h-4 w-4" />
          {isPending ? t("adding") : t("add")}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  );
}

function CategoryRow({
  category,
  restaurantId,
  basePath,
}: {
  category: CategorySummary;
  restaurantId: string;
  basePath: string;
}) {
  const t = useTranslations("MenuEditor.categories");
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const itemsHref = `${basePath}/${category.slug}`;

  const cancelRename = () => {
    setIsRenaming(false);
    setDraft(category.name);
    setError(null);
  };

  const saveRename = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError(t("nameEmpty"));
      return;
    }
    if (trimmed === category.name) {
      cancelRename();
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", category.id);
        formData.set("restaurantId", restaurantId);
        formData.set("name", trimmed);
        unwrap(await updateCategory(formData));
        setIsRenaming(false);
        setError(null);
      } catch (err) {
        setError(errorMessage(err, t("renameFailed")));
      }
    });
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-card border-border relative flex items-center gap-3 border-b px-3 py-3 last:border-b-0 sm:px-4",
        isDragging && "ring-primary/40 z-10 rounded-lg shadow-lg ring-2",
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={t("reorderLabel", { name: category.name })}
        className="text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-ring/50 -ms-1 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded outline-none focus-visible:ring-[3px] active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {isRenaming ? (
        <form onSubmit={saveRename} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Escape" && cancelRename()}
            aria-label={t("nameLabel")}
            aria-invalid={error ? true : undefined}
            disabled={isPending}
            autoFocus
            className="h-8 max-w-xs"
          />
          <Button type="submit" size="sm" disabled={isPending}>
            <Check className="h-3.5 w-3.5" /> {isPending ? t("saving") : t("save")}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelRename} disabled={isPending}>
            {t("cancel")}
          </Button>
          {error && <p className="text-destructive w-full text-sm">{error}</p>}
        </form>
      ) : (
        <>
          <Link href={itemsHref} className="group flex min-w-0 flex-1 items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium group-hover:underline">{category.name}</p>
              <p className="text-muted-foreground text-sm">
                {t("itemCount", { count: category.itemCount })}
              </p>
            </div>
            {category.thumbnails.length > 0 && (
              <div className="hidden -space-x-2 sm:flex rtl:space-x-reverse" aria-hidden>
                {category.thumbnails.map((src) => (
                  <div key={src} className="ring-card relative h-8 w-8 overflow-hidden rounded-full ring-2">
                    <Image src={src} alt="" fill sizes="32px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Link>
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setDraft(category.name);
                setIsRenaming(true);
              }}
              aria-label={t("renameLabel", { name: category.name })}
              title={t("rename")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DeleteCategoryDialog
              categoryId={category.id}
              categoryName={category.name}
              itemCount={category.itemCount}
              restaurantId={restaurantId}
            />
            <Button variant="ghost" size="icon" asChild>
              <Link href={itemsHref} aria-label={t("openLabel", { name: category.name })} title={t("open")}>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </li>
  );
}

interface CategoryListProps {
  restaurantId: string;
  // Where this restaurant's menu pages live, e.g. "/dashboard/marios/menu";
  // a category's items are at `${basePath}/${category.slug}`.
  basePath: string;
  categories: CategorySummary[];
}

export function CategoryList({ restaurantId, basePath, categories }: CategoryListProps) {
  const t = useTranslations("MenuEditor.categories");
  const [items, setItems] = useState(categories);
  const [orderStatus, setOrderStatus] = useReorderState();

  // Adding, renaming and deleting refresh the server data; pick it up here.
  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const previous = items;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    setOrderStatus("saving");

    try {
      const formData = new FormData();
      formData.set("restaurantId", restaurantId);
      formData.set("orderedIds", JSON.stringify(reordered.map((c) => c.id)));
      unwrap(await reorderCategories(formData));
      setOrderStatus("saved");
    } catch {
      setItems(previous);
      setOrderStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AddCategoryRow restaurantId={restaurantId} />
        <ReorderStatus state={orderStatus} onDismiss={() => setOrderStatus("idle")} />
      </div>

      {items.length === 0 ? (
        <div className="border-border flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <LayoutList className="text-muted-foreground mb-3 h-9 w-9" />
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">{t("emptyText")}</p>
        </div>
      ) : (
        <div className="border-border overflow-hidden rounded-xl border shadow-sm">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <ul>
                {items.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    restaurantId={restaurantId}
                    basePath={basePath}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}
      {items.length > 1 && <p className="text-muted-foreground text-xs">{t("dragHint")}</p>}
    </div>
  );
}
