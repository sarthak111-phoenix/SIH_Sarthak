"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Download,
  Printer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Cpu,
  Wrench,
  Users,
  ArrowUpRight,
  Filter,
  RefreshCw
} from "lucide-react";

interface ReportData {
  preset: string;
  period: {
    startDate: string;
    endDate: string;
    daysCount: number;
  };
  executiveSummary: {
    totalRevenue: number;
    netProfit: number;
    netMarginPercent: string;
    totalUnitsProduced: number;
    totalOrdersCount: number;
    completedOrdersCount: number;
    inProgressOrdersCount: number;
    overallUptimePercent: number;
    totalMaintenanceExpenses: number;
    completedMaintenanceCount: number;
    activeWorkersCount: number;
  };
  financials: {
    revenue: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    maintenanceCost: number;
    netProfit: number;
    margin: string;
  };
  machineSummary: {
    totalMachines: number;
    runningCount: number;
    idleCount: number;
    downCount: number;
    avgOee: string;
    machines: Array<{
      id: string;
      code: string;
      name: string;
      status: string;
      workHours: string;
      nextMaintenance: string;
    }>;
  };
  maintenanceLog: Array<{
    id: string;
    machineName: string;
    type: string;
    scheduledDate: string;
    completedDate: string;
    cost: number;
    notes: string;
  }>;
  timeline: Array<{
    date: string;
    fullDate: string;
    unitsProduced: number;
    revenue: number;
    uptimePercentage: number;
  }>;
}

export default function ReportsPage() {
  const [preset, setPreset] = useState<"day" | "week" | "month" | "custom">("week");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateError, setDateError] = useState<string | null>(null);
  
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const formattedEnd = today.toISOString().split("T")[0];
    const past7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const formattedStart = past7Days.toISOString().split("T")[0];

    setEndDate(formattedEnd);
    setStartDate(formattedStart);
  }, []);

  // Fetch report whenever preset or submitted custom dates change
  const fetchReport = async (
    targetPreset: "day" | "week" | "month" | "custom" = preset,
    sDate: string = startDate,
    eDate: string = endDate
  ) => {
    setDateError(null);

    // Validate 45 day limit for custom range
    if (targetPreset === "custom") {
      if (!sDate || !eDate) {
        setDateError("Please select both Start Date and End Date for custom report.");
        return;
      }
      const s = new Date(sDate);
      const e = new Date(eDate);
      if (s > e) {
        setDateError("Start Date cannot be after End Date.");
        return;
      }
      const diffMs = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 45) {
        setDateError(`Custom date range cannot exceed 45 days (selected: ${diffDays} days). Please select a range within 45 days.`);
        return;
      }
    }

    setLoading(true);
    try {
      let url = `/api/reports?preset=${targetPreset}`;
      if (targetPreset === "custom") {
        url += `&startDate=${sDate}&endDate=${eDate}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        setReport(json.data);
      } else {
        setDateError(json.error?.message || "Failed to load report data.");
      }
    } catch (err) {
      console.error("Error loading report:", err);
      setDateError("Network error while generating report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (preset !== "custom") {
      fetchReport(preset);
    }
  }, [preset]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport("custom", startDate, endDate);
  };

  // CSV Export Generator
  const exportCSV = () => {
    if (!report) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `FACTORYIQ OPERATIONAL & FINANCIAL REPORT\n`;
    csvContent += `Period Preset,${report.preset}\n`;
    csvContent += `Date Range,${report.period.startDate} to ${report.period.endDate} (${report.period.daysCount} days)\n\n`;

    csvContent += `EXECUTIVE SUMMARY\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Total Revenue,₹${report.executiveSummary.totalRevenue}\n`;
    csvContent += `Net Operating Profit,₹${report.executiveSummary.netProfit}\n`;
    csvContent += `Net Margin %,${report.executiveSummary.netMarginPercent}%\n`;
    csvContent += `Total Units Produced,${report.executiveSummary.totalUnitsProduced}\n`;
    csvContent += `Machine Uptime %,${report.executiveSummary.overallUptimePercent}%\n`;
    csvContent += `Maintenance Expenses,₹${report.executiveSummary.totalMaintenanceExpenses}\n\n`;

    csvContent += `DAILY TIMELINE TREND\n`;
    csvContent += `Date,Units Produced,Revenue (INR),Uptime %\n`;
    report.timeline.forEach((row) => {
      csvContent += `${row.fullDate},${row.unitsProduced},${row.revenue},${row.uptimePercentage}%\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FactoryIQ_Report_${report.period.startDate}_to_${report.period.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] text-xs font-black uppercase tracking-wider">
              Owner Reports Hub
            </span>
            <span className="text-xs font-semibold text-slate-400">Max 45-Day Custom Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 mt-1">
            <FileText className="h-7 w-7 text-[#00A8FF]" /> Operational & Financial Performance Report
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCSV}
            disabled={!report || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition shadow-xs disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-[#00A8FF]" /> Export CSV
          </button>

          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#09172A] hover:bg-[#102440] dark:bg-[#00A8FF] dark:hover:bg-sky-500 transition shadow-md"
          >
            <Printer className="h-4 w-4" /> Print Report
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS: Day, Week, Month, Custom */}
      <div className="rounded-3xl bg-white dark:bg-[#0B172B] p-5 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPreset("day")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                preset === "day"
                  ? "bg-white dark:bg-[#00A8FF] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Today (Day)
            </button>

            <button
              type="button"
              onClick={() => setPreset("week")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                preset === "week"
                  ? "bg-white dark:bg-[#00A8FF] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              This Week (7 Days)
            </button>

            <button
              type="button"
              onClick={() => setPreset("month")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                preset === "month"
                  ? "bg-white dark:bg-[#00A8FF] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              This Month (30 Days)
            </button>

            <button
              type="button"
              onClick={() => setPreset("custom")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                preset === "custom"
                  ? "bg-white dark:bg-[#00A8FF] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Custom Range (Max 45 Days)
            </button>
          </div>

          {/* Date Summary Badge */}
          {report && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <Calendar className="h-4 w-4 text-[#00A8FF]" />
              <span>Reporting Range: <strong className="text-slate-900 dark:text-white">{report.period.startDate}</strong> to <strong className="text-slate-900 dark:text-white">{report.period.endDate}</strong> ({report.period.daysCount} days)</span>
            </div>
          )}
        </div>

        {/* Custom Date Form (Shown only when preset === 'custom') */}
        {preset === "custom" && (
          <form onSubmit={handleCustomSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#00A8FF] hover:bg-sky-500 transition shadow-sm flex items-center gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" /> Generate Custom Report
            </button>
          </form>
        )}

        {/* Validation Warning Alert for Custom Range */}
        {dateError && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* REPORT CONTENT BODY */}
      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-[#0B172B] p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00A8FF] mx-auto" />
          <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Compiling Operational & Financial Data...</div>
          <div className="text-xs text-slate-400">Filtering factory telemetry for the selected period</div>
        </div>
      ) : report ? (
        <div className="space-y-6">

          {/* 1. EXECUTIVE SCORECARD MATRIX */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#0B172B] p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Revenue</div>
              <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                ₹{report.executiveSummary.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" /> {report.executiveSummary.netMarginPercent}% Net Margin
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0B172B] p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Net Operating Profit</div>
              <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{report.executiveSummary.netProfit.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-slate-500">After BOM & Maintenance</div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0B172B] p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Production Output</div>
              <div className="text-2xl md:text-3xl font-black text-[#00A8FF]">
                {report.executiveSummary.totalUnitsProduced.toLocaleString()} <span className="text-sm font-bold text-slate-400">pcs</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                Across {report.executiveSummary.totalOrdersCount} active orders
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#0B172B] p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Machine Uptime Rate</div>
              <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                {report.executiveSummary.overallUptimePercent}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500">
                OEE Avg: {report.machineSummary.avgOee}
              </div>
            </div>
          </div>

          {/* 2. FINANCIAL & COST STRUCTURE BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#0B172B] p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" /> Financial Cost Allocation
                </h2>
                <span className="text-xs font-bold text-slate-400">INR (₹)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 block">Raw Material Cost (BOM)</span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100">
                    ₹{report.financials.materialCost.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 block">Labor & Wages</span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100">
                    ₹{report.financials.laborCost.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 block">Maintenance Expenses</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400">
                    ₹{report.financials.maintenanceCost.toLocaleString()}
                  </span>
                </div>

                <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Net Profit Margin</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {report.financials.margin}
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Expense & Margin Composition</span>
                  <span>100% Revenue</span>
                </div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-sky-500 h-full" style={{ width: "45%" }} title="Material (45%)" />
                  <div className="bg-amber-500 h-full" style={{ width: "18%" }} title="Labor (18%)" />
                  <div className="bg-rose-500 h-full" style={{ width: "10%" }} title="Maintenance (10%)" />
                  <div className="bg-emerald-500 h-full" style={{ width: "27%" }} title="Net Margin (27%)" />
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Material (45%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Labor (18%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Maintenance & Overhead</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Net Profit</span>
                </div>
              </div>
            </div>

            {/* MACHINE STATUS SCORECARD */}
            <div className="rounded-3xl bg-white dark:bg-[#0B172B] p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-[#00A8FF]" /> Machine Availability
                </h2>
                <span className="text-xs font-bold text-slate-400">{report.machineSummary.totalMachines} Total</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active Running
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {report.machineSummary.runningCount} Machines
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Idle / Available
                  </span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                    {report.machineSummary.idleCount} Machines
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Maintenance / Breakdown
                  </span>
                  <span className="text-sm font-black text-rose-700 dark:text-rose-400">
                    {report.machineSummary.downCount} Machine
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MACHINE TELEMETRY & SHIFT WINDOW AUDIT */}
          <div className="rounded-3xl bg-white dark:bg-[#0B172B] p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> Machine Operational Schedule & Servicing Audit
              </h2>
              <span className="text-xs font-bold text-slate-400">Configured Operating Windows</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black tracking-wider">
                  <tr>
                    <th className="pb-3">Machine Code</th>
                    <th className="pb-3">Machine Name</th>
                    <th className="pb-3">Shift Operating Hours</th>
                    <th className="pb-3">Next Scheduled Servicing</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {report.machineSummary.machines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3.5 font-black text-slate-900 dark:text-white">{m.code}</td>
                      <td className="py-3.5 font-bold text-slate-700 dark:text-slate-300">{m.name}</td>
                      <td className="py-3.5 font-semibold text-slate-600 dark:text-slate-400">
                        {m.workHours}
                      </td>
                      <td className="py-3.5 font-bold text-[#00A8FF]">
                        {m.nextMaintenance}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          m.status === "RUNNING" || m.status === "Running"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : m.status === "DOWN_BREAKDOWN" || m.status === "Breakdown"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                            : m.status === "DOWN_MAINTENANCE" || m.status === "Maintenance"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. DAILY PERFORMANCE TREND TIMELINE TABLE */}
          <div className="rounded-3xl bg-white dark:bg-[#0B172B] p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Daily Production & Revenue Breakdown ({report.timeline.length} Days)
              </h2>
              <span className="text-xs font-bold text-slate-400">Aggregated Output</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black tracking-wider">
                  <tr>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Units Produced</th>
                    <th className="pb-3">Estimated Daily Revenue</th>
                    <th className="pb-3 text-right">Floor Uptime %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {report.timeline.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      <td className="py-3 font-extrabold text-slate-900 dark:text-white">{row.fullDate} ({row.date})</td>
                      <td className="py-3 font-black text-[#00A8FF]">{row.unitsProduced.toLocaleString()} pcs</td>
                      <td className="py-3 font-extrabold text-slate-900 dark:text-slate-200">₹{row.revenue.toLocaleString()}</td>
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">{row.uptimePercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
