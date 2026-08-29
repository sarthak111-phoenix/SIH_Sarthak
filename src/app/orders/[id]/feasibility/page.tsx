"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OrderFeasibilityView from "@/components/orders/OrderFeasibilityView";
import { Loader2 } from "lucide-react";

export default function FeasibilityPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeasibility() {
      try {
        const factoryRes = await fetch("/api/onboarding");
        const factoryData = await factoryRes.json();
        const fId = factoryData.data?.id || "demo";

        const res = await fetch(`/api/orders/${orderId}/feasibility?factoryId=${fId}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFeasibility();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-factory-dark text-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-[#0088F5]" />
        <span className="ml-3 font-semibold text-slate-700">Running 14-Parameter Deterministic Engine...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-factory-dark text-slate-500">
        Order or feasibility data not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-factory-dark px-4 py-8 md:px-8 max-w-6xl mx-auto">
      <OrderFeasibilityView
        orderId={data.orderId}
        orderNumber={data.orderNumber}
        deterministicResult={data.deterministicResult}
        aiExplanation={data.aiExplanation}
      />
    </div>
  );
}
