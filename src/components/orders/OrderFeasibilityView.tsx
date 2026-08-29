"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { 
  ChevronLeft,
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  XCircle, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp
} from "lucide-react";

export type OrderFeasibilityProps = {
  orderId: string;
  orderNumber: string;
  deterministicResult: any;
  aiExplanation: any;
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function OrderFeasibilityView({
  orderNumber,
  deterministicResult,
  aiExplanation,
}: OrderFeasibilityProps) {
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C">("C");
  const [confirmedOption, setConfirmedOption] = useState<string | null>(null);
  const [show14Params, setShow14Params] = useState(false);

  const { classification, confidenceScore, parameters, options } = deterministicResult;

  // Options configuration matching exact design
  const optionList = [
    {
      key: "A",
      optCode: "OPTION_A",
      title: options.optionA?.title || "Machine 4",
      subTitle: "Completes 25 Aug",
      cost: "No change",
      costHighlight: false,
      confidence: `${options.optionA?.confidenceScore || 86}%`,
      recommended: true,
      buttonText: "Choose this option",
      btnStyle: "bg-[#1E88E5] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20",
      cardBorder: selectedOption === "A" ? "border-2 border-[#1E88E5] shadow-lg shadow-blue-500/10" : "border border-slate-200 hover:border-blue-300",
    },
    {
      key: "B",
      optCode: "OPTION_B",
      title: options.optionB?.title || "Overtime",
      subTitle: "Completes 25 Aug",
      cost: `+₹${(options.optionB?.additionalCost || 4200).toLocaleString()}`,
      costHighlight: true,
      confidence: `${options.optionB?.confidenceScore || 91}%`,
      recommended: false,
      buttonText: "Choose this option",
      btnStyle: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
      cardBorder: selectedOption === "B" ? "border-2 border-[#1E88E5] shadow-lg shadow-blue-500/10" : "border border-slate-200 hover:border-blue-300",
    },
    {
      key: "C",
      optCode: "OPTION_C",
      title: options.optionC?.title || "Normal Queue",
      subTitle: "Completes 27 Aug",
      cost: "No change",
      costHighlight: false,
      confidence: `${options.optionC?.confidenceScore || 95}%`,
      recommended: false,
      buttonText: selectedOption === "C" ? "Selected" : "Choose this option",
      btnStyle: selectedOption === "C" ? "bg-[#0D47A1] text-white shadow-md shadow-blue-900/20" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
      cardBorder: selectedOption === "C" ? "border-2 border-[#0D47A1] shadow-lg shadow-blue-900/10" : "border border-slate-200 hover:border-blue-300",
    },
  ];

  // 8 Breakdown Chips list matching user screenshot
  const breakdownChips = [
    { label: "Raw material", valid: parameters?.materialAvailable ?? true },
    { label: "Usable stock", valid: true },
    { label: "Machine capacity", valid: false, isWarning: true },
    { label: "Manpower", valid: true },
    { label: "Setup time", valid: true },
    { label: "Dispatch window", valid: false, isWarning: true },
    { label: "Estimated cost", valid: true },
    { label: "Profitability", valid: true },
  ];

  const handleConfirmOption = () => {
    const selectedObj = optionList.find(o => o.key === selectedOption);
    setConfirmedOption(selectedObj?.title || selectedOption);
  };

  return (
    <div className="space-y-6 text-[#0F294A] max-w-5xl mx-auto font-sans pb-12">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.history.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-sm text-slate-600 hover:bg-slate-50 transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#0F294A]">
            Order #{orderNumber} — Feasibility Result
          </h1>
          <p className="text-xs font-medium text-slate-500">
            ABC Company · 20,000 Brochures · Deadline 25 Aug
          </p>
        </div>
      </div>

      {/* 2. Main Hero Feasibility Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="rounded-[28px] bg-white border border-slate-100 p-6 md:p-8 shadow-[0_10px_35px_-10px_rgba(15,41,74,0.05)] relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left Column Text & Details */}
          <div className="space-y-3 max-w-2xl">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E6] px-3 py-1 text-xs font-semibold text-[#D97706]">
              <span className="h-2 w-2 rounded-full bg-[#D97706]" />
              {classification === "POSSIBLE_WITH_RISK" ? "Possible with risk" : classification}
            </div>

            {/* Headline */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0D2D52] tracking-tight leading-snug">
              Order can be completed by 25 August if produced on Machine 4.
            </h2>

            {/* Description */}
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Machine 2 is fully booked through Tuesday and the paper delivery lands a day later than the current schedule needs — Machine 4 has an open slot that avoids both problems.
            </p>
          </div>

          {/* Right Column: Donut Progress Meter */}
          <div className="flex flex-col items-center justify-center md:items-end flex-shrink-0">
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#0088F5]"
                  strokeDasharray={`${confidenceScore || 86}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#0D2D52]">{confidenceScore || 86}%</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">Estimated confidence</span>
          </div>
        </div>

        {/* 8 Breakdown Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100/90 mt-6">
          {breakdownChips.map((chip, idx) => (
            <div
              key={idx}
              className={`rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 transition ${
                chip.isWarning
                  ? "bg-[#FFF8EC] border border-amber-200/80 text-slate-800"
                  : "bg-[#F0F6FC] border border-slate-200/40 text-slate-700"
              }`}
            >
              {chip.isWarning ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              ) : (
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              )}
              <span>{chip.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. "Choose how to proceed" Section */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#0D2D52]">Choose how to proceed</h2>
          <p className="text-xs text-slate-500">Each option shows the trade-off — pick one to update the schedule.</p>
        </div>

        {/* Option Cards Container */}
        <div className="relative grid md:grid-cols-3 gap-6 pt-2">
          {/* Horizontal Connecting Dashed Line behind cards */}
          <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] border-t-2 border-dashed border-slate-200 z-0 pointer-events-none" />

          {optionList.map((opt) => (
            <motion.div
              key={opt.key}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedOption(opt.key as "A" | "B" | "C")}
              className={`relative z-10 cursor-pointer rounded-[24px] bg-white p-6 transition-all duration-200 flex flex-col justify-between shadow-sm ${opt.cardBorder}`}
            >
              {/* Optional RECOMMENDED Badge */}
              {opt.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#E3F2FD] text-[#1E88E5] text-[10px] font-extrabold tracking-wider px-3.5 py-1 uppercase shadow-sm">
                    RECOMMENDED
                  </span>
                </div>
              )}

              <div className="space-y-4 text-center pt-2">
                {/* Circle Icon */}
                <div
                  className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm mx-auto transition ${
                    opt.key === "A" && selectedOption === "A"
                      ? "bg-[#1565C0] text-white shadow-md shadow-blue-600/30"
                      : selectedOption === opt.key
                      ? "bg-[#0D47A1] text-white"
                      : "bg-[#E3F2FD] text-[#1565C0]"
                  }`}
                >
                  {opt.key}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0D2D52]">{opt.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.subTitle}</p>
                </div>

                {/* Specs List */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Cost</span>
                    <span className={`font-medium ${opt.costHighlight ? "text-slate-800 font-semibold" : "text-slate-600"}`}>
                      {opt.cost}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Confidence</span>
                    <span className="font-bold text-[#0D2D52]">{opt.confidence}</span>
                  </div>
                </div>
              </div>

              {/* Card Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption(opt.key as "A" | "B" | "C");
                }}
                className={`mt-6 w-full py-2.5 text-xs font-bold rounded-xl transition ${opt.btnStyle}`}
              >
                {selectedOption === opt.key && opt.key === "C" ? "Selected" : "Choose this option"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. Collapsible 14 Operational Parameters Matrix */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
        <button
          onClick={() => setShow14Params(!show14Params)}
          className="w-full flex items-center justify-between text-left font-bold text-sm text-[#0D2D52]"
        >
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#0088F5]" />
            <span>Full 14 Operational Parameters Matrix</span>
          </div>
          {show14Params ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {show14Params && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100"
          >
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">1. Material Availability</span>
              <p className="font-bold text-emerald-600 mt-1">{parameters?.materialAvailable ? "AVAILABLE" : "INSUFFICIENT"}</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">2. Usable Stock</span>
              <p className="font-bold text-slate-800 mt-1">{parameters?.usableStock || 22000} units</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">3. Machine Capacity</span>
              <p className="font-bold text-slate-800 mt-1">{parameters?.machineCapacityHours || 48} hrs</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">4. Existing Commitments</span>
              <p className="font-bold text-slate-800 mt-1">{parameters?.existingCommitmentHours || 16} hrs</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">5. Deadline Margin</span>
              <p className="font-bold text-amber-600 mt-1">{(parameters?.deadlineMarginHours || 14.5).toFixed(1)} hrs safety</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">6. Setup Time</span>
              <p className="font-bold text-slate-800 mt-1">{parameters?.setupTimeMinutes || 45} mins</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">7. Production Time</span>
              <p className="font-bold text-slate-800 mt-1">{(parameters?.productionTimeHours || 18.2).toFixed(1)} hrs</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">8. Wastage Estimate</span>
              <p className="font-bold text-slate-800 mt-1">{parameters?.wastageEstimateUnits || 350} units</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">9. Finishing Capacity</span>
              <p className="font-bold text-emerald-600 mt-1">READY</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">10. Logistics Constraints</span>
              <p className="font-bold text-slate-800 mt-1">UNCONSTRAINED</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">11. Material Cost</span>
              <p className="font-bold text-slate-800 mt-1">₹{Math.round(parameters?.materialCostTotal || 45000).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">12. Labor & Machine Cost</span>
              <p className="font-bold text-slate-800 mt-1">₹{Math.round(parameters?.operationalCostTotal || 18500).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">13. Total Cost</span>
              <p className="font-bold text-slate-800 mt-1">₹{Math.round(parameters?.totalCost || 63500).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-[#F0F6FC] p-3 text-xs">
              <span className="text-slate-500 font-medium">14. Expected Job Profit</span>
              <p className="font-bold text-emerald-600 mt-1">₹{Math.round(parameters?.expectedProfit || 26500).toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 5. AI Explanation Section */}
      {aiExplanation && (
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#0088F5]">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">AI Copilot Natural Language Feasibility Summary</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {aiExplanation.problemSummary || "Machine 2 is fully booked through Tuesday and the paper delivery lands a day later than the current schedule needs."}
          </p>
        </div>
      )}

      {/* 6. Footer Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/60 text-xs">
        <p className="text-slate-500 font-medium text-center sm:text-left">
          Based on <span className="font-semibold text-slate-700">live inventory, machine schedule</span> as of 8:42 AM · Ref <span className="font-bold text-slate-800">#FB-482-3</span>
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => window.history.back()}
            className="w-1/2 sm:w-auto bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 font-semibold rounded-xl shadow-sm transition"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmOption}
            className="w-1/2 sm:w-auto bg-[#1565C0] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
          >
            {confirmedOption ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" /> Confirmed ({confirmedOption})
              </>
            ) : (
              `Confirm ${optionList.find(o => o.key === selectedOption)?.title || "Option"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
