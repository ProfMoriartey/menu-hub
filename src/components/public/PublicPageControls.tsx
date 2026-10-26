// src/components/public/PublicPageControls.tsx
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { cn } from "~/lib/utils";

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
          "bg-card/80 w-auto backdrop-blur",
          compact && "h-8 gap-1 px-2",
        )}
      />
      <ThemeToggle />
    </div>
  );
}
