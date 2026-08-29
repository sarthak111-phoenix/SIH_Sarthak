"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("factoryiq_theme") as Theme;
      if (stored === "light" || stored === "dark") {
        applyTheme(stored);
      } else {
        // Default to dark theme for high-tech MSME platform
        applyTheme("dark");
      }
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("factoryiq_theme", newTheme);
      document.cookie = `factoryiq_theme=${newTheme}; path=/; max-age=31536000`;
      
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        document.body.classList.add("dark");
        document.body.style.backgroundColor = "#070f1e";
        document.body.style.color = "#f1f5f9";
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        document.body.classList.remove("dark");
        document.body.style.backgroundColor = "#f0f7ff";
        document.body.style.color = "#0c2b64";
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
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
