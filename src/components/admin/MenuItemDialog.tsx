// src/components/admin/MenuItemDialog.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { Check, CircleAlert, ImagePlus, X } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { UploadButton } from "~/utils/uploadthing";
import { addMenuItem, updateMenuItem } from "~/app/actions/menu-item";
import { CharCount, Field } from "~/components/admin/restaurant-form/fields";
import { cn } from "~/lib/utils";
import type { menuItems } from "~/server/db/schema";
import type { DietaryLabel } from "~/types/restaurant";

export type AdminMenuItem = InferSelectModel<typeof menuItems>;

// Matches dietaryLabelEnum in the database schema.
const DIETARY_LABELS: { value: DietaryLabel; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "nut-free", label: "Nut-free" },
];

// Column lengths in the menu items table.
const MAX_NAME = 256;
const MAX_TEXT = 512;

interface ItemValues {
  name: string;
  price: string;
  description: string;
  ingredients: string;
  dietaryLabels: DietaryLabel[];
  imageUrl: string;
}

const valuesFromItem = (item?: AdminMenuItem): ItemValues => ({
  name: item?.name ?? "",
  price: item?.price ?? "",
  description: item?.description ?? "",
  ingredients: item?.ingredients ?? "",
  dietaryLabels: item?.dietaryLabels ?? [],
  imageUrl: item?.imageUrl ?? "",
});

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Omit to add a new item.
  item?: AdminMenuItem;
  restaurantId: string;
  categoryId: string;
  categoryName: string;
  currency: string;
}

export function MenuItemDialog(props: MenuItemDialogProps) {
  // Remount the form each time it opens so it starts from fresh values.
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <MenuItemForm key={props.item?.id ?? "new"} {...props} />}
    </Dialog>
  );
}

function MenuItemForm({
  onOpenChange,
  item,
  restaurantId,
  categoryId,
  categoryName,
  currency,
}: MenuItemDialogProps) {
  const isEditing = Boolean(item);
  const [initial, setInitial] = useState(() => valuesFromItem(item));
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ItemValues | "general", string>>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const isDirty = JSON.stringify(values) !== JSON.stringify(initial);

  const set = <K extends keyof ItemValues>(key: K, value: ItemValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
  };

  const toggleLabel = (label: DietaryLabel) =>
    set(
      "dietaryLabels",
      values.dietaryLabels.includes(label)
        ? values.dietaryLabels.filter((l) => l !== label)
        : [...values.dietaryLabels, label],
    );

  const requestClose = () => {
    if (isDirty && !window.confirm("Discard your changes to this item?")) return;
    onOpenChange(false);
  };

  const save = (addAnother: boolean) => {
    const found: typeof errors = {};
    if (!values.name.trim()) found.name = "Give the item a name.";
    if (!values.price.trim()) found.price = "Add a price.";
    if (Object.keys(found).length > 0) {
      setErrors(found);
      document.getElementById(found.name ? "item-name" : "item-price")?.focus();
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      if (item) formData.set("id", item.id);
      formData.set("restaurantId", restaurantId);
      formData.set("categoryId", categoryId);
      formData.set("name", values.name);
      formData.set("price", values.price);
      formData.set("description", values.description);
      formData.set("ingredients", values.ingredients);
      formData.set("dietaryLabels", JSON.stringify(values.dietaryLabels));
      formData.set("imageUrl", values.imageUrl);

      try {
        await (item ? updateMenuItem : addMenuItem)(formData);
        if (addAnother) {
          const empty = valuesFromItem();
          setInitial(empty);
          setValues(empty);
          setAddedCount((n) => n + 1);
          document.getElementById("item-name")?.focus();
        } else {
          onOpenChange(false);
        }
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : "Couldn't save the item.",
        });
      }
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save(false);
  };

  const busy = isPending || isUploading;

  return (
    <DialogContent
      className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl"
      showCloseButton={false}
      onEscapeKeyDown={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onInteractOutside={(e) => {
        e.preventDefault();
        requestClose();
      }}
    >
      <DialogHeader className="border-border relative border-b px-6 py-4 pr-14">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={requestClose}
          aria-label="Close"
          className="text-muted-foreground absolute top-3 right-3"
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogTitle>{isEditing ? `Edit ${item!.name}` : "New item"}</DialogTitle>
        <DialogDescription>
          {isEditing ? `In ${categoryName}.` : `Adds to ${categoryName}. Only name and price are required.`}
        </DialogDescription>
      </DialogHeader>

      <form id="menu-item-form" onSubmit={handleSubmit} noValidate className="overflow-y-auto px-6 py-5">
        <div className="grid gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
          {/* Photo */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Photo</p>
            <div className="border-border bg-muted/40 relative flex aspect-square w-full max-w-[160px] items-center justify-center overflow-hidden rounded-xl border border-dashed">
              {values.imageUrl ? (
                <Image src={values.imageUrl} alt="Item photo" fill sizes="160px" className="object-cover" />
              ) : (
                <ImagePlus className="text-muted-foreground h-8 w-8" aria-hidden />
              )}
            </div>
            <UploadButton
              endpoint="imageUploader"
              appearance={{ allowedContent: "hidden" }}
              content={{ button: values.imageUrl ? "Replace" : "Upload photo" }}
              className="ut-button:bg-secondary ut-button:text-secondary-foreground ut-button:h-8 ut-button:w-full ut-button:max-w-[160px] ut-button:text-sm ut-button:rounded-md ut-button:after:bg-primary/40 items-start"
              onUploadBegin={() => setIsUploading(true)}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                const url = res?.[0]?.ufsUrl;
                if (url) set("imageUrl", url);
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false);
                setErrors((prev) => ({ ...prev, imageUrl: `Upload failed: ${error.message}` }));
              }}
            />
            {values.imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full max-w-[160px]"
                onClick={() => set("imageUrl", "")}
              >
                Remove photo
              </Button>
            )}
            {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl}</p>}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_140px]">
              <Field label="Name" htmlFor="item-name" required error={errors.name}>
                <Input
                  id="item-name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={MAX_NAME}
                  placeholder="e.g. Margherita"
                  aria-invalid={errors.name ? true : undefined}
                  autoFocus
                />
              </Field>
              <Field label="Price" htmlFor="item-price" required error={errors.price}>
                <div
                  className={cn(
                    "border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 items-center rounded-md border shadow-xs focus-within:ring-[3px]",
                    errors.price && "border-destructive",
                  )}
                >
                  <input
                    id="item-price"
                    value={values.price}
                    onChange={(e) => set("price", e.target.value)}
                    inputMode="decimal"
                    maxLength={50}
                    placeholder="0.00"
                    aria-invalid={errors.price ? true : undefined}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums outline-none"
                  />
                  <span className="text-muted-foreground pr-3 text-sm">{currency}</span>
                </div>
              </Field>
            </div>

            <Field
              label="Description"
              htmlFor="item-description"
              aside={<CharCount value={values.description} recommended={MAX_TEXT} />}
            >
              <Textarea
                id="item-description"
                rows={3}
                maxLength={MAX_TEXT}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What makes it good, in a sentence or two."
              />
            </Field>

            <Field label="Ingredients" htmlFor="item-ingredients" hint="Separate with commas.">
              <Input
                id="item-ingredients"
                maxLength={MAX_TEXT}
                value={values.ingredients}
                onChange={(e) => set("ingredients", e.target.value)}
                placeholder="Tomato, mozzarella, basil"
              />
            </Field>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Dietary labels</legend>
              <div className="flex flex-wrap gap-2">
                {DIETARY_LABELS.map(({ value, label }) => {
                  const selected = values.dietaryLabels.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleLabel(value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                        "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent",
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>
      </form>

      <DialogFooter className="border-border flex-row flex-wrap items-center gap-2 border-t px-6 py-4 sm:justify-between">
        <div className="text-sm" role="status" aria-live="polite">
          {errors.general ? (
            <span className="text-destructive inline-flex items-center gap-1.5">
              <CircleAlert className="h-4 w-4 shrink-0" /> {errors.general}
            </span>
          ) : addedCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> {addedCount === 1 ? "1 item added" : `${addedCount} items added`}
            </span>
          ) : isUploading ? (
            <span className="text-muted-foreground">Uploading photo…</span>
          ) : null}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={requestClose} disabled={isPending}>
            {addedCount > 0 && !isDirty ? "Done" : "Cancel"}
          </Button>
          {!isEditing && (
            <Button type="button" variant="outline" onClick={() => save(true)} disabled={busy}>
              Save and add another
            </Button>
          )}
          <Button type="submit" form="menu-item-form" disabled={busy || (isEditing && !isDirty)}>
            {isPending ? "Saving…" : isEditing ? "Save changes" : "Add item"}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
