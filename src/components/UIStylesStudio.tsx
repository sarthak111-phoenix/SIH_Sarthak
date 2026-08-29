"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Layers, 
  Palette, 
  Eye, 
  Check, 
  Copy, 
  Zap, 
  Maximize2, 
  RefreshCw,
  Box,
  Droplet,
  Sun,
  Moon,
  Sparkle
} from "lucide-react";

export interface UIStyleDefinition {
  id: string;
  name: string;
  className: string;
  description: string;
  tagline: string;
  colorHighlight: string;
  icon: any;
  category: "Tactile & Depth" | "Translucent & Modern" | "Clean & Minimal" | "Bold & Vibrant";
}

export const STYLES_LIST: UIStyleDefinition[] = [
  {
    id: "skeuomorphism",
    name: "Skeuomorphism",
    className: "style-skeuomorphism",
    tagline: "Tactile Realism & Wood/Metal Textures",
    description: "Digital elements mimic real-world textures like wood, leather, and metallic bevels with heavy inner highlights.",
    colorHighlight: "#77B1D4",
    icon: Layers,
    category: "Tactile & Depth",
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    className: "style-glassmorphism",
    tagline: "Frosted Glass & Translucent Depth",
    description: "Translucent frosted-glass panels using background blurs, vivid backdrops, and subtle light highlights.",
    colorHighlight: "#90D5FF",
    icon: Sparkles,
    category: "Translucent & Modern",
  },
  {
    id: "neumorphism",
    name: "Neumorphism",
    className: "style-neumorphism",
    tagline: "Soft Extruded Realism & Soft UI",
    description: "Soft UI that combines flat design and realism with subtle dual extruded and inset shadows.",
    colorHighlight: "#EBF4FC",
    icon: Box,
    category: "Tactile & Depth",
  },
  {
    id: "claymorphism",
    name: "Claymorphism",
    className: "style-claymorphism",
    tagline: "Puffy 3D Toy-Like Modeling Clay",
    description: "A puffy, rounded, toy-like 3D style resembling soft modeling clay with high corner radius and inner glows.",
    colorHighlight: "#57B9FF",
    icon: Sparkle,
    category: "Tactile & Depth",
  },
  {
    id: "flat",
    name: "Flat Design",
    className: "style-flat",
    tagline: "Minimalist 2D Vector Clarity",
    description: "Minimalist 2D clean shapes without shadows or gradients, focusing on crisp hierarchy and vector precision.",
    colorHighlight: "#90D5FF",
    icon: Eye,
    category: "Clean & Minimal",
  },
  {
    id: "material",
    name: "Material Design",
    className: "style-material",
    tagline: "Physics-Based Elevation & Motion",
    description: "Google's system featuring purposeful shadows, lighting, surface elevation, and physics-based motion.",
    colorHighlight: "#ffffff",
    icon: Layers,
    category: "Tactile & Depth",
  },
  {
    id: "fluent",
    name: "Fluent Design",
    className: "style-fluent",
    tagline: "Microsoft Acrylic Translucency",
    description: "Microsoft's design language focused on depth, light, reveal highlights, and smooth translucency.",
    colorHighlight: "#77B1D4",
    icon: Sun,
    category: "Translucent & Modern",
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass",
    className: "style-liquid-glass",
    tagline: "Dynamic Fluid Refraction & Flow",
    description: "Advanced translucent surfaces that dynamically refract light and react to motion with fluid animations.",
    colorHighlight: "#90D5FF",
    icon: Droplet,
    category: "Translucent & Modern",
  },
  {
    id: "brutalism",
    name: "Brutalism / Web Brutalism",
    className: "style-brutalism",
    tagline: "Stark Concrete Unpolished Grid",
    description: "Raw, unpolished layouts inspired by stark concrete architecture, monospace fonts, and harsh solid borders.",
    colorHighlight: "#517891",
    icon: Box,
    category: "Bold & Vibrant",
  },
  {
    id: "neubrutalism",
    name: "Neubrutalism",
    className: "style-neubrutalism",
    tagline: "Playful Hard Black Offset Shadows",
    description: "A playful spin on brutalism featuring bright blue hues (#57B9FF), thick black borders, and hard offset shadows.",
    colorHighlight: "#57B9FF",
    icon: Zap,
    category: "Bold & Vibrant",
  },
  {
    id: "minimalism",
    name: "Minimalism",
    className: "style-minimalism",
    tagline: "Extreme Restraint & White Space",
    description: "Extreme design restraint focusing on generous white space, subtle hairline dividers, and typographic hierarchy.",
    colorHighlight: "#77B1D4",
    icon: Eye,
    category: "Clean & Minimal",
  },
  {
    id: "maximalism",
    name: "Maximalism",
    className: "style-maximalism",
    tagline: "Dense Multi-Hue Vibrant Patterns",
    description: "Dense compositions, loud multi-hue gradients, floating badges, and visible energetic personality.",
    colorHighlight: "#57B9FF",
    icon: Sparkles,
    category: "Bold & Vibrant",
  },
  {
    id: "bento",
    name: "Bento Grid",
    className: "style-bento",
    tagline: "Modular Clean Bento Container Grid",
    description: "Modular, clean container grids inspired by bento lunchboxes, featuring sleek rounded edges and smooth hover lift.",
    colorHighlight: "#ffffff",
    icon: Box,
    category: "Clean & Minimal",
  },
  {
    id: "darkmode",
    name: "Dark Mode",
    className: "style-darkmode",
    tagline: "OLED Slate Backdrop & Neon Glow",
    description: "Low-luminance interfaces optimized for low-light visibility, featuring deep slate #517891 and glowing sky #90D5FF.",
    colorHighlight: "#071324",
    icon: Moon,
    category: "Translucent & Modern",
  },
  {
    id: "aurora",
    name: "Aurora UI",
    className: "style-aurora",
    tagline: "Vibrant Flowing Multi-Color Mesh",
    description: "Flowing, vibrant multi-color gradients inspired by the northern lights, cycling smoothly across blue hues.",
    colorHighlight: "#57B9FF",
    icon: RefreshCw,
    category: "Bold & Vibrant",
  },
];

export const PALETTE_COLORS = [
  { hex: "#90D5FF", label: "Sky / Ice Light Blue", role: "Primary Glow & High Light" },
  { hex: "#57B9FF", label: "Vivid Sky Blue", role: "Vibrant Action & Accent" },
  { hex: "#77B1D4", label: "Muted Slate Blue", role: "Secondary Card Surface & Trim" },
  { hex: "#517891", label: "Deep Denim Blue", role: "Base Slate Dark Accent" },
];

export function UIStylesStudio() {
  const [activeStyle, setActiveStyle] = useState<UIStyleDefinition>(STYLES_LIST[1]); // Default Glassmorphism
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Tactile & Depth", "Translucent & Modern", "Clean & Minimal", "Bold & Vibrant"];

  const filteredStyles = filterCategory === "All" 
    ? STYLES_LIST 
    : STYLES_LIST.filter(s => s.category === filterCategory);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-[#0B2342] px-4 py-1.5 text-xs font-black text-[#90D5FF] shadow-lg">
          <Palette className="h-4 w-4 text-[#57B9FF]" />
          <span>Interactive 15 UI Design Styles Engine & Color Palette</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          15 Distinct UI Aesthetics.<br />
          <span className="bg-gradient-to-r from-[#90D5FF] via-[#57B9FF] to-[#77B1D4] bg-clip-text text-transparent">
            One Harmonious Color Palette.
          </span>
        </h2>
        <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
          Explore all 15 UI design styles implemented with custom micro-animations and the attached color palette 
          (<span className="text-[#90D5FF] font-mono font-bold">#90D5FF</span>, <span className="text-[#57B9FF] font-mono font-bold">#57B9FF</span>, <span className="text-[#77B1D4] font-mono font-bold">#77B1D4</span>, <span className="text-[#517891] font-mono font-bold">#517891</span>).
        </p>
      </div>

      {/* COLOR PALETTE SHOWCASE STRIP */}
      <div className="rounded-3xl bg-[#091A2F]/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-200 uppercase tracking-wider">
            <Palette className="h-4 w-4 text-[#57B9FF]" />
            <span>Attached UI Color Palette System</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Click hex code to copy</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => handleCopyHex(c.hex)}
              className="group relative flex flex-col p-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 hover:border-sky-400 transition-all text-left space-y-3 cursor-pointer"
            >
              <div 
                className="h-16 w-full rounded-xl shadow-inner transition-transform group-hover:scale-[1.02] flex items-end justify-end p-2" 
                style={{ backgroundColor: c.hex }}
              >
                {copiedHex === c.hex ? (
                  <span className="bg-black/70 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-400" /> Copied
                  </span>
                ) : (
                  <Copy className="h-4 w-4 text-black/50 opacity-0 group-hover:opacity-100 transition" />
                )}
              </div>
              <div>
                <div className="text-xs font-black text-white font-mono">{c.hex}</div>
                <div className="text-[11px] font-bold text-slate-300 mt-0.5">{c.label}</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{c.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              filterCategory === cat
                ? "bg-[#57B9FF] text-slate-950 shadow-md shadow-sky-500/30 scale-105"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ACTIVE PREVIEW STAGE (HERO CARD) */}
      <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-r from-[#90D5FF] via-[#57B9FF] to-[#517891] shadow-2xl">
        <div className="bg-[#071324] rounded-[23px] p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="text-xs font-black text-[#57B9FF] uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Live Interactive Preview
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {activeStyle.name}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                {activeStyle.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#517891]/40 border border-[#77B1D4]/40 text-[#90D5FF]">
                {activeStyle.category}
              </span>
            </div>
          </div>

          {/* DYNAMIC CARD PREVIEW */}
          <div className="min-h-[220px] flex items-center justify-center p-4">
            <motion.div
              key={activeStyle.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-lg p-6 sm:p-8 space-y-4 ${activeStyle.className}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-sm">
                    <activeStyle.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black">{activeStyle.name}</h4>
                    <span className="text-xs opacity-90 font-medium">FactoryIQ Module #024</span>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-black rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                  Active FX
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed opacity-95">
                {activeStyle.description}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs font-bold border-t border-white/20">
                <span>OEE Efficiency: 94.2%</span>
                <button 
                  type="button"
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-xs font-extrabold backdrop-blur-md cursor-pointer"
                >
                  Trigger Motion →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* THE 15 UI DESIGN STYLES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {filteredStyles.map((style, idx) => {
          const IconComponent = style.icon;
          const isSelected = activeStyle.id === style.id;

          return (
            <motion.div
              key={style.id}
              whileHover={{ y: -4 }}
              onClick={() => setActiveStyle(style)}
              className={`group cursor-pointer p-6 rounded-3xl transition-all duration-300 relative flex flex-col justify-between space-y-4 ${
                isSelected 
                  ? "ring-2 ring-[#57B9FF] shadow-xl shadow-sky-500/20 bg-[#0B2342]" 
                  : "bg-[#091A2F]/80 hover:bg-[#0B2342] border border-slate-800/90"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 font-mono">
                    STYLE #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    isSelected ? "bg-[#57B9FF] text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}>
                    {style.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${style.className} shrink-0`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-[#57B9FF] transition">
                      {style.name}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400">
                      {style.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-3">
                  {style.description}
                </p>
              </div>

              {/* MINI LIVE COMPONENT DEMO BOX */}
              <div className="pt-2">
                <div className={`p-4 text-xs ${style.className}`}>
                  <div className="flex items-center justify-between font-black">
                    <span>{style.name}</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
