"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

function StudentPaymentCancelContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <AnimatedBackground variant="hero" />

      <div className="relative z-10 max-w-md w-full rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
            Exam Payment Cancelled
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The payment checkout session was cancelled. You can retry checkout anytime from the examination marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student/exams" className="flex-1">
            <Button
              variant="outline"
              className="w-full font-bold text-xs py-2.5 rounded-xl"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Browse Exams
            </Button>
          </Link>

          {examId && (
            <Link href={`/exam/${examId}`} className="flex-1">
              <Button
                className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs py-2.5 rounded-xl"
              >
                Retry Payment
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentPaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StudentPaymentCancelContent />
    </Suspense>
  );
}
