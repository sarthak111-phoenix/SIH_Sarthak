"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Package, Clock, Loader2 } from "lucide-react";

export default function CustomerTrackingPage() {
  const params = useParams();
  const code = params.code as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrackingInfo() {
      try {
        const res = await fetch(`/api/track/${code}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrackingInfo();
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-factory-dark text-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 font-semibold text-slate-700">Retrieving Order Tracking Progress...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-factory-dark text-slate-600 text-sm font-semibold">
        Invalid tracking code or order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-factory-dark text-slate-900 px-4 py-12 max-w-3xl mx-auto space-y-8">
      {/* Customer Tracking Header */}
      <div className="rounded-2xl border border-sky-200 bg-white p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">CUSTOMER TRACKING PORTAL</span>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">{order.orderNumber}</h1>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-extrabold text-emerald-800">
            {order.orderStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <span className="text-slate-500">Customer:</span>
            <div className="font-extrabold text-slate-900 mt-0.5">{order.companyName}</div>
          </div>
          <div>
            <span className="text-slate-500">Product:</span>
            <div className="font-extrabold text-slate-900 mt-0.5">{order.productName}</div>
          </div>
          <div>
            <span className="text-slate-500">Quantity:</span>
            <div className="font-extrabold text-slate-900 mt-0.5">{order.quantity.toLocaleString()} pcs</div>
          </div>
          <div>
            <span className="text-slate-500">Target Delivery:</span>
            <div className="font-extrabold text-emerald-700 mt-0.5">
              {new Date(order.targetDeadline).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Production Progress Timeline */}
      <div className="rounded-2xl border border-sky-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" /> Production Progress & Milestones
        </h2>

        <div className="relative pl-6 border-l-2 border-sky-200 space-y-6">
          {order.stages.map((stg: any, idx: number) => (
            <div key={stg.stageName + idx} className="relative group">
              <div className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                stg.status === "PASSED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : stg.status === "IN_PROGRESS"
                  ? "bg-blue-600 text-white animate-pulse shadow-xs"
                  : "bg-slate-200 text-slate-600"
              }`}>
                {stg.status === "PASSED" ? "✓" : idx + 1}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">{stg.stageName}</h3>
                  <span className={`text-[10px] font-bold ${
                    stg.status === "PASSED" ? "text-emerald-700" : stg.status === "IN_PROGRESS" ? "text-blue-700" : "text-slate-500"
                  }`}>
                    {stg.status}
                  </span>
                </div>
                {stg.completedAt && (
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Completed on {new Date(stg.completedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
