"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { authClient } from "@/lib/auth-client";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const userRole = session?.user?.role;

  // Role-based access control
  if (!isPending && session) {
    // Non-admins can't access admin dashboard
    if (userRole !== "admin") {
      return (
        <div className="relative min-h-screen bg-slate-50/60 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
          <AnimatedBackground variant="hero" />
          <div className="relative z-10 max-w-md w-full rounded-3xl border border-rose-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Admin Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You are currently signed in as a{" "}
              <strong className="text-blue-600">{userRole || "User"}</strong>.
              Only admin accounts can access the admin dashboard.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/${userRole || "student"}/dashboard`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2238] text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-[#13304A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Go to Your Dashboard
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs px-5 py-2.5 hover:bg-slate-50 transition-colors"
              >
                Sign in with Admin Account
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Admin gets sidebar + topbar layout
  return (
    <div className="relative min-h-screen bg-slate-50/60 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Full Dashboard Landing Page Animated Background */}
      <AnimatedBackground variant="hero" />

      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsMobileOpen(false)}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <AdminTopbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <React.Suspense fallback={<div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading admin dashboard...</div>}>
            {children}
          </React.Suspense>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
