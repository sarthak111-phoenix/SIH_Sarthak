"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Globe, Check, ChevronDown, Sparkles } from "lucide-react";
import { LanguageOption, LanguageCode } from "@/lib/i18n/translations";

export function LanguageSelector({ variant }: { variant?: "dark" | "light" }) {
  const { language, setLanguage, currentOption, options } = useLanguage();
  const { isDark: themeIsDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = variant !== undefined ? variant === "dark" : themeIsDark;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Clickable Header Button: Desktop (🌐 English ▼) vs Mobile (🌐 EN) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select Application Language"
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer border shadow-sm hover:scale-105 active:scale-95 ${
          isDark
            ? "bg-[#0D213A]/90 border-slate-700/80 text-slate-100 hover:bg-[#132E50] hover:border-sky-500/50 hover:shadow-sky-500/10"
            : "bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-sky-400 hover:shadow-slate-200"
        }`}
      >
        <Globe className="h-4.5 w-4.5 text-[#00A8FF] shrink-0" />
        
        {/* Desktop display */}
        <span className="hidden sm:inline tracking-tight font-black text-xs sm:text-sm">
          {currentOption?.nativeName || "English"}
        </span>
        
        {/* Mobile display */}
        <span className="inline sm:hidden font-black text-xs uppercase">
          {language}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#00A8FF]" : ""
          }`}
        />
      </button>

      {/* Accessible Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 sm:w-72 rounded-2xl shadow-2xl border backdrop-blur-2xl z-50 p-2.5 space-y-1.5 transform transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isDark
              ? "bg-[#0A1A2F]/95 border-slate-700/80 text-white shadow-sky-950/50"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-slate-400/30"
          }`}
        >
          {/* Header Title */}
          <div className="flex items-center justify-between px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-700/40">
            <span className="flex items-center gap-1.5 text-[#00A8FF]">
              <Globe className="h-3.5 w-3.5" /> 🌐 Language / भाषा चुनें
            </span>
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto py-1 space-y-1 custom-scrollbar">
            {options.map((opt: LanguageOption) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#00A8FF] to-[#0088F5] text-white shadow-md shadow-sky-500/30 scale-[1.02]"
                      : isDark
                      ? "text-slate-200 hover:bg-slate-800/80 hover:text-white hover:translate-x-1"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="h-4 w-4 shrink-0 stroke-[3] text-white" />}
                    <span className="text-sm font-black">{opt.nativeName}</span>
                    {opt.name !== opt.nativeName && (
                      <span
                        className={`text-[10px] font-semibold ${
                          isSelected ? "text-sky-100" : "text-slate-400"
                        }`}
                      >
                        ({opt.name})
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
