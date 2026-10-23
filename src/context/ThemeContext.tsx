// src/context/ThemeContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme";

/**
 * Runs in <head> before the page paints, so a saved dark theme is applied
 * without a light flash. Keep in sync with applyTheme() below.
 */
export const themeInitScript = `(function(){try{if(localStorage.getItem("${STORAGE_KEY}")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The server can't know the saved theme, so render "light" first and
  // pick up the real value (already applied by themeInitScript) on mount.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setThemeState("dark");
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "light" : "dark",
    );
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
