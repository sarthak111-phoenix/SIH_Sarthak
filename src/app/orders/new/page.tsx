"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowLeft, Loader2 } from "lucide-react";

export default function NewOrderFeasibilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: "Differential Pin 25mm dia",
    customerName: "Tata Motors Ltd.",
    quantity: 3000,
    deliveryDate: "2024-02-08",
    machineType: "CNC Lathe",
    unitPrice: "",
  });

  const handleRunFeasibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.data?.orderId) {
        router.push(`/orders/${data.data.orderId}/feasibility`);
      } else {
        router.push("/orders");
      }
    } catch (err) {
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-12 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>

        {/* Center White Form Card (Exact Screencast 00:30) */}
        <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00A8FF] fill-current" /> AI Order Feasibility Check
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              AI analyzes machine, material, manpower, timeline, and profitability before you commit.
            </p>
          </div>

          <form onSubmit={handleRunFeasibility} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Product / Component Name *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Differential Pin 25mm dia"
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Tata Motors Ltd."
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Quantity Required *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="3000"
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Required Delivery Date *
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Machine Type Required
                </label>
                <select
                  value={formData.machineType}
                  onChange={(e) => setFormData({ ...formData, machineType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                >
                  <option value="CNC Lathe">CNC Lathe</option>
                  <option value="CNC Milling">CNC Milling</option>
                  <option value="Grinder">Grinder</option>
                  <option value="Drill Press">Drill Press</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Unit Price (₹, optional)
                </label>
                <input
                  type="text"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Enter quoted price"
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] px-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1B365D] hover:bg-[#142845] py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-98"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-[#00A8FF] fill-current" /> Run AI Feasibility Check
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
