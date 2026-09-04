"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { authClient } from "@/lib/auth-client";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const userRole = session?.user?.role;

  // Unauthenticated visitors cannot access teacher dashboard
  if (!isPending && !session) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground variant="hero" />
        <div className="relative z-10 max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Teacher Authentication Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            You must be signed in with an authorized Teacher account to access the Question Bank and exam dashboard.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <GraduationCap className="h-4 w-4" /> Sign In as Teacher
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Non-teachers cannot access teacher workspace
  if (!isPending && session && userRole !== "teacher" && userRole !== "admin") {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground variant="hero" />
        <div className="relative z-10 max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Teacher Workspace Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            You are currently signed in as a <strong className="text-indigo-600 dark:text-indigo-400 capitalize">{userRole || "User"}</strong>. Only teacher and admin accounts can access teacher dashboards.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/${userRole || "student"}/dashboard`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Go to Your Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <GraduationCap className="h-4 w-4" /> Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Teachers get sidebar + topbar layout
  return (
    <div className="relative min-h-screen bg-slate-50/60 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Full Dashboard Landing Page Animated Aurora & Grid Background */}
      <AnimatedBackground variant="hero" />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsMobileOpen(false)}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <Topbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <React.Suspense fallback={<div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading teacher dashboard...</div>}>
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}