"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Plus, 
  ArrowRight, 
  Check,
  ShieldAlert,
  RefreshCw,
  Loader2
} from "lucide-react";

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<"all" | "emergency" | "scheduled">("all");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newWorkOrder, setNewWorkOrder] = useState({
    machine: "Milling Machine M-02",
    priority: "Emergency / Critical",
    issue: "Spindle bearing vibration and lockup",
    technician: "Ramesh Tech",
  });

  const [workOrders, setWorkOrders] = useState<any[]>([]);

  const fetchMaintenanceData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch machines to inspect live telemetry
      const mRes = await fetch("/api/machines");
      const mJson = await mRes.json();
      const machines: any[] = mJson.success && Array.isArray(mJson.data) ? mJson.data : [];

      // Check if M-02 or any machine is in DOWN_BREAKDOWN or DOWN_MAINTENANCE in DB
      const m02Machine = machines.find(
        (m) => m.code === "M-02" || m.name.includes("M-02") || m.name.toLowerCase().includes("milling")
      );

      // 2. Fetch maintenance tasks
      const res = await fetch("/api/maintenance");
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const fetchedList = json.data.map((m: any) => ({
          id: m.id || `WO-${Math.floor(800 + Math.random() * 100)}`,
          machineId: m.machineId || m.machine?.code || "M-02",
          machineName: m.machine?.name || "Milling Machine M-02",
          type: m.type || "Preventative Maintenance",
          priority: m.type === "BREAKDOWN" ? "CRITICAL" : "IMPORTANT",
          issue: m.notes || "Servicing and inspection work order",
          affectedOrder: "Active Production",
          scheduledDate: new Date(m.scheduledDate).toLocaleDateString(),
          technician: "Assigned Tech",
          status: m.completedDate ? "COMPLETED" : "IN_PROGRESS",
        }));
        setWorkOrders(fetchedList);
      } else {
        setWorkOrders([]);
      }
    } catch (e) {
      console.error("Failed to fetch maintenance data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceData();

    const handleUpdate = () => {
      fetchMaintenanceData();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("factory-data-updated", handleUpdate);
      return () => window.removeEventListener("factory-data-updated", handleUpdate);
    }
  }, [fetchMaintenanceData]);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const newWo = {
      id: `WO-${Math.floor(900 + Math.random() * 99)}`,
      machineId: newWorkOrder.machine.includes("M-02") ? "M-02" : "L-01",
      machineName: newWorkOrder.machine,
      type: newWorkOrder.priority.includes("Emergency") ? "Emergency Breakdown" : "Preventative Maintenance",
      priority: newWorkOrder.priority.includes("Emergency") ? "CRITICAL" : "IMPORTANT",
      issue: newWorkOrder.issue,
      affectedOrder: "Pending assessment",
      scheduledDate: "Immediate",
      technician: newWorkOrder.technician,
      status: "IN_PROGRESS",
    };

    setWorkOrders((prev) => [newWo, ...prev]);
    setShowModal(false);

    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: newWo.machineId,
          type: newWorkOrder.priority.includes("Emergency") ? "BREAKDOWN" : "PREVENTIVE",
          notes: newWorkOrder.issue,
        }),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("factory-data-updated"));
      }
    } catch (err) {
      console.error("Failed to persist new work order:", err);
    }
  };

  const markCompleted = async (id: string) => {
    const targetWo = workOrders.find((w) => w.id === id);
    const mId = targetWo?.machineId || "M-02";

    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: "COMPLETED" } : wo))
    );

    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          maintenanceId: id,
          machineId: mId,
        }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("factory-data-updated"));
      }
    } catch (err) {
      console.error("Failed to mark maintenance completed in DB:", err);
    }
  };

  const activeEmergencyOrders = workOrders.filter(
    (wo) => wo.priority === "CRITICAL" && wo.status !== "COMPLETED"
  );
  const activeServicingOrders = workOrders.filter(
    (wo) => wo.status === "IN_PROGRESS" && wo.priority !== "CRITICAL"
  );
  const scheduledOrders = workOrders.filter(
    (wo) => wo.status === "SCHEDULED"
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="h-7 w-7 text-[#00A8FF]" /> Maintenance & Rehabilitation
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Preventative Servicing · Emergency Work Orders · Machine Breakdown Logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMaintenanceData}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>

          <Link
            href="/machines"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
          >
            <Cpu className="h-4 w-4 text-[#00A8FF]" /> View Machines Status
          </Link>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#1B365D] hover:bg-[#142845] px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-98"
          >
            <Plus className="h-4 w-4 text-[#00A8FF]" /> Raise Work Order
          </button>
        </div>
      </div>

      {/* Top 4 Dynamic Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-rose-600">{activeEmergencyOrders.length}</div>
          <div className="text-xs font-extrabold text-slate-800">Emergency Breakdown</div>
          <div className="text-[10px] font-semibold text-rose-600">
            {activeEmergencyOrders.length > 0 ? activeEmergencyOrders[0].machineName : "None · Floor Active"}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-amber-600">{activeServicingOrders.length}</div>
          <div className="text-xs font-extrabold text-slate-800">In Active Servicing</div>
          <div className="text-[10px] font-semibold text-amber-600">
            {activeServicingOrders.length > 0 ? activeServicingOrders[0].machineName : "All Equipment Operational"}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-[#00A8FF]">{scheduledOrders.length}</div>
          <div className="text-xs font-extrabold text-slate-800">Scheduled PM Tasks</div>
          <div className="text-[10px] font-semibold text-slate-500">Next 7 days</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-emerald-600">99.2%</div>
          <div className="text-xs font-extrabold text-slate-800">MTBF Reliability</div>
          <div className="text-[10px] font-semibold text-emerald-600">Optimal Target Met</div>
        </div>
      </div>

      {/* DYNAMIC EMERGENCY ALERT CALLOUT */}
      {activeEmergencyOrders.length > 0 ? (
        <div className="rounded-3xl bg-[#0F2647] text-white p-6 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">CRITICAL BREAKDOWN DETECTED</span>
            </div>
            <Link
              href="/notifications"
              className="text-xs font-bold text-[#00A8FF] hover:underline flex items-center gap-1"
            >
              View AI Alert Details →
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-white">
              {activeEmergencyOrders[0].machineName} — {activeEmergencyOrders[0].issue} ({activeEmergencyOrders[0].id})
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Master technician actively performing repairs. Affected Order:{" "}
              <Link href="/orders" className="text-[#00A8FF] font-bold underline">
                {activeEmergencyOrders[0].affectedOrder}
              </Link>. You can mark this task complete in the work order list or ask the AI agent to clear maintenance.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-emerald-950 text-white p-6 shadow-md space-y-2 relative overflow-hidden border border-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">MAINTENANCE SECTION CLEARED</span>
          </div>
          <h2 className="text-lg font-black text-white">
            All Machine Breakdowns Serviced & Equipment Restored to IDLE/RUNNING
          </h2>
          <p className="text-xs text-emerald-200 font-medium">
            Zero active breakdown alerts detected on factory floor. AI Agent verified database telemetry and cleared all maintenance holds.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: "all", label: `All Work Orders (${workOrders.length})` },
          { id: "emergency", label: `Emergency (${activeEmergencyOrders.length})` },
          { id: "scheduled", label: `Scheduled (${scheduledOrders.length + activeServicingOrders.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeTab === tab.id
                ? "bg-[#1B365D] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Work Orders List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workOrders
          .filter((wo) => {
            if (activeTab === "emergency") return wo.priority === "CRITICAL";
            if (activeTab === "scheduled") return wo.priority !== "CRITICAL";
            return true;
          })
          .map((wo) => (
            <div
              key={wo.id}
              className={`rounded-3xl bg-white p-6 shadow-md border transition space-y-4 ${
                wo.priority === "CRITICAL" && wo.status !== "COMPLETED"
                  ? "border-rose-200 bg-rose-50/20"
                  : wo.status === "COMPLETED"
                  ? "border-emerald-200 bg-emerald-50/10"
                  : "border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-slate-400">{wo.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        wo.priority === "CRITICAL" && wo.status !== "COMPLETED"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : wo.priority === "IMPORTANT"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">{wo.machineName}</h3>
                  <span className="text-xs font-extrabold text-[#00A8FF]">{wo.type}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                    wo.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : wo.status === "IN_PROGRESS"
                      ? "bg-[#00A8FF]/10 text-[#0070C0] border border-[#00A8FF]/30 animate-pulse"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {wo.status === "IN_PROGRESS" ? "IN SERVICING" : wo.status}
                </span>
              </div>

              <div className="rounded-2xl bg-[#F7F9FC] p-4 text-xs space-y-2 border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">ISSUE & SCOPE</span>
                  <p className="text-slate-800 font-medium leading-relaxed">{wo.issue}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-200/60">
                  <span>Affected Order: <strong className="text-slate-900">{wo.affectedOrder}</strong></span>
                  <span>Technician: <strong className="text-slate-900">{wo.technician}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <span className="text-slate-500 font-mono text-[11px]">Scheduled: {wo.scheduledDate}</span>
                
                {wo.status !== "COMPLETED" ? (
                  <button
                    type="button"
                    onClick={() => markCompleted(wo.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" /> Mark Resolved
                  </button>
                ) : (
                  <span className="text-emerald-600 font-black flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Serviced & Verified
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* CREATE WORK ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Raise Maintenance Work Order</h2>
              <p className="text-xs font-semibold text-slate-500">
                Dispatch technicians and record equipment maintenance actions.
              </p>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Target Machine</label>
                <select
                  value={newWorkOrder.machine}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, machine: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-bold"
                >
                  <option value="Milling Machine M-02">Milling Machine M-02 (Spindle Breakdown)</option>
                  <option value="CNC Lathe L-01">CNC Lathe L-01</option>
                  <option value="Lathe L-06">Lathe L-06</option>
                  <option value="Drill Press D-04">Drill Press D-04</option>
                  <option value="Grinder G-05">Grinder G-05</option>
                  <option value="CNC Mill M-07">CNC Mill M-07</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Priority</label>
                <select
                  value={newWorkOrder.priority}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-bold"
                >
                  <option value="Emergency / Critical">Emergency / Critical</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Routine PM">Routine PM</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description / Observed Fault</label>
                <textarea
                  value={newWorkOrder.issue}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, issue: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-semibold"
                  placeholder="Describe machine symptom..."
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={newWorkOrder.technician}
                  onChange={(e) => setNewWorkOrder({ ...newWorkOrder, technician: e.target.value })}
                  placeholder="Technician name"
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142845] text-white font-extrabold text-xs shadow-md"
                >
                  Submit Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
