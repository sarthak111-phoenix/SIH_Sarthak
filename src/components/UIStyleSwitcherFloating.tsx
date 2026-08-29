"use client";

import React, { useState, useEffect } from "react";
import { STYLES_LIST, UIStyleDefinition } from "@/components/UIStylesStudio";
import { Palette, X, Sparkles, Check, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UIStyleSwitcherFloating() {
  const [open, setOpen] = useState(false);
  const [activeStyleId, setActiveStyleId] = useState<string>("glassmorphism");
  const [activeStyleName, setActiveStyleName] = useState<string>("Glassmorphism");

  const handleApplyStyle = (style: UIStyleDefinition) => {
    setActiveStyleId(style.id);
    setActiveStyleName(style.name);

    if (typeof document !== "undefined") {
      // Remove any existing style classes from body
      STYLES_LIST.forEach((s) => {
        document.body.classList.remove(s.className);
      });
      // Add active style class to body
      document.body.classList.add(style.className);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-80 max-h-[420px] rounded-3xl bg-[#091A2F]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-4 flex flex-col space-y-3 text-white overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#57B9FF]">
                <Sparkles className="h-4 w-4" />
                <span>15 UI Design Styles Switcher</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] font-semibold text-slate-300">
              Select a style to apply it live across the platform interface:
            </p>

            <div className="overflow-y-auto space-y-1.5 pr-1 max-h-[300px]">
              {STYLES_LIST.map((style) => {
                const isActive = activeStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleApplyStyle(style)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer text-left ${
                      isActive
                        ? "bg-[#57B9FF] text-slate-950 shadow-md shadow-sky-500/30"
                        : "hover:bg-slate-800/80 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono opacity-60">
                        {style.name}
                      </span>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-slate-950" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#90D5FF] via-[#57B9FF] to-[#517891] text-slate-950 font-black text-xs shadow-2xl hover:scale-105 transition-all cursor-pointer border border-white/40"
      >
        <Palette className="h-4 w-4" />
        <span>15 UI Styles ({activeStyleName})</span>
        <ChevronUp className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
