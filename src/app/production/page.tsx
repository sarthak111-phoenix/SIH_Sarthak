"use client";

import { useEffect, useState } from "react";
import { 
  Play, 
  Layers, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Sliders, 
  Plus,
  RefreshCw
} from "lucide-react";

const STAGES = [
  "RECEIVED",
  "DESIGN_APPROVED",
  "MATERIAL_READY",
  "PRINTING",
  "CUTTING",
  "FINISHING",
  "QC",
  "PACKING",
  "DISPATCHED",
];

export default function ProductionBoardPage() {
  const [factoryId, setFactoryId] = useState<string>("");
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // What-If Simulator Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [scenarioType, setScenarioType] = useState<"MACHINE_BREAKDOWN" | "URGENT_ORDER_INSERTION" | "MATERIAL_DELAY">("MACHINE_BREAKDOWN");
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [applied, setApplied] = useState(false);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const fRes = await fetch("/api/onboarding");
      const fData = await fRes.json();
      const fId = fData.data?.id;
      setFactoryId(fId || "");

      if (!fId) {
        setScheduleData(null);
        return;
      }

      const sRes = await fetch("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factoryId: fId }),
      });
      const data = await sRes.json();
      if (data.success) {
        setScheduleData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const runSimulation = async () => {
    setSimulating(true);
    setApplied(false);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factoryId,
          scenarioType,
          materialDelayDays: 2,
          urgentOrder: {
            orderNumber: "ORD-URG-99",
            quantity: 5000,
            targetDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            unitPrice: 20,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.data);
      }
    } finally {
      setSimulating(false);
    }
  };

  const applySimulation = async () => {
    if (!simulationResult) return;
    try {
      await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPLY_SCENARIO",
          factoryId,
          scenarioTasks: simulationResult.scheduledTasksPreview,
        }),
      });
      setApplied(true);
      loadSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-factory-dark text-slate-900 px-4 py-8 md:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-sky-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">9-Stage Production Scheduling Board</h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">Live Stage Execution • Non-Destructive What-If Simulation Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
          >
            <Sliders className="h-4 w-4 text-amber-600" /> Run What-If Simulator
          </button>
          <button
            onClick={loadSchedule}
            className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition shadow-xs"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" /> Refresh Board
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex py-16 justify-center items-center text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-sm font-semibold">Computing Smart Machine Schedule...</span>
        </div>
      ) : (
        /* 9-Stage Kanban Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-3 overflow-x-auto pb-6">
          {STAGES.map((st, idx) => (
            <div key={st} className="rounded-2xl border border-sky-200 bg-white p-3 min-w-[200px] flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Stage {idx + 1}</span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-bold border border-blue-200">
                    {scheduleData?.scheduledTasks?.filter((t: any) => t.sequenceOrder === idx + 1).length || 0}
                  </span>
                </div>
                <h3 className="text-xs font-extrabold text-slate-900 tracking-wide">{st}</h3>

                {/* Job Cards in Stage */}
                <div className="space-y-2">
                  {scheduleData?.scheduledTasks
                    ?.filter((t: any) => t.sequenceOrder === idx + 1 || (idx === 0 && t.sequenceOrder === 1))
                    .slice(0, 3)
                    .map((t: any) => (
                      <div key={t.orderId + t.processId} className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-2.5 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{t.orderNumber}</span>
                          <span className="text-[10px] font-mono font-bold text-blue-700">{t.machineName}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-600">Duration: {t.durationHours} hrs</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-2/3" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-sky-100 text-[10px] font-bold text-slate-400 text-center">
                Auto-assigned by Engine
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WHAT-IF SIMULATOR MODAL */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-amber-300 bg-white p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sky-100 pb-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Sliders className="h-6 w-6" />
                <h2 className="text-lg font-extrabold text-slate-900">Non-Destructive What-If Simulator</h2>
              </div>
              <button onClick={() => setShowSimulator(false)} className="text-slate-500 hover:text-slate-900 font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-slate-700">Select Simulation Scenario</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "MACHINE_BREAKDOWN", label: "Machine Breakdown" },
                  { key: "URGENT_ORDER_INSERTION", label: "Urgent Order Insert" },
                  { key: "MATERIAL_DELAY", label: "Material Delay (+2 Days)" },
                ].map((sc) => (
                  <button
                    key={sc.key}
                    onClick={() => setScenarioType(sc.key as any)}
                    className={`rounded-xl border p-3 text-xs font-bold transition ${
                      scenarioType === sc.key
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              <button
                onClick={runSimulation}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition shadow-md shadow-blue-500/20"
              >
                {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run In-Memory Simulation"}
              </button>
            </div>

            {/* Simulation Preview Impact */}
            {simulationResult && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-900">Scenario Impact Analysis</h3>
                <div className="text-xs text-amber-900 font-bold">{simulationResult.impact?.summaryMessage}</div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-200 font-bold">
                  <div>
                    <span className="text-slate-600">Delayed Orders Delta: </span>
                    <span className="text-rose-700">+{simulationResult.impact?.delayedOrdersDelta}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Revenue at Risk: </span>
                    <span className="text-rose-700">₹{simulationResult.impact?.revenueAtRisk?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-amber-200">
                  <span className="text-[11px] text-slate-600 font-semibold">Does NOT mutate database until explicitly applied.</span>
                  <button
                    onClick={applySimulation}
                    disabled={applied}
                    className={`rounded-xl px-5 py-2 text-xs font-bold transition flex items-center gap-2 ${
                      applied ? "bg-emerald-600 text-white shadow-xs" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                    }`}
                  >
                    {applied ? <CheckCircle2 className="h-4 w-4" /> : "Apply Scenario to Live Schedule"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
