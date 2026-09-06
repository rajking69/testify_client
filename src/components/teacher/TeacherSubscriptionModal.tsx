"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { paymentService } from "@/services/payment.service";
import { useSession } from "@/lib/auth-client";
import { useTeacherSubscription, activateTeacherPremium } from "@/lib/subscription-sync";
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  LogIn,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface TeacherSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMessage?: string;
}

export function TeacherSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  initialMessage,
}: TeacherSubscriptionModalProps) {
  const { data: sessionData, isPending } = useSession();
  const user = sessionData?.user;
  const userRole = (user as any)?.role?.toLowerCase() || "";

  const { hasPremium, daysRemaining, expiryDateFormatted } = useTeacherSubscription(sessionData);
  const isAlreadyActive = hasPremium;

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePurchase = async () => {
    // 1. Guard against duplicate payment
    if (isAlreadyActive) {
      setErrorMessage(
        `You already have an active Premium Membership (${daysRemaining} days remaining). Duplicate payments are not permitted.`
      );
      return;
    }

    // 2. Guard against non-teacher accounts (e.g. Student)
    if (user && userRole === "student") {
      setErrorMessage(
        "Teacher Account Required: You are signed in as a Student. Teacher Premium can only be purchased by Teacher accounts."
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // 1. Try Backend Stripe Checkout Endpoint first
      try {
        const res = await paymentService.createTeacherPremiumCheckout();
        if (res.success && res.url) {
          window.location.href = res.url;
          return;
        }
      } catch (backendErr: any) {
        console.warn("Backend checkout requires teacher auth or server sync, falling back to Next.js Stripe API:", backendErr);
      }

      // 2. Direct Next.js Stripe API checkout route (reads STRIPE_SECRET_KEY from .env)
      if (user?.email && typeof window !== "undefined") {
        localStorage.setItem("testify_pending_subscription_email", user.email);
      }
      const nextRes = await fetch("/api/payments/teacher-premium/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherEmail: user?.email || "instructor@testify.io",
          teacherName: user?.name || "Testify Instructor",
        }),
      });
      const nextData = await nextRes.json();

      if (nextData.success && nextData.url) {
        window.location.href = nextData.url;
        return;
      }

      throw new Error(
        nextData.message ||
          "Stripe API credentials missing or invalid in .env. Please check STRIPE_SECRET_KEY."
      );
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(err.message || "Failed to start checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const premiumFeatures = [
    "Conduct Unlimited Live Examinations (Free & Paid Papers)",
    "Instant Shareable Exam Links & Unique Room Join Codes",
    "Bulk Question Import via Excel, CSV & JSON Engine",
    "Central Question Bank Repository & 1-Click Reusability",
    "Live AI Proctoring, Tab Switch Detection & Webcam Telemetry",
    "Automated MCQ Grading & Student Submission Evaluation",
    "Exportable Gradebooks, Analytics & Performance Transcripts",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher Premium Membership"
      description="Unlock full examination hosting, live proctoring, and monetization on Testify."
      size="md"
    >
      <div className="space-y-5 pt-1">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Already Active Subscription Card */}
        {isAlreadyActive ? (
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                  Premium Membership Active
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {daysRemaining} days remaining • Valid until {expiryDateFormatted}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-emerald-200/60 dark:border-emerald-800/60 pt-2.5">
              You already have full access to all teacher privileges for 1 full year. Additional payments are denied while your membership remains active.
            </p>
          </div>
        ) : (
          <>
            {/* 2. Non-Teacher Role Warning (e.g. Student Logged In) */}
            {user && userRole === "student" && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Teacher Account Required</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  You are currently logged in as a <strong>Student ({user.email})</strong>. Teacher Premium can only be purchased and activated on a verified Teacher account.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link href="/auth/login" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs font-bold bg-white dark:bg-slate-900">
                      Switch to Teacher Login
                    </Button>
                  </Link>
                  <Link href="/auth/register?role=teacher" className="flex-1">
                    <Button size="sm" className="w-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white">
                      Register as Teacher
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* 3. Unauthenticated Warning */}
            {!user && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <LogIn className="h-4 w-4 text-[#0092E3] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Not Logged In: </span>
                  <span>Make sure to log in or register with your Teacher account so your 1-year access is linked directly to your profile.</span>
                </div>
              </div>
            )}

            {initialMessage && !errorMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Crown className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{initialMessage}</span>
              </div>
            )}

            {/* Pricing Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/80 dark:from-slate-900 dark:to-slate-950 border border-blue-200/80 dark:border-cyan-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0092E3] dark:text-cyan-400">
                    Annual Instructor Plan
                  </span>
                  <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white mt-0.5">
                    Teacher Premium
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold font-display text-[#0092E3] dark:text-cyan-400">
                    $20
                  </span>
                  <span className="text-xs text-slate-500 font-medium"> / year</span>
                  <p className="text-[10px] text-emerald-600 font-bold">Full 1-Year Access</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Conduct official academic tests, create paid entry exams, and grade papers effortlessly.
              </p>
            </div>
          </>
        )}

        {/* Feature List */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Everything included in premium
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {premiumFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs font-bold">
            {isAlreadyActive ? "Close" : "Cancel"}
          </Button>

          {isAlreadyActive ? (
            <Button
              type="button"
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Membership Active ✓
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isProcessing || (user && userRole === "student")}
              onClick={handlePurchase}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-xs px-5 shadow-md shadow-[#0092E3]/20"
              leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            >
              {isProcessing ? "Redirecting..." : "Upgrade with Stripe • $20.00"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}