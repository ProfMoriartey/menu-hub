// src/components/menu-editor/MenuItemDialog.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { unwrap } from "~/lib/action-result";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UploadButton, uploadButtonClass } from "~/utils/uploadthing";
import { ITEM_PHOTO, resizeImages } from "~/lib/resize-image";
import { addMenuItem, updateMenuItem } from "~/app/actions/menu-item";
import { CharCount, Field } from "~/components/forms/fields";
import { AVAILABILITY_OPTIONS, AvailabilitySelect } from "~/components/menu-editor/availability";
import type { ItemAvailability } from "~/lib/menu-item-schemas";
import { cn } from "~/lib/utils";
import type { menuItems } from "~/server/db/schema";
import type { DietaryLabel } from "~/types/restaurant";

export type AdminMenuItem = InferSelectModel<typeof menuItems>;

// Matches dietaryLabelEnum in the database schema; values map to their
// translation keys under MenuEditor.dietary.
export const DIETARY_LABEL_KEYS: Record<DietaryLabel, string> = {
  vegetarian: "vegetarian",
  vegan: "vegan",
  "gluten-free": "glutenFree",
  "dairy-free": "dairyFree",
  "nut-free": "nutFree",
};
const DIETARY_LABELS = Object.keys(DIETARY_LABEL_KEYS) as DietaryLabel[];

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
  categoryId: string;
  availability: ItemAvailability;
}

const valuesFromItem = (item: AdminMenuItem | undefined, categoryId: string): ItemValues => ({
  name: item?.name ?? "",
  price: item?.price ?? "",
  description: item?.description ?? "",
  ingredients: item?.ingredients ?? "",
  dietaryLabels: item?.dietaryLabels ?? [],
  imageUrl: item?.imageUrl ?? "",
  categoryId: item?.categoryId ?? categoryId,
  availability: item?.availability ?? "available",
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
  // The restaurant's categories, for moving an item or adding it elsewhere.
  categories: { id: string; name: string }[];
  onSaved?: (saved: { name: string; categoryId: string; isNew: boolean }) => void;
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
  categories,
  onSaved,
}: MenuItemDialogProps) {
  const t = useTranslations("MenuEditor");
  const tAvailability = useTranslations("Availability");
  const locale = useLocale();
  const isEditing = Boolean(item);
  const [initial, setInitial] = useState(() => valuesFromItem(item, categoryId));
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
    if (isDirty && !window.confirm(t("itemDialog.discardConfirm"))) return;
    onOpenChange(false);
  };

  const save = (addAnother: boolean) => {
    const found: typeof errors = {};
    if (!values.name.trim()) found.name = t("itemDialog.nameRequired");
    if (!values.price.trim()) found.price = t("itemDialog.priceRequired");
    if (Object.keys(found).length > 0) {
      setErrors(found);
      document.getElementById(found.name ? "item-name" : "item-price")?.focus();
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      if (item) formData.set("id", item.id);
      formData.set("restaurantId", restaurantId);
      formData.set("categoryId", values.categoryId);
      formData.set("name", values.name);
      formData.set("price", values.price);
      formData.set("description", values.description);
      formData.set("ingredients", values.ingredients);
      formData.set("dietaryLabels", JSON.stringify(values.dietaryLabels));
      formData.set("imageUrl", values.imageUrl);
      formData.set("availability", values.availability);

      try {
        unwrap(await (item ? updateMenuItem : addMenuItem)(formData));
        onSaved?.({ name: values.name, categoryId: values.categoryId, isNew: !item });
        if (addAnother) {
          // Keep the chosen category for the next one.
          const empty = valuesFromItem(undefined, values.categoryId);
          setInitial(empty);
          setValues(empty);
          setAddedCount((n) => n + 1);
          document.getElementById("item-name")?.focus();
        } else {
          onOpenChange(false);
        }
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : t("itemDialog.saveFailed"),
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
      <DialogHeader className="border-border relative border-b px-6 py-4 pe-14">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={requestClose}
          aria-label={t("itemDialog.close")}
          className="text-muted-foreground absolute end-3 top-3"
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogTitle>{isEditing ? t("itemDialog.editTitle", { name: item!.name }) : t("itemDialog.newTitle")}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? t("itemDialog.editDescription", { category: categoryName })
            : t("itemDialog.newDescription", { category: categoryName })}
        </DialogDescription>
      </DialogHeader>

      <form id="menu-item-form" onSubmit={handleSubmit} noValidate className="overflow-y-auto px-6 py-5">
        <div className="grid gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
          {/* Photo */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("itemDialog.photo")}</p>
            <div className="border-border bg-muted/40 relative flex aspect-square w-full max-w-[160px] items-center justify-center overflow-hidden rounded-xl border border-dashed">
              {values.imageUrl ? (
                <Image src={values.imageUrl} alt={t("itemDialog.photoAlt")} fill sizes="160px" className="object-cover" />
              ) : (
                <ImagePlus className="text-muted-foreground h-8 w-8" aria-hidden />
              )}
            </div>
            <UploadButton
              endpoint="imageUploader"
              input={{ restaurantId, locale }}
              appearance={{ allowedContent: "hidden" }}
              content={{ button: values.imageUrl ? t("itemDialog.replace") : t("itemDialog.upload") }}
              className={cn(uploadButtonClass, "items-start ut-button:w-full ut-button:max-w-[160px]")}
              // Shrink phone photos before they go up; the route allows 2 MB.
              onBeforeUploadBegin={(files) => {
                setIsUploading(true);
                return resizeImages(ITEM_PHOTO)(files);
              }}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                const url = res?.[0]?.ufsUrl;
                if (url) set("imageUrl", url);
              }}
              onUploadError={(error) => {
                setIsUploading(false);
                setErrors((prev) => ({
                  ...prev,
                  imageUrl:
                    error.code === "TOO_LARGE"
                      ? t("itemDialog.photoTooLarge")
                      : t("itemDialog.uploadFailed", { error: error.message }),
                }));
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
                {t("itemDialog.removePhoto")}
              </Button>
            )}
            {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl}</p>}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_140px]">
              <Field label={t("itemDialog.name")} htmlFor="item-name" required error={errors.name}>
                <Input
                  id="item-name"
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={MAX_NAME}
                  placeholder={t("itemDialog.namePlaceholder")}
                  aria-invalid={errors.name ? true : undefined}
                  autoFocus
                />
              </Field>
              <Field label={t("itemDialog.price")} htmlFor="item-price" required error={errors.price}>
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
                  <span className="text-muted-foreground pe-3 text-sm">{currency}</span>
                </div>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {categories.length > 1 && (
                <Field label={t("itemDialog.category")} htmlFor="item-category">
                  <Select value={values.categoryId} onValueChange={(v) => set("categoryId", v)}>
                    <SelectTrigger id="item-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field
                label={tAvailability("label")}
                htmlFor="item-availability"
                hint={tAvailability(
                  `${AVAILABILITY_OPTIONS.find((o) => o.value === values.availability)?.key ?? "available"}Hint`,
                )}
              >
                <AvailabilitySelect
                  id="item-availability"
                  value={values.availability}
                  onChange={(v) => set("availability", v)}
                  className="w-full"
                />
              </Field>
            </div>

            <Field
              label={t("itemDialog.description")}
              htmlFor="item-description"
              aside={<CharCount value={values.description} recommended={MAX_TEXT} />}
            >
              <Textarea
                id="item-description"
                rows={3}
                maxLength={MAX_TEXT}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("itemDialog.descriptionPlaceholder")}
              />
            </Field>

            <Field
              label={t("itemDialog.ingredients")}
              htmlFor="item-ingredients"
              hint={t("itemDialog.ingredientsHint")}
            >
              <Input
                id="item-ingredients"
                maxLength={MAX_TEXT}
                value={values.ingredients}
                onChange={(e) => set("ingredients", e.target.value)}
                placeholder={t("itemDialog.ingredientsPlaceholder")}
              />
            </Field>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t("itemDialog.dietaryLabels")}</legend>
              <div className="flex flex-wrap gap-2">
                {DIETARY_LABELS.map((value) => {
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
                      {t(`dietary.${DIETARY_LABEL_KEYS[value]}`)}
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
              <Check className="h-4 w-4" /> {t("itemDialog.added", { count: addedCount })}
            </span>
          ) : isUploading ? (
            <span className="text-muted-foreground">{t("itemDialog.uploading")}</span>
          ) : null}
        </div>
        <div className="ms-auto flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={requestClose} disabled={isPending}>
            {addedCount > 0 && !isDirty ? t("itemDialog.done") : t("itemDialog.cancel")}
          </Button>
          {!isEditing && (
            <Button type="button" variant="outline" onClick={() => save(true)} disabled={busy}>
              {t("itemDialog.saveAndAddAnother")}
            </Button>
          )}
          <Button type="submit" form="menu-item-form" disabled={busy || (isEditing && !isDirty)}>
            {isPending
              ? t("itemDialog.saving")
              : isEditing
                ? t("itemDialog.saveChanges")
                : t("itemDialog.addItem")}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
