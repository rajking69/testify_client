"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth-client";
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Award,
  Clock,
  CreditCard,
  Lock,
  AlertTriangle,
  ShieldAlert,
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
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const price = (exam.price !== undefined && exam.price !== null && Number(exam.price) > 0) ? Number(exam.price) : 5;

  const handlePurchase = async () => {
    if (!agreedToPolicy) {
      setErrorMessage("Please acknowledge and agree to the 1-attempt examination policy before proceeding.");
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    // 0. Prevent re-purchase if account already submitted this exam
    if (typeof window !== "undefined") {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const currentEmail = (sessionData?.user?.email || "").trim().toLowerCase();
        const currentUserId = sessionData?.user?.id;

        const alreadyTaken = storedSubs.find((s: any) => {
          const matchExam =
            String(s.examId) === String(exam.id) ||
            String(s.id) === String(exam.id) ||
            s.token === exam.id ||
            (s.title && exam.title && s.title.trim().toLowerCase() === exam.title.trim().toLowerCase());

          const matchUser =
            (currentEmail && s.studentEmail && s.studentEmail.trim().toLowerCase() === currentEmail) ||
            (currentUserId && s.studentId && s.studentId === currentUserId);

          return matchExam && matchUser;
        });

        if (alreadyTaken) {
          setErrorMessage("You have already completed this examination. Re-purchasing and retakes are not permitted.");
          setIsProcessing(false);
          return;
        }
      } catch {}
    }

    try {
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
    "Full access to certified examination paper & questions",
    "Live timed assessment with automated evaluation",
    "Comprehensive solution breakdown with instant feedback",
    "Permanent transcript & performance analytics report",
    "Encrypted academic proctoring session",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unlock Examination Pass"
      description="Purchase official entry pass to attempt this verified examination."
      size="md"
    >
      <div className="space-y-5 pt-1">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pricing Box */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0092E3] dark:text-cyan-400">
                {exam.subject} Assessment
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                {exam.title}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ${price}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / pass</span>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">One-Time Access</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {exam.duration || 60} mins
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Award className="h-3.5 w-3.5 text-slate-400" />
              {exam.totalMarks || 50} pts total
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Included in exam pass
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {examFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Attempt Warning Alert */}
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Important Examination Warning</span>
          </div>
          <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 pl-6 list-disc leading-relaxed">
            <li>
              <strong>1-Attempt Limit:</strong> This paid pass allows <strong>only 1 attempt</strong>. Once submitted, retakes and repurchasing are strictly disabled.
            </li>
            <li>
              <strong>Account Bound:</strong> The pass is permanently linked to your logged-in account (<strong>{sessionData?.user?.email || "your account"}</strong>).
            </li>
            <li>
              <strong>Non-Refundable:</strong> Please ensure a stable internet connection and uninterrupted time before beginning.
            </li>
          </ul>

          <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="agreeExamPolicy"
              checked={agreedToPolicy}
              onChange={(e) => {
                setAgreedToPolicy(e.target.checked);
                if (e.target.checked) setErrorMessage(null);
              }}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label
              htmlFor="agreeExamPolicy"
              className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-snug cursor-pointer select-none"
            >
              I understand that I can attempt this exam <strong>only once</strong> and that no second chance or repurchase will be allowed.
            </label>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isProcessing || !agreedToPolicy}
            onClick={handlePurchase}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-semibold text-xs px-5 shadow-xs cursor-pointer"
            leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          >
            {isProcessing ? "Processing..." : `Pay $${price}.00 with Stripe`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
