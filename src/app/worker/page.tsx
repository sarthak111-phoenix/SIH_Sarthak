"use client";

import { useState } from "react";
import { Play, AlertTriangle, QrCode, Mic, CheckCircle2 } from "lucide-react";

export default function WorkerPage() {
  const [jobStatus, setJobStatus] = useState<"Running" | "Paused">("Running");
  const [pcsCount, setPcsCount] = useState(127);

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 flex flex-col items-center justify-center font-sans">
      
      {/* Title */}
      <h1 className="text-xl font-black text-slate-800 mb-6">Worker Mobile View</h1>

      {/* iPhone / Mobile Phone Mockup Frame (Exact Screencast 00:50 - 00:54) */}
      <div className="w-full max-w-[380px] bg-[#0A1828] text-white rounded-[44px] p-4 shadow-2xl shadow-slate-900/30 border-[8px] border-[#182B42] relative overflow-hidden">
        
        {/* Mobile Status Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[11px] font-bold text-slate-400">
          <span>09:41 AM</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-300">Shift A</span>
        </div>

        {/* Inner App Canvas */}
        <div className="bg-[#EFF4FA] text-slate-900 rounded-[32px] p-5 space-y-5 shadow-inner min-h-[580px] flex flex-col justify-between">
          
          {/* Top User Info */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged in as</div>
            <div className="text-base font-black text-slate-900 leading-tight">Ramesh Kumar</div>
            <div className="text-xs font-semibold text-slate-500">Machine Operator — Machine M-01</div>
          </div>

          {/* CURRENT JOB Card */}
          <div className="rounded-3xl bg-white p-5 shadow-md border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">CURRENT JOB</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Running
              </span>
            </div>

            <div>
              <div className="text-lg font-black text-slate-900">Order #127</div>
              <div className="text-xs font-bold text-slate-700">Gear Housing Assembly</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Customer: Tata Motors Ltd.</div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Progress</span>
                <span className="text-slate-900 font-extrabold">{pcsCount} / 588 pcs</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.round((pcsCount/588)*100)}%` }} />
              </div>
              <div className="text-[10px] font-bold text-emerald-600 text-right">On Track · Target: 500 pcs by 2:30 PM</div>
            </div>
          </div>

          {/* QUICK ACTIONS SECTION */}
          <div className="space-y-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">QUICK ACTIONS</div>

            {/* Big Green Start Jobs Button */}
            <button
              type="button"
              onClick={() => setPcsCount(pcsCount + 10)}
              className="w-full rounded-2xl bg-[#00C853] hover:bg-[#00E676] py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Play className="h-5 w-5 fill-current" /> Start Jobs
            </button>

            {/* Two Outline Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => alert("Problem reported to floor supervisor.")}
                className="rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 p-3 text-xs font-extrabold text-rose-700 shadow-xs flex items-center justify-center gap-2 transition"
              >
                <AlertTriangle className="h-4 w-4 text-rose-600" /> Report Problems
              </button>

              <button
                type="button"
                onClick={() => alert("QR Scanner launched.")}
                className="rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 p-3 text-xs font-extrabold text-slate-800 shadow-xs flex items-center justify-center gap-2 transition"
              >
                <QrCode className="h-4 w-4 text-slate-600" /> Scan QR
              </button>
            </div>

            {/* Bottom Cyan Pill Voice Button */}
            <button
              type="button"
              onClick={() => alert("Listening for voice input in Hindi/English...")}
              className="w-full rounded-2xl bg-white border border-sky-300 hover:bg-sky-50 py-3 text-xs font-extrabold text-[#00A8FF] shadow-xs flex items-center justify-center gap-2 transition"
            >
              <Mic className="h-4 w-4 text-[#00A8FF]" /> Voice Input (Hindi / English)
            </button>
          </div>

        </div>
      </div>

      <p className="text-xs font-bold text-slate-400 mt-4">Worker mobile interface preview</p>
    </div>
  );
}
