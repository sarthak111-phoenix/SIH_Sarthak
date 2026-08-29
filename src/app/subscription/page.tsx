"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Lock, 
  Building2, 
  CreditCard,
  Sparkles,
  ArrowLeft
} from "lucide-react";

const PLAN_DETAILS: Record<string, { name: string; price: string; period: string; subtitle: string; features: string[]; popular?: boolean }> = {
  starter: {
    name: "STARTER PLAN",
    price: "₹3,999",
    period: "per month",
    subtitle: "Ideal for small machine workshops and job work units.",
    features: [
      "Up to 5 Machines monitored in real-time",
      "Up to 25 Workers on floor terminal",
      "Core AI Alerts & Order Progress Tracker",
      "WhatsApp Notification Integration",
      "Standard Email & Phone Support"
    ],
  },
  growth: {
    name: "GROWTH PLAN",
    price: "₹9,999",
    period: "per month",
    subtitle: "For Tier 2 & Tier 3 Automotive & Aerospace vendors.",
    popular: true,
    features: [
      "Up to 25 Machines monitored in real-time",
      "Unlimited Workers on floor terminal",
      "AI Daily Briefing & Penalty Risk Prediction (₹64k risk alerts)",
      "Predictive Maintenance & Work Order Dispatch",
      "Dedicated AI Decision Copilot",
      "Deterministic Job Profitability Engine"
    ],
  },
  enterprise: {
    name: "ENTERPRISE PLAN",
    price: "Custom",
    period: "tailored pricing",
    subtitle: "Multi-unit manufacturing clusters and enterprise plants.",
    features: [
      "Unlimited Machines & Multi-Plant Facilities",
      "Multi-Tenant Isolation & Custom API Access",
      "On-Premise / Hybrid Cloud Deployment",
      "Dedicated 24/7 Account Manager & SLA Support",
      "Custom ERP Integrations (SAP, Tally, Oracle)"
    ],
  },
};

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = (searchParams.get("plan") || "growth").toLowerCase();

  const [planKey, setPlanKey] = useState<string>(PLAN_DETAILS[planParam] ? planParam : "growth");
  const [gstNumber, setGstNumber] = useState("27AABCU9603R1ZM");
  const [factoryName, setFactoryName] = useState("Rajesh Industries Pvt. Ltd.");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication state
    const authCookie = typeof document !== "undefined" && document.cookie.includes("factoryiq_authenticated=true");
    const authStorage = typeof window !== "undefined" && localStorage.getItem("factoryiq_authenticated") === "true";

    if (!authCookie && !authStorage) {
      // Not authenticated -> redirect to sign-in page with redirect back to subscription
      const targetUrl = `/subscription?plan=${planKey}`;
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}&reason=auth_required`);
    } else {
      setIsAuthenticated(true);
      // Load user factory name if available
      if (typeof window !== "undefined") {
        const storedFac = localStorage.getItem("factoryiq_factory");
        if (storedFac) {
          try {
            const fac = JSON.parse(storedFac);
            if (fac.name) setFactoryName(fac.name);
          } catch (e) {}
        }
      }
    }
  }, [router, planKey]);

  const selectedPlan = PLAN_DETAILS[planKey] || PLAN_DETAILS.growth;

  const handleConfirmSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "factoryiq_subscription",
          JSON.stringify({
            plan: selectedPlan.name,
            planKey,
            billingCycle,
            activatedAt: new Date().toISOString(),
            status: "ACTIVE_TRIAL",
          })
        );
      }
      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }, 1000);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center text-slate-300 font-bold text-xs">
        <Loader2 className="h-6 w-6 text-[#00A8FF] animate-spin mr-2" /> Checking sign-in status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071324] text-white font-sans overflow-x-hidden relative py-12 px-4 sm:px-6">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0088FF]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Landing Page
        </Link>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-[#0B2342] px-4 py-1.5 text-xs font-extrabold text-[#00A8FF]">
            <Sparkles className="h-3.5 w-3.5" /> 14-Day Risk-Free Trial · No Immediate Charge
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Complete Your FactoryIQ Subscription
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto">
            Logged in as <span className="text-white font-bold">{factoryName}</span>. Choose your plan options below to activate your account.
          </p>
        </div>

        {/* Main Grid: Plan Selector & Checkout Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          
          {/* Plan Options Selector (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Select Plan</h2>

            {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setPlanKey(key)}
                className={`rounded-2xl p-5 border transition cursor-pointer relative ${
                  planKey === key
                    ? "bg-[#0E2647] border-[#00A8FF] shadow-lg shadow-sky-500/20"
                    : "bg-[#0A1A2F] border-slate-800 hover:border-slate-700 opacity-80"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-4 bg-[#00A8FF] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
                    POPULAR
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${planKey === key ? "text-[#00A8FF]" : "text-slate-300"}`}>
                    {plan.name}
                  </span>
                  <div className="text-right">
                    <span className="text-base font-black text-white">{plan.price}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">{plan.period}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
                  {plan.subtitle}
                </p>
              </div>
            ))}

            {/* Included Features Card */}
            <div className="rounded-2xl bg-[#091B33] border border-slate-800 p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                WHAT'S INCLUDED IN {selectedPlan.name}
              </span>
              <div className="space-y-2 text-xs font-semibold text-slate-300 pt-1">
                {selectedPlan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00A8FF] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Card (7 cols) */}
          <div className="md:col-span-7">
            <div className="rounded-3xl bg-[#0A1A2F] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
              
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Subscription Summary</h3>
                  <p className="text-xs text-slate-400 font-medium">Verified Sign-In Session Active</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" /> Signed In
                </div>
              </div>

              {success ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h4 className="text-xl font-black text-white">Subscription Activated!</h4>
                  <p className="text-xs text-slate-300 font-medium">
                    Your 14-day free trial for {selectedPlan.name} is now active. Directing to your FactoryIQ dashboard...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmSubscription} className="space-y-5">
                  
                  {/* Billing Cycle Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Billing Cycle</label>
                    <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-[#071324] border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`py-2 text-xs font-bold rounded-lg transition ${
                          billingCycle === "monthly" ? "bg-[#00A8FF] text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Monthly Billing
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("annual")}
                        className={`py-2 text-xs font-bold rounded-lg transition ${
                          billingCycle === "annual" ? "bg-[#00A8FF] text-white" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Annual (Save 20%)
                      </button>
                    </div>
                  </div>

                  {/* Factory Name Input */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Factory Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={factoryName}
                        onChange={(e) => setFactoryName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-[#071324] pl-10 pr-4 py-2.5 text-xs text-white font-semibold focus:border-[#00A8FF] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* GSTIN / Tax ID */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">GSTIN / Tax ID (Optional)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="27AABCU9603R1ZM"
                        className="w-full rounded-xl border border-slate-700 bg-[#071324] pl-10 pr-4 py-2.5 text-xs text-white font-semibold focus:border-[#00A8FF] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="rounded-2xl bg-[#071324] border border-slate-800 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Selected Plan:</span>
                      <span className="text-white font-bold">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>14-Day Trial Price:</span>
                      <span className="text-emerald-400 font-extrabold">₹0 (Free Trial)</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800 font-bold">
                      <span className="text-white">Amount Due Today:</span>
                      <span className="text-[#00A8FF] text-sm">₹0.00</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00A8FF] hover:bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-sky-500/25 transition cursor-pointer active:scale-98"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Confirm & Start 14-Day Free Subscription <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center font-medium">
                    🔒 SSL Encrypted · You can upgrade or cancel anytime from your settings.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071324] flex items-center justify-center text-slate-300 font-bold text-xs">
          Loading Subscription Gateway...
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
