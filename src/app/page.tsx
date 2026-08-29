"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Wrench, 
  Users,
  Check,
  Building2,
  Clock,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleProtectedNavigation = (e: React.MouseEvent, targetPath: string) => {
    e.preventDefault();
    const authCookie = typeof document !== "undefined" && document.cookie.includes("factoryiq_authenticated=true");
    const authStorage = typeof window !== "undefined" && localStorage.getItem("factoryiq_authenticated") === "true";

    if (authCookie || authStorage) {
      router.push(targetPath);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}&reason=auth_required`);
    }
  };

  const handlePlanClick = (e: React.MouseEvent, planKey: string) => {
    e.preventDefault();
    const authCookie = typeof document !== "undefined" && document.cookie.includes("factoryiq_authenticated=true");
    const authStorage = typeof window !== "undefined" && localStorage.getItem("factoryiq_authenticated") === "true";

    const targetUrl = `/subscription?plan=${planKey}`;

    if (authCookie || authStorage) {
      router.push(targetUrl);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}&reason=auth_required`);
    }
  };

  return (
    <div className="min-h-screen bg-[#071324] text-white font-sans overflow-x-hidden relative scroll-smooth">
      {/* Aurora Gradient Mesh Background (#90D5FF, #57B9FF, #77B1D4, #517891) */}
      <div className="absolute inset-0 bg-[radial-gradient(#517891_1px,transparent_1px)] [background-size:32px_32px] opacity-35 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#57B9FF]/15 via-[#90D5FF]/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Header Navigation (Glassmorphism & Fluent Translucency) */}
      <header className="sticky top-0 z-50 border-b border-[#77B1D4]/30 bg-[#071324]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-black text-xl text-white tracking-tight group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#57B9FF] text-slate-950 shadow-lg shadow-sky-500/40 group-hover:scale-105 transition transform">
              <Zap className="h-5 w-5 fill-current text-slate-950" />
            </div>
            <span className="bg-gradient-to-r from-[#90D5FF] via-[#57B9FF] to-white bg-clip-text text-transparent">FactoryIQ</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
            <a href="#features" className="hover:text-[#57B9FF] transition">{t("features", "Features")}</a>
            <a href="#how-it-works" className="hover:text-[#57B9FF] transition">{t("howItWorks", "How It Works")}</a>
            <a href="#pricing" className="hover:text-[#57B9FF] transition">{t("pricing", "Pricing")}</a>
            <a href="#case-studies" className="hover:text-[#57B9FF] transition">Case Studies</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <LanguageSelector variant="dark" />
            <Link
              href="/login"
              className="px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition border border-[#77B1D4]/40"
            >
              {t("signIn", "Sign In")}
            </Link>
            <Link
              href="/signup"
              className="style-claymorphism flex items-center gap-1.5 px-6 py-2.5 text-xs font-black text-slate-950 bg-[#57B9FF] hover:bg-[#90D5FF] rounded-2xl transition shadow-lg shadow-sky-500/30"
            >
              {t("startFreeTrial", "Start Free Trial")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-20 text-center space-y-8">
        {/* Top Badge (Neubrutalism & Aurora accent) */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#90D5FF]/40 bg-[#517891]/30 px-5 py-2 text-xs font-black text-[#90D5FF] shadow-lg backdrop-blur-md">
          <Zap className="h-4 w-4 fill-current text-[#57B9FF]" />
          <span>AI-Powered · Real-Time MSME Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.1]">
          Your Factory.<br />
          <span className="bg-gradient-to-r from-[#90D5FF] via-[#57B9FF] to-[#77B1D4] bg-clip-text text-transparent">
            One Intelligent View.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          You run the factory.<br />
          We run the complexity.
        </p>

        {/* Highlight Bullet Points (Glassmorphism & Neumorphism Cards) */}
        <div className="max-w-xl mx-auto text-left space-y-3 pt-2 pb-4">
          <div className="style-glassmorphism flex items-center gap-4 p-4 rounded-2xl bg-[#517891]/20 border border-[#90D5FF]/30 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#57B9FF]/20 text-[#90D5FF] border border-[#57B9FF]/40 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-100">Real-time machine & production monitoring</span>
          </div>

          <div className="style-glassmorphism flex items-center gap-4 p-4 rounded-2xl bg-[#517891]/20 border border-[#90D5FF]/30 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#57B9FF]/20 text-[#90D5FF] border border-[#57B9FF]/40 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold text-slate-100">AI risk prediction before problems happen</span>
          </div>

          <div className="style-glassmorphism flex items-center gap-4 p-4 rounded-2xl bg-[#517891]/20 border border-[#90D5FF]/30 backdrop-blur-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#57B9FF]/20 text-[#90D5FF] border border-[#57B9FF]/40 shrink-0">
              <Sparkles className="h-5 w-5 text-[#57B9FF]" />
            </div>
            <span className="text-sm font-bold text-slate-100">Instant order feasibility in seconds</span>
          </div>
        </div>

        {/* Hero Buttons (Claymorphism & Liquid Glass) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={(e) => handleProtectedNavigation(e, "/dashboard")}
            className="style-claymorphism flex items-center gap-2 rounded-2xl bg-[#57B9FF] hover:bg-[#90D5FF] px-8 py-4 text-sm font-black text-slate-950 shadow-2xl shadow-sky-500/40 transition transform hover:-translate-y-1 cursor-pointer"
          >
            Launch Your Dashboard <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href="/login"
            className="style-fluent flex items-center gap-2 rounded-2xl border border-[#77B1D4]/60 bg-[#517891]/20 hover:bg-[#517891]/40 px-6 py-4 text-sm font-extrabold text-slate-100 transition backdrop-blur-lg"
          >
            <Play className="h-4 w-4 text-[#57B9FF] fill-current" /> Watch Demo
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs font-extrabold text-slate-400">
          <span className="rounded-xl bg-[#517891]/30 border border-[#77B1D4]/30 px-4 py-2 text-slate-200">
            1,200+ Factories on-boarded
          </span>
          <span>Pune · Mumbai · Ahmedabad · Coimbatore</span>
          <span className="text-[#57B9FF] font-black">₹0 setup cost</span>
        </div>
      </main>

      {/* SECTION 1: FEATURES (Bento Grid & Glassmorphism Cards) */}
      <section id="features" className="relative z-10 py-24 border-t border-[#77B1D4]/20 bg-[#06101E]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#57B9FF] uppercase tracking-widest bg-[#57B9FF]/10 px-3.5 py-1.5 rounded-full border border-[#57B9FF]/30">
              PLATFORM CAPABILITIES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Built for High-Precision Manufacturing</h2>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              Eliminate late penalties, prevent machine breakdowns, and automate raw material replenishment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              onClick={(e) => handleProtectedNavigation(e, "/dashboard")}
              className="style-bento group rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40 hover:border-[#57B9FF] transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#57B9FF]/20 text-[#57B9FF] border border-[#57B9FF]/30 group-hover:scale-110 transition">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#57B9FF] transition">
                AI Daily Briefing & Alert Clusters
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Predicts machine failure 3 days in advance and highlights ₹64,000 penalty risks before deadlines slip.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#57B9FF] group-hover:underline">
                Explore Dashboard →
              </span>
            </div>

            <div
              onClick={(e) => handleProtectedNavigation(e, "/machines")}
              className="style-bento group rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40 hover:border-[#57B9FF] transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#57B9FF] transition">
                Machine Telemetry & OEE Tracking
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Real-time monitoring for CNC Lathes, Mills, Grinders, and Drill Presses with live OEE scoring.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#57B9FF] group-hover:underline">
                View Machine Telemetry →
              </span>
            </div>

            <div
              onClick={(e) => handleProtectedNavigation(e, "/inventory")}
              className="style-bento group rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40 hover:border-[#57B9FF] transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#57B9FF] transition">
                Predictive Raw Material Depletion
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Tracks stock burn rate for MS Flat Bar, EN8 Steel, and Aluminium Sheets with 1-click PO reordering.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#57B9FF] group-hover:underline">
                Check Inventory Engine →
              </span>
            </div>

            <div
              onClick={(e) => handleProtectedNavigation(e, "/orders/new")}
              className="style-bento group rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40 hover:border-[#57B9FF] transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#90D5FF]/20 text-[#90D5FF] border border-[#90D5FF]/30 group-hover:scale-110 transition">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#57B9FF] transition">
                AI Order Feasibility Check
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Instantly validates machine availability, material stock, and delivery feasibility for new customer RFQs.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#57B9FF] group-hover:underline">
                Test Feasibility Engine →
              </span>
            </div>

            <div
              onClick={(e) => handleProtectedNavigation(e, "/profitability")}
              className="style-bento group rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40 hover:border-[#57B9FF] transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#57B9FF] transition">
                Deterministic Job Profitability
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                BOM-level cost calculation combining material, labor, machine hourly rates, and penalty risk.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#57B9FF] group-hover:underline">
                Analyze Job Profitability →
              </span>
            </div>

            <div
              onClick={(e) => handleProtectedNavigation(e, "/worker")}
              className="style-bento group rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40 hover:border-[#57B9FF] transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-[#57B9FF] transition">
                Worker Mobile & Voice Terminal
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Operator interface with Hindi/English voice logging, QR code scanning, and 1-tap problem reporting.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-[#57B9FF] group-hover:underline">
                Launch Worker Terminal →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 py-24 border-t border-[#77B1D4]/20 bg-[#071324]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#57B9FF] uppercase tracking-widest bg-[#57B9FF]/10 px-3.5 py-1.5 rounded-full border border-[#57B9FF]/30">
              FAST ONBOARDING
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Setup Your Factory in 5 Minutes</h2>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              No complex ERP implementation or IT team required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="style-glassmorphism rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#57B9FF] text-slate-950 font-black text-sm shadow-md">
                1
              </div>
              <h3 className="text-lg font-black text-white">Select Industry & Machines</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Choose from pre-built MSME templates (Automotive Parts, Sheet Metal, Plastics) and list your active machines.
              </p>
            </div>

            <div className="style-glassmorphism rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#57B9FF] text-slate-950 font-black text-sm shadow-md">
                2
              </div>
              <h3 className="text-lg font-black text-white">Import Materials & Orders</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Upload raw material stock balances and active customer job cards in 1-click or via simple web forms.
              </p>
            </div>

            <div className="style-glassmorphism rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#57B9FF] text-slate-950 font-black text-sm shadow-md">
                3
              </div>
              <h3 className="text-lg font-black text-white">Activate Decision Copilot</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Get real-time daily briefings, preventative maintenance warnings, and automated order rerouting.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/onboarding"
              className="style-claymorphism inline-flex items-center gap-2 rounded-2xl bg-[#57B9FF] hover:bg-[#90D5FF] px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-sky-500/30 transition"
            >
              Start 5-Minute Setup Wizard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRICING (Claymorphism & Neumorphism Cards) */}
      <section id="pricing" className="relative z-10 py-24 border-t border-[#77B1D4]/20 bg-[#06101E]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#57B9FF] uppercase tracking-widest bg-[#57B9FF]/10 px-3.5 py-1.5 rounded-full border border-[#57B9FF]/30">
              TRANSPARENT PRICING
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Simple Plans for Indian Factories</h2>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div 
              onClick={(e) => handlePlanClick(e, "starter")}
              className="style-glassmorphism group rounded-3xl p-8 space-y-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2 relative border border-[#77B1D4]/40"
            >
              <div className="space-y-4">
                <div className="text-xs font-extrabold text-[#77B1D4] group-hover:text-[#57B9FF] uppercase tracking-wider transition">STARTER</div>
                <div className="text-3xl font-black text-white">₹3,999 <span className="text-xs text-slate-400 font-semibold">/ month</span></div>
                <p className="text-xs text-slate-300 font-medium">Ideal for small machine workshops and job work units.</p>
                <div className="space-y-2.5 pt-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Up to 5 Machines</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Up to 25 Workers</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Core AI Alerts & Order Tracker</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handlePlanClick(e, "starter")}
                className="w-full text-center py-3.5 rounded-2xl bg-slate-800/90 group-hover:bg-[#57B9FF] group-hover:text-slate-950 text-xs font-black text-white transition border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Choose Starter Plan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Growth Plan */}
            <div 
              onClick={(e) => handlePlanClick(e, "growth")}
              className="style-aurora group rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-2xl shadow-sky-500/30 relative cursor-pointer transition-all duration-300 hover:-translate-y-2"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#57B9FF] text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                MOST POPULAR FOR MSMEs
              </div>
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-950 uppercase tracking-wider">GROWTH</div>
                <div className="text-3xl font-black text-white">₹9,999 <span className="text-xs text-slate-200 font-semibold">/ month</span></div>
                <p className="text-xs text-slate-100 font-medium">For Tier 2 & Tier 3 Automotive & Aerospace vendors.</p>
                <div className="space-y-2.5 pt-4 text-xs font-bold text-white">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-950" /> Up to 25 Machines</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-950" /> Unlimited Workers</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-950" /> AI Daily Briefing & Penalty Risk</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-slate-950" /> Dedicated AI Decision Copilot</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handlePlanClick(e, "growth")}
                className="w-full text-center py-3.5 rounded-2xl bg-slate-950 text-xs font-black text-[#57B9FF] transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Enterprise Plan */}
            <div 
              onClick={(e) => handlePlanClick(e, "enterprise")}
              className="style-glassmorphism group rounded-3xl p-8 space-y-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2 relative border border-[#77B1D4]/40"
            >
              <div className="space-y-4">
                <div className="text-xs font-extrabold text-[#77B1D4] group-hover:text-[#57B9FF] uppercase tracking-wider transition">ENTERPRISE</div>
                <div className="text-3xl font-black text-white">Custom <span className="text-xs text-slate-400 font-semibold">pricing</span></div>
                <p className="text-xs text-slate-300 font-medium">Multi-unit manufacturing clusters and enterprise plants.</p>
                <div className="space-y-2.5 pt-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Unlimited Machines & Plants</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Multi-Tenant Isolation & Custom API</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Dedicated Account Manager</div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handlePlanClick(e, "enterprise")}
                className="w-full text-center py-3.5 rounded-2xl bg-slate-800/90 group-hover:bg-[#57B9FF] group-hover:text-slate-950 text-xs font-black text-white transition border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Contact Sales</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CASE STUDIES */}
      <section id="case-studies" className="relative z-10 py-24 border-t border-[#77B1D4]/20 bg-[#071324]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#57B9FF] uppercase tracking-widest bg-[#57B9FF]/10 px-3.5 py-1.5 rounded-full border border-[#57B9FF]/30">
              PROVEN MSME IMPACT
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">Real Results from Real Indian Factories</h2>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              See how MSMEs in Chakan, Peenya, and Coimbatore operate with FactoryIQ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="style-glassmorphism rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40">
              <div className="text-xs font-black text-[#57B9FF] uppercase">PUNE AUTOMOTIVE CLUSTER</div>
              <h3 className="text-lg font-black text-white">Rajesh Industries Pvt. Ltd.</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Saved ₹4.2 Lakhs in late delivery penalty fees in 60 days by rerouting breakdown jobs on Milling Machine M-02 to idle CNC units.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> 84% Downtime Penalty Reduction
              </div>
            </div>

            <div className="style-glassmorphism rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40">
              <div className="text-xs font-black text-[#57B9FF] uppercase">COIMBATORE PRECISION TOOLS</div>
              <h3 className="text-lg font-black text-white">Mahalaxmi Precision Tools</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Increased factory-wide OEE from 58% to 81% within 30 days using real-time machine telemetry and predictive maintenance alerts.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> +23% Overall Equipment Effectiveness
              </div>
            </div>

            <div className="style-glassmorphism rounded-3xl p-8 space-y-4 border border-[#77B1D4]/40">
              <div className="text-xs font-black text-[#57B9FF] uppercase">AHMEDABAD SHEET METAL</div>
              <h3 className="text-lg font-black text-white">Gujarat Sheet Metal Works</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Eliminated raw material stockout delays for MS Steel Flat Bars by automating PO reorders directly to Jindal Steel.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> 0 Stockout Production Halts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#77B1D4]/20 bg-[#040B15] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#57B9FF] text-slate-950">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="font-black text-white text-base">FactoryIQ</span>
            <span className="text-slate-500 font-semibold">© 2026 FactoryIQ Platforms Inc.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button
              type="button"
              onClick={(e) => handleProtectedNavigation(e, "/dashboard")}
              className="hover:text-white transition cursor-pointer"
            >
              Dashboard
            </button>
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Create Account</Link>
            <Link href="/onboarding" className="hover:text-white transition">Setup Wizard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
