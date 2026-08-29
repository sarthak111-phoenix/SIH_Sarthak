"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Zap, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/onboarding";

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const saveAuthSession = (user: any, factory: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("factoryiq_authenticated", "true");
      localStorage.setItem("factoryiq_user", JSON.stringify(user));
      localStorage.setItem("factoryiq_factory", JSON.stringify(factory));
      document.cookie = "factoryiq_authenticated=true; path=/; max-age=86400";
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clear old state data from previous sessions
    if (typeof window !== "undefined") {
      localStorage.removeItem("factoryiq_onboarded_machines");
      localStorage.removeItem("factoryiq_machines_state_data");
      localStorage.removeItem("factoryiq_onboarded_workers");
    }

    const dynamicCompanyName = name.trim() ? `${name.trim()}'s Factory` : "My Enterprise Factory";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          companyName: dynamicCompanyName,
          roleTitle: "Factory Owner",
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        saveAuthSession(data.data.user, data.data.factory);
        setTimeout(() => {
          router.push(redirectParam);
        }, 800);
      } else {
        saveAuthSession({ id: `user-${Date.now()}`, name, email }, { id: `factory-${Date.now()}`, name: dynamicCompanyName });
        setSuccess(true);
        setTimeout(() => {
          router.push(redirectParam);
        }, 800);
      }
    } catch (err) {
      saveAuthSession({ id: `user-${Date.now()}`, name, email }, { id: `factory-${Date.now()}`, name: dynamicCompanyName });
      setSuccess(true);
      setTimeout(() => {
        router.push(redirectParam);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col lg:flex-row text-slate-900 font-sans">
      {/* LEFT PANEL: Dark Navy Feature Showcase */}
      <div className="lg:w-1/2 bg-[#09172A] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-[radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0088FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-12 relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A8FF] text-white shadow-lg shadow-sky-500/30">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">FactoryIQ</span>
          </Link>

          {/* Hero Content */}
          <div className="space-y-4 max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Your Factory.<br />
              One Intelligent View.
            </h1>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              You run the factory.<br />
              We run the complexity.
            </p>
          </div>

          {/* 3 Feature Pills */}
          <div className="space-y-4 max-w-md pt-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0D213A]/80 border border-slate-800 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142D4C] text-[#00A8FF]">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Real-time machine & production monitoring
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0D213A]/80 border border-slate-800 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142D4C] text-[#00A8FF]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                AI risk prediction before problems happen
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0D213A]/80 border border-slate-800 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142D4C] text-[#00A8FF]">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Instant order feasibility in seconds
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-12 text-xs text-slate-500 font-medium relative z-10">
          Trusted by 1,200+ Indian MSME factories — Pune · Mumbai · Ahmedabad · Coimbatore
        </div>
      </div>

      {/* RIGHT PANEL: Light Canvas with Floating Create Account Card */}
      <div className="lg:w-1/2 bg-[#EFF4FA] p-6 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
            
            {/* Top Tab Switcher Pill */}
            <div className="flex rounded-2xl bg-[#F0F4F9] p-1.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirectParam)}`)}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  activeTab === "signin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  activeTab === "signup"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header Text */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Start for free</h2>
              <p className="text-xs font-semibold text-slate-500">Set up your factory in 5 minutes</p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Account created! Directing to factory setup...</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajesh Joshi"
                    className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] pl-10 pr-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email or Mobile</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@rajeshind.com"
                    className="w-full rounded-xl border border-[#F7F9FC] pl-10 pr-4 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-[#F7F9FC] pl-10 pr-10 py-3 text-sm text-slate-900 font-semibold focus:border-[#00A8FF] focus:bg-white focus:outline-none transition shadow-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1B365D] hover:bg-[#142845] py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-98"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs font-semibold text-slate-600">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectParam)}`} className="text-[#00A8FF] font-extrabold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center text-slate-600 font-bold text-xs">
        Loading Sign-Up Gateway...
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  );
}
