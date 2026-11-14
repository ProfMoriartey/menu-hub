"use client";

import { useState } from "react";
import { Check, ChevronDown, FlaskConical } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface DashboardTab {
  id: string;
  label: string;
  href: string;
  experimental?: boolean;
}

// The flask beside an experimental section; its name is read out instead.
function Flask({ label }: { label: string }) {
  return (
    <span className="text-attention inline-flex" title={label}>
      <FlaskConical className="h-4 w-4" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * A restaurant's sections in one menu: a button with the open section that
 * opens the list of all of them (owners have eight, too many for a row on
 * a phone). Experimental sections carry a flask.
 */
export function DashboardTabsMenu({
  tabs,
  activeId,
  label,
  experimentalLabel,
}: {
  tabs: DashboardTab[];
  activeId: string;
  // What the list is, for screen readers ("Sections").
  label: string;
  experimentalLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0]!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="bg-card border-border hover:bg-secondary inline-flex h-11 w-full items-center gap-2 rounded-[10px] border px-4 text-start font-semibold shadow-xs transition-colors sm:w-72"
        aria-label={`${label}: ${active.label}`}
      >
        <span className="min-w-0 flex-1 truncate">{active.label}</span>
        {active.experimental && <Flask label={experimentalLabel} />}
        <ChevronDown
          className={cn("text-muted-foreground h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1.5 sm:w-72">
        <nav aria-label={label}>
          <ul>
            {tabs.map((tab) => {
              const current = tab.id === active.id;
              return (
                <li key={tab.id}>
                  <Link
                    href={tab.href}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                      current ? "bg-secondary font-semibold" : "hover:bg-secondary/60",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                    {tab.experimental && <Flask label={experimentalLabel} />}
                    {current && <Check className="text-primary h-4 w-4 shrink-0" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
