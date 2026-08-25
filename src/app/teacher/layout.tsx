"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSession } from "@/lib/auth-client";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session, isPending } = useSession();

  const userRole = (session?.user as { role?: string })?.role;

  // Unauthenticated visitors cannot access teacher dashboard
  if (!isPending && !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-4">
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

  // Student accounts cannot access the teacher exam builder & dashboard
  if (!isPending && session && userRole === "student") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            Teacher Workspace Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            You are currently signed in as a <strong className="text-indigo-600 dark:text-indigo-400">Student</strong>. Student accounts cannot access, create, or manage teacher dashboards and question banks.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Go to Student Home / Exams
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <GraduationCap className="h-4 w-4" /> Switch to Teacher Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsMobileOpen(false)}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <Topbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
