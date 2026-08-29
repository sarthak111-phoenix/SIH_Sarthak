"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FactoryAgentDrawer } from "@/components/agent/FactoryAgentDrawer";
import { Loader2 } from "lucide-react";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Pages that should NOT have left sidebar
  const standalonePages = ["/", "/login", "/signup", "/onboarding"];
  const isStandalone = standalonePages.includes(pathname);

  useEffect(() => {
    if (isStandalone) {
      setCheckingAuth(false);
      return;
    }

    // Check auth status for dashboard pages
    if (typeof window !== "undefined") {
      const authCookie = document.cookie.includes("factoryiq_authenticated=true");
      const authStorage = localStorage.getItem("factoryiq_authenticated") === "true";

      if (authCookie || authStorage) {
        setIsAuthenticated(true);
        setCheckingAuth(false);
      } else {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}&reason=auth_required`);
      }
    }
  }, [pathname, isStandalone, router]);

  if (isStandalone) {
    return (
      <main className="w-full min-h-screen relative bg-[#F4F7FB] dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 transition-colors">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector variant="dark" />
        </div>
        {children}
      </main>
    );
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#071324] text-white flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-[#57B9FF]" />
        <span className="text-xs font-black text-slate-300">Verifying FactoryIQ Credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="lg:pl-64 min-h-screen transition-all duration-300 bg-[#F4F7FB] dark:bg-[#070F1E] text-slate-900 dark:text-slate-100">
        {children}
      </main>
      <FactoryAgentDrawer />
    </>
  );
}

