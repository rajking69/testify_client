"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { paymentService, TeacherPremiumStatusResponse } from "@/services/payment.service";
import { activateTeacherPremium } from "@/lib/subscription-sync";
import { authClient } from "@/lib/auth-client";

function TeacherPaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paramEmail = searchParams.get("email");
  const { data: session } = authClient.useSession();
  const [isVerifying, setIsVerifying] = useState(true);
  const [statusData, setStatusData] = useState<TeacherPremiumStatusResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Resolve user email from query param, session, or pending subscription storage
    let userEmail = paramEmail || session?.user?.email;
    if (!userEmail && typeof window !== "undefined") {
      userEmail = localStorage.getItem("testify_pending_subscription_email") || undefined;
    }

    if (userEmail) {
      activateTeacherPremium(365, userEmail);
    }

    let attempts = 0;
    const maxAttempts = 6;
    let timer: NodeJS.Timeout;

    async function checkStatus() {
      try {
        const res = await paymentService.getTeacherPremiumStatus();
        if (res.success && (res.data.isPremium || res.data.premiumStatus === "active")) {
          setStatusData(res.data);
          setIsVerifying(false);
          return;
        }

        // Retry polling while Stripe webhook processes
        attempts += 1;
        if (attempts < maxAttempts) {
          timer = setTimeout(checkStatus, 2000);
        } else {
          setStatusData(res.data);
          setIsVerifying(false);
        }
      } catch (err: any) {
        attempts += 1;
        if (attempts < maxAttempts) {
          timer = setTimeout(checkStatus, 2000);
        } else {
          setIsVerifying(false);
        }
      }
    }

    checkStatus();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, paramEmail, session?.user?.email]);

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <AnimatedBackground variant="hero" />

      <div className="relative z-10 max-w-md w-full rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 text-center space-y-6">
        {isVerifying ? (
          <div className="py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-[#0092E3] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Verifying Stripe Subscription...
            </h2>
            <p className="text-xs text-slate-500">
              Confirming payment with the backend and activating your Teacher Premium account.
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-9 w-9" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verification Notice
            </h2>
            <p className="text-xs text-slate-500">{error}</p>
            <Link href="/teacher/dashboard" className="block w-full">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Premium Active
              </span>
              <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                Welcome to Teacher Premium!
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your $20.00 annual subscription payment was verified successfully. Full examination conducting, live proctoring, and question banking privileges are now unlocked for 1 year.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-left space-y-2">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Membership Plan:</span>
                <strong className="text-slate-900 dark:text-white">
                  {statusData?.planName || "Teacher Premium ($20/yr)"}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Payment Gateway:</span>
                <strong className="text-emerald-600">Stripe Verified ✓</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Duration:</span>
                <strong className="text-slate-900 dark:text-white">
                  {statusData?.premiumExpiresAt
                    ? `Valid until ${new Date(statusData.premiumExpiresAt).toLocaleDateString()}`
                    : "Valid for 365 Days"}
                </strong>
              </div>
            </div>

            <Link href="/teacher/exams" className="block w-full">
              <Button
                className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-[#0092E3]/20"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Go to Examination Console
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function TeacherPaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TeacherPaymentSuccessContent />
    </Suspense>
  );
}