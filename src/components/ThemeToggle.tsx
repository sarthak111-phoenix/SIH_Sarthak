"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer border shadow-sm hover:scale-105 active:scale-95 ${
        isDark
          ? "bg-[#0D213A]/90 border-slate-700/80 text-amber-400 hover:bg-[#132E50] hover:border-amber-400/50 hover:shadow-amber-400/10"
          : "bg-white/90 border-slate-200 text-indigo-600 hover:bg-slate-50 hover:border-indigo-400 hover:shadow-slate-200"
      }`}
    >
      {isDark ? (
        <>
          <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-slow shrink-0" />
          <span className="hidden sm:inline text-slate-200 font-extrabold text-xs">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline text-slate-800 font-extrabold text-xs">Dark</span>
        </>
      )}
    </button>
  );
}
