"use client";

import React from "react";
import { notFound } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const params = useParams<{ role: string }>();

  const userRole = session?.user?.role;

  // Validate role from URL
  const validRoles = ["admin", "teacher", "student"];
  if (!validRoles.includes(params.role)) {
    notFound();
  }

  // Role-based access control
  if (!isPending && session) {
    // Students can't access teacher/admin profiles
    if (params.role === "teacher" && userRole === "student") {
      return (
        <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Teacher Profile Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently signed in as a{" "}
              <strong className="text-blue-600">Student</strong>. Student
              accounts cannot access teacher profile settings.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/profile/student"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2238] text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-[#13304A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Go to Student Profile
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

    // Non-admins can't access admin profile
    if (params.role === "admin" && userRole !== "admin") {
      return (
        <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Admin Profile Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently signed in as a{" "}
              <strong className="text-blue-600">{userRole || "User"}</strong>.
              Only admin accounts can access admin profile settings.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/profile/${userRole || "student"}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2238] text-white font-semibold text-xs px-5 py-2.5 shadow-sm hover:bg-[#13304A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Go to Your Profile
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

  if (!isPending && !session) {
    router.push("/auth/login");
    return null;
  }

  return <>{children}</>;
}
