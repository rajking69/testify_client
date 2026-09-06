"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

export default function TeacherPaymentCancelPage() {
  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <AnimatedBackground variant="hero" />

      <div className="relative z-10 max-w-md w-full rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
            Subscription Checkout Cancelled
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your Stripe checkout session was cancelled. No charges were made to your payment method and your account status remains unchanged.
          </p>
        </div>

        <Link href="/teacher/exams" className="block w-full">
          <Button
            variant="outline"
            className="w-full font-bold text-xs py-2.5 rounded-xl"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
