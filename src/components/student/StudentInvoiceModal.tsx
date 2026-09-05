"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  User,
  GraduationCap,
  CreditCard,
} from "lucide-react";
import { ExamPurchaseRecord } from "@/services/purchase.service";

interface StudentInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ExamPurchaseRecord | null;
}

export function StudentInvoiceModal({ isOpen, onClose, invoice }: StudentInvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const invoiceNumber = invoice.id || `INV-${String(invoice.examId).slice(-6)}`;
  const transactionId = invoice.transactionId || invoice.paymentTransactionId || "cs_stripe_verified";
  const studentName = invoice.studentName || "Student Scholar";
  const studentEmail = invoice.studentEmail || "student@example.com";
  const examTitle = invoice.examTitle || "Certified Examination Assessment";
  const teacherName = invoice.teacherName || invoice.teacherEmail || "Certified Teacher / Instructor";
  const paidAmount = Number(invoice.paidAmount ?? invoice.amount ?? 0);
  const originalPrice = Number(invoice.originalExamPrice ?? paidAmount);
  const currencySymbol = invoice.currency === "BDT" ? "৳" : "$";
  const purchaseDate = invoice.purchaseDate || invoice.purchasedAt || new Date().toISOString();
  const formattedDate = new Date(purchaseDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(purchaseDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Exam Invoice & Payment Voucher"
      description={`Transaction Reference: ${transactionId}`}
      size="lg"
    >
      <div className="space-y-6 pt-2 print:p-0 print:space-y-4">
        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
          {/* Top Decorative Border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0092E3] via-teal-400 to-[#152234]" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#0092E3] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  T
                </span>
                <span className="text-xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                  TESTIFY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Automated Assessment & Examination Cloud Platform
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAID IN FULL
              </div>
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {invoiceNumber}
              </p>
            </div>
          </div>

          {/* Student & Invoice Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="h-3 w-3" /> Student Customer
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {studentName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-mono">
                {studentEmail}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Student ID: {invoice.studentId}
              </p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center sm:justify-end gap-1">
                <Calendar className="h-3 w-3" /> Invoice Metadata
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                Date: <strong className="text-slate-900 dark:text-white">{formattedDate}</strong>
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                Time: {formattedTime}
              </p>
              <p className="text-slate-500 font-mono text-[11px] truncate max-w-[240px] sm:ml-auto">
                Txn: {transactionId}
              </p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item / Purchased Examination</th>
                  <th className="py-3 px-4">Exam Creator</th>
                  <th className="py-3 px-4 text-center">Original Price</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#0092E3]" />
                      <span>{examTitle}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {teacherName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {currencySymbol}{originalPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {currencySymbol}{paidAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary & Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <CreditCard className="h-3.5 w-3.5 text-[#0092E3]" />
                <span>Payment Gateway: <strong>{invoice.paymentProvider || "STRIPE SECURED"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Assessment Access Active</span>
              </div>
            </div>

            <div className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">{currencySymbol}{paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Platform Discount:</span>
                <span className="font-mono text-emerald-600">-{currencySymbol}0.00</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>Total Paid:</span>
                <span className="font-mono text-[#0092E3]">{currencySymbol}{paidAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-[10px] text-slate-400 text-center leading-relaxed">
            This document serves as an official electronic receipt and examination admission voucher. Retain this invoice for academic certification and audit records.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold px-4"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
              className="text-xs font-bold border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Print Invoice
            </Button>

            <Button
              type="button"
              onClick={handlePrint}
              leftIcon={<Download className="h-4 w-4" />}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold px-5 shadow-xs"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
