"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  PieChart, 
  CheckCircle2, 
  Zap,
  Building2,
  Loader2
} from "lucide-react";

interface JobProfitItem {
  id: string;
  orderNumber: string;
  companyName: string;
  revenue: number;
  expectedProfit: number;
  minProfit: number;
  maxProfit: number;
  marginPercentage: number;
  confidenceScore: number;
}

export default function JobProfitabilityPage() {
  const [jobs, setJobs] = useState<JobProfitItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfitability = async () => {
      setLoading(true);
      try {
        let factoryId = "";
        const storedFactory = localStorage.getItem("factoryiq_factory");
        if (storedFactory) {
          try {
            factoryId = JSON.parse(storedFactory).id;
          } catch (e) {}
        }

        const url = factoryId ? `/api/profitability?factoryId=${factoryId}` : `/api/profitability`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          setSummary(json.data);
          setJobs(json.data.jobDetails || []);
        } else {
          setJobs([]);
          setSummary(null);
        }
      } catch (err) {
        console.error("Failed to fetch profitability:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfitability();
  }, []);

  const totalRevenue = summary?.totalRevenue || 0;
  const totalProfit = summary?.totalExpectedProfit || 0;
  const avgMargin = summary?.averageProfitMargin || 0;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-8 md:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <PieChart className="h-7 w-7 text-[#00A8FF]" /> Job-Level Profitability & Risk Analytics
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Real-time margin analysis, machine downtime cost allocation & SLA penalty risk
          </p>
        </div>

        <Link
          href="/orders"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1B365D] hover:bg-[#142845] transition shadow-md self-start sm:self-auto"
        >
          View Active Orders <ArrowRight className="h-4 w-4 text-[#00A8FF]" />
        </Link>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-[#00A8FF]">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-xs font-extrabold text-slate-800">Tracked Revenue</div>
          <div className="text-[10px] font-semibold text-slate-500">All Evaluated Orders</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-emerald-600">₹{totalProfit.toLocaleString()}</div>
          <div className="text-xs font-extrabold text-slate-800">Expected Net Profit</div>
          <div className="text-[10px] font-semibold text-emerald-600">After Costs & Overheads</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-sky-600">{avgMargin}%</div>
          <div className="text-xs font-extrabold text-slate-800">Average Profit Margin</div>
          <div className="text-[10px] font-semibold text-sky-600">Weighted Average</div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-1">
          <div className="text-3xl font-black text-[#1B365D]">{jobs.length}</div>
          <div className="text-xs font-extrabold text-slate-800">Jobs Analyzed</div>
          <div className="text-[10px] font-semibold text-[#00A8FF]">Deterministic Calculations</div>
        </div>
      </div>

      {/* Job Cards List or Empty State */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#00A8FF]" /> Computing Profitability Metrics...
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl bg-white p-6 shadow-md border border-slate-200/80 space-y-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-black text-[#00A8FF]">{job.orderNumber}</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{job.companyName}</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">PROFIT MARGIN</span>
                  <span className="text-lg font-black text-emerald-600">{job.marginPercentage}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#F7F9FC] p-3 rounded-2xl border border-slate-200/60 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">REVENUE</span>
                  <span className="text-xs font-black text-slate-900">₹{job.revenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">EXPECTED PROFIT</span>
                  <span className="text-xs font-black text-emerald-600">₹{job.expectedProfit.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">CONFIDENCE</span>
                  <span className="text-xs font-black text-slate-900">{job.confidenceScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center space-y-4 border border-slate-200">
          <div className="inline-flex p-4 rounded-full bg-sky-50 text-[#00A8FF]">
            <PieChart className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">No Job Profitability Data</h3>
            <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto">
              Your factory database has no active orders or jobs configured. Create orders to view job-level profit margins.
            </p>
          </div>
          <Link
            href="/orders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A8FF] text-white text-xs font-black hover:bg-blue-600 transition shadow-sm"
          >
            <Building2 className="h-4 w-4" /> Create New Order
          </Link>
        </div>
      )}

    </div>
  );
}
