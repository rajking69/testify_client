"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  KeyRound,
  Filter,
  Star,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { examService } from "@/services/exam.service";
import { StudentExamPurchaseModal } from "@/components/student/StudentExamPurchaseModal";
import { authClient } from "@/lib/auth-client";

export interface MarketplaceExam {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacherName: string;
  teacherEmail?: string;
  teacherId?: string;
  duration: number;
  totalMarks: number;
  passMark: number;
  questionsCount: number;
  accessType: "FREE" | "PAID";
  price: number;
  rating: number;
  enrollmentCount: number;
  joinCode?: string;
  accessToken?: string;
  status: string;
  startDateTime?: string;
  endDateTime?: string;
  requireCamera?: boolean;
}

const defaultMarketplaceExams: MarketplaceExam[] = [];


export const getExamScheduleDetails = (exam: {
  startDateTime?: string;
  endDateTime?: string;
  createdAt?: string;
  date?: string;
  status?: string;
}) => {
  let startFormatted = "";
  let endFormatted = "";
  let isUpcoming = false;

  const now = Date.now();

  if (exam.startDateTime) {
    const startDate = new Date(exam.startDateTime);
    if (!isNaN(startDate.getTime())) {
      if (startDate.getTime() > now) {
        isUpcoming = true;
      }
      const dStr = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const tStr = startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      startFormatted = dStr + " • " + tStr;
    }
  }

  if (exam.endDateTime) {
    const endDate = new Date(exam.endDateTime);
    if (!isNaN(endDate.getTime())) {
      const dStr = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const tStr = endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      endFormatted = dStr + " • " + tStr;
    }
  }

  if (!startFormatted) {
    if (exam.date && exam.date !== "Scheduled Soon" && !exam.date.toLowerCase().includes("soon")) {
      startFormatted = exam.date;
    } else if (exam.createdAt) {
      const created = new Date(exam.createdAt);
      if (!isNaN(created.getTime())) {
        startFormatted = created.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    if (!startFormatted) {
      startFormatted = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  if (!endFormatted) {
    endFormatted = "Open / Flexible";
  }

  if (
    exam.status &&
    (exam.status === "Scheduled" ||
      exam.status === "SCHEDULED" ||
      exam.status === "Upcoming" ||
      exam.status === "UPCOMING")
  ) {
    isUpcoming = true;
  }

  return { startFormatted, endFormatted, isUpcoming };
};

export default function StudentExamsMarketplacePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [exams, setExams] = useState<MarketplaceExam[]>([]);
  const [purchasedExamIds, setPurchasedExamIds] = useState<string[]>([]);
  const [completedExamIds, setCompletedExamIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  // Purchase Modal
  const [purchasingExam, setPurchasingExam] = useState<MarketplaceExam | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Purchased Exams & Real Teacher Exams from Backend & Storage
  useEffect(() => {
    async function loadExamsData() {
      try {
        // 1. Load Completed Submissions
        const currentEmail = (session?.user?.email || "").trim().toLowerCase();
        const currentUserId = session?.user?.id;

        if (typeof window !== "undefined") {
          localStorage.removeItem("testify_student_purchases");
          try {
            if (!currentEmail && !currentUserId) {
              setCompletedExamIds([]);
            } else {
              const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
              const completed = storedSubs
                .filter((s: any) =>
                  (currentEmail && s.studentEmail && s.studentEmail.trim().toLowerCase() === currentEmail) ||
                  (currentUserId && s.studentId && s.studentId === currentUserId)
                )
                .flatMap((s: any) => [
                  String(s.examId || ""),
                  String(s.id || ""),
                  String(s.token || ""),
                  String(s.accessToken || ""),
                  String(s.joinCode || ""),
                  String(s.title || "").toLowerCase(),
                  String(s.examTitle || "").toLowerCase()
                ].filter(Boolean));
              setCompletedExamIds(completed);
            }
          } catch {}
        }

        // Sync from Backend Submissions API
        if (currentEmail || currentUserId) {
          try {
            const res = await examService.getMySubmissions();
            if (res && res.data && res.data.length > 0) {
              const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
              const apiSubsConverted = res.data.map((sub: any) => ({
                id: String(sub._id || sub.examId),
                examId: String(sub.examId),
                title: (sub.exam as any)?.title || sub.title || "Completed Assessment",
                subject: (sub.exam as any)?.subject || sub.subject || "General",
                duration: `${(sub.exam as any)?.durationMinutes || 60} mins`,
                schedule: `Completed on ${new Date(sub.submittedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
                status: "Completed",
                score: `${sub.score || 0}%`,
                percentage: sub.score || 0,
                isPassed: Boolean(sub.passed),
                studentEmail: currentEmail,
                studentId: currentUserId,
                token: String(sub.examId),
                completedAt: sub.submittedAt || new Date().toISOString(),
                timeTakenSeconds: 300,
                correctAnswers: sub.answers ? sub.answers.filter((a: any) => a.isCorrect).length : 0,
                totalQuestions: sub.answers ? sub.answers.length : 10,
              }));

              const merged = [...storedSubs];
              apiSubsConverted.forEach((apiItem) => {
                if (!merged.some((m: any) => String(m.examId) === String(apiItem.examId) && ((currentEmail && m.studentEmail === currentEmail) || (currentUserId && m.studentId === currentUserId)))) {
                  merged.unshift(apiItem);
                }
              });
              localStorage.setItem("testify_student_submissions", JSON.stringify(merged));

              const userOnlySubs = merged.filter((s: any) =>
                (currentEmail && s.studentEmail && s.studentEmail.trim().toLowerCase() === currentEmail) ||
                (currentUserId && s.studentId && s.studentId === currentUserId)
              );

              const updatedCompleted = userOnlySubs.flatMap((s: any) => [
                String(s.examId || ""),
                String(s.id || ""),
                String(s.token || ""),
                String(s.accessToken || ""),
                String(s.joinCode || ""),
                String(s.title || "").toLowerCase(),
                String(s.examTitle || "").toLowerCase()
              ].filter(Boolean));

              setCompletedExamIds(updatedCompleted);
            }
          } catch {}
        }
        const storedRecords = localStorage.getItem("testify_purchased_records");
        if (storedRecords) {
          const records = JSON.parse(storedRecords);
          const validIds = records
            .filter((r: any) =>
              r.paymentStatus === "SUCCESS" &&
              ((currentEmail && r.studentEmail && r.studentEmail.trim().toLowerCase() === currentEmail) ||
                (currentUserId && r.studentId && r.studentId === currentUserId))
            )
            .map((r: any) => String(r.examId));
          setPurchasedExamIds(validIds);
        } else {
          setPurchasedExamIds([]);
        }

        let realList: MarketplaceExam[] = [];

        // 2. Load Real Teacher Published Exams from localStorage
        const teacherExamsRaw = localStorage.getItem("testify_teacher_exams");
        if (teacherExamsRaw) {
          const teacherList = JSON.parse(teacherExamsRaw);
          realList = teacherList
            .filter((t: any) => t.status === "Published" || t.status === "Ready" || t.status === "Scheduled")
            .map((t: any) => ({
              id: String(t.id),
              title: t.title,
              subject: t.subject || "General",
              description: t.description || "Instructor published examination.",
              teacherName: t.teacherName || t.creatorName || (t.teacherEmail ? t.teacherEmail.split("@")[0] : "Your Instructor"),
              teacherEmail: t.teacherEmail || t.createdBy || "",
              teacherId: t.teacherId || t.creatorId || "",
              duration: t.duration || 60,
              totalMarks: t.totalMarks || 50,
              passMark: t.passMark || 20,
              questionsCount: t.questions?.length || 0,
              accessType: (t.accessType === "PAID" || t.accessType === "paid" || Number(t.price) > 0) ? "PAID" : "FREE",
              price: Number(t.price) || 0,
              rating: 5.0,
              enrollmentCount: 0,
              joinCode: t.joinCode || "TST123",
              accessToken: t.accessToken || String(t.id),
              status: "Published",
              startDateTime: t.startDateTime || t.date,
              endDateTime: t.endDateTime,
                requireCamera: Boolean(t.requireCamera || t.requireCameraProctoring || t.cameraRequired || (t.proctoring && t.proctoring.cameraActive)),
            }));
        }

        // 3. Also fetch live from backend API
        try {
          const res = await examService.getAllExams();
          if (res.data) {
            const apiExams: MarketplaceExam[] = res.data
              .filter((t: any) => t.isPublished !== false && t.status !== "Draft")
              .map((t: any) => ({
                id: String(t.id || t._id),
                title: t.title,
                subject: t.subject || t.category || "General",
                description: t.description || "Instructor published examination.",
                teacherName: (t.createdBy as any)?.name || t.teacherName || "Certified Instructor",
                teacherEmail: (t.createdBy as any)?.email || t.teacherEmail || "",
                teacherId: (t.createdBy as any)?._id || (t.createdBy as any)?.id || t.teacherId || "",
                duration: t.durationMinutes || 60,
                totalMarks: t.totalMarks || 50,
                passMark: Math.round((t.totalMarks || 50) * (t.passPercentage || 40) / 100),
                questionsCount: t.questions?.length || 0,
                accessType: (t.accessType === "PAID" || t.accessType === "paid" || Number(t.price) > 0) ? "PAID" : "FREE",
                price: Number(t.price) || 0,
                rating: 5.0,
                enrollmentCount: 0,
                joinCode: t.joinCode || String(t._id),
                accessToken: t.accessToken || String(t._id),
                status: "Published",
              }));

            apiExams.forEach((ae) => {
              if (!realList.some((r) => r.id === ae.id)) {
                realList.unshift(ae);
              }
            });
          }
        } catch {}

        // Standard catalog mock exams removed so only teacher-created exams appear
        setExams(realList);
      } catch {
        setExams([]);
      }
    }
    loadExamsData();
  }, [session?.user?.email, session?.user?.id]);

  
  const isExamExpired = (exam: MarketplaceExam) => {
    if (exam.endDateTime) {
      const endDate = new Date(exam.endDateTime);
      if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
        return true;
      }
    }
    const statusUpper = String(exam.status || "").toUpperCase();
    if (statusUpper === "EXPIRED") {
      return true;
    }
    return false;
  };

  const isExamCompleted = (exam: MarketplaceExam) => {
    const currentEmail = (session?.user?.email || "").trim().toLowerCase();
    const currentUserId = session?.user?.id;

    if (!currentEmail && !currentUserId) {
      return false; // Guests have not completed any exam under an account
    }

    const idStr = String(exam.id);
    const tokenStr = String(exam.accessToken || "");
    const codeStr = String(exam.joinCode || "");
    const titleStr = String(exam.title || "").toLowerCase();

    if (
      completedExamIds.includes(idStr) ||
      (tokenStr && completedExamIds.includes(tokenStr)) ||
      (codeStr && completedExamIds.includes(codeStr)) ||
      (titleStr && completedExamIds.includes(titleStr))
    ) {
      return true;
    }

    if (typeof window !== "undefined") {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        return storedSubs.some((s: any) => {
          const sEmail = (s.studentEmail || "").trim().toLowerCase();
          const sUserId = s.studentId || s.userId;

          const matchUser =
            (currentEmail && sEmail && sEmail === currentEmail) ||
            (currentUserId && sUserId && sUserId === currentUserId);

          if (!matchUser) return false;

          const sExamId = String(s.examId || s.id || s.token || "");
          const sTitle = String(s.title || s.examTitle || "").trim().toLowerCase();
          return (
            sExamId === idStr ||
            sExamId === tokenStr ||
            sExamId === codeStr ||
            (sTitle && titleStr && (sTitle === titleStr || sTitle.includes(titleStr) || titleStr.includes(sTitle)))
          );
        });
      } catch {}
    }

    return false;
  };

  const subjects = ["All", ...Array.from(new Set(exams.map((e) => e.subject)))];

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedSubject, typeFilter]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.subject.toLowerCase().includes(search.toLowerCase()) ||
        exam.teacherName.toLowerCase().includes(search.toLowerCase()) ||
        (exam.joinCode && exam.joinCode.toLowerCase().includes(search.toLowerCase()));

      const matchSubject = selectedSubject === "All" || exam.subject === selectedSubject;
      const matchType = typeFilter === "ALL" || exam.accessType === typeFilter;

      return matchSearch && matchSubject && matchType;
    });
  }, [exams, search, selectedSubject, typeFilter]);

  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE) || 1;

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExams.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExams, currentPage]);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    router.push(`/exam/${roomCodeInput.trim().toUpperCase()}`);
  };

  const handleBuyExam = async () => {
    if (!purchasingExam) return;

    setIsProcessingPayment(true);
    try {
      const res = await fetch("/api/payments/exam/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: purchasingExam.id,
          examTitle: purchasingExam.title,
          examSubject: purchasingExam.subject,
          price: purchasingExam.price,
        }),
      });
      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error(data.message || "Failed to initialize Stripe payment session.");
    } catch (err: any) {
      console.error("Purchase failed:", err);
      showToast(err.message || "Payment authorization failed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Hero Banner with Room Code Quick Join */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Examination Marketplace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Discover & Take Certified Examinations
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Join free classroom assessments via instructor room codes or enroll in premium mock tests.
            </p>
          </div>

          {/* Quick Room Code Entry Box */}
          <form
            onSubmit={handleJoinByCode}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shrink-0 space-y-2 max-w-sm w-full"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <KeyRound className="h-4 w-4 text-cyan-200" />
              <span>Have an Exam Room Code?</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. CSE7K29"
                className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl bg-black/20 border border-white/30 text-white placeholder:text-blue-200 focus:outline-none focus:border-white"
              />
              <Button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shrink-0 px-4"
              >
                Join
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2">
          {(["ALL", "FREE", "PAID"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === type
                  ? "bg-[#0092E3] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {type === "ALL" ? "All Exams" : type === "FREE" ? "Free Classroom" : "Paid Marketplace"}
            </button>
          ))}
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, subject, code..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === "All" ? "All Subjects" : sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          No examinations found matching your filter criteria.
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedExams.map((exam, index) => {
            const isPurchased = purchasedExamIds.includes(exam.id);
            const expired = isExamExpired(exam);
            const isPaid = String(exam.accessType).toUpperCase() === "PAID";
            const targetToken = exam.accessToken || exam.joinCode || exam.id;
            const scheduleInfo = getExamScheduleDetails(exam);

            return (
              <Card
                key={(exam as any)._id || exam.id || index}
                hoverEffect
                className="flex flex-col justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400 font-bold">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {scheduleInfo.isUpcoming && !expired && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs animate-pulse">
                          <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          SOON
                        </span>
                      )}
                      {expired ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 shadow-2xs">
                          <Clock className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Expired
                        </span>
                      ) : isExamCompleted(exam) ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Completed
                        </span>
                      ) : isPaid ? (
                        isPurchased ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Purchased
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 shadow-2xs">
                            <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Paid • ${exam.price}
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <CardTitle className="mt-3 text-base font-bold font-display text-[#152234] dark:text-white leading-snug line-clamp-1">
                    {exam.title}
                  </CardTitle>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-[#0092E3] dark:text-cyan-400">
                      {exam.subject}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400" /> {exam.rating}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Schedule Date & Time Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-slate-950/70 border border-blue-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1 font-bold text-[#0092E3]">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>Start:</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {scheduleInfo.startFormatted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>End:</span>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {scheduleInfo.endFormatted}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col justify-between flex-1 p-5 pt-0 space-y-4">
                  {/* Metadata Stats Box */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-amber-500" /> {exam.duration} mins
                    </span>
                    <span className="flex items-center gap-1.5 justify-end font-medium">
                      <Award className="h-3.5 w-3.5 text-emerald-500" /> {exam.totalMarks} Marks
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="h-3.5 w-3.5 text-[#0092E3]" /> {exam.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1.5 justify-end text-slate-500 font-medium text-[11px]">
                      Pass Mark: {exam.passMark || Math.round(exam.totalMarks * 0.4)}
                    </span>
                  </div>

                  {/* Footer Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {expired ? (
                      <Button
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/80 font-bold text-xs py-2.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Exam Expired</span>
                      </Button>
                    ) : isExamCompleted(exam) ? (
                      <Link href={`/practice/result?examId=${exam.id}&title=${encodeURIComponent(exam.title)}&subject=${encodeURIComponent(exam.subject)}`} className="block w-full">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Show Result</span>
                        </Button>
                      </Link>
                    ) : isPaid && !isPurchased ? (
                      <Button
                        type="button"
                        onClick={() => setPurchasingExam(exam)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Buy Exam • ${exam.price}
                      </Button>
                    ) : (
                      <Link href={`/exam/${targetToken}`} className="block w-full">
                        <Button
                          className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-[#0092E3]/15 flex items-center justify-center gap-1.5"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          {isPaid ? "Start Purchased Exam" : "Take Free Exam"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 9 Cards Per Page Pagination Bar */}
      {filteredExams.length > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredExams.length}</span> examinations
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0092E3] text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 transition-colors cursor-pointer shadow-2xs"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentPage === pageNum
                    ? "bg-[#0092E3] text-white shadow-xs font-extrabold"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#0092E3]"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0092E3] text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-900 transition-colors cursor-pointer shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Student Exam Purchase Modal (Identical payment flow to Teacher Subscription) */}
      {purchasingExam && (
        <StudentExamPurchaseModal
          isOpen={!!purchasingExam}
          onClose={() => setPurchasingExam(null)}
          onSuccess={() => {
            const updated = [...purchasedExamIds, purchasingExam.id];
            setPurchasedExamIds(updated);
            localStorage.setItem("testify_student_purchases", JSON.stringify(updated));
            setToastMessage(`✓ Stripe Payment of $${purchasingExam.price} confirmed! Exam Unlocked.`);
            setTimeout(() => {
              setToastMessage(null);
              const token = purchasingExam.accessToken || purchasingExam.joinCode || purchasingExam.id;
              setPurchasingExam(null);
              router.push(`/exam/${token}`);
            }, 1200);
          }}
          exam={purchasingExam}
        />
      )}
    </div>
  );
}
