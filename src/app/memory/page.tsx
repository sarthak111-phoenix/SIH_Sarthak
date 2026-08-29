"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Brain, 
  Search, 
  BookOpen, 
  FileText, 
  ArrowRight, 
  Wrench, 
  Cpu, 
  Package, 
  Zap 
} from "lucide-react";

export default function FactoryMemoryPage() {
  const [query, setQuery] = useState("");

  const [memories] = useState([
    {
      id: "MEM-101",
      category: "MACHINE BREAKDOWN SOP",
      title: "Milling Machine M-02 Spindle Bearing Failure SOP",
      content:
        "1. Immediately stop Machine M-02 power isolate (LOTO Protocol).\n2. Disengage spindle locking pin and inspect bearing race for thermal scoring.\n3. Reroute ongoing active jobs (Order #124) to idle Machine M-04 / M-07.\n4. Replace with SKF 6208-2Z Bearing stock from Toolroom Locker B-4.",
      machineRef: "M-02",
      updatedAt: "Today 09:20 AM",
    },
    {
      id: "MEM-102",
      category: "QUALITY CHECK SPEC",
      title: "Gear Housing Assembly Tolerance Guidelines (Tata Motors)",
      content:
        "Bore concentricity tolerance must be within ±0.015mm. Surface roughness Ra max 0.8 µm. Require 100% dial indicator check on first 10 pcs before running bulk batch on CNC Lathe L-01.",
      orderRef: "Order #127",
      updatedAt: "22 Aug 2024",
    },
    {
      id: "MEM-103",
      category: "MATERIAL HANDLING",
      title: "MS Steel Flat Bar 40×8mm Storage & Inspection",
      content:
        "Verify material test certificate (MTC) from Jindal Steel. Check cross-sectional dimensions using digital vernier caliper. Store under dry bay to prevent surface oxidation.",
      materialRef: "MS Flat Bar 40×8mm",
      updatedAt: "20 Aug 2024",
    },
    {
      id: "MEM-104",
      category: "PREVENTATIVE MAINTENANCE",
      title: "Quarterly Hydraulic Servicing Protocol for Lathe L-06",
      content:
        "Flush hydraulic reservoir. Replace 40-micron oil return filter. Check system pressure (Target 65 Bar ± 2 Bar). Lubricate carriage ways with ISO VG 68 slide lubricant.",
      machineRef: "L-06",
      updatedAt: "18 Aug 2024",
    },
  ]);

  const filteredMemories = memories.filter((m) =>
    query === ""
      ? true
      : m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.content.toLowerCase().includes(query.toLowerCase()) ||
        m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-[#00A8FF]" /> Factory Knowledge & Memory Bank
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Searchable SOPs, machine breakdown resolution logs, quality specifications & decision audit trail
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/maintenance"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1B365D] hover:bg-[#142845] transition shadow-md"
          >
            <Wrench className="h-4 w-4 text-[#00A8FF]" /> Maintenance Logs
          </Link>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search SOPs, machine breakdown fixes, customer specs, or material guidelines..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-xs text-slate-900 font-extrabold focus:outline-none focus:border-[#00A8FF] focus:ring-1 focus:ring-[#00A8FF] shadow-xs"
        />
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMemories.map((m) => (
          <div
            key={m.id}
            className="rounded-3xl bg-white p-6 shadow-md border border-slate-200/80 space-y-4 hover:shadow-lg transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-sky-50 text-[#0070C0] border border-sky-200 text-[10px] font-black uppercase tracking-wider">
                  {m.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{m.updatedAt}</span>
              </div>

              <h3 className="text-base font-black text-slate-900">{m.title}</h3>

              <div className="rounded-2xl bg-[#F7F9FC] p-4 text-xs font-medium text-slate-800 leading-relaxed border border-slate-200/60 whitespace-pre-wrap">
                {m.content}
              </div>
            </div>

            {/* Bottom Reference Links */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400 font-mono text-[11px]">{m.id}</span>
              {m.machineRef && (
                <Link
                  href="/machines"
                  className="text-[#00A8FF] font-extrabold hover:underline flex items-center gap-1"
                >
                  Machine {m.machineRef} <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {m.orderRef && (
                <Link
                  href="/orders"
                  className="text-[#00A8FF] font-extrabold hover:underline flex items-center gap-1"
                >
                  {m.orderRef} Details <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {m.materialRef && (
                <Link
                  href="/inventory"
                  className="text-[#00A8FF] font-extrabold hover:underline flex items-center gap-1"
                >
                  Inventory Stock <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
