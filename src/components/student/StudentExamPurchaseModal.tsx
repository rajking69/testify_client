"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-client";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";

interface StudentExamPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exam: {
    id: string;
    title: string;
    subject: string;
    price?: number;
    duration?: number;
    totalMarks?: number;
    passMark?: number;
  };
}

export function StudentExamPurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  exam,
}: StudentExamPurchaseModalProps) {
  const { data: sessionData } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const price = exam.price || 50;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Call backend Stripe Checkout API endpoint (uses STRIPE_SECRET_KEY from .env)
      const res = await fetch("/api/payments/exam/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          examTitle: exam.title,
          examSubject: exam.subject,
          price: price,
          studentEmail: sessionData?.user?.email,
        }),
      });
      const data = await res.json();

      if (data.success && data.url) {
        // Direct redirect to Stripe Checkout hosted payment page
        window.location.href = data.url;
        return;
      }

      throw new Error(
        data.message ||
          "Stripe API credentials missing or invalid. Please check STRIPE_SECRET_KEY in your .env file."
      );
    } catch (err: any) {
      console.error("Exam purchase error:", err);
      setErrorMessage(
        err.message || "Payment authorization failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const examFeatures = [
    "Full access to certified examination paper & official questions",
    "Live timed assessment with automated evaluation",
    "Comprehensive solution breakdown with instant answer feedback",
    "Permanent result transcript & performance analytics report",
    "End-to-end 256-bit encrypted academic proctoring session",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unlock Examination Pass"
      description="Purchase official entry pass to attempt this premium verified examination."
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

        {/* Pricing Box */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/80 dark:from-slate-900 dark:to-slate-950 border border-blue-200/80 dark:border-cyan-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0092E3] dark:text-cyan-400">
                {exam.subject} Assessment
              </span>
              <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white mt-0.5">
                {exam.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold font-display text-[#0092E3] dark:text-cyan-400">
                ৳{price}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / pass</span>
              <p className="text-[10px] text-emerald-600 font-bold">One-Time Access</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-blue-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="h-3.5 w-3.5 text-[#0092E3]" />
              {exam.duration || 60} mins
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Award className="h-3.5 w-3.5 text-emerald-500" />
              {exam.totalMarks || 50} pts total
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Everything included in exam pass
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {examFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs font-bold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isProcessing}
            onClick={handlePurchase}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-xs px-5 shadow-md shadow-[#0092E3]/20 cursor-pointer"
            leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          >
            {isProcessing ? "Processing..." : `Pay with Stripe • ৳${price}.00`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
