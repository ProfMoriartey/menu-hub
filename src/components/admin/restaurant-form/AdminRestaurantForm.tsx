// src/components/admin/restaurant-form/AdminRestaurantForm.tsx
"use client";

import { unwrap, type ActionResult } from "~/lib/action-result";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type MouseEvent,
} from "react";
import Image from "next/image";
import {
  Bike,
  Check,
  CircleAlert,
  ExternalLink,
  Facebook,
  Globe,
  ImagePlus,
  Instagram,
  MapPin,
  Music2,
  Phone,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { Link, useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UploadButton } from "~/utils/uploadthing";
import { cn } from "~/lib/utils";
import type { SocialMediaLinks, DeliveryAppLinks } from "~/lib/schemas";
import type { Restaurant } from "~/types/restaurant";
import { slugify } from "~/lib/slug";
import { CharCount, Field, FormSection, ToggleRow, UrlInput } from "./fields";
import {
  COUNTRY_SUGGESTIONS,
  CURRENCIES,
  EMPTY_VALUES,
  ESTABLISHMENT_SUGGESTIONS,
  FOOD_TYPE_SUGGESTIONS,
  SECTIONS,
  THEMES,
  sectionHasError,
  toFormData,
  validate,
  valuesFromRestaurant,
  type FormErrors,
  type RestaurantFormValues,
  type SectionId,
} from "./form-state";

const SOCIAL_FIELDS: { key: keyof SocialMediaLinks; label: string; icon: LucideIcon; placeholder: string }[] = [
  { key: "website", label: "Website", icon: Globe, placeholder: "https://example.com" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/…" },
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/…" },
  { key: "tiktok", label: "TikTok", icon: Music2, placeholder: "https://tiktok.com/@…" },
  { key: "twitter", label: "X (Twitter)", icon: Twitter, placeholder: "https://x.com/…" },
];

const DELIVERY_FIELDS: { key: keyof DeliveryAppLinks; label: string }[] = [
  { key: "yemeksepeti", label: "Yemeksepeti" },
  { key: "getir", label: "Getir" },
  { key: "trendyolYemek", label: "Trendyol Yemek" },
  { key: "migrosYemek", label: "Migros Yemek" },
  { key: "uberEats", label: "Uber Eats" },
  { key: "deliveroo", label: "Deliveroo" },
  { key: "customLink", label: "Other delivery link" },
];

interface AdminRestaurantFormProps {
  restaurant?: Restaurant;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function AdminRestaurantForm({ restaurant, action }: AdminRestaurantFormProps) {
  const isEditing = Boolean(restaurant);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialValues = useMemo(
    () => (restaurant ? valuesFromRestaurant(restaurant) : EMPTY_VALUES),
    [restaurant],
  );
  const [savedValues, setSavedValues] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  // New restaurants get a slug from the name until someone edits it directly.
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [activeSection, setActiveSection] = useState<SectionId>("basics");

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues);
  const errorCount = Object.keys(errors).length;

  const clearError = (path: string) => {
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const set = <K extends keyof RestaurantFormValues>(key: K, value: RestaurantFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    clearError(key);
  };

  const setLink = <G extends "socialMedia" | "deliveryApps">(group: G, key: string, value: string) => {
    setValues((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    setJustSaved(false);
    clearError(`${group}.${key}`);
  };

  // Warn before a refresh or tab close throws away edits.
  useEffect(() => {
    if (!isDirty || isPending) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, isPending]);

  // Highlight the section currently in view in the side nav.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id as SectionId);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

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

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    startTransition(async () => {
      try {
        unwrap(await action(toFormData(values, restaurant?.id)));
        if (isEditing) {
          setSavedValues(values);
          setJustSaved(true);
          // The page URL contains the slug, so follow it to its new address.
          if (values.slug !== savedValues.slug) {
            router.replace(`/admin/restaurants/${values.slug}/edit`);
          }
        } else {
          router.push("/admin/restaurants");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong while saving.";
        if (/slug/i.test(message)) {
          setErrors({ slug: message });
          focusFirstError({ slug: message });
        } else {
          setServerError(message);
        }
      }
    });
  };

  const confirmLeave = (e: MouseEvent) => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
      e.preventDefault();
    }
  };

  const currencyOptions = CURRENCIES.some((c) => c.value === values.currency)
    ? CURRENCIES
    : [{ value: values.currency, label: values.currency }, ...CURRENCIES];

  const slugChanged = isEditing && values.slug !== savedValues.slug;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Mobile section jump links */}
      <nav aria-label="Form sections" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "border-border shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap",
              sectionHasError(section, errors) && "border-destructive text-destructive",
            )}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Form sections" className="sticky top-24 space-y-1">
            {SECTIONS.map((section) => {
              const hasError = sectionHasError(section, errors);
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-current={activeSection === section.id ? "true" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  {section.label}
                  {hasError && <CircleAlert className="text-destructive h-4 w-4" aria-label="Has errors" />}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          {/* BASICS */}
          <FormSection id="basics" title="Basics" description="What the restaurant is called and where its menu lives.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" required error={errors.name}>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!slugEdited) set("slug", slugify(e.target.value));
                  }}
                  placeholder="e.g. Mario's Pizzeria"
                  aria-invalid={errors.name ? true : undefined}
                  autoFocus={!isEditing}
                />
              </Field>
              <Field
                label="Menu address"
                htmlFor="slug"
                required
                error={errors.slug}
                hint={
                  slugChanged ? (
                    <span className="text-attention">
                      Changing this breaks existing links and printed QR codes.
                    </span>
                  ) : isEditing ? (
                    "Lowercase letters, numbers and hyphens."
                  ) : (
                    "Filled in from the name. You can change it."
                  )
                }
              >
                <div
                  className={cn(
                    "border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 items-center rounded-md border shadow-xs focus-within:ring-[3px]",
                    errors.slug && "border-destructive",
                  )}
                >
                  <span className="text-muted-foreground border-input bg-muted/50 flex h-full items-center rounded-l-md border-r px-3 text-sm">
                    /
                  </span>
                  <input
                    id="slug"
                    value={values.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    placeholder="marios-pizzeria"
                    aria-invalid={errors.slug ? true : undefined}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                  />
                </div>
              </Field>
              <Field label="Type of place" htmlFor="typeOfEstablishment" hint="Pick a suggestion or type your own.">
                <Input
                  id="typeOfEstablishment"
                  list="establishment-suggestions"
                  value={values.typeOfEstablishment}
                  onChange={(e) => set("typeOfEstablishment", e.target.value)}
                  placeholder="e.g. Cafe"
                />
                <datalist id="establishment-suggestions">
                  {ESTABLISHMENT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </Field>
              <Field label="Cuisine" htmlFor="foodType" hint="Used in search and filters.">
                <Input
                  id="foodType"
                  list="food-type-suggestions"
                  value={values.foodType}
                  onChange={(e) => set("foodType", e.target.value)}
                  placeholder="e.g. Italian"
                />
                <datalist id="food-type-suggestions">
                  {FOOD_TYPE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </Field>
            </div>
            <Field
              label="Description"
              htmlFor="description"
              aside={<CharCount value={values.description} recommended={300} />}
              hint="Shown on the restaurant's about page."
            >
              <Textarea
                id="description"
                rows={4}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="A few sentences about the place, its food and its story."
              />
            </Field>
          </FormSection>

          {/* VISIBILITY */}
          <FormSection id="visibility" title="Visibility" description="Control who can find this restaurant.">
            <div className="divide-border divide-y">
              <ToggleRow
                id="isActive"
                title="Active"
                description="The menu page is live and the restaurant is listed in the directory. When off, visitors are sent back to the directory."
                checked={values.isActive}
                onCheckedChange={(checked) => set("isActive", checked)}
              />
              <ToggleRow
                id="isDisplayed"
                title="Featured on the homepage"
                description="Show this restaurant in the homepage's featured section. Only applies while it's active."
                checked={values.isDisplayed}
                onCheckedChange={(checked) => set("isDisplayed", checked)}
              />
            </div>
          </FormSection>

          {/* BRANDING */}
          <FormSection id="branding" title="Branding" description="How the menu looks to guests.">
            <Field label="Logo" htmlFor="logoUrl" error={errors.logoUrl} hint="A square image works best, at least 256 × 256 px.">
              <div className="flex flex-wrap items-center gap-5">
                <div className="border-border bg-muted/40 relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed">
                  {values.logoUrl ? (
                    <Image src={values.logoUrl} alt="Logo preview" fill sizes="96px" className="object-cover" />
                  ) : (
                    <ImagePlus className="text-muted-foreground h-7 w-7" aria-hidden />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <UploadButton
                    endpoint="logoUploader"
                    input={{ restaurantId: restaurant?.id }}
                    appearance={{ allowedContent: "hidden" }}
                    content={{ button: values.logoUrl ? "Replace logo" : "Upload logo" }}
                    className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:h-9 ut-button:w-auto ut-button:px-4 ut-button:text-sm ut-button:font-medium ut-button:rounded-md ut-button:after:bg-primary/70"
                    onClientUploadComplete={(res) => {
                      const url = res?.[0]?.ufsUrl;
                      if (url) set("logoUrl", url);
                    }}
                    onUploadError={(error: Error) => setServerError(`Logo upload failed: ${error.message}`)}
                  />
                  {values.logoUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => set("logoUrl", "")}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Field>

            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">Menu theme</legend>
              <div role="radiogroup" aria-label="Menu theme" className="grid gap-3 sm:grid-cols-2">
                {THEMES.map((theme) => {
                  const selected = values.theme === theme.value;
                  return (
                    <button
                      key={theme.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set("theme", theme.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                        "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
                        selected
                          ? "border-primary bg-primary/5 ring-primary/30 ring-1"
                          : "border-border hover:bg-accent/40",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{theme.label}</span>
                        <span className="text-muted-foreground block text-sm">{theme.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Field label="Currency" htmlFor="currency" required error={errors.currency} hint="Used for every price on the menu." className="sm:max-w-xs">
              <Select value={values.currency} onValueChange={(value) => set("currency", value)}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FormSection>

          {/* LOCATION & CONTACT */}
          <FormSection id="location" title="Location & contact" description="Helps guests find and reach the restaurant.">
            <Field label="Address" htmlFor="address">
              <Input
                id="address"
                value={values.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street, number, district, city"
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Country" htmlFor="country">
                <Input
                  id="country"
                  list="country-suggestions"
                  value={values.country}
                  onChange={(e) => set("country", e.target.value)}
                />
                <datalist id="country-suggestions">
                  {COUNTRY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                </datalist>
              </Field>
              <Field label="Phone number" htmlFor="phoneNumber">
                <div className="relative">
                  <Phone className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={values.phoneNumber}
                    onChange={(e) => set("phoneNumber", e.target.value)}
                    placeholder="+90 555 123 45 67"
                    className="pl-9"
                  />
                </div>
              </Field>
            </div>
            <Field
              label="Map link"
              htmlFor="mapUrl"
              error={errors.mapUrl}
              hint="Paste the share link from Google Maps or Apple Maps."
              aside={
                values.mapUrl && !errors.mapUrl ? (
                  <a href={values.mapUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1 text-xs hover:underline">
                    Test link <ExternalLink className="h-3 w-3" />
                  </a>
                ) : undefined
              }
            >
              <UrlInput
                id="mapUrl"
                icon={MapPin}
                value={values.mapUrl}
                onValueChange={(v) => set("mapUrl", v)}
                error={errors.mapUrl}
                placeholder="https://maps.app.goo.gl/…"
              />
            </Field>
          </FormSection>

          {/* LINKS & DELIVERY */}
          <FormSection id="links" title="Links & delivery" description="Shown as buttons on the menu. Leave empty to hide.">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Website & social</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {SOCIAL_FIELDS.map(({ key, label, icon, placeholder }) => {
                  const id = `socialMedia.${key}`;
                  return (
                    <Field key={key} label={label} htmlFor={id} error={errors[id]}>
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
            </div>
            <div className="border-border space-y-3 border-t pt-5">
              <h3 className="text-sm font-medium">Delivery apps</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {DELIVERY_FIELDS.map(({ key, label }) => {
                  const id = `deliveryApps.${key}`;
                  return (
                    <Field key={key} label={label} htmlFor={id} error={errors[id]}>
                      <UrlInput
                        id={id}
                        icon={Bike}
                        value={values.deliveryApps[key] ?? ""}
                        onValueChange={(v) => setLink("deliveryApps", key, v)}
                        error={errors[id]}
                        placeholder="https://…"
                      />
                    </Field>
                  );
                })}
              </div>
            </div>
          </FormSection>

          {/* SEO */}
          <FormSection id="seo" title="Search & sharing" description="How the menu appears on Google and in shared links.">
            <Field
              label="Page title"
              htmlFor="metaTitle"
              error={errors.metaTitle}
              aside={<CharCount value={values.metaTitle} recommended={60} />}
              hint="Leave empty to use the restaurant name."
            >
              <Input
                id="metaTitle"
                value={values.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder={values.name ? `${values.name} — Menu` : "e.g. Mario's Pizzeria — Menu"}
              />
            </Field>
            <Field
              label="Page description"
              htmlFor="metaDescription"
              aside={<CharCount value={values.metaDescription} recommended={160} />}
              hint="Leave empty to use the description from Basics."
            >
              <Textarea
                id="metaDescription"
                rows={3}
                value={values.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="One or two sentences for search results."
              />
            </Field>

            <div className="bg-muted/40 border-border rounded-lg border p-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">Search preview</p>
              <p className="text-muted-foreground truncate text-xs">…/{values.slug || "your-restaurant"}</p>
              <p className="text-primary truncate text-lg leading-snug">
                {values.metaTitle || values.name || "Restaurant name"}
              </p>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {values.metaDescription || values.description || "Your description will appear here."}
              </p>
            </div>
          </FormSection>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="bg-background/95 border-border sticky bottom-0 z-10 -mx-4 mt-8 border-t px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm" role="status" aria-live="polite">
            {isPending ? (
              <span className="text-muted-foreground">Saving…</span>
            ) : errorCount > 0 ? (
              <button type="button" onClick={() => focusFirstError(errors)} className="text-destructive inline-flex items-center gap-1.5 font-medium hover:underline">
                <CircleAlert className="h-4 w-4" />
                {errorCount === 1 ? "1 field needs attention" : `${errorCount} fields need attention`}
              </button>
            ) : serverError ? (
              <span className="text-destructive inline-flex items-center gap-1.5">
                <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
              </span>
            ) : justSaved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> All changes saved
              </span>
            ) : isDirty ? (
              <span className="text-muted-foreground inline-flex items-center gap-2">
                <span className="bg-attention h-2 w-2 rounded-full" /> Unsaved changes
              </span>
            ) : (
              <span className="text-muted-foreground">{isEditing ? "No changes yet" : "Fields marked * are required"}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && isDirty && !isPending ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setValues(savedValues);
                  setErrors({});
                  setServerError(null);
                }}
              >
                Discard
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild>
                <Link href="/admin/restaurants" onClick={confirmLeave}>
                  Cancel
                </Link>
              </Button>
            )}
            <Button type="submit" disabled={isPending || (isEditing && !isDirty)}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create restaurant"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
