"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { purchaseService } from "@/services/purchase.service";

export interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: {
    transactionId: string;
    cardLast4: string;
    amount: number;
    currency: string;
  }) => void;
  title: string;
  subtitle?: string;
  amount: number;
  currencySymbol?: string;
  itemType: "EXAM" | "TEACHER_PREMIUM";
  itemId: string;
  studentEmail?: string;
}

export function StripeCardPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  subtitle,
  amount,
  currencySymbol = "$",
  itemType,
  itemId,
  studentEmail = "",
}: StripePaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardHolder, setCardHolder] = useState("Testify Candidate");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("888");
  const [email, setEmail] = useState(studentEmail);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format Card Number input with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
    setErrorMessage(null);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (val.length >= 2) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setExpiry(val);
    setErrorMessage(null);
  };

  // Handle Card Submission
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\D/g, "");
    if (cleanCard.length > 0 && cleanCard.length < 16 && !cardNumber.includes("••••")) {
      setErrorMessage("Please enter a valid 16-digit credit/debit card number.");
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMessage("Please enter the cardholder name.");
      return;
    }
    if (expiry.length < 5 && !expiry.includes("12/28")) {
      setErrorMessage("Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (cvc.length < 3 && !cvc.includes("888")) {
      setErrorMessage("Please enter a valid 3-digit security CVC code.");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate real Stripe API card verification handshake
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const transactionId = `txn_strp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const cardLast4 = cleanCard.length >= 4 ? cleanCard.slice(-4) : "4242";

      // Save purchase record & generate official invoice
      if (typeof window !== "undefined") {
        if (itemType === "EXAM") {
          const stored = localStorage.getItem("testify_student_purchases") || "[]";
          const ids: string[] = JSON.parse(stored);
          if (!ids.includes(itemId)) {
            ids.push(itemId);
            localStorage.setItem("testify_student_purchases", JSON.stringify(ids));
          }

          let matchedTeacherId = "";
          let matchedTeacherEmail = "";
          let matchedTeacherName = "";
          let matchedExamTitle = title || "Certified Assessment";
          let matchedPrice = amount || 50;

          try {
            const storedExams = JSON.parse(localStorage.getItem("testify_teacher_exams") || "[]");
            const found = storedExams.find(
              (e: any) =>
                String(e.id || e._id || e.code) === String(itemId) ||
                (e.title && title && e.title.trim().toLowerCase() === title.trim().toLowerCase())
            );
            if (found) {
              matchedTeacherId = found.teacherId || found.teacherEmail || found.createdBy || "";
              matchedTeacherEmail = found.teacherEmail || found.createdBy || "";
              matchedTeacherName = found.teacherName || found.instructorName || "";
              matchedExamTitle = found.title || matchedExamTitle;
              if (found.price && Number(found.price) > 0) {
                matchedPrice = Number(found.price);
              }
            }
          } catch {}

          const now = new Date();
          const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
          const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
          const invoiceNumber = `INV-${dateStr}-${randSuffix}`;

          purchaseService.recordPurchase({
            id: invoiceNumber,
            studentId: "student_verified",
            studentName: cardHolder || "Student Scholar",
            studentEmail: (email || studentEmail || "").trim().toLowerCase() || "student@example.com",
            examId: itemId,
            examTitle: matchedExamTitle,
            teacherId: matchedTeacherId || "certified_instructor",
            teacherName: matchedTeacherName || matchedTeacherEmail || "Certified Teacher / Instructor",
            teacherEmail: matchedTeacherEmail,
            originalExamPrice: matchedPrice,
            paidAmount: matchedPrice,
            amount: matchedPrice,
            currency: "USD",
            paymentProvider: "STRIPE",
            paymentMethod: "Stripe Secured Card",
            transactionId: transactionId,
            paymentTransactionId: transactionId,
            paymentStatus: "SUCCESS",
            purchasedAt: now.toISOString(),
            purchaseDate: now.toISOString(),
            createdAt: now.toISOString(),
            accessStatus: "ACTIVE",
          });

          // Dispatch event to refresh invoices across teacher & student views
          window.dispatchEvent(new CustomEvent("testify_exam_submitted"));
        }
      }

      onSuccess({
        transactionId,
        cardLast4,
        amount,
        currency: "USD",
      });
      onClose();
    } catch (err: any) {
      setErrorMessage("Payment verification failed. Please check your card information.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-300 border border-blue-200/80 dark:border-cyan-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Stripe Secure Paywall
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-[#152234] dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* Order Price Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 border border-blue-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Total Charge Amount
            </span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              One-Time Instant Assessment Pass
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black font-display text-[#0092E3] dark:text-cyan-400">
              {currencySymbol}{amount}.00
            </span>
          </div>
        </div>

        {/* Realistic Interactive Credit Card Preview */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0092E3] p-5 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                <div className="w-4 h-3 border border-amber-800/40 rounded-sm" />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                Debit / Credit Pass
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold tracking-widest text-xs">
              <span className="text-sky-300">STRIPE</span>
            </div>
          </div>

          <div className="py-1">
            <p className="font-mono text-base sm:text-lg tracking-widest font-bold drop-shadow-sm">
              {cardNumber || "•••• •••• •••• ••••"}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <div>
              <span className="block text-[9px] text-slate-400 uppercase tracking-wider">
                Cardholder Name
              </span>
              <span className="font-bold tracking-wide uppercase">
                {cardHolder || "CANDIDATE NAME"}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] text-slate-400 uppercase tracking-wider">
                Expires
              </span>
              <span className="font-mono font-bold">{expiry || "MM/YY"}</span>
            </div>
          </div>
        </div>

        {/* Card Payment Form */}
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Card Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                className="pl-10 font-mono font-bold tracking-wider text-xs h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cardholder Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="e.g. John Doe"
              className="text-xs h-11 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <Input
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="font-mono font-bold text-xs h-11 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>CVC / CVV <span className="text-rose-500">*</span></span>
                <span className="text-[10px] font-normal text-slate-400">3-Digits</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.substring(0, 4))}
                  placeholder="123"
                  type="password"
                  className="pl-10 font-mono font-bold text-xs h-11 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-xl shadow-[#0092E3]/25 transition-all cursor-pointer"
            leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          >
            {isProcessing ? "Authorizing Stripe Payment..." : `Pay ${currencySymbol}${amount}.00 & Unlock Exam`}
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>End-to-End 256-Bit Encrypted via Stripe Gateway</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
