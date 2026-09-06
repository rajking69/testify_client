"use client";

import React from "react";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { authClient } from "@/lib/auth-client";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();

  const userRole = session?.user?.role;

  // Role-based access control
  if (!isPending && session) {
    // Non-students can't access student dashboard
    if (userRole !== "student") {
      return (
        <div className="relative min-h-screen bg-[#FCFBF7] dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
          <AnimatedBackground variant="hero" />
          <div className="relative z-10 max-w-md w-full rounded-3xl border border-rose-200 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Student Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You are currently signed in as a{" "}
              <strong className="text-blue-600">{userRole || "User"}</strong>.
              Only student accounts can access the student dashboard.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/${userRole || "teacher"}/dashboard`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2238] text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-[#13304A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Go to Your Dashboard
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 font-semibold text-xs px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <GraduationCap className="h-4 w-4" /> Sign in with Student Account
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Students get simpler layout without sidebar
  return (
    <div className="relative min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Full Dashboard Landing Page Animated Background */}
      <AnimatedBackground variant="hero" />

      <main className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}