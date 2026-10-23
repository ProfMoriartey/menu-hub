// src/components/forms/fields.tsx
"use client";

import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { normalizeUrl } from "~/components/admin/restaurant-form/form-state";

export function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="bg-card border-border scroll-mt-24 rounded-xl border shadow-sm"
    >
      <header className="border-border border-b px-6 py-4">
        <h2 id={`${id}-title`} className="text-base font-semibold">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        )}
      </header>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  aside,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={htmlFor && `${htmlFor}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        hint && <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  );
}

export function CharCount({ value, recommended }: { value: string; recommended: number }) {
  const over = value.length > recommended;
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        over ? "text-attention font-medium" : "text-muted-foreground",
      )}
    >
      {value.length}/{recommended}
    </span>
  );
}

// An input that marks itself invalid and adds https:// when it loses focus.
export function UrlInput({
  id,
  value,
  onValueChange,
  error,
  icon: Icon,
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  icon?: LucideIcon;
}) {
  return (
    // Links read left to right even on Arabic pages; the icon follows suit.
    <div className="relative" dir="ltr">
      {Icon && (
        <Icon className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      )}
      <Input
        id={id}
        type="url"
        inputMode="url"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={(e) => onValueChange(normalizeUrl(e.target.value))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(Icon && "ps-9", className)}
        {...props}
      />
    </div>
  );
}

export function ToggleRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {title}
        </Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
    </div>
  );
}
