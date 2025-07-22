// src/components/shared/ThemeToggle.tsx
"use client";

import { useTheme } from "~/context/ThemeContext";
import { Button } from "~/components/ui/button"; // Assuming your Button component path
import { Sun, Moon } from "lucide-react"; // Install lucide-react if you haven't: npm install lucide-react

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost" // Use a ghost variant so it doesn't stand out too much
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="hover:bg-muted bg-transparent" // Apply semantic hover color
    >
      {theme === "dark" ? (
        <Sun className="text-foreground h-5 w-5" /> // Use semantic text-foreground
      ) : (
        <Moon className="text-foreground h-5 w-5" /> // Use semantic text-foreground
      )}
    </Button>
  );
}
