"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  FileText, 
  Cpu, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  Loader2,
  PlusCircle,
  Sparkles,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardData {
  factory: {
    id: string;
    name: string;
    code: string;
    status: string;
  } | null;
  metrics: {
    factoryHealth: string;
    healthStatus: string;
    ordersOnTrack: string;
    ordersAtRisk: string;
    machinesRunning: string;
    machineStatusSummary: string;
    materialAlerts: number;
    materialAlertsSummary: string;
    todayDispatches: string;
    pendingPickup: string;
    criticalAlerts: number;
    criticalAlertsSummary: string;
  };
  aiBriefing: {
    title: string;
    message: string;
    actionRequired: boolean;
  } | null;
  workersCount: number;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [userName, setUserName] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Read logged in user info
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("factoryiq_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) setUserName(parsed.name.split(" ")[0]);
        } catch (e) {}
      }
    }

    // Fetch live dashboard metrics
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (json.success) {
          setDashboardData(json.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const greetingName = userName ? `, ${userName}` : "";
  const factory = dashboardData?.factory;
  const metrics = dashboardData?.metrics;
  const workersCount = dashboardData?.workersCount || 0;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Top Header & Greeting Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {t("greeting", `Good morning${greetingName} 👋`)}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {factory
              ? `${factory.name} · ${workersCount} active workers on floor`
              : "Welcome to FactoryIQ · Fresh Account Setup Required"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/onboarding"
            className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-extrabold text-slate-700 shadow-xs transition"
          >
            <Building2 className="h-4 w-4 text-[#00A8FF]" />
            <span>Factory Setup</span>
          </Link>

          <Link
            href="/orders/new"
            className="flex items-center gap-2 rounded-xl bg-[#00A8FF] hover:bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-sky-500/20 transition active:scale-95"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>{t("checkFeasibilityBtn", "Check Order Feasibility")}</span>
          </Link>
        </div>
      </div>

      {/* Fresh Account Setup Banner (Shown if no factory exists yet) */}
      {!factory && !loading && (
        <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-blue-700 text-white p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Fresh Account Ready
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Set Up Your Factory Operations</h2>
            <p className="text-sm font-medium text-sky-100 max-w-xl">
              Add your machines, raw materials, shift schedules, and worker rosters to start tracking real-time production analytics.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-sky-50 font-black text-sm shadow-lg shrink-0 flex items-center gap-2 transition"
          >
            <PlusCircle className="h-5 w-5 text-[#00A8FF]" /> Complete Onboarding Now
          </Link>
        </div>
      )}

      {/* 6 Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
        {/* Card 1: Factory Health */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{metrics?.factoryHealth || "100/100"}</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{t("factoryHealth", "Factory Health")}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{metrics?.healthStatus || "Optimal — Clean System"}</div>
          </div>
        </div>

        {/* Card 2: Orders On Track */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{metrics?.ordersOnTrack || "0 / 0"}</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{t("ordersOnTrack", "Orders On Track")}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{metrics?.ordersAtRisk || "0 at risk"}</div>
          </div>
        </div>

        {/* Card 3: Machines Running */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{metrics?.machinesRunning || "0 / 0"}</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{t("machinesRunning", "Machines Running")}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{metrics?.machineStatusSummary || "No machines configured"}</div>
          </div>
        </div>

        {/* Card 4: Material Alerts */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{metrics?.materialAlerts || 0}</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{t("materialAlerts", "Material Alerts")}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{metrics?.materialAlertsSummary || "No material shortages"}</div>
          </div>
        </div>

        {/* Card 5: Today Dispatches */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{metrics?.todayDispatches || "0 / 0"}</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{t("todayDispatches", "Today Dispatches")}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{metrics?.pendingPickup || "0 pending pickup"}</div>
          </div>
        </div>

        {/* Card 6: Critical Alerts */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-slate-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{metrics?.criticalAlerts || 0}</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">{t("criticalAlerts", "Critical Alerts")}</div>
            <div className="text-xs font-semibold text-slate-400 mt-0.5">{metrics?.criticalAlertsSummary || "All systems normal"}</div>
          </div>
        </div>
      </div>

      {/* AI DAILY BRIEFING HERO BANNER */}
      <div className="rounded-3xl bg-[#0F2647] text-white p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[#133A6B] px-3.5 py-1 text-xs font-extrabold text-[#00A8FF]">
              <Zap className="h-3.5 w-3.5 fill-current" /> {t("aiDailyBriefing", "AI Operations Briefing")}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Real-time status</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="rounded-xl bg-[#00A8FF] hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5"
            >
              {t("viewDetails", "View Details")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Priority Title */}
        {dashboardData?.aiBriefing ? (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
              {dashboardData.aiBriefing.title}
            </h2>

            <div className="rounded-2xl bg-[#0B1E38] border border-[#18487A] p-4 text-xs space-y-1">
              <span className="font-extrabold text-[#00A8FF] uppercase tracking-wider text-[10px]">AI Action Recommendation</span>
              <p className="text-slate-300 font-medium leading-relaxed">
                {dashboardData.aiBriefing.message}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-white">All Operations Running Smoothly</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No active bottlenecks, overdue maintenance, or critical order delays detected.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
