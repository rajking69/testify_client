"use client";

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("testify-theme") as Theme) || "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let isDark = false;
      if (theme === "system") {
        isDark = systemQuery.matches;
      } else {
        isDark = theme === "dark";
      }

      const activeResolved = isDark ? "dark" : "light";
      setResolvedTheme(activeResolved);

      if (isDark) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
    };

    applyTheme();

    const handleSystemChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    systemQuery.addEventListener("change", handleSystemChange);
    return () => systemQuery.removeEventListener("change", handleSystemChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("testify-theme", newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
