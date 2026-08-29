"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Package, 
  CheckCircle2, 
  PhoneCall, 
  Mail,
  Building2,
  Loader2
} from "lucide-react";

interface SupplierItem {
  id: string;
  name: string;
  code: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  averageLeadTimeDays: number;
  reliabilityScore: number;
  grade: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
}

export default function SupplierIntelligencePage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        let factoryId = "";
        const storedFactory = localStorage.getItem("factoryiq_factory");
        if (storedFactory) {
          try {
            factoryId = JSON.parse(storedFactory).id;
          } catch (e) {}
        }
        
        const url = factoryId ? `/api/suppliers?factoryId=${factoryId}` : `/api/suppliers`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSuppliers(json.data);
        } else {
          setSuppliers([]);
        }
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const totalSuppliers = suppliers.length;
  const excellentCount = suppliers.filter((s) => s.grade === "EXCELLENT").length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="h-7 w-7 text-[#00A8FF]" /> Supplier Intelligence & Vendor Risk
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Vendor reliability scoring, lead-time variance, defect tracking & PO dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1B365D] hover:bg-[#142845] transition shadow-md"
          >
            <Package className="h-4 w-4 text-[#00A8FF]" /> View Raw Material Stock
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-[#00A8FF]">{totalSuppliers}</div>
          <div className="text-xs font-extrabold text-slate-800">Approved Suppliers</div>
          <div className="text-[10px] font-semibold text-slate-500">Active Vendor Roster</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-emerald-600">{excellentCount}</div>
          <div className="text-xs font-extrabold text-slate-800">Excellent Grade</div>
          <div className="text-[10px] font-semibold text-emerald-600">Top Tier Performance</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-amber-600">
            {totalSuppliers > 0 ? `${(suppliers.reduce((a, b) => a + b.averageLeadTimeDays, 0) / totalSuppliers).toFixed(1)} Days` : "0 Days"}
          </div>
          <div className="text-xs font-extrabold text-slate-800">Avg Lead Time</div>
          <div className="text-[10px] font-semibold text-slate-500">Fulfillment turnaround</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-[#1B365D]">{totalSuppliers}</div>
          <div className="text-xs font-extrabold text-slate-800">Active Partners</div>
          <div className="text-[10px] font-semibold text-[#00A8FF]">Quality Verified</div>
        </div>
      </div>

      {/* Supplier Cards List or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#00A8FF]" /> Loading Suppliers Data...
        </div>
      ) : suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="rounded-3xl bg-white p-6 shadow-md border border-slate-200/80 space-y-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-slate-400">{sup.code}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        sup.grade === "EXCELLENT"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : sup.grade === "GOOD"
                          ? "bg-sky-100 text-sky-800 border border-sky-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {sup.grade}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">{sup.name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">RELIABILITY SCORE</span>
                  <span className="text-lg font-black text-emerald-600">{sup.reliabilityScore}/100</span>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 gap-2 bg-[#F7F9FC] p-3 rounded-2xl border border-slate-200/60 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">AVG LEAD TIME</span>
                  <span className="text-xs font-black text-slate-900">{sup.averageLeadTimeDays} Days</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">CONTACT</span>
                  <span className="text-xs font-black text-slate-900">{sup.contactPerson || "N/A"}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <PhoneCall className="h-3.5 w-3.5 text-slate-400" /> {sup.phone || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> {sup.email || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center space-y-4 border border-slate-200">
          <div className="inline-flex p-4 rounded-full bg-sky-50 text-[#00A8FF]">
            <Truck className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No Registered Suppliers</h3>
            <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
              Your supplier roster is empty. Complete your onboarding wizard or add suppliers to enable vendor scoring.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A8FF] text-white text-xs font-black hover:bg-blue-600 transition shadow-sm"
          >
            <Building2 className="h-4 w-4" /> Go to Factory Setup
          </Link>
        </div>
      )}

    </div>
  );
}
