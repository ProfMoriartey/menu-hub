import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

/**
 * A line set like a menu: the name, a dotted leader, and the value at the
 * end (a price, "Included", "5"), with an optional note under it and
 * anything else (a link) after that.
 */
export function LeaderRow({
  name,
  value,
  note,
  nameAs: Name = "span",
  nameClassName,
  children,
}: {
  name: string;
  value: string;
  note?: string;
  nameAs?: "span" | "h3";
  nameClassName?: string;
  children?: ReactNode;
}) {
  return (
    <li>
      <div className="flex items-baseline gap-3">
        <Name className={cn("min-w-0", nameClassName)}>{name}</Name>
        <span className="border-border min-w-6 flex-1 border-b-2 border-dotted" aria-hidden />
        <span className="text-primary shrink-0 font-semibold">{value}</span>
      </div>
      {note && <p className="text-muted-foreground mt-1 text-sm leading-snug">{note}</p>}
      {children}
    </li>
  );
}
