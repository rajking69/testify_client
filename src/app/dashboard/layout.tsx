"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { authClient } from "@/lib/auth-client";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const userRole = session?.user?.role;

  // Validate role from URL
  const validRoles = ["admin", "teacher", "student"];
  const params = useParams<{ role: string }>();
  if (!validRoles.includes(params.role)) {
    notFound();
  }

  // Role-based access control
  if (!isPending && session) {
    // Students can't access teacher/admin dashboards
    if (params.role === "teacher" && userRole === "student") {
      return (
        <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Teacher Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently signed in as a{" "}
              <strong className="text-blue-600">Student</strong>. Student
              accounts cannot access the teacher dashboard.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard/student"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2238] text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-[#13304A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Go to Student Dashboard
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs px-5 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <GraduationCap className="h-4 w-4" /> Sign in with Teacher
                Account
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Non-admins can't access admin dashboard
    if (params.role === "admin" && userRole !== "admin") {
      return (
        <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Admin Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently signed in as a{" "}
              <strong className="text-blue-600">{userRole || "User"}</strong>.
              Only admin accounts can access the admin dashboard.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/dashboard/${userRole || "student"}`}
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

  // Admin and Teacher get sidebar + topbar layout
  if (params.role === "admin" || params.role === "teacher") {
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

  // Students get simpler layout without sidebar
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
