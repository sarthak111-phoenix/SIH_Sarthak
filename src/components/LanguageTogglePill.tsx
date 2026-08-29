"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, Check, Sparkles } from "lucide-react";
import { LanguageCode } from "@/lib/i18n/translations";

export function LanguageTogglePill() {
  const { language, setLanguage, options } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* Segmented Pill Toggle Switch */}
      <div className="flex items-center p-1 rounded-2xl bg-[#0B1D33] border border-slate-700/80 shadow-md gap-1">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
            language === "en"
              ? "bg-[#00A8FF] text-white shadow-md shadow-sky-500/30 scale-105"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          EN
        </button>

        <button
          type="button"
          onClick={() => setLanguage("hi")}
          className={`px-3 py-1 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer ${
            language === "hi"
              ? "bg-[#00A8FF] text-white shadow-md shadow-sky-500/30 scale-105"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          हिंदी
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="More Indian Languages"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            language !== "en" && language !== "hi"
              ? "bg-[#00A8FF] text-white shadow-md shadow-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase">
            {language !== "en" && language !== "hi" ? language.toUpperCase() : "More"}
          </span>
        </button>
      </div>

      {/* Popover Menu for All 7 Languages */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-56 rounded-2xl bg-[#0A1A2F]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-700/30">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#00A8FF]" /> 7 Indian Languages
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-1">
            {options.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#00A8FF] text-white font-extrabold shadow-md"
                      : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{opt.nativeName}</span>
                    <span className="text-[10px] opacity-70">({opt.name})</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
