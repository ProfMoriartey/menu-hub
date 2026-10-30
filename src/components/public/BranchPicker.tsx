// src/components/public/BranchPicker.tsx
"use client";

import { useTranslations } from "next-intl";
import { Check, ChevronDown, MapPin, Store } from "lucide-react";
import { Link } from "~/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { OpenStatusText } from "~/components/public/OpeningHours";
import type { OpeningHours } from "~/lib/opening-hours";

/** One branch in the picker (server/public-branch builds these). */
export interface BranchChoice {
  id: string;
  href: string;
  label: string;
  // Address or city, and country.
  place: string;
  // Open now or not is worked out in the browser (OpenStatusText).
  hours: OpeningHours | null;
  timeZone: string | null;
  current: boolean;
}

interface BranchPickerProps {
  restaurantName: string;
  branches: BranchChoice[];
  // The restaurant's own page (every branch), and whether it's this page.
  allHref: string;
  onAll: boolean;
  className?: string;
}

/**
 * The branch a menu or about page is for, as a button that opens the list
 * of branches. Only on restaurants with several; the menu is the same at
 * every branch, so this changes the address, hours and contact shown.
 */
export function BranchPicker({ restaurantName, branches, allHref, onAll, className }: BranchPickerProps) {
  const t = useTranslations("PublicMenu");
  const current = branches.find((b) => b.current);

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "border-border bg-background hover:bg-muted inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
          className,
        )}
      >
        <MapPin className="text-primary h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">
          {current ? current.label : t("chooseBranch", { count: branches.length })}
        </span>
        <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0" aria-hidden />
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("branchPickerTitle", { name: restaurantName })}</DialogTitle>
          <DialogDescription>{t("branchPickerIntro")}</DialogDescription>
        </DialogHeader>
        <ul className="-mx-2 space-y-1">
          {branches.map((branch) => (
            <li key={branch.id}>
              <Link
                href={branch.href}
                aria-current={branch.current ? "page" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-xl px-3 py-2.5",
                  branch.current ? "bg-primary/10" : "hover:bg-muted",
                )}
              >
                <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{branch.label}</span>
                  {branch.place && (
                    <span className="text-muted-foreground block text-sm">{branch.place}</span>
                  )}
                  <OpenStatusText hours={branch.hours} timeZone={branch.timeZone} className="mt-0.5 text-xs" />
                </span>
                {branch.current && <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
              </Link>
            </li>
          ))}
        </ul>
        {!onAll && (
          <Link
            href={allHref}
            className="text-muted-foreground hover:text-foreground border-border inline-flex items-center gap-2 border-t pt-3 text-sm"
          >
            <Store className="h-4 w-4" aria-hidden /> {t("allBranches")}
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}
