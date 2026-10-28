// src/components/branches/BranchesSettings.tsx
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowUp,
  Bike,
  Check,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  MapPin,
  Phone,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useRouter } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Field, UrlInput } from "~/components/forms/fields";
import { ConfirmDialog } from "~/components/menu-editor/ConfirmDialog";
import { OpeningHoursSettings } from "~/components/restaurant-settings/OpeningHoursSettings";
import { normalizeUrl } from "~/components/admin/restaurant-form/form-state";
import {
  addBranch,
  deleteBranch,
  reorderBranches,
  updateBranch,
} from "~/app/actions/branches";
import { isCountryCode, type CountryOption } from "~/lib/countries";
import { branchSchema, deliveryAppsSchema, type DeliveryAppLinks } from "~/lib/schemas";
import { useUnsavedChangesGuard } from "~/lib/unsaved-changes";
import { cn } from "~/lib/utils";
import type { BranchDetails } from "~/server/branches";

// Brand names stay the same in every language.
const DELIVERY_FIELDS: { key: keyof DeliveryAppLinks; label?: string }[] = [
  { key: "yemeksepeti", label: "Yemeksepeti" },
  { key: "getir", label: "Getir" },
  { key: "trendyolYemek", label: "Trendyol Yemek" },
  { key: "migrosYemek", label: "Migros Yemek" },
  { key: "uberEats", label: "Uber Eats" },
  { key: "deliveroo", label: "Deliveroo" },
  { key: "customLink" },
];

// Radix Select items can't have an empty value.
const NOT_SET = "none";

interface BranchesSettingsProps {
  restaurantId: string;
  branches: BranchDetails[];
  // The plan's limit (null = none). Branches beyond it stay, hidden.
  maxBranches: number | null;
  // Only admins change a branch's country.
  isAdmin: boolean;
  // Named on the server, in the page's language.
  countries: CountryOption[];
}

/**
 * Where the restaurant is: its branches, which share its menu, each with
 * its own address, contact, delivery links and opening hours. The first is
 * the main branch. On the admin edit page and the owner's Details tab.
 */
export function BranchesSettings({
  restaurantId,
  branches,
  maxBranches,
  isAdmin,
  countries,
}: BranchesSettingsProps) {
  const atLimit = maxBranches !== null && branches.length >= maxBranches;
  const t = useTranslations("Branches");
  const router = useRouter();
  // An only branch is open; with several, people pick one.
  const [openId, setOpenId] = useState<string | null>(
    branches.length === 1 ? branches[0]!.id : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const move = (index: number, by: -1 | 1) => {
    const ids = branches.map((b) => b.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + by, 0, moved!);
    setError(null);
    startTransition(async () => {
      const result = await reorderBranches(restaurantId, ids);
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  };

  return (
    <section
      aria-labelledby="branches-title"
      className="bg-card border-border rounded-xl border shadow-sm"
    >
      <header className="border-border border-b px-5 py-4 sm:px-6">
        <h2 id="branches-title" className="flex items-center gap-2 text-base font-semibold">
          <Store className="h-4 w-4" aria-hidden /> {t("title")}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{t("intro")}</p>
        {maxBranches !== null && maxBranches > 1 && (
          <p className="text-muted-foreground mt-1 text-sm">
            {t("limitNote", { used: Math.min(branches.length, maxBranches), max: maxBranches })}
          </p>
        )}
      </header>

      <ul className="divide-border divide-y">
        {branches.map((branch, index) => (
          <li key={branch.id}>
            <BranchItem
              branch={branch}
              isMain={index === 0}
              isOnly={branches.length === 1}
              isHidden={maxBranches !== null && index >= maxBranches}
              isOpen={openId === branch.id}
              onToggle={() => setOpenId(openId === branch.id ? null : branch.id)}
              onMoveUp={index > 0 ? () => move(index, -1) : undefined}
              onMoveDown={index < branches.length - 1 ? () => move(index, 1) : undefined}
              reordering={isPending}
              isAdmin={isAdmin}
              countries={countries}
            />
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-destructive flex items-center gap-1.5 px-5 pb-3 text-sm sm:px-6" role="alert">
          <CircleAlert className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {atLimit ? (
        <p className="border-border text-muted-foreground border-t px-5 py-4 text-sm sm:px-6">
          {isAdmin
            ? t("limitReachedAdmin", { count: maxBranches })
            : t("limitReached", { count: maxBranches })}
        </p>
      ) : (
        <AddBranch
          restaurantId={restaurantId}
          onAdded={(id) => {
            setOpenId(id);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

function BranchItem({
  branch,
  isMain,
  isOnly,
  isHidden,
  isOpen,
  onToggle,
  onMoveUp,
  onMoveDown,
  reordering,
  isAdmin,
  countries,
}: {
  branch: BranchDetails;
  isMain: boolean;
  isOnly: boolean;
  // Beyond the plan's limit: kept, but guests don't see it.
  isHidden: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  reordering: boolean;
  isAdmin: boolean;
  countries: CountryOption[];
}) {
  const t = useTranslations("Branches");
  const router = useRouter();
  const panelId = `branch-${branch.id}`;
  const countryLabel = countries.find((c) => c.code === branch.country)?.name ?? branch.country;
  const summary = [branch.address ?? branch.city, countryLabel].filter(Boolean).join(" · ");

  return (
    <div>
      <div className="flex items-center gap-2 px-5 py-3 sm:px-6">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="hover:bg-muted/60 -mx-2 flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-start"
        >
          <MapPin className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium">{branch.name ?? t("unnamed")}</span>
              {isMain && !isOnly && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                  {t("mainBadge")}
                </span>
              )}
              {isHidden && (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                  {t("hiddenBadge")}
                </span>
              )}
            </span>
            <span className="text-muted-foreground block truncate text-sm">
              {summary || t("noAddress")}
            </span>
          </span>
          <ChevronDown
            className={cn("text-muted-foreground h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")}
            aria-hidden
          />
        </button>
        {!isOnly && (
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveUp}
              disabled={!onMoveUp || reordering}
              aria-label={t("moveUp", { name: branch.name ?? t("unnamed") })}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onMoveDown}
              disabled={!onMoveDown || reordering}
              aria-label={t("moveDown", { name: branch.name ?? t("unnamed") })}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isOpen && (
        <div id={panelId} className="space-y-8 px-5 pt-2 pb-6 sm:px-6">
          <BranchForm branch={branch} isOnly={isOnly} isAdmin={isAdmin} countries={countries} />
          <div className="border-border border-t pt-6">
            <OpeningHoursSettings
              key={branch.id}
              branchId={branch.id}
              timeZone={branch.timeZone}
              hours={branch.openingHours}
              embedded
            />
          </div>
          {!isOnly && (
            <div className="border-border flex justify-end border-t pt-4">
              <ConfirmDialog
                trigger={
                  <Button type="button" variant="ghost" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> {t("delete")}
                  </Button>
                }
                title={t("deleteTitle", { name: branch.name ?? t("unnamed") })}
                description={t("deleteText")}
                confirmLabel={t("delete")}
                onConfirm={async () => {
                  const result = await deleteBranch(branch.id);
                  if (result.ok) router.refresh();
                  return result;
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface BranchValues {
  name: string;
  address: string;
  city: string;
  country: string;
  phoneNumber: string;
  mapUrl: string;
  deliveryApps: DeliveryAppLinks;
}

const valuesOf = (branch: BranchDetails): BranchValues => ({
  name: branch.name ?? "",
  address: branch.address ?? "",
  city: branch.city ?? "",
  country: branch.country ?? "",
  phoneNumber: branch.phoneNumber ?? "",
  mapUrl: branch.mapUrl ?? "",
  deliveryApps: branch.deliveryApps ?? {},
});

// Links as they are saved: "maps.google.com/…" gets its https://.
const normalized = (values: BranchValues): BranchValues => ({
  ...values,
  mapUrl: normalizeUrl(values.mapUrl),
  deliveryApps: Object.fromEntries(
    Object.entries(values.deliveryApps).map(([key, url]) => [key, normalizeUrl(url ?? "")]),
  ),
});

function BranchForm({
  branch,
  isOnly,
  isAdmin,
  countries,
}: {
  branch: BranchDetails;
  isOnly: boolean;
  isAdmin: boolean;
  countries: CountryOption[];
}) {
  const t = useTranslations("Branches");
  const tUnsaved = useTranslations("UnsavedChanges");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [savedValues, setSavedValues] = useState(() => valuesOf(branch));
  const [values, setValues] = useState(savedValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues);
  const id = (field: string) => `${branch.id}-${field}`;

  useUnsavedChangesGuard(isDirty && !isPending, tUnsaved("confirmLeave"));

  const set = <K extends keyof BranchValues>(key: K, value: BranchValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    setErrors(({ [key]: _, ...rest }) => rest);
  };
  const setDelivery = (key: keyof DeliveryAppLinks, value: string) => {
    setValues((prev) => ({ ...prev, deliveryApps: { ...prev.deliveryApps, [key]: value } }));
    setJustSaved(false);
    setErrors(({ [`deliveryApps.${key}`]: _, ...rest }) => rest);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const toSave = normalized(values);
    const found: Record<string, string> = {};
    if (!isOnly && !toSave.name.trim()) found.name = t("nameRequired");
    if (!branchSchema.shape.mapUrl.safeParse(toSave.mapUrl).success) found.mapUrl = t("invalidUrl");
    for (const { key } of DELIVERY_FIELDS) {
      if (!deliveryAppsSchema.shape[key].safeParse(toSave.deliveryApps[key]).success)
        found[`deliveryApps.${key}`] = t("invalidUrl");
    }
    setValues(toSave);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }

    startTransition(async () => {
      const result = await updateBranch(branch.id, toSave);
      if (!result.ok) return setServerError(result.error);
      setSavedValues(toSave);
      setJustSaved(true);
      router.refresh();
    });
  };

  const typedCountry = values.country && !isCountryCode(values.country) ? values.country : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        label={t("nameLabel")}
        htmlFor={id("name")}
        required={!isOnly}
        error={errors.name}
        hint={isOnly ? t("nameHintSingle") : t("nameHint")}
      >
        <Input
          id={id("name")}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder={t("namePlaceholder")}
          maxLength={128}
          aria-invalid={errors.name ? true : undefined}
          className="sm:max-w-sm"
        />
      </Field>

      <Field label={t("address")} htmlFor={id("address")}>
        <Input
          id={id("address")}
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder={t("addressPlaceholder")}
          maxLength={256}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("city")} htmlFor={id("city")} hint={t("cityHint")}>
          <Input
            id={id("city")}
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder={t("cityPlaceholder")}
            maxLength={128}
          />
        </Field>
        <Field
          label={t("country")}
          htmlFor={id("country")}
          hint={
            !isAdmin
              ? t("countryAdminOnly")
              : typedCountry
                ? t("countryTyped", { country: typedCountry })
                : undefined
          }
        >
          {isAdmin ? (
            <Select
              value={isCountryCode(values.country) ? values.country : NOT_SET}
              onValueChange={(value) => set("country", value === NOT_SET ? "" : value)}
            >
              <SelectTrigger id={id("country")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NOT_SET}>{t("countryNotSet")}</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={id("country")}
              value={
                countries.find((c) => c.code === values.country)?.name ??
                (values.country || t("countryNotSet"))
              }
              readOnly
              disabled
            />
          )}
        </Field>
        <Field label={t("phone")} htmlFor={id("phoneNumber")}>
          <div className="relative" dir="ltr">
            <Phone className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              id={id("phoneNumber")}
              type="tel"
              value={values.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              placeholder="+90 555 123 45 67"
              maxLength={50}
              className="ps-9"
            />
          </div>
        </Field>
        <Field
          label={t("mapUrl")}
          htmlFor={id("mapUrl")}
          error={errors.mapUrl}
          hint={t("mapUrlHint")}
          aside={
            values.mapUrl && !errors.mapUrl ? (
              <a
                href={values.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
              >
                {t("testLink")} <ExternalLink className="h-3 w-3" />
              </a>
            ) : undefined
          }
        >
          <UrlInput
            id={id("mapUrl")}
            icon={MapPin}
            value={values.mapUrl}
            onValueChange={(v) => set("mapUrl", v)}
            error={errors.mapUrl}
            placeholder="https://maps.app.goo.gl/…"
          />
        </Field>
      </div>

      <div className="border-border space-y-3 border-t pt-5">
        <div>
          <h3 className="text-sm font-medium">{t("deliveryTitle")}</h3>
          <p className="text-muted-foreground text-sm">{t("deliveryDescription")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {DELIVERY_FIELDS.map(({ key, label }) => {
            const fieldId = id(`deliveryApps.${key}`);
            const error = errors[`deliveryApps.${key}`];
            return (
              <Field key={key} label={label ?? t("otherDelivery")} htmlFor={fieldId} error={error}>
                <UrlInput
                  id={fieldId}
                  icon={Bike}
                  value={values.deliveryApps[key] ?? ""}
                  onValueChange={(v) => setDelivery(key, v)}
                  error={error}
                  placeholder="https://…"
                />
              </Field>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? t("saving") : t("save")}
        </Button>
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
        <span className="text-sm" role="status" aria-live="polite">
          {serverError ? (
            <span className="text-destructive inline-flex items-center gap-1.5">
              <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
            </span>
          ) : justSaved && !isDirty ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> {t("saved")}
            </span>
          ) : isDirty ? (
            <span className="text-muted-foreground inline-flex items-center gap-2">
              <span className="bg-attention h-2 w-2 rounded-full" /> {t("unsaved")}
            </span>
          ) : null}
        </span>
      </div>
    </form>
  );
}

function AddBranch({
  restaurantId,
  onAdded,
}: {
  restaurantId: string;
  onAdded: (id: string) => void;
}) {
  const t = useTranslations("Branches");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!adding) {
    return (
      <div className="border-border border-t px-5 py-4 sm:px-6">
        <Button type="button" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> {t("add")}
        </Button>
      </div>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError(t("nameRequired"));
    setError(null);
    startTransition(async () => {
      const result = await addBranch(restaurantId, name);
      if (!result.ok) return setError(result.error);
      setName("");
      setAdding(false);
      onAdded(result.data.id);
    });
  };

  return (
    <form onSubmit={submit} noValidate className="border-border space-y-3 border-t px-5 py-4 sm:px-6">
      <Field label={t("addLabel")} htmlFor="new-branch-name" hint={t("addHint")} error={error ?? undefined}>
        <div className="flex flex-wrap gap-2">
          <Input
            id="new-branch-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            maxLength={128}
            autoFocus
            aria-invalid={error ? true : undefined}
            className="min-w-0 flex-1 sm:max-w-sm"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? t("adding") : t("add")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setAdding(false);
              setName("");
              setError(null);
            }}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
        </div>
      </Field>
    </form>
  );
}
