"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, Loader2, ArrowRight } from "lucide-react";

export type ApprovalCardProps = {
  approvalId: string;
  taskId: string;
  actionSummary: string;
  reason: string;
  expectedResult: string;
  impact: string;
  riskLevel: number;
  onApproved?: (task: any) => void;
  onRejected?: (task: any) => void;
};

export function ApprovalCard({
  approvalId,
  taskId,
  actionSummary,
  reason,
  expectedResult,
  impact,
  riskLevel,
  onApproved,
  onRejected,
}: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, approvalId, action }),
      });
      const data = await res.json();
      if (data.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("factory-data-updated"));
        }
        if (action === "APPROVE") {
          setStatus("APPROVED");
          if (onApproved) onApproved(data.task);
        } else {
          setStatus("REJECTED");
          if (onRejected) onRejected(data.task);
        }
      }
    } catch (err) {
      console.error("Approval action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "APPROVED") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 space-y-2 animate-fadeIn">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>Action Approved & Verified</span>
        </div>
        <p className="text-xs font-semibold">{actionSummary} — Execution verified deterministically.</p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-800 dark:text-rose-300 space-y-2 animate-fadeIn">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide">
          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
          <span>Action Rejected by Owner</span>
        </div>
        <p className="text-xs font-semibold">{actionSummary} — Production schedule remains unchanged.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-50/90 dark:bg-amber-950/40 p-4 space-y-3.5 shadow-md">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
            {riskLevel === 3 ? "HIGH-RISK FINANCIAL APPROVAL REQUIRED" : "OWNER APPROVAL REQUIRED"}
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
          Risk Level {riskLevel}
        </span>
      </div>

      {/* Main Action Title */}
      <div className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
        {actionSummary}
      </div>

      {/* Details Grid */}
      <div className="space-y-2 text-xs">
        <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
          <span className="font-extrabold text-amber-900 dark:text-amber-400 block text-[10px] uppercase">
            WHY THIS ACTION IS RECOMMENDED
          </span>
          <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{reason}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
            <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block text-[10px] uppercase">
              EXPECTED RESULT
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{expectedResult}</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
            <span className="font-extrabold text-sky-800 dark:text-sky-400 block text-[10px] uppercase">
              OPERATIONAL IMPACT
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{impact}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("REJECT")}
          className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          Reject Action
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("APPROVE")}
          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
          ) : (
            <>
              Approve & Execute <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
