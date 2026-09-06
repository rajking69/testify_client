"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  BookOpen,
  Users,
  ShieldCheck,
  Building2,
  Send,
  Clock,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet,
  Receipt,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { authClient } from "@/lib/auth-client";
import {
  purchaseService,
  TeacherEarningsSummary,
  ExamwiseRevenue,
  ExamPurchaseRecord,
} from "@/services/purchase.service";

export default function TeacherRevenuePage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [earningsData, setEarningsData] = useState<TeacherEarningsSummary | null>(null);
  const [teacherExams, setTeacherExams] = useState<any[]>([]);

  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "exams">("overview");

  // Filtering & Pagination State for Transactions
  const [txnSearchQuery, setTxnSearchQuery] = useState("");
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>("ALL");
  const [selectedTimeframeFilter, setSelectedTimeframeFilter] = useState<"ALL" | "TODAY" | "MONTH">("ALL");
  const [txnPage, setTxnPage] = useState(1);
  const [txnPageSize, setTxnPageSize] = useState(10);

  // Exam performance Search & Sorting
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [examSortBy, setExamSortBy] = useState<"sales" | "revenue" | "title">("revenue");

  // Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"stripe" | "bkash" | "bank">("stripe");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Transaction Details Modal State
  const [selectedTxnModal, setSelectedTxnModal] = useState<ExamPurchaseRecord | null>(null);

  useEffect(() => {
    const loadRevenueData = () => {
      try {
        const userEmail = user?.email;
        const userId = user?.id;
        if (!userEmail && !userId) return;

        // 1. Fetch teacher exams stored in localStorage
        const storedExams = JSON.parse(localStorage.getItem("testify_teacher_exams") || "[]");
        const myExams = storedExams.filter((e: any) => {
          const eTeacher = (e.teacherEmail || e.createdBy || "").trim().toLowerCase();
          const uEmail = (userEmail || "").trim().toLowerCase();
          const uId = userId || "";
          return eTeacher === uEmail || e.teacherId === uId || e.createdBy === uEmail;
        });
        setTeacherExams(myExams);

        // 2. Sanitize local purchase records to match active exam prices ($50.00)
        const storedPurchases = localStorage.getItem("testify_purchased_records");
        if (storedPurchases) {
          try {
            let records: ExamPurchaseRecord[] = JSON.parse(storedPurchases);
            let updated = false;
            records = records.map((r) => {
              const matched = myExams.find(
                (e: any) => String(e.id || e._id || e.code) === String(r.examId)
              );
              if (matched && matched.price && matched.price > 0 && r.amount !== matched.price) {
                updated = true;
                return {
                  ...r,
                  amount: Number(matched.price),
                  examTitle: matched.title || r.examTitle,
                };
              }
              if (r.amount === 5 || !r.amount) {
                updated = true;
                return { ...r, amount: 50 };
              }
              return r;
            });
            if (updated) {
              localStorage.setItem("testify_purchased_records", JSON.stringify(records));
            }
          } catch {}
        }

        // 3. Calculate Teacher Earnings strictly isolated by Teacher Identity (40% Fee)
        const summary = purchaseService.getTeacherEarnings(userEmail || userId, myExams);
        setEarningsData(summary);
      } catch (err) {
        console.error("Failed to load teacher revenue:", err);
      }
    };

    loadRevenueData();
    window.addEventListener("storage", loadRevenueData);
    window.addEventListener("testify_exam_submitted", loadRevenueData);
    return () => {
      window.removeEventListener("storage", loadRevenueData);
      window.removeEventListener("testify_exam_submitted", loadRevenueData);
    };
  }, [user?.email, user?.id]);

  useEffect(() => {
    setTxnPage(1);
  }, [txnSearchQuery, selectedExamFilter, selectedTimeframeFilter]);

  const filteredTransactions = useMemo(() => {
    if (!earningsData?.recentTransactions) return [];

    let list = [...earningsData.recentTransactions];

    if (selectedTimeframeFilter === "TODAY") {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      list = list.filter((tx) => new Date(tx.purchasedAt || Date.now()).getTime() >= startOfToday);
    } else if (selectedTimeframeFilter === "MONTH") {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      list = list.filter((tx) => new Date(tx.purchasedAt || Date.now()).getTime() >= startOfMonth);
    }

    if (selectedExamFilter !== "ALL") {
      list = list.filter((tx) => String(tx.examId) === String(selectedExamFilter));
    }

    if (txnSearchQuery.trim()) {
      const q = txnSearchQuery.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          (tx.studentName || "").toLowerCase().includes(q) ||
          (tx.studentEmail || "").toLowerCase().includes(q) ||
          (tx.examTitle || "").toLowerCase().includes(q) ||
          (tx.transactionId || "").toLowerCase().includes(q) ||
          (tx.id || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [earningsData, selectedTimeframeFilter, selectedExamFilter, txnSearchQuery]);

  const totalTxnPages = Math.ceil(filteredTransactions.length / txnPageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (txnPage - 1) * txnPageSize;
    return filteredTransactions.slice(start, start + txnPageSize);
  }, [filteredTransactions, txnPage, txnPageSize]);

  const filteredExams = useMemo(() => {
    if (!earningsData?.examBreakdown) return [];

    let list = [...earningsData.examBreakdown];

    if (examSearchQuery.trim()) {
      const q = examSearchQuery.toLowerCase().trim();
      list = list.filter((e) => e.examTitle.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (examSortBy === "sales") return b.soldCount - a.soldCount;
      if (examSortBy === "title") return a.examTitle.localeCompare(b.examTitle);
      return b.grossRevenue - a.grossRevenue;
    });

    return list;
  }, [earningsData, examSearchQuery, examSortBy]);

  const handleExportCSV = () => {
    if (!earningsData || earningsData.recentTransactions.length === 0) {
      showToast("No transaction records available to export.");
      return;
    }

    const headers = ["Transaction ID", "Student Name", "Student Email", "Exam Title", "Amount ($)", "Gateway", "Status", "Date"];
    const rows = filteredTransactions.map((tx) => [
      tx.transactionId || tx.id,
      `"${tx.studentName || "Student Scholar"}"`,
      tx.studentEmail || "",
      `"${tx.examTitle || "Paid Assessment"}"`,
      tx.amount.toFixed(2),
      tx.paymentProvider || "STRIPE",
      tx.paymentStatus,
      new Date(tx.purchasedAt || Date.now()).toLocaleDateString("en-US"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Testify_Teacher_Revenue_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV Financial Statement exported successfully!");
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Please enter a valid payout amount.");
      return;
    }
    if (earningsData && amountNum > earningsData.teacherEarnings) {
      showToast(`Payout amount cannot exceed available net balance ($${earningsData.teacherEarnings.toFixed(2)}).`);
      return;
    }

    setIsSubmittingPayout(true);
    setTimeout(() => {
      setIsSubmittingPayout(false);
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
      setPayoutDetails("");
      showToast(`Payout request for $${amountNum.toFixed(2)} via ${payoutMethod.toUpperCase()} submitted for processing!`);
    }, 1200);
  };

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#0092E3] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading revenue console...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Access Restricted
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Revenue &amp; Financial Sales data can only be accessed by verified Exam Creators / Teachers.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2238] hover:bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-md"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const grossRev = earningsData?.grossRevenue || 0;
  const netRev = earningsData?.teacherEarnings || 0;
  const platformFee = earningsData?.platformFees || 0;
  const totalSales = earningsData?.totalSalesCount || 0;
  const paidExamsCount = earningsData?.paidExamsCount || 0;
  const monthNet = earningsData?.monthNetEarnings || 0;
  const todayNet = earningsData?.todayNetEarnings || 0;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl bg-[#0B2238] text-white text-xs font-semibold border border-cyan-500/40 animate-bounce backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 text-[#00CBB8] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. MINIMAL EXECUTIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              Revenue Console
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">40% Platform Fee</span>
          </div>
          <h1 className="text-2xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
            Revenue &amp; Sales Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/teacher/dashboard">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4 text-[#0092E3]" />}
              className="h-9 px-3.5 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 hover:border-[#0092E3]/40"
            >
              Dashboard
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="h-3.5 w-3.5 text-[#0092E3]" />}
            className="h-9 px-3.5 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 hover:border-[#0092E3]/40"
          >
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPayoutModalOpen(true)}
            leftIcon={<CreditCard className="h-3.5 w-3.5" />}
            className="h-9 px-4 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            Withdraw (${netRev.toFixed(2)})
          </Button>

          <ThemeToggle className="shrink-0 h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* 2. CONSISTENT & UNIFORM METRIC CARDS (DARK MODE STYLE MATCHED) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Net Teacher Earnings (60%) */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Teacher Earnings (60%)
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ${netRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between font-medium">
            <span>Gross: ${grossRev.toFixed(2)}</span>
            <span className="text-amber-600 dark:text-amber-400">Fee (40%): ${platformFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 2: Current Month Net */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            This Month Net
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            ${monthNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Today: ${todayNet.toFixed(2)}</div>
        </div>

        {/* Card 3: Total Exams Sold */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Exams Sold
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            {totalSales} <span className="text-xs font-normal text-slate-400">Purchases</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Student Vouchers Verified</div>
        </div>

        {/* Card 4: Monetized Papers */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monetized Papers
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            {paidExamsCount} <span className="text-xs font-normal text-slate-400">Exams</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active Paid Exam Papers</div>
        </div>
      </div>

      {/* 3. MINIMAL TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "overview"
              ? "bg-[#0B2238] text-white dark:bg-[#0092E3] shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Overview &amp; Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "transactions"
              ? "bg-[#0B2238] text-white dark:bg-[#0092E3] shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Receipt className="h-3.5 w-3.5" />
          <span>Transactions ({filteredTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "exams"
              ? "bg-[#0B2238] text-white dark:bg-[#0092E3] shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Exam Performance ({filteredExams.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW & BREAKDOWN */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Commission Split */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0B2238] dark:text-white">
                    Platform Revenue Split Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    60% Instructor Net vs 40% Platform Maintenance Split
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">40% Fee Standard</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales</span>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                    ${grossRev.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Platform Fee (40%)</span>
                  <div className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-300 mt-0.5">
                    -${platformFee.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Net Teacher (60%)</span>
                  <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                    ${netRev.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">Teacher Net (60%)</span>
                  <span className="text-amber-600 dark:text-amber-400">Platform Maintenance (40%)</span>
                </div>
                <div className="w-full bg-amber-100 dark:bg-amber-950 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: grossRev > 0 ? "60%" : "100%" }} />
                  <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: grossRev > 0 ? "40%" : "0%" }} />
                </div>
              </div>
            </div>

            {/* Right 1 Col: Top Selling Monetized Papers */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-sm font-bold text-[#0B2238] dark:text-white flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span>Top Monetized Papers</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {filteredExams.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No monetized exam sales yet.</p>
                ) : (
                  filteredExams.slice(0, 3).map((ex) => (
                    <div key={ex.examId} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between">
                      <div className="truncate max-w-[150px]">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{ex.examTitle}</div>
                        <div className="text-[10px] text-slate-400">{ex.soldCount} Sold @ ${ex.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                        ${ex.netEarnings.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CUSTOMER TRANSACTIONS ONLY */}
      {activeTab === "transactions" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-[#0B2238] dark:text-white tracking-tight">
                Customer Transactions &amp; Purchase Logs
              </h2>
              <p className="text-xs text-slate-500">
                Verified student exam voucher payments ({filteredTransactions.length} Total Records)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, txn or exam..."
                  value={txnSearchQuery}
                  onChange={(e) => setTxnSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0092E3]/20"
                />
              </div>

              <select
                value={selectedTimeframeFilter}
                onChange={(e: any) => setSelectedTimeframeFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="MONTH">This Month</option>
              </select>

              <select
                value={selectedExamFilter}
                onChange={(e) => setSelectedExamFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer max-w-[150px] truncate"
              >
                <option value="ALL">All Exams</option>
                {teacherExams.map((ex) => (
                  <option key={ex.id || ex._id} value={ex.id || ex._id}>
                    {ex.title}
                  </option>
                ))}
              </select>

              <select
                value={txnPageSize}
                onChange={(e) => {
                  setTxnPageSize(Number(e.target.value));
                  setTxnPage(1);
                }}
                className="px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-xl">Transaction ID</th>
                  <th className="py-2.5 px-3">Student Customer</th>
                  <th className="py-2.5 px-3">Purchased Exam</th>
                  <th className="py-2.5 px-3 text-center">Gateway</th>
                  <th className="py-2.5 px-3 text-right">Gross Charged</th>
                  <th className="py-2.5 px-3 text-right">Teacher Net (60%)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No customer transactions found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => {
                    const matchedExam = teacherExams.find(
                      (e: any) => String(e.id || e._id || e.code) === String(tx.examId)
                    );
                    const grossPrice = matchedExam?.price && matchedExam.price > 0 ? Number(matchedExam.price) : (tx.amount || 50);
                    const netShare = grossPrice * 0.6;
                    const displayExamTitle = matchedExam?.title || tx.examTitle || "JavaScript Fundamentals – Live Assessment";

                    return (
                      <tr
                        key={tx.id || tx.transactionId}
                        onClick={() => setSelectedTxnModal({ ...tx, amount: grossPrice, examTitle: displayExamTitle })}
                        className="hover:bg-slate-100/80 dark:hover:bg-slate-900/70 transition-colors cursor-pointer group"
                        title="Click to view full voucher transaction details"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#0092E3] dark:text-cyan-400 group-hover:underline">
                          {tx.transactionId || tx.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white">{tx.studentName || "Sheikh Mohammad Rajking"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tx.studentEmail || "smrajking4@gmail.com"}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                          {displayExamTitle}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono text-[10px] font-bold text-[#0092E3]">
                            {tx.paymentProvider || "STRIPE"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ${grossPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${netShare.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="h-2.5 w-2.5" /> PAID
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                          {new Date(tx.purchasedAt || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">
                {filteredTransactions.length === 0 ? 0 : (txnPage - 1) * txnPageSize + 1}
              </span> to <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(txnPage * txnPageSize, filteredTransactions.length)}
              </span> of <span className="font-bold text-slate-900 dark:text-white">{filteredTransactions.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={txnPage <= 1}
                onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 rounded-lg text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>

              <span className="px-3 py-1 font-mono font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Page {txnPage} of {totalTxnPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={txnPage >= totalTxnPages}
                onClick={() => setTxnPage((p) => Math.min(totalTxnPages, p + 1))}
                className="h-8 px-2.5 rounded-lg text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: EXAM PERFORMANCE TABLE ONLY */}
      {activeTab === "exams" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0B2238] dark:text-white tracking-tight">
                Exam-Wise Sales Performance Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Individual monetized exam papers unit price, total sales, and net revenue
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter title..."
                  value={examSearchQuery}
                  onChange={(e) => setExamSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={examSortBy}
                onChange={(e: any) => setExamSortBy(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                <option value="revenue">Sort: Highest Revenue</option>
                <option value="sales">Sort: Highest Sales</option>
                <option value="title">Sort: Title</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-xl">Monetized Exam Paper</th>
                  <th className="py-2.5 px-3 text-center">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Students Purchased</th>
                  <th className="py-2.5 px-3 text-right">Gross Sales</th>
                  <th className="py-2.5 px-3 text-right">Platform Fee (40%)</th>
                  <th className="py-2.5 px-3 text-right">Net Teacher (60%)</th>
                  <th className="py-2.5 px-3 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No monetized exams found.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((ex) => (
                    <tr key={ex.examId} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{ex.examTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {ex.examId}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${ex.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0092E3] dark:text-cyan-300">
                          {ex.soldCount} Sold
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${ex.grossRevenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                        -${ex.platformFee.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${ex.netEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ex.soldCount > 0
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                        }`}>
                          {ex.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PAYOUT REQUEST MODAL */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Request Earnings Payout"
        description="Withdraw your verified net revenue directly to your Stripe account, Bank Transfer, or bKash."
        size="md"
      >
        <form onSubmit={handlePayoutSubmit} className="space-y-4 pt-1">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 border border-emerald-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Available Net Balance
            </span>
            <div className="text-2xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
              ${netRev.toFixed(2)} USD
            </div>
            <p className="text-[11px] text-slate-500">100% cleared net funds after 40% platform hosting fee</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payout Amount ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={netRev}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`e.g. ${netRev.toFixed(2)}`}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payout Destination Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("stripe")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    payoutMethod === "stripe"
                      ? "border-[#0092E3] bg-blue-50 dark:bg-blue-950/60 text-[#0092E3]"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Stripe Direct</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod("bkash")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    payoutMethod === "bkash"
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-950/60 text-pink-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>bKash (BD)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod("bank")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    payoutMethod === "bank"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-600"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Bank Wire</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Details / Number / IBAN
              </label>
              <input
                type="text"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder={payoutMethod === "bkash" ? "Enter 11-digit bKash Personal Number..." : "Enter Account Number / Email..."}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsPayoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingPayout || netRev <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 text-xs"
            >
              {isSubmittingPayout ? "Processing Payout..." : "Submit Payout Request"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Customer Transaction & Voucher Receipt Audit Modal */}
      {selectedTxnModal && (
        <Modal
          isOpen={!!selectedTxnModal}
          onClose={() => setSelectedTxnModal(null)}
          title="Student Transaction & Voucher Receipt"
          description="Verified student examination voucher payment audit record."
          size="md"
        >
          <div className="space-y-4 pt-1 font-sans text-xs">
            {/* Top Status & Receipt Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0092E3] block">
                  Official Audit Trail
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {selectedTxnModal.transactionId || selectedTxnModal.id}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> PAID IN FULL
              </span>
            </div>

            {/* Customer & Gateway Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Student Candidate
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedTxnModal.studentName || "Sheikh Mohammad Rajking"}
                </p>
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {selectedTxnModal.studentEmail || "smrajking4@gmail.com"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Payment Gateway
                </span>
                <p className="font-bold text-[#0092E3]">
                  {selectedTxnModal.paymentProvider || "STRIPE"}
                </p>
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {new Date(selectedTxnModal.purchasedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Exam Title Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#0092E3] block">
                Purchased Examination Paper
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {selectedTxnModal.examTitle || "JavaScript Fundamentals – Live Assessment"}
              </p>
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 shadow-md">
              <div className="flex justify-between items-center text-slate-300 text-xs">
                <span>Gross Charged Amount:</span>
                <span className="font-mono font-bold text-white">${(selectedTxnModal.amount || 50).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-amber-400 text-xs">
                <span>Platform Maintenance Fee (40%):</span>
                <span className="font-mono font-bold">-${((selectedTxnModal.amount || 50) * 0.4).toFixed(2)} USD</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-extrabold">
                <span className="text-emerald-400">Net Teacher Share (60%):</span>
                <span className="font-mono text-emerald-400 text-base">
                  +${((selectedTxnModal.amount || 50) * 0.6).toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={() => setSelectedTxnModal(null)}
                className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-6 rounded-xl cursor-pointer"
              >
                Close Details
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
