"use client";

import { useEffect, useState } from "react";
import { Zap, Package, AlertCircle, PlusCircle, Building2, Loader2 } from "lucide-react";
import Link from "next/link";

interface InventoryItem {
  materialId: string;
  materialName: string;
  materialCode: string;
  category: string;
  unitOfMeasure: string;
  costPerUnit: number;
  currentStock: number;
  reservedStock: number;
  damagedStock: number;
  usableStock: number;
  minimumStockThreshold: number;
  reorderQuantity: number;
  status: "OK" | "LOW_STOCK" | "CRITICAL_SHORTAGE";
  dailyConsumptionRate: number;
  predictedShortageDays: number | null;
  needsPurchaseReorder: boolean;
}

export default function InventoryPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        let factoryId = "";
        const storedFactory = localStorage.getItem("factoryiq_factory");
        if (storedFactory) {
          try {
            factoryId = JSON.parse(storedFactory).id;
          } catch (e) {}
        }
        
        const url = factoryId ? `/api/inventory?factoryId=${factoryId}` : `/api/inventory`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const totalSkus = items.length;
  const criticalCount = items.filter((i) => i.status === "CRITICAL_SHORTAGE").length;
  const lowCount = items.filter((i) => i.status === "LOW_STOCK").length;
  const normalCount = items.filter((i) => i.status === "OK").length;

  const filteredItems = items.filter((item) => {
    if (categoryFilter === "critical") return item.status === "CRITICAL_SHORTAGE";
    if (categoryFilter === "warning") return item.status === "LOW_STOCK";
    if (categoryFilter === "normal") return item.status === "OK";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Inventory & Stock</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Real-time raw material, consumable, and spare parts tracking</p>
        </div>

        <Link
          href="/onboarding"
          className="rounded-xl bg-[#00A8FF] hover:bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition self-start sm:self-auto flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Raw Materials</span>
        </Link>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#1B365D] text-white p-5 shadow-sm space-y-1">
          <div className="text-3xl font-black">{totalSkus}</div>
          <div className="text-xs font-bold text-slate-300">Total SKUs</div>
        </div>

        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 shadow-xs space-y-1">
          <div className="text-3xl font-black text-rose-600">{criticalCount}</div>
          <div className="text-xs font-extrabold text-rose-900">Critical Shortage</div>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-xs space-y-1">
          <div className="text-3xl font-black text-amber-600">{lowCount}</div>
          <div className="text-xs font-extrabold text-amber-900">Low Stock</div>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 shadow-xs space-y-1">
          <div className="text-3xl font-black text-emerald-600">{normalCount}</div>
          <div className="text-xs font-extrabold text-emerald-900">Optimal Stock</div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {[
          { id: "all", label: "All Items" },
          { id: "critical", label: "Critical Shortage" },
          { id: "warning", label: "Low Stock" },
          { id: "normal", label: "Optimal Stock" },
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setCategoryFilter(chip.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              categoryFilter === chip.id
                ? "bg-[#1B365D] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Inventory Data Table or Empty State */}
      <div className="rounded-3xl bg-white shadow-md border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#00A8FF]" /> Loading Inventory Data...
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-[#F7F9FC] border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ITEM</th>
                  <th className="px-6 py-4">CATEGORY</th>
                  <th className="px-6 py-4">AVAILABLE / TOTAL</th>
                  <th className="px-6 py-4">MIN THRESHOLD</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">UNIT COST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.materialId} className="hover:bg-[#F0F7FF] transition">
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900">{item.materialName}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-400">{item.materialCode}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-900">{item.usableStock} / {item.currentStock} {item.unitOfMeasure}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{item.minimumStockThreshold} {item.unitOfMeasure}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                        item.status === "CRITICAL_SHORTAGE"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : item.status === "LOW_STOCK"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 font-mono">₹{item.costPerUnit}/{item.unitOfMeasure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-sky-50 text-[#00A8FF]">
              <Package className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">No Materials in Inventory</h3>
              <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
                Your inventory database is currently clear. Complete your factory setup or add raw materials to begin tracking stock.
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

    </div>
  );
}
