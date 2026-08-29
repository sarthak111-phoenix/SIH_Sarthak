"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ChevronRight
} from "lucide-react";
import { ApprovalCard } from "./ApprovalCard";

export function TaskCenterView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load agent tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING_APPROVAL") return t.status === "WAITING_FOR_APPROVAL";
    return t.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </span>
        );
      case "WAITING_FOR_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase animate-pulse">
            <Clock className="h-3 w-3" /> Pending Approval
          </span>
        );
      case "EXECUTING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase">
            <RefreshCw className="h-3 w-3 animate-spin" /> Executing
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 text-[10px] font-black uppercase">
            <XCircle className="h-3 w-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0A1628] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#00A8FF]" /> Agent Task Center
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Audit log of autonomous operational plans, permission requests, and deterministic verifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PENDING_APPROVAL", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                filterStatus === st
                  ? "bg-[#00A8FF] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
          <button
            type="button"
            onClick={loadTasks}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
          Loading active agent tasks and audit records...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0A1628] p-8 space-y-2">
          <Layers className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-sm font-black text-slate-700 dark:text-slate-300">No agent tasks match this filter</p>
          <p className="text-xs text-slate-500">Ask the Factory Operations Agent a question to generate operational tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((t) => (
            <div
              key={t.taskId}
              className="bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    ID: {t.taskId.slice(0, 12)}...
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    INTENT: {t.intent}
                  </span>
                </div>
                {getStatusBadge(t.status)}
              </div>

              <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                "{t.userRequest}"
              </div>

              {/* Execution Plan Steps */}
              {t.planSteps && t.planSteps.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Plan:</span>
                  {t.planSteps.map((s: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Response Summary */}
              {t.response && (
                <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed space-y-1">
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">{t.response.result}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{t.response.why}</p>
                </div>
              )}

              {/* Interactive Approval Request if Pending */}
              {t.pendingApproval && t.status === "WAITING_FOR_APPROVAL" && (
                <div className="pt-2">
                  <ApprovalCard
                    approvalId={t.pendingApproval.approvalId}
                    taskId={t.taskId}
                    actionSummary={t.pendingApproval.actionSummary}
                    reason={t.pendingApproval.reason}
                    expectedResult={t.pendingApproval.expectedResult}
                    impact={t.pendingApproval.impact}
                    riskLevel={t.pendingApproval.riskLevel}
                    onApproved={loadTasks}
                    onRejected={loadTasks}
                  />
                </div>
              )}

              {/* Verification Record */}
              {t.verification && t.verification.verified && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Verified: {t.verification.summary}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
