// src/components/public/PublicPageControls.tsx
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { cn } from "~/lib/utils";
import { tableFontVariables } from "~/components/table/fonts";

// Language and light/dark switches for guests, top corner of every public
// restaurant page. Guests scanning a QR code abroad need the language most.
export function PublicPageControls({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <LanguageSwitcher
        compact={compact}
        className={cn(
          "bg-card dark:bg-card border-border/70 h-11 w-auto rounded-full",
          compact && "gap-1 px-3",
        )}
        // The list opens in a portal, outside the guest menu's scope.
        contentClassName={cn("table-world guest-menu", tableFontVariables)}
      />
      <ThemeToggle className="size-11 rounded-full" />
    </div>
  );
}
