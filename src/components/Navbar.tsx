"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Zap, 
  LayoutDashboard, 
  Bell, 
  ShoppingCart, 
  Cpu, 
  Package, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Bot,
  Calendar,
  Wrench,
  Truck,
  TrendingUp,
  Brain,
  FileText,
  Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const [factoryInfo, setFactoryInfo] = useState<{ name: string; city: string }>({
    name: "My Enterprise Factory",
    city: "Fresh Account State",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFactory = localStorage.getItem("factoryiq_factory");
      if (storedFactory) {
        try {
          const parsed = JSON.parse(storedFactory);
          if (parsed?.name) {
            setFactoryInfo({
              name: parsed.name,
              city: parsed.city ? `${parsed.city}, ${parsed.state || ""}` : "Active Factory",
            });
          }
        } catch (e) {}
      } else {
        // Fetch from API
        fetch("/api/dashboard")
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.data?.factory) {
              setFactoryInfo({
                name: json.data.factory.name,
                city: "Active Factory",
              });
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Hide left sidebar on landing and auth pages
  const standalonePages = ["/", "/login", "/signup", "/onboarding"];
  if (standalonePages.includes(pathname)) {
    return null;
  }

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("factoryiq_authenticated");
      localStorage.removeItem("factoryiq_user");
      localStorage.removeItem("factoryiq_factory");
      localStorage.removeItem("factoryiq_onboarded_machines");
      localStorage.removeItem("factoryiq_machines_state_data");
      localStorage.removeItem("factoryiq_onboarded_workers");
      document.cookie = "factoryiq_authenticated=; path=/; max-age=0";
    }
    router.push("/signup");
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to completely wipe all database records and start with a 100% fresh account?")) {
      try {
        await fetch("/api/admin/reset", { method: "POST" });
        if (typeof window !== "undefined") {
          localStorage.clear();
          document.cookie = "factoryiq_authenticated=; path=/; max-age=0";
        }
        window.location.href = "/signup";
      } catch (err) {
        alert("Reset failed: " + err);
      }
    }
  };

  const primaryItems = [
    { name: t("dashboard", "Dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("aiCopilot", "AI Copilot"), href: "/copilot", icon: Bot, badge: "AI" },
    { name: t("aiAlerts", "AI Alerts"), href: "/notifications", icon: Bell, alertBadge: 0 },
    { name: t("orders", "Orders"), href: "/orders", icon: ShoppingCart },
    { name: t("aiFeasibility", "AI Feasibility"), href: "/orders/new", icon: Zap },
  ];

  const operationsItems = [
    { name: t("production", "Production"), href: "/production", icon: Calendar },
    { name: t("machines", "Machines"), href: "/machines", icon: Cpu },
    { name: t("maintenance", "Maintenance"), href: "/maintenance", icon: Wrench },
    { name: t("inventory", "Inventory"), href: "/inventory", icon: Package },
    { name: t("suppliers", "Suppliers"), href: "/suppliers", icon: Truck },
  ];

  const intelligenceItems = [
    { name: t("reports", "Reports"), href: "/reports", icon: FileText },
    { name: t("profitability", "Profitability"), href: "/profitability", icon: TrendingUp },
    { name: t("workerView", "Worker View"), href: "/worker", icon: Users },
    { name: t("memoryBank", "Memory Bank"), href: "/memory", icon: Brain },
  ];

  return (
    <>
      {/* Mobile Top Header Toggle */}
      <div className="lg:hidden sticky top-0 z-50 bg-[#09172A] text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00A8FF] text-white">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <span className="font-black text-white text-base">FactoryIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="dark" />
          <LanguageSelector variant="dark" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#09172A] border-r border-slate-800 text-white flex flex-col justify-between p-4 overflow-y-auto transition-transform duration-300 font-sans ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-5">
          {/* Brand Header & Language Dropdown */}
          <div className="flex items-center justify-between px-1 pt-1">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00A8FF] text-white shadow-md shadow-sky-500/20">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight font-black text-white text-base tracking-tight">FactoryIQ</span>
                <span className="text-[9px] font-semibold text-slate-400">Intelligence Platform</span>
              </div>
            </Link>
          </div>

          {/* Controls: Theme & Language Selectors */}
          <div className="pt-1 flex items-center gap-2">
            <ThemeToggle variant="dark" />
            <LanguageSelector variant="dark" />
          </div>

          {/* Active Factory Card */}
          <div className="rounded-2xl bg-[#0D213A] border border-slate-800/90 p-3.5 space-y-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Active Factory</span>
            <div className="text-sm font-black text-slate-100">{factoryInfo.name}</div>
            <div className="text-xs font-semibold text-slate-400">{factoryInfo.city}</div>
          </div>

          {/* Category 1: CORE DECISION INTELLIGENCE */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 block mb-1">
              DECISION ENGINE
            </span>
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isExactActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                    isExactActive
                      ? "bg-[#57B9FF] text-slate-950 shadow-md shadow-sky-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#00A8FF] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Category 2: OPERATIONS */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 block mb-1">
              OPERATIONS
            </span>
            {operationsItems.map((item) => {
              const Icon = item.icon;
              const isExactActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                    isExactActive
                      ? "bg-[#57B9FF] text-slate-950 shadow-md shadow-sky-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Category 3: ANALYTICS & FLOOR */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 block mb-1">
              ANALYTICS & FLOOR
            </span>
            {intelligenceItems.map((item) => {
              const Icon = item.icon;
              const isExactActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                    isExactActive
                      ? "bg-[#57B9FF] text-slate-950 shadow-md shadow-sky-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800/80 pt-3 mt-4 space-y-1">
          <Link
            href="/onboarding"
            className="flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <Settings className="h-4 w-4" />
            <span>{t("factorySetup", "Factory Setup")}</span>
          </Link>

          <button
            type="button"
            onClick={handleResetData}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-950/20 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Factory Data</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("signOut", "Sign Out")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
