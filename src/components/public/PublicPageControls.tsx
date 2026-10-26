// src/components/public/PublicPageControls.tsx
import { LanguageSwitcher } from "~/components/shared/LanguageSwitcher";
import { ThemeToggle } from "~/components/shared/ThemeToggle";
import { cn } from "~/lib/utils";

// Language and light/dark switches for guests, top corner of every public
// restaurant page. Guests scanning a QR code abroad need the language most.
export function PublicPageControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <LanguageSwitcher className="bg-card/80 w-auto backdrop-blur" />
      <ThemeToggle />
    </div>
  );
}
