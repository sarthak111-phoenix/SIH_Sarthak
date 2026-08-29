"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Wrench, 
  Send,
  Package,
  ArrowRight
} from "lucide-react";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"critical" | "important" | "informational">("critical");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "orders", label: "Orders" },
    { id: "machines", label: "Machines" },
    { id: "inventory", label: "Inventory" },
    { id: "production", label: "Production" },
    { id: "delivery", label: "Delivery" },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Top Title & Header Tabs (Screencast 00:19 & 00:22) */}
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">AI Alerts</h1>

        {/* 3 Main Header Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("critical")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "critical"
                ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Critical</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">2</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("important")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "important"
                ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Important</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">3</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("informational")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "informational"
                ? "bg-sky-50 text-sky-700 border border-sky-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Informational</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] text-white">3</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                categoryFilter === cat.id
                  ? "bg-[#1B365D] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ALERT CONTENT LIST */}
      <div className="space-y-4">
        {activeTab === "critical" ? (
          <div className="space-y-4">
            {/* ALERT CARD 1: M-02 Breakdown (Exact Screencast 00:22 & 01:00) */}
            {(categoryFilter === "all" || categoryFilter === "machines" || categoryFilter === "orders") && (
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                      M-02 Breakdown — Order #124 at risk
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Milling Machine M-02 failed due to spindle bearing failure at 09:15 AM.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">09:18 AM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">WHAT HAPPENED</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      Milling Machine M-02 failed due to spindle bearing failure at 09:15 AM.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">WHY IT HAPPENED</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      Last PM service was 23 days overdue. Vibration anomaly was detected 3 days ago but not acted upon.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">BUSINESS IMPACT</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      Order #124 (2000 Engine Brackets, Hero MotoCorp, due Aug 26) will miss deadline by ~2 days.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">RISK LEVEL</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      ₹64,000 penalty clause may apply.
                    </p>
                  </div>
                </div>

                {/* AI Recommendation Callout */}
                <div className="rounded-2xl bg-[#F0F7FF] border border-[#B8D8FA] p-4 text-xs space-y-1">
                  <span className="font-extrabold text-[#0070C0] uppercase tracking-wider text-[10px]">AI RECOMMENDATION</span>
                  <p className="text-slate-800 font-semibold leading-relaxed">
                    Shift remaining work on Order #124 to Machine M-04 (currently idle). Raise emergency maintenance for M-02.
                  </p>
                </div>

                {/* Action Buttons connected directly to modules */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/machines"
                    className="rounded-xl bg-[#00A8FF] hover:bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    Assign M-04 Machine →
                  </Link>

                  <Link
                    href="/maintenance"
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-800 border border-slate-300 transition flex items-center gap-1.5"
                  >
                    <Wrench className="h-3.5 w-3.5 text-slate-500" /> Raise Maintenance Work Order
                  </Link>

                  <Link
                    href="/orders"
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-800 border border-slate-300 transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5 text-slate-500" /> View Order #124 Details
                  </Link>
                </div>
              </div>
            )}

            {/* ALERT CARD 2: MS Steel Flat Bar stock low */}
            {(categoryFilter === "all" || categoryFilter === "inventory") && (
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#00A8FF]" />
                      MS Steel Flat Bar critical stock low — 2 orders affected
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      MS Steel Flat Bar 40×8mm stock is 101 kg against a minimum threshold of 500 kg.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">08:45 AM</span>
                </div>

                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                  <Link
                    href="/inventory"
                    className="rounded-xl bg-[#1B365D] hover:bg-[#142845] px-4 py-2 text-xs font-black text-white shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <Package className="h-3.5 w-3.5 text-[#00A8FF]" /> View Raw Material Inventory →
                  </Link>
                  <Link
                    href="/suppliers"
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-extrabold text-slate-800 border border-slate-300 transition inline-flex items-center gap-1.5"
                  >
                    Issue Supplier PO →
                  </Link>
                </div>
              </div>
            )}

            {/* Empty State when filtering non-matching category */}
            {categoryFilter !== "all" && categoryFilter !== "machines" && categoryFilter !== "orders" && categoryFilter !== "inventory" && (
              <div className="rounded-3xl bg-white p-16 text-center shadow-sm border border-slate-200/80 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-slate-900">No alerts in this category</h3>
                <p className="text-xs font-semibold text-slate-500">Everything looks good here.</p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State for Important / Informational */
          <div className="rounded-3xl bg-white p-16 text-center shadow-sm border border-slate-200/80 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No alerts in this category</h3>
            <p className="text-xs font-semibold text-slate-500">Everything looks good here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
