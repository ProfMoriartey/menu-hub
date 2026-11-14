// src/components/shared/ThemeToggle.tsx
"use client";

import { useTheme } from "~/context/ThemeContext";
import { Button } from "~/components/ui/button"; // Assuming your Button component path
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "~/lib/utils";

// quiet: on the cloth, in the world's colours, 44 px.
export function ThemeToggle({ className, quiet = false }: { className?: string; quiet?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("ThemeToggle");

  return (
    <Button
      variant="ghost" // Use a ghost variant so it doesn't stand out too much
      size="icon"
      onClick={toggleTheme}
      aria-label={t("label")}
      className={cn(
        quiet
          ? "text-on-cloth-muted hover:text-on-cloth hover:bg-on-cloth/10 size-11 rounded-full focus-visible:ring-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[var(--table-focus)]"
          : "hover:bg-muted bg-transparent",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun className={cn("h-5 w-5", !quiet && "text-foreground")} aria-hidden />
      ) : (
        <Moon className={cn("h-5 w-5", !quiet && "text-foreground")} aria-hidden />
      )}
    </Button>
  );
}
