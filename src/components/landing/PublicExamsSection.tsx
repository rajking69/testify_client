"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Award,
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Layers,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { examService } from "@/services/exam.service";
import { authClient } from "@/lib/auth-client";
import { StudentExamPurchaseModal } from "@/components/student/StudentExamPurchaseModal";

export interface PublicExamCard {
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
  joinCode?: string;
  accessToken: string;
  status: string;
}

export default function PublicExamsSection() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [exams, setExams] = useState<PublicExamCard[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [selectedPurchaseExam, setSelectedPurchaseExam] = useState<PublicExamCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [completedExamIds, setCompletedExamIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentEmail = (session?.user?.email || "").trim().toLowerCase();
    const currentUserId = session?.user?.id;

    // Purge any stale legacy test purchases
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("testify_student_purchases");

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

    // Sync backend submissions asynchronously
    async function syncBackendSubmissions() {
      if (!currentEmail && !currentUserId) return;
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
    syncBackendSubmissions();

    async function loadPublicExams() {
      let list: PublicExamCard[] = [];

      // 1. Load from Teacher LocalStorage Exams
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("testify_teacher_exams");
          if (stored) {
            const parsed = JSON.parse(stored);
            list = parsed
              .filter((e: any) => e.status === "Published" || e.status === "Scheduled" || e.status === "Ready")
              .map((e: any) => ({
                id: String(e.id),
                title: e.title,
                subject: e.subject || "General",
                description: e.description || "Official assessment hosted on Testify platform.",
                teacherName: e.teacherName || e.creatorName || (e.teacherEmail ? e.teacherEmail.split("@")[0] : "Certified Instructor"),
                teacherEmail: e.teacherEmail || e.createdBy || "",
                teacherId: e.teacherId || e.creatorId || "",
                duration: e.duration || 60,
                totalMarks: e.totalMarks || 50,
                passMark: e.passMark || 20,
                questionsCount: e.questions?.length || 10,
                accessType: (e.accessType === "PAID" || e.accessType === "paid" || Number(e.price) > 0) ? "PAID" : "FREE",
                price: Number(e.price) > 0 ? Number(e.price) : 0,
                joinCode: e.joinCode || "CSE101",
                accessToken: e.accessToken || String(e.id),
                status: e.status || "Published",
              }));
          }
        } catch {}
      }

      // 2. Fetch from Backend API
      try {
        const res = await examService.getAllExams();
        if (res.data) {
          const apiList: PublicExamCard[] = res.data
            .filter((e: any) => e.status === "PUBLISHED" || e.status === "Published")
            .map((e: any) => ({
              id: String(e._id),
              title: e.title,
              subject: e.subject || e.category || "General",
              description: e.description || "Official examination hosted on Testify.",
              teacherName: (e.createdBy as any)?.name || e.teacherName || "Certified Instructor",
              teacherEmail: (e.createdBy as any)?.email || e.teacherEmail || "",
              teacherId: (e.createdBy as any)?._id || (e.createdBy as any)?.id || e.teacherId || "",
              duration: e.durationMinutes || 60,
              totalMarks: e.totalMarks || 50,
              passMark: Math.round(((e.totalMarks || 50) * (e.passPercentage || 40)) / 100),
              questionsCount: e.questions?.length || 0,
              accessType: (e.accessType === "PAID" || e.accessType === "paid" || Number(e.price) > 0) ? "PAID" : "FREE",
              price: Number(e.price) > 0 ? Number(e.price) : 0,
              joinCode: e.joinCode || String(e._id),
              accessToken: e.accessToken || String(e._id),
              status: "Published",
            }));

          apiList.forEach((item) => {
            if (!list.some((l) => l.id === item.id)) {
              list.unshift(item);
            }
          });
        }
      } catch {}

      setExams(list);
      setIsLoaded(true);
    }
    loadPublicExams();
  }, [session?.user?.email, session?.user?.id]);

  const isExamCompleted = (exam: PublicExamCard) => {
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

  const filtered = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.subject.toLowerCase().includes(search.toLowerCase()) ||
        (exam.joinCode && exam.joinCode.toLowerCase().includes(search.toLowerCase()));

      const matchSubject = selectedSubject === "All" || exam.subject === selectedSubject;
      const matchType = typeFilter === "ALL" || exam.accessType === typeFilter;

      return matchSearch && matchSubject && matchType;
    });
  }, [exams, search, selectedSubject, typeFilter]);

  return (
    <section id="explore-exams" className="relative w-full py-16 lg:py-24 bg-gradient-to-b from-[#EFF6FB]/60 via-white to-[#EFF6FB]/40 dark:from-[#080E1A] dark:via-[#0B1220] dark:to-[#080E1A] border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 z-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[#0092E3] dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" />
            <span>Assessment Catalog</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            Explore Published Examinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Discover verified classroom tests, certified subject assessments, and proctored examination rooms.
          </p>
        </div>

        {/* Filter & Search Bar */}
        {session?.user?.role === "teacher" && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <strong className="font-bold">Teacher Access Notice:</strong> You are browsing published examinations. Teacher accounts are strictly prohibited from taking or attempting exams.
              </div>
            </div>
            <Link href="/teacher/exams">
              <Button size="sm" className="bg-[#152234] hover:bg-[#0f1926] text-white text-xs font-bold shrink-0 rounded-xl">
                Go to Teacher Dashboard
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubject === subj
                    ? "bg-[#0092E3] text-white shadow-xs"
                    : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === "ALL" ? "bg-white dark:bg-slate-900 text-[#0092E3] font-bold shadow-xs" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("FREE")}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === "FREE" ? "bg-white dark:bg-slate-900 text-emerald-600 font-bold shadow-xs" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setTypeFilter("PAID")}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === "PAID" ? "bg-white dark:bg-slate-900 text-[#0092E3] font-bold shadow-xs" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Paid
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assessments..."
                className="pl-8 text-xs h-8.5 rounded-lg border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 max-w-md mx-auto space-y-3">
            <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Examinations Matching Criteria
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or subject filters to find available assessments.
            </p>
            {session?.user?.role === "teacher" ? (
              <Link href="/teacher/exams">
                <Button size="sm" className="bg-[#0092E3] text-white text-xs font-semibold mt-2">
                  Create an Examination
                </Button>
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSelectedSubject("All");
                    setTypeFilter("ALL");
                  }}
                  className="text-xs font-semibold"
                >
                  Reset Filters
                </Button>
                <Link href="/practice">
                  <Button size="sm" className="bg-[#0092E3] text-white text-xs font-semibold">
                    Go to Practice Zone
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((exam) => {
              const isPaid = exam.accessType === "PAID";
              const priceDisplay = exam.price > 0 ? exam.price : 5;

              return (
                <motion.div
                  key={exam.id}
                  whileHover={{ y: -4, transition: { duration: 0.15 } }}
                  className="group p-5.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Badge Row: PAID exams ALWAYS show Lock & Price, Free shows Free Access */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                        {exam.subject}
                      </span>

                      {isExamCompleted(exam) ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Completed
                        </span>
                      ) : isPaid ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0092E3] dark:text-cyan-300 border border-blue-200/80 dark:border-blue-800/80">
                          <Lock className="h-3 w-3" /> ${priceDisplay} • One-Time Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                          Free Access
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0092E3] transition-colors line-clamp-1">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
                        {exam.description}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{exam.duration} Minutes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{exam.totalMarks} Marks (Pass: {exam.passMark})</span>
                      </div>
                    </div>

                    {/* Security / Verification Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Verified Exam
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {isPaid ? "Stripe Checkout" : "Passcode Protected"}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                    {session?.user?.role === "teacher" ? (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs">
                        <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Teachers Cannot Take Exams</span>
                      </div>
                    ) : isExamCompleted(exam) ? (
                      <Link href={`/practice/result?examId=${exam.id}&title=${encodeURIComponent(exam.title)}&subject=${encodeURIComponent(exam.subject)}`} className="block w-full">
                        <Button
                          className="w-full text-xs font-bold py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Show Result</span>
                        </Button>
                      </Link>
                    ) : isPaid ? (
                      <Button
                        type="button"
                        onClick={() => setSelectedPurchaseExam(exam)}
                        className="w-full text-xs font-semibold py-2.5 bg-[#0092E3] hover:bg-[#007AC9] text-white shadow-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Unlock Exam • ${priceDisplay}</span>
                      </Button>
                    ) : (
                      <Link href={`/exam/${exam.accessToken || exam.joinCode || exam.id}`} className="block w-full">
                        <Button
                          variant="outline"
                          className="w-full text-xs font-semibold py-2.5 rounded-xl border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0092E3] flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <span>Enter Assessment</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Stripe Checkout Modal from Catalog */}
      {selectedPurchaseExam && (
        <StudentExamPurchaseModal
          isOpen={!!selectedPurchaseExam}
          onClose={() => setSelectedPurchaseExam(null)}
          onSuccess={() => {
            setSelectedPurchaseExam(null);
          }}
          exam={selectedPurchaseExam}
        />
      )}
    </section>
  );
}
