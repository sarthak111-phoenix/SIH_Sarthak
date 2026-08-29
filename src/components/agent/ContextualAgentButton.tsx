"use client";

import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { ApprovalCard } from "./ApprovalCard";

export type ContextualAgentButtonProps = {
  promptText: string;
  buttonLabel?: string;
  variant?: "primary" | "secondary" | "outline" | "compact";
  contextEntity?: { type: "Order" | "Machine" | "Material"; id: string; name?: string };
};

export function ContextualAgentButton({
  promptText,
  buttonLabel,
  variant = "primary",
  contextEntity,
}: ContextualAgentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    setShowModal(true);
    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: promptText }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data.data);
      }
    } catch (err) {
      console.error("Contextual agent call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case "compact":
        return "px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-extrabold text-xs hover:border-[#00A8FF]";
      case "outline":
        return "px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs hover:border-[#00A8FF]";
      case "secondary":
        return "px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-xs hover:bg-slate-800";
      case "primary":
      default:
        return "px-4 py-2.5 rounded-xl bg-[#00A8FF] hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-sky-500/20";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleTrigger}
        className={`flex items-center gap-2 transition active:scale-98 ${getButtonClass()}`}
      >
        <Bot className="h-4 w-4 text-[#00A8FF]" />
        <span>{buttonLabel || `Ask Agent: "${promptText}"`}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-[#00A8FF]" />
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                  Agent Telemetry Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center space-y-2 text-sky-500 font-bold text-xs">
                <Sparkles className="h-6 w-6 animate-spin mx-auto text-[#00A8FF]" />
                <p>Executing deterministic inspection for: "{promptText}"...</p>
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="whitespace-pre-wrap text-xs leading-relaxed font-medium bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {response.answer}
                </div>

                {response.pendingApproval && (
                  <ApprovalCard
                    approvalId={response.pendingApproval.approvalId}
                    taskId={response.taskId}
                    actionSummary={response.pendingApproval.actionSummary}
                    reason={response.pendingApproval.reason}
                    expectedResult={response.pendingApproval.expectedResult}
                    impact={response.pendingApproval.impact}
                    riskLevel={response.pendingApproval.riskLevel}
                    onApproved={() => setShowModal(false)}
                  />
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
