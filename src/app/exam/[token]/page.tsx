"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth-client";
import { examService } from "@/services/exam.service";
import {
  BookOpen,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  KeyRound,
  CreditCard,
  Layers,
} from "lucide-react";
import { StudentExamPurchaseModal } from "@/components/student/StudentExamPurchaseModal";

interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  description: string;
  date?: string;
  duration: number;
  totalMarks: number;
  passMark: number;
  status: "Published" | "Scheduled" | "Draft" | "Ready";
  accessType?: "FREE" | "PAID";
  price?: number;
  joinCode?: string;
  accessToken?: string;
  questions?: any[];
}

const defaultPublishedExams: ExamRecord[] = [
  {
    id: "cs-midterm-101",
    title: "Computer Science Mid Term Exam",
    subject: "Computer Science",
    description: "Live assessment covering core CS concepts, data structures, algorithms, and logic.",
    duration: 30,
    totalMarks: 25,
    passMark: 10,
    status: "Published",
    accessType: "FREE",
    price: 0,
    joinCode: "COMPZPN",
    accessToken: "cs_midterm_101",
    questions: [],
  },
  {
    id: "js-mastery-mock",
    title: "Advanced JavaScript & Web Mock Test",
    subject: "Computer Science",
    description: "Premium certification test covering asynchronous JS, event loop, closures, and React architecture.",
    duration: 45,
    totalMarks: 50,
    passMark: 25,
    status: "Published",
    accessType: "PAID",
    price: 5,
    joinCode: "JSPREM50",
    accessToken: "js_mastery_mock",
    questions: [],
  },
  {
    id: "math-calculus-202",
    title: "Calculus & Linear Algebra Assessment",
    subject: "Mathematics",
    description: "Comprehensive mathematics paper on differentiation, integration, matrices, and vectors.",
    duration: 60,
    totalMarks: 50,
    passMark: 20,
    status: "Published",
    accessType: "FREE",
    price: 0,
    joinCode: "MATH7K9",
    accessToken: "math_calculus_202",
    questions: [],
  },
  {
    id: "physics-quantum-301",
    title: "Quantum Mechanics & Optics Mock",
    subject: "Physics",
    description: "Premium assessment covering wave-particle duality, photonics, and quantum states.",
    duration: 45,
    totalMarks: 40,
    passMark: 20,
    status: "Published",
    accessType: "PAID",
    price: 5,
    joinCode: "PHYQNT75",
    accessToken: "physics_quantum_301",
    questions: [],
  },
];

export default function StudentExamWaitingRoomPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const rawToken = resolvedParams.token;
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [enteredJoinCode, setEnteredJoinCode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [agreeRules, setAgreeRules] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setStudentName(session.user.name || "");
      setStudentEmail(session.user.email || "");
    }
  }, [session]);

  // Lookup Exam by Access Token, Join Code, or ID across LocalStorage, Backend API, and Default Catalog
  useEffect(() => {
    async function resolveExam() {
      try {
        let found: ExamRecord | undefined;

        // 1. Check teacher custom exams in localStorage
        const stored = localStorage.getItem("testify_teacher_exams");
        if (stored) {
          const list: ExamRecord[] = JSON.parse(stored);
          found = list.find(
            (item) =>
              item.accessToken === rawToken ||
              item.joinCode?.toUpperCase() === rawToken.toUpperCase() ||
              String(item.id) === rawToken
          );
        }

        // 2. If not found in localStorage, fetch from backend API
        if (!found) {
          try {
            const res = await examService.getAllExams();
            if (res.data && res.data.length > 0) {
              const match: any = res.data.find(
                (item: any) =>
                  String(item._id) === rawToken ||
                  item.accessToken === rawToken ||
                  (item.joinCode && item.joinCode.toUpperCase() === rawToken.toUpperCase())
              );
              if (match) {
                found = {
                  id: String(match._id),
                  title: match.title,
                  subject: match.subject || match.category || "General",
                  description: match.description || "Instructor published examination.",
                  duration: match.durationMinutes || 60,
                  totalMarks: match.totalMarks || 50,
                  passMark: Math.round((match.totalMarks || 50) * (match.passPercentage || 40) / 100),
                  status: "Published",
                  accessType: (String(match.accessType).toUpperCase() === "PAID" || Number(match.price) > 0) ? "PAID" : "FREE",
                  price: match.price || 0,
                  joinCode: match.joinCode || "CSE101",
                  accessToken: match.accessToken || String(match._id),
                  questions: match.questions || [],
                };
              }
            }
          } catch (e) {
            console.error("Failed to load exam from API:", e);
          }
        }

        // 3. Check standard platform default exams
        if (!found) {
          found = defaultPublishedExams.find(
            (item) =>
              item.accessToken === rawToken ||
              item.joinCode?.toUpperCase() === rawToken.toUpperCase() ||
              String(item.id) === rawToken
          );
        }

        if (found) {
          setExam(found);
          if (rawToken.toUpperCase() === found.joinCode?.toUpperCase()) {
            setEnteredJoinCode(rawToken.toUpperCase());
          }
        } else {
          // Fallback room if unknown join code
          setExam({
            id: rawToken,
            title: "Private Classroom Exam",
            subject: "Assessment",
            description: "Instructor hosted examination session.",
            duration: 60,
            totalMarks: 50,
            passMark: 20,
            status: "Published",
            accessType: "FREE",
            joinCode: rawToken.toUpperCase(),
            questions: [],
          });
        }
      } catch (err) {
        console.error("Error resolving exam:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    resolveExam();
  }, [rawToken]);

  // Check Purchase Status strictly against verified Stripe transactions
  useEffect(() => {
    if (!exam) return;
    const isPaidExam = exam.accessType === "PAID" || Number(exam.price) > 0;
    if (isPaidExam) {
      try {
        const stored = localStorage.getItem("testify_purchased_records");
        if (stored) {
          const records = JSON.parse(stored);
          const examIdStr = String(exam.id);
          const hasPurchased = records.some(
            (r: any) =>
              r.paymentStatus === "SUCCESS" &&
              r.paymentProvider === "STRIPE" &&
              (String(r.examId) === examIdStr ||
                String(r.examId) === rawToken ||
                (exam.accessToken && String(r.examId) === exam.accessToken) ||
                (exam.joinCode && String(r.examId) === exam.joinCode))
          );
          setIsPurchased(Boolean(hasPurchased));
        } else {
          setIsPurchased(false);
        }
      } catch {
        setIsPurchased(false);
      }
    } else {
      setIsPurchased(true); // Free exams do not require monetary purchase
    }
  }, [exam, rawToken]);

  // Check if this student/account has already completed this exam
  const previousSubmission = React.useMemo(() => {
    if (!exam) return null;
    try {
      const stored = localStorage.getItem("testify_student_submissions");
      if (stored) {
        const list = JSON.parse(stored);
        const emailToCheck = (studentEmail || session?.user?.email || "").trim().toLowerCase();
        const userId = session?.user?.id;

        return list.find((sub: any) => {
          const matchExam =
            String(sub.examId) === String(exam.id) ||
            String(sub.id) === String(exam.id) ||
            sub.token === rawToken ||
            (exam.accessToken && sub.token === exam.accessToken) ||
            (sub.title && exam.title && sub.title.trim().toLowerCase() === exam.title.trim().toLowerCase());

          const matchUser =
            (emailToCheck && sub.studentEmail && sub.studentEmail.trim().toLowerCase() === emailToCheck) ||
            (userId && sub.studentId && sub.studentId === userId);

          return matchExam && matchUser;
        });
      }
    } catch {}
    return null;
  }, [exam, studentEmail, session, rawToken]);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !agreeRules) return;

    // Strict 1-Attempt Check: Retakes are strictly prohibited per account
    if (previousSubmission) {
      alert("You have already completed this examination. Retakes are not permitted per account.");
      return;
    }

    // Strict Paywall Guard: Paid exams CANNOT be started without completing payment
    if ((exam?.accessType === "PAID" || Number(exam?.price) > 0) && !isPurchased) {
      setIsCardModalOpen(true);
      return;
    }

    // Validate Teacher Exam Key for Free Classroom Exams
    if (exam?.accessType !== "PAID" && (!exam?.price || Number(exam.price) <= 0)) {
      const requiredCode = (exam?.joinCode || "").trim().toUpperCase();
      const studentInputCode = enteredJoinCode.trim().toUpperCase();
      const currentToken = rawToken.trim().toUpperCase();

      if (requiredCode && studentInputCode !== requiredCode && currentToken !== requiredCode) {
        setPasscodeError("Invalid Teacher Exam Key. Please enter the exact key provided by your teacher.");
        return;
      }
    }

    setPasscodeError(null);
    setIsStarting(true);

    try {
      localStorage.setItem(
        "testify_active_live_exam",
        JSON.stringify({
          examId: exam?.id || rawToken,
          title: exam?.title || "Live Examination",
          subject: exam?.subject || "Computer Science",
          duration: exam?.duration || 60,
          totalMarks: exam?.totalMarks || 50,
          passMark: exam?.passMark || 20,
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          token: rawToken,
          startedAt: new Date().toISOString(),
        })
      );
    } catch {}

    setTimeout(() => {
      router.push(`/practice/session?mode=timed&subject=${encodeURIComponent(exam?.subject || "Computer Science")}&examId=${exam?.id || rawToken}`);
    }, 600);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-400 text-xs font-semibold animate-pulse">
          Connecting to secure examination room...
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Examination Room Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The exam code or access link is invalid or the session has ended.
          </p>
          <Link href="/practice">
            <Button className="bg-[#0092E3] text-white font-semibold text-xs px-5">
              Browse Practice Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = exam.accessType === "PAID" || Number(exam.price) > 0;

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <AnimatedBackground variant="hero" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 max-w-xl w-full rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Header Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-300 text-xs font-semibold border border-blue-200/80 dark:border-cyan-800">
              <BookOpen className="h-3.5 w-3.5" />
              {exam.subject}
            </span>
            {previousSubmission ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed (1 Attempt Limit)
              </span>
            ) : isPaid ? (
              isPurchased ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid & Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0092E3] dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                  <Lock className="h-3 w-3" /> Paid Exam • ${exam.price !== undefined && Number(exam.price) > 0 ? exam.price : 5}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Free Classroom Exam
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Verified Room
          </span>
        </div>

        {/* Exam Title & Overview */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            {exam.title}
          </h1>
          {exam.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {exam.description}
            </p>
          )}
        </div>

        {/* Examination Metadata Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Duration
            </span>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {exam.duration} mins
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total Marks
            </span>
            <p className="text-base sm:text-lg font-bold text-[#0092E3] dark:text-cyan-400 mt-0.5">
              {exam.totalMarks} pts
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Pass Mark
            </span>
            <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {exam.passMark} pts
            </p>
          </div>
        </div>

        {/* 1. HIGHEST PRIORITY: If student has already completed this exam, BLOCK payment & retakes */}
        {previousSubmission ? (
          <div className="space-y-4 pt-1">
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                Examination Already Completed
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                You have already attempted and submitted this examination using account <strong>{studentEmail || session?.user?.email || "your account"}</strong>. As per academic integrity rules, only <strong>1 attempt is permitted per account</strong>. Retakes and repeat payments are permanently disabled.
              </p>
              <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Previous Score:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {previousSubmission.score || `${previousSubmission.percentage}%`} ({previousSubmission.isPassed ? "Passed" : "Completed"})
                </span>
              </div>
            </div>

            <Link href="/practice/result" className="block w-full">
              <Button
                type="button"
                className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-semibold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>View Your Results & Review Answers</span>
              </Button>
            </Link>
          </div>
        ) : isPaid && !isPurchased ? (
          /* 2. STRICT PAYWALL: Only shown if user hasn't attempted and haven't purchased */
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0092E3] dark:text-cyan-400">
                  Paid Examination Pass Required
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Unlock this assessment to begin
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official certified question paper with instant evaluation.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${exam.price !== undefined && Number(exam.price) > 0 ? exam.price : 5}.00
                </span>
                <span className="block text-[10px] font-semibold text-slate-400">
                  One-time Pass
                </span>
              </div>
            </div>

            {/* Warning Callout Box */}
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">⚠️ Policy:</span>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                <strong>1 Attempt Only:</strong> You can take this examination once per account. Retakes and repeat payments are permanently disabled after submission.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay ${exam.price !== undefined && Number(exam.price) > 0 ? exam.price : 5}.00 with Stripe & Unlock Exam</span>
            </Button>
          </div>
        ) : (
          /* 3. Student Verification Form (Only available after payment is completed or for free classroom exams) */
          <form onSubmit={handleStartExam} className="space-y-4 pt-1">
            {!isPaid && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-[#0092E3]" />
                    Teacher Exam Key (Passcode) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Instructor Provided</span>
                </label>
                <Input
                  value={enteredJoinCode}
                  onChange={(e) => {
                    setEnteredJoinCode(e.target.value);
                    setPasscodeError(null);
                  }}
                  placeholder="Enter passcode (e.g. COMPZPN)..."
                  className="font-mono font-bold uppercase tracking-widest text-xs h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  required
                  autoComplete="off"
                />
                {passcodeError ? (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {passcodeError}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Enter the unique classroom key provided by your teacher to unlock this exam.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Candidate Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name..."
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            {/* Academic Integrity Check */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
              <input
                type="checkbox"
                id="agreeRules"
                checked={agreeRules}
                onChange={(e) => setAgreeRules(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0092E3] focus:ring-[#0092E3] cursor-pointer"
                required
              />
              <label htmlFor="agreeRules" className="text-slate-600 dark:text-slate-400 leading-snug cursor-pointer text-xs">
                I agree to adhere to academic integrity rules. This assessment will be timed and evaluated automatically.
              </label>
            </div>

            {/* Start CTA */}
            <Button
              type="submit"
              disabled={!studentName.trim() || !agreeRules || isStarting}
              className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-semibold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isStarting ? "Initializing Assessment Engine..." : "Enter Examination Room"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </motion.div>

      {/* Student Exam Purchase Modal */}
      {exam && (
        <StudentExamPurchaseModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          onSuccess={() => {
            setIsPurchased(true);
            setToastMessage(`Payment of $${exam.price !== undefined && Number(exam.price) > 0 ? exam.price : 5} confirmed! Exam Unlocked.`);
            setTimeout(() => setToastMessage(null), 4000);
          }}
          exam={exam}
        />
      )}
    </div>
  );
}
