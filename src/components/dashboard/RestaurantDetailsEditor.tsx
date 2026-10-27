// src/components/dashboard/RestaurantDetailsEditor.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  CircleAlert,
  Facebook,
  Globe,
  ImagePlus,
  Info,
  Instagram,
  Music2,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { unwrap } from "~/lib/action-result";
import { useUnsavedChangesGuard } from "~/lib/unsaved-changes";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { UploadButton, uploadButtonClass } from "~/utils/uploadthing";
import { cn } from "~/lib/utils";
import { LOGO, resizeImages } from "~/lib/resize-image";
import { updateRestaurant } from "~/app/actions/restaurant";
import { CharCount, Field, FormSection, UrlInput } from "~/components/forms/fields";
import {
  toFormData,
  validate,
  valuesFromRestaurant,
  type FormErrors,
  type RestaurantFormValues,
} from "~/components/admin/restaurant-form/form-state";
import type { SocialMediaLinks } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";

// Brand names stay the same in every language.
const SOCIAL_FIELDS: { key: keyof SocialMediaLinks; label?: string; icon: LucideIcon; placeholder: string }[] = [
  { key: "website", icon: Globe, placeholder: "https://example.com" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/…" },
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/…" },
  { key: "tiktok", label: "TikTok", icon: Music2, placeholder: "https://tiktok.com/@…" },
  { key: "twitter", label: "X (Twitter)", icon: Twitter, placeholder: "https://x.com/…" },
];

// Address, contact and delivery links are per branch (BranchesSettings).
const SHOWN_FIELDS = new Set(["name", "description", "logoUrl", "socialMedia"]);

export function RestaurantDetailsEditor({ restaurant }: { restaurant: Restaurant }) {
  const t = useTranslations("RestaurantDetails");
  const tUnsaved = useTranslations("UnsavedChanges");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  // The full set of values goes back on save: the server keeps the
  // admin-only ones as they are for owners, and for an admin the unchanged
  // values mean nothing gets cleared by accident.
  const [savedValues, setSavedValues] = useState(() => valuesFromRestaurant(restaurant));
  const [values, setValues] = useState(savedValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues);
  const errorCount = Object.keys(errors).length;

  const clearError = (path: string) =>
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });

  const set = <K extends keyof RestaurantFormValues>(key: K, value: RestaurantFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    clearError(key);
  };

  const setLink = (group: "socialMedia", key: string, value: string) => {
    setValues((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    setJustSaved(false);
    clearError(`${group}.${key}`);
  };

  // Ask before a refresh, tab close, link or language switch loses edits.
  useUnsavedChangesGuard(isDirty && !isPending, tUnsaved("confirmLeave"));

  // Validation messages come from the shared schema in English; owners see
  // these instead. Fields this form doesn't show are left out: the server
  // keeps those as they are for owners. Of the fields shown, only the name
  // and the links can be invalid.
  const translateErrors = (found: FormErrors): FormErrors =>
    Object.fromEntries(
      Object.keys(found)
        .filter((key) => SHOWN_FIELDS.has(key.split(".")[0]!))
        .map((key) => [key, key === "name" ? t("nameRequired") : t("invalidUrl")]),
    );

  const focusFirstError = (found: FormErrors) => {
    const firstKey = Object.keys(found)[0];
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const found = translateErrors(validate(values));
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    startTransition(async () => {
      try {
        unwrap(await updateRestaurant(toFormData(values, restaurant.id)));
        setSavedValues(values);
        setJustSaved(true);
      } catch (error) {
        setServerError(error instanceof Error ? error.message : t("saveFailed"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <p className="text-muted-foreground flex items-start gap-2 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {t("adminOnlyNote")}
        </p>

        <FormSection id="basics" title={t("basicsTitle")} description={t("basicsDescription")}>
          <Field label={t("name")} htmlFor="name" required error={errors.name}>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={errors.name ? true : undefined}
            />
          </Field>
          <Field
            label={t("description")}
            htmlFor="description"
            hint={t("descriptionHint")}
            aside={<CharCount value={values.description} recommended={300} />}
          >
            <Textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("descriptionPlaceholder")}
            />
          </Field>
        </FormSection>

        <FormSection id="logo" title={t("logoTitle")} description={t("logoDescription")}>
          <Field label={t("logoTitle")} htmlFor="logoUrl" error={errors.logoUrl} hint={t("logoHint")}>
            <div className="flex flex-wrap items-center gap-5">
              <div className="border-border bg-muted/40 relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed">
                {values.logoUrl ? (
                  <Image src={values.logoUrl} alt={t("logoPreview")} fill sizes="96px" className="object-cover" />
                ) : (
                  <ImagePlus className="text-muted-foreground h-7 w-7" aria-hidden />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UploadButton
                  endpoint="logoUploader"
                  input={{ restaurantId: restaurant.id, locale }}
                  appearance={{ allowedContent: "hidden" }}
                  content={{ button: values.logoUrl ? t("replaceLogo") : t("uploadLogo") }}
                  className={cn(uploadButtonClass, "ut-button:w-auto")}
                  // Shrink large images before they go up; the route allows 4 MB.
                  onBeforeUploadBegin={resizeImages(LOGO)}
                  onClientUploadComplete={(res) => {
                    const url = res?.[0]?.ufsUrl;
                    if (url) set("logoUrl", url);
                  }}
                  onUploadError={(error) =>
                    setServerError(
                      error.code === "TOO_LARGE"
                        ? t("logoTooLarge")
                        : t("uploadFailed", { error: error.message }),
                    )
                  }
                />
                {values.logoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => set("logoUrl", "")}>
                    {t("removeLogo")}
                  </Button>
                )}
              </div>
            </div>
          </Field>
        </FormSection>

        <FormSection id="links" title={t("linksTitle")} description={t("linksDescription")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_FIELDS.map(({ key, label, icon, placeholder }) => {
              const id = `socialMedia.${key}`;
              return (
                <Field key={key} label={label ?? t("website")} htmlFor={id} error={errors[id]}>
                  <UrlInput
                    id={id}
                    icon={icon}
                    value={values.socialMedia[key] ?? ""}
                    onValueChange={(v) => setLink("socialMedia", key, v)}
                    error={errors[id]}
                    placeholder={placeholder}
                  />
                </Field>
              );
            })}
          </div>
        </FormSection>

      </div>

      {/* Sticky save bar */}
      <div className="bg-background/95 border-border sticky bottom-0 z-10 -mx-4 mt-8 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm" role="status" aria-live="polite">
            {isPending ? (
              <span className="text-muted-foreground">{t("saving")}</span>
            ) : errorCount > 0 ? (
              <button
                type="button"
                onClick={() => focusFirstError(errors)}
                className="text-destructive inline-flex items-center gap-1.5 font-medium hover:underline"
              >
                <CircleAlert className="h-4 w-4" />
                {t("needAttention", { count: errorCount })}
              </button>
            ) : serverError ? (
              <span className="text-destructive inline-flex items-center gap-1.5">
                <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
              </span>
            ) : justSaved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> {t("saved")}
              </span>
            ) : isDirty ? (
              <span className="text-muted-foreground inline-flex items-center gap-2">
                <span className="bg-attention h-2 w-2 rounded-full" /> {t("unsaved")}
              </span>
            ) : (
              <span className="text-muted-foreground">{t("noChanges")}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isDirty && !isPending && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setValues(savedValues);
                  setErrors({});
                  setServerError(null);
                }}
              >
                {t("discard")}
              </Button>
            )}
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
