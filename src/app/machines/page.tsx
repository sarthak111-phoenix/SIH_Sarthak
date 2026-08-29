"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, AlertTriangle, CheckCircle2, Clock, Wrench, ArrowRight, Plus, RefreshCw, Loader2, Calendar, Settings, Check } from "lucide-react";

export type MachineDisplay = {
  id: string;
  code: string;
  name: string;
  status: "Running" | "Idle" | "Breakdown" | "Maintenance";
  statusColor?: string;
  job?: string;
  progress?: number;
  startedAt?: string;
  eta?: string;
  efficiency?: string;
  issue?: string;
  affectedOrder?: string;
  workOrder?: string;
  available?: string;
  details?: string;
  hourlyRate?: number;
  workStartTime?: string;
  workEndTime?: string;
  nextMaintenanceDate?: string;
  isMaintenanceNear?: boolean;
  maintenanceDaysLeft?: number;
};

export default function MachinesPage() {
  const [filter, setFilter] = useState("all");
  const [machines, setMachines] = useState<MachineDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMachineName, setNewMachineName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Modal State for Owner Schedule & Maintenance Configuration
  const [editingMachine, setEditingMachine] = useState<MachineDisplay | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    workStartTime: "08:00",
    workEndTime: "17:00",
    nextMaintenanceDate: "",
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    fetchMachines();

    const handleUpdate = () => {
      fetchMachines();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("factory-data-updated", handleUpdate);
      return () => window.removeEventListener("factory-data-updated", handleUpdate);
    }
  }, []);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      // 1. Try to load from LocalStorage first if present
      let localSavedState: MachineDisplay[] | null = null;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("factoryiq_machines_state_data");
        if (saved) {
          try {
            localSavedState = JSON.parse(saved);
          } catch (e) {}
        }
      }

      // 2. Fetch from DB
      const res = await fetch("/api/machines");
      const json = await res.json();

      let dbMachines: any[] = [];
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        dbMachines = json.data;
      }

      // 3. Check LocalStorage fallback from Onboarding Setup
      let localMachineNames: string[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("factoryiq_onboarded_machines");
        if (stored) {
          try {
            localMachineNames = JSON.parse(stored);
          } catch (e) {}
        }
      }

      let finalMachineList: MachineDisplay[] = [];
      const now = new Date();

      if (dbMachines.length > 0) {
        finalMachineList = dbMachines.map((m: any, idx: number) => {
          const localMatch = localSavedState?.find(
            (loc) => loc.id === m.id || loc.code === m.code || loc.name === m.name
          );

          let status = (m.status === "RUNNING" ? "Running" 
                        : m.status === "DOWN_BREAKDOWN" ? "Breakdown" 
                        : m.status === "DOWN_MAINTENANCE" ? "Maintenance" 
                        : "Idle") as "Running" | "Idle" | "Breakdown" | "Maintenance";

          if (localMatch?.status === "Idle" && status !== "Running") {
            status = "Idle";
          }

          const workStartTime = localMatch?.workStartTime || m.workStartTime || "08:00";
          const workEndTime = localMatch?.workEndTime || m.workEndTime || "17:00";
          const formattedMaintDate = localMatch?.nextMaintenanceDate !== undefined
            ? localMatch.nextMaintenanceDate
            : (m.nextMaintenanceDate ? new Date(m.nextMaintenanceDate).toISOString().split("T")[0] : undefined);

          let isMaintenanceNear = false;
          let maintenanceDaysLeft: number | undefined = undefined;

          if (formattedMaintDate && status !== "Idle") {
            const maintDate = new Date(formattedMaintDate);
            const diffMs = maintDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            maintenanceDaysLeft = diffDays;
            if (diffDays <= 3) {
              isMaintenanceNear = true;
            }
          }

          return {
            id: m.id || `M-${String(idx + 1).padStart(2, '0')}`,
            code: m.code || `MCH-${String(idx + 1).padStart(2, '0')}`,
            name: m.name,
            status,
            hourlyRate: m.hourlyRate || 450,
            workStartTime,
            workEndTime,
            nextMaintenanceDate: formattedMaintDate,
            isMaintenanceNear: status === "Idle" ? false : isMaintenanceNear,
            maintenanceDaysLeft: status === "Idle" ? undefined : maintenanceDaysLeft,
            job: status === "Running" ? `Order #${120 + idx} - Standard Production` : undefined,
            progress: status === "Running" ? 40 + (idx * 15) % 55 : undefined,
            startedAt: status === "Running" ? `Started ${workStartTime || "08:00 AM"}` : undefined,
            eta: status === "Running" ? `ETA ${workEndTime || "04:30 PM"}` : undefined,
            efficiency: status === "Running" ? `${88 + (idx * 3) % 11}%` : undefined,
            issue: status === "Breakdown" ? "Emergency spindle thermal cut-off" : undefined,
            affectedOrder: status === "Breakdown" ? `Order #${124}` : undefined,
            workOrder: status === "Breakdown" ? `WO-${900 + idx}` : status === "Maintenance" ? `WO-${880 + idx}` : undefined,
            available: status === "Idle" ? "Operator assigned · Capacity ready" : undefined,
            details: status === "Maintenance" ? "Scheduled preventative service" : undefined,
          };
        });
      } else if (localSavedState && localSavedState.length > 0) {
        finalMachineList = localSavedState;
      } else if (localMachineNames.length > 0) {
        finalMachineList = localMachineNames.map((name: string, idx: number) => {
          const initialStatus = (idx === 3 ? "Maintenance" : idx === 4 ? "Breakdown" : idx <= 1 ? "Running" : "Idle") as "Running" | "Idle" | "Breakdown" | "Maintenance";
          const demoDate = new Date(now.getTime() + (idx + 1) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

          return {
            id: `M-${String(idx + 1).padStart(2, '0')}`,
            code: `MCH-${String(idx + 1).padStart(2, '0')}`,
            name,
            status: initialStatus,
            hourlyRate: 450 + (idx * 50),
            workStartTime: "08:00",
            workEndTime: "17:00",
            nextMaintenanceDate: demoDate,
            isMaintenanceNear: initialStatus === "Maintenance" || initialStatus === "Breakdown",
            maintenanceDaysLeft: idx + 1,
            job: initialStatus === "Running" ? `Order #${125 + idx} - Batch Production` : undefined,
            progress: initialStatus === "Running" ? 50 + (idx * 12) % 45 : undefined,
            startedAt: initialStatus === "Running" ? "Started 08:30 AM" : undefined,
            eta: initialStatus === "Running" ? "ETA 03:00 PM" : undefined,
            efficiency: initialStatus === "Running" ? `${90 + (idx * 2) % 9}%` : undefined,
            issue: initialStatus === "Breakdown" ? "Spindle alignment calibration fault" : undefined,
            affectedOrder: initialStatus === "Breakdown" ? `Order #${124}` : undefined,
            workOrder: initialStatus === "Breakdown" ? `WO-${901 + idx}` : initialStatus === "Maintenance" ? `WO-${884 + idx}` : undefined,
            available: initialStatus === "Idle" ? "Ready for job allocation" : undefined,
            details: initialStatus === "Maintenance" ? "Quarterly PM Checklist" : undefined,
          };
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("factoryiq_machines_state_data", JSON.stringify(finalMachineList));
        }
      } else {
        finalMachineList = [];
      }

      setMachines(finalMachineList);
    } catch (e) {
      console.error("Failed to load machines:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName.trim()) return;

    setIsAdding(true);
    const newName = newMachineName.trim();

    try {
      await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("factoryiq_onboarded_machines");
        const list: string[] = existing ? JSON.parse(existing) : [];
        if (!list.includes(newName)) {
          list.push(newName);
          localStorage.setItem("factoryiq_onboarded_machines", JSON.stringify(list));
        }
      }

      setNewMachineName("");
      await fetchMachines();
    } catch (e) {
      console.error("Error adding machine:", e);
    } finally {
      setIsAdding(false);
    }
  };

  const openScheduleModal = (m: MachineDisplay) => {
    setEditingMachine(m);
    setScheduleForm({
      workStartTime: m.workStartTime || "08:00",
      workEndTime: m.workEndTime || "17:00",
      nextMaintenanceDate: m.nextMaintenanceDate || "",
    });
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;

    setSavingSchedule(true);
    try {
      const updatedList = machines.map((m) =>
        m.id === editingMachine.id || m.code === editingMachine.code || m.name === editingMachine.name
          ? {
              ...m,
              workStartTime: scheduleForm.workStartTime,
              workEndTime: scheduleForm.workEndTime,
              nextMaintenanceDate: scheduleForm.nextMaintenanceDate || undefined,
            }
          : m
      );

      setMachines(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem("factoryiq_machines_state_data", JSON.stringify(updatedList));
      }

      await fetch("/api/machines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: editingMachine.id,
          workStartTime: scheduleForm.workStartTime,
          workEndTime: scheduleForm.workEndTime,
          nextMaintenanceDate: scheduleForm.nextMaintenanceDate || null,
        }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("factory-data-updated"));
      }

      setEditingMachine(null);
    } catch (err) {
      console.error("Failed to update machine schedule:", err);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleCompleteMaintenance = async (machineId: string, machineName: string) => {
    try {
      const updatedList = machines.map((m) =>
        m.id === machineId || m.name === machineName || m.code === machineId
          ? {
              ...m,
              status: "Idle" as const,
              isMaintenanceNear: false,
              maintenanceDaysLeft: undefined,
              details: undefined,
              issue: undefined,
              workOrder: undefined,
              affectedOrder: undefined,
              available: "Operator assigned · Capacity ready",
            }
          : m
      );

      setMachines(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem("factoryiq_machines_state_data", JSON.stringify(updatedList));
      }

      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          machineId,
          machineCode: machineName,
        }),
      });

      await fetch("/api/machines", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId,
          status: "IDLE",
        }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("factory-data-updated"));
      }
    } catch (err) {
      console.error("Failed to mark maintenance complete:", err);
    }
  };

  const filteredMachines = machines.filter((m) => {
    if (filter === "idle") return m.status === "Idle";
    if (filter === "maintenance") return m.status === "Maintenance";
    if (filter === "breakdown") return m.status === "Breakdown";
    if (filter === "running") return m.status === "Running";
    return true;
  });

  const runningCount = machines.filter((m) => m.status === "Running").length;
  const idleCount = machines.filter((m) => m.status === "Idle").length;
  const maintenanceCount = machines.filter((m) => m.status === "Maintenance").length;
  const breakdownCount = machines.filter((m) => m.status === "Breakdown").length;
  const maintenanceAlertsCount = machines.filter((m) => m.isMaintenanceNear).length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title & Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Machine Monitoring</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">Real-time floor telemetry, operating hours, maintenance alerts & status tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMachines}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link
            href="/maintenance"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
          >
            <Wrench className="h-4 w-4 text-[#00A8FF]" /> Maintenance Hub
          </Link>
          <span className="text-xs font-black text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            Configured Equipment: <span className="text-[#00A8FF]">{machines.length}</span>
          </span>
        </div>
      </div>

      {/* Global Maintenance Alert Banner if any machine maintenance is near */}
      {maintenanceAlertsCount > 0 && (
        <div className="rounded-3xl bg-amber-50 border border-amber-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                UPCOMING MAINTENANCE WARNING ({maintenanceAlertsCount} Machine{maintenanceAlertsCount > 1 ? "s" : ""})
              </span>
              <p className="text-xs font-semibold text-amber-950 mt-0.5">
                Maintenance date is approaching soon. Please inspect work schedules and ensure parts availability.
              </p>
            </div>
          </div>
          <Link
            href="/maintenance"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition shadow-xs whitespace-nowrap"
          >
            Manage Maintenance →
          </Link>
        </div>
      )}

      {/* Add Quick Machine Bar */}
      <form onSubmit={handleAddCustomMachine} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Cpu className="h-5 w-5 text-[#00A8FF] shrink-0 ml-2" />
        <input
          type="text"
          placeholder="Add another machine to your factory floor (e.g. Haas VF-2 CNC)..."
          value={newMachineName}
          onChange={(e) => setNewMachineName(e.target.value)}
          className="flex-1 bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newMachineName.trim() || isAdding}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A8FF] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold text-xs transition shadow-xs shrink-0 cursor-pointer"
        >
          {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add Machine
        </button>
      </form>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            filter === "all" ? "bg-[#1B365D] text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          All ({machines.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("running")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            filter === "running" ? "bg-emerald-600 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> {runningCount} Running
        </button>

        <button
          type="button"
          onClick={() => setFilter("idle")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            filter === "idle" ? "bg-amber-500 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" /> {idleCount} Idle
        </button>

        <button
          type="button"
          onClick={() => setFilter("maintenance")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            filter === "maintenance" ? "bg-orange-500 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-orange-500" /> {maintenanceCount} Maintenance
        </button>

        <button
          type="button"
          onClick={() => setFilter("breakdown")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            filter === "breakdown" ? "bg-rose-500 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500" /> {breakdownCount} Breakdown
        </button>
      </div>

      {/* Machine Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="h-8 w-8 text-[#00A8FF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMachines.map((m) => (
            <div
              key={m.id}
              className={`rounded-3xl bg-white p-6 shadow-md border transition space-y-4 ${
                m.status === "Breakdown"
                  ? "border-rose-200 bg-rose-50/20"
                  : m.status === "Maintenance"
                  ? "border-amber-200 bg-amber-50/20"
                  : m.isMaintenanceNear
                  ? "border-amber-300 bg-amber-50/10"
                  : "border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{m.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{m.code}</span>
                  </div>

                  {/* Maintenance Alert Chip on Machine */}
                  {m.isMaintenanceNear && m.status !== "Maintenance" && m.status !== "Breakdown" && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      Maintenance Due: {m.maintenanceDaysLeft === 0 ? "Today" : `In ${m.maintenanceDaysLeft} day(s)`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${
                      m.status === "Running"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : m.status === "Breakdown"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : m.status === "Maintenance"
                        ? "bg-orange-100 text-orange-800 border border-orange-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      m.status === "Running" ? "bg-emerald-500" : m.status === "Breakdown" ? "bg-rose-500" : "bg-amber-500"
                    }`} />
                    {m.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => openScheduleModal(m)}
                    title="Define Working Hours & Maintenance Date"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Owner Configuration Summary Bar (Working Hours & Maintenance Date) */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-[#00A8FF]" />
                  <span>Work Hours: <strong>{m.workStartTime || "08:00"} — {m.workEndTime || "17:00"}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" />
                  <span>Maint Date: <strong className={m.isMaintenanceNear ? "text-amber-700 font-extrabold" : "text-slate-900"}>{m.nextMaintenanceDate || "Not Set"}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => openScheduleModal(m)}
                  className="text-[11px] font-extrabold text-[#00A8FF] hover:underline"
                >
                  Edit Settings
                </button>
              </div>

              {m.status === "Running" && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#F7F9FC] p-3.5 border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CURRENT JOB</span>
                    <div className="text-xs font-black text-slate-900">{m.job || "Active Manufacturing Run"}</div>
                    
                    {m.progress !== undefined && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-[#00A8FF]" style={{ width: `${m.progress}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{m.progress}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
                    <span>{m.startedAt || "Started 08:00 AM"}</span>
                    {m.eta && <span className="text-[#00A8FF] font-bold">{m.eta}</span>}
                    {m.efficiency && <span className="text-emerald-600 font-extrabold">Efficiency: {m.efficiency}</span>}
                  </div>
                </div>
              )}

              {m.status === "Breakdown" && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 space-y-3 text-xs">
                  <div>
                    <span className="font-extrabold text-rose-800 uppercase tracking-wider text-[10px]">CRITICAL BREAKDOWN ISSUE</span>
                    <p className="text-rose-900 font-bold mt-0.5">{m.issue || "Spindle & drive fault reported"}</p>
                    <p className="text-slate-600 text-[11px] font-medium mt-1">Affected: {m.affectedOrder || "Active Orders"}</p>
                  </div>

                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-mono font-bold">Ticket: {m.workOrder || "WO-901"}</span>
                    
                    <button
                      type="button"
                      onClick={() => handleCompleteMaintenance(m.id, m.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Remove / Confirm Completed
                    </button>
                  </div>
                </div>
              )}

              {m.status === "Idle" && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                  <span className="font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">STATUS</span>
                  <p className="text-slate-800 font-bold">{m.available || "Ready for job allocation"}</p>
                  <Link href="/orders/new" className="inline-block text-[#00A8FF] font-extrabold hover:underline">
                    Assign Idle Capacity →
                  </Link>
                </div>
              )}

              {m.status === "Maintenance" && (
                <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 space-y-3 text-xs">
                  <div>
                    <span className="font-extrabold text-orange-800 uppercase tracking-wider text-[10px]">SERVICING IN PROGRESS</span>
                    <p className="text-orange-900 font-bold mt-0.5">{m.details || "Scheduled preventative maintenance"}</p>
                  </div>

                  <div className="pt-2 border-t border-orange-200 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-mono font-bold">Work Order: {m.workOrder || "WO-884"}</span>
                    
                    <button
                      type="button"
                      onClick={() => handleCompleteMaintenance(m.id, m.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Remove / Confirm Completed
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDIT MACHINE SCHEDULE & MAINTENANCE MODAL */}
      {editingMachine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#00A8FF]" /> Machine Operational Settings
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Define work hours (Start to End time) & Maintenance date for <strong>{editingMachine.name}</strong>.
              </p>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Work Start Time (Daily)</label>
                <input
                  type="time"
                  value={scheduleForm.workStartTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, workStartTime: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Work End Time (Daily)</label>
                <input
                  type="time"
                  value={scheduleForm.workEndTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, workEndTime: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Next Scheduled Maintenance Date</label>
                <input
                  type="date"
                  value={scheduleForm.nextMaintenanceDate}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, nextMaintenanceDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] p-3 text-slate-900 font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Our system will send warning alerts when this date approaches.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMachine(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-6 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142845] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
                >
                  {savingSchedule && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

