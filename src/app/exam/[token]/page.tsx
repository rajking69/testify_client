"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authClient } from "@/lib/auth-client";
import {
  BookOpen,
  Clock,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lock,
  KeyRound,
  CreditCard,
} from "lucide-react";
import { StudentExamPurchaseModal } from "@/components/student/StudentExamPurchaseModal";

interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
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
    date: "Scheduled Today",
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
    date: "Live Online",
    duration: 45,
    totalMarks: 50,
    passMark: 25,
    status: "Published",
    accessType: "PAID",
    price: 50,
    joinCode: "JSPREM50",
    accessToken: "js_mastery_mock",
    questions: [],
  },
  {
    id: "math-calculus-202",
    title: "Calculus & Linear Algebra Assessment",
    subject: "Mathematics",
    description: "Comprehensive mathematics paper on differentiation, integration, matrices, and vectors.",
    date: "Available Now",
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
    date: "Live Online",
    duration: 45,
    totalMarks: 40,
    passMark: 20,
    status: "Published",
    accessType: "PAID",
    price: 75,
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

  // Lookup Exam by Access Token, Join Code, or ID
  useEffect(() => {
    try {
      let found: ExamRecord | undefined;

      // 1. Check teacher custom exams
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

      // 2. Check standard platform default exams
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
        // Fallback for custom join code
        setExam({
          id: rawToken,
          title: "Examination Room",
          subject: "Computer Science",
          description: "Online assessment session.",
          date: "Live Room",
          duration: 60,
          totalMarks: 50,
          passMark: 20,
          status: "Published",
          accessType: "FREE",
          joinCode: rawToken.toUpperCase(),
          questions: [],
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, [rawToken]);

  // Check Purchase Status for Paid Exams
  useEffect(() => {
    if (!exam) return;
    if (exam.accessType === "PAID") {
      try {
        const stored = localStorage.getItem("testify_student_purchases");
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          if (ids.includes(String(exam.id)) || ids.includes(rawToken)) {
            setIsPurchased(true);
          }
        }
      } catch {}
    } else {
      setIsPurchased(true); // Free exams do not require monetary purchase
    }
  }, [exam, rawToken]);

  // Check if this student/email has already completed this exam
  const previousSubmission = React.useMemo(() => {
    if (!exam) return null;
    try {
      const stored = localStorage.getItem("testify_student_submissions");
      if (stored) {
        const list = JSON.parse(stored);
        const emailToCheck = studentEmail?.trim().toLowerCase();
        return list.find(
          (sub: any) =>
            (String(sub.examId) === String(exam.id) || String(sub.id) === String(exam.id) || sub.token === rawToken) &&
            (!emailToCheck || !sub.studentEmail || sub.studentEmail.toLowerCase() === emailToCheck)
        );
      }
    } catch {}
    return null;
  }, [exam, studentEmail, rawToken]);

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !agreeRules) return;

    // Validate Teacher Exam Key for Free Classroom Exams
    if (exam?.accessType !== "PAID") {
      const requiredCode = (exam?.joinCode || "").trim().toUpperCase();
      const studentInputCode = enteredJoinCode.trim().toUpperCase();
      const currentToken = rawToken.trim().toUpperCase();

      if (requiredCode && studentInputCode !== requiredCode && currentToken !== requiredCode) {
        setPasscodeError("Invalid Teacher Exam Key. Please enter the exact 6-digit key provided by your teacher.");
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
          <Link href="/exam/join">
            <Button className="bg-[#0092E3] text-white font-bold text-xs px-5">
              Enter Another Join Code
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = exam.accessType === "PAID";

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Full Animated Background */}
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
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-xl w-full rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Header Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-300 text-xs font-bold border border-blue-200/80 dark:border-cyan-800">
              <BookOpen className="h-3.5 w-3.5" />
              {exam.subject}
            </span>
            {isPaid ? (
              isPurchased ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Paid & Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                  Paid Exam • ৳{exam.price || 50}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-300">
                Free Classroom Exam
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Verified Assessment Room
          </span>
        </div>

        {/* Exam Title & Overview */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white">
            {exam.title}
          </h1>
          {exam.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {exam.description}
            </p>
          )}
        </div>

        {/* Examination Metadata Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Duration
            </span>
            <p className="text-base sm:text-lg font-black text-[#152234] dark:text-white mt-0.5">
              {exam.duration} mins
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Marks
            </span>
            <p className="text-base sm:text-lg font-black text-[#0092E3] dark:text-cyan-400 mt-0.5">
              {exam.totalMarks} pts
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pass Mark
            </span>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {exam.passMark} pts
            </p>
          </div>
        </div>

        {/* Check if Paid Exam requires Purchase first */}
        {isPaid && !isPurchased ? (
          /* Payment Required Card */
          <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-300 dark:border-emerald-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Paid Examination Access
                </span>
                <h4 className="text-base font-bold font-display text-slate-900 dark:text-white mt-0.5">
                  Unlock this assessment
                </h4>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-display text-emerald-700 dark:text-emerald-300">
                  ৳{exam.price || 50}.00
                </span>
                <span className="block text-[10px] font-bold text-slate-500">
                  One-time Entry
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#0092E3]/20 transition-all cursor-pointer"
              leftIcon={<CreditCard className="h-4 w-4" />}
            >
              Pay ৳{exam.price || 50}.00 with Card & Unlock Exam
            </Button>
          </div>
        ) : previousSubmission ? (
          /* Already Completed Banner */
          <div className="space-y-4 pt-1">
            <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                Examination Already Completed
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                You have already submitted this examination using email <strong>{studentEmail || "your account"}</strong>. As per academic integrity rules, only <strong>one attempt</strong> is permitted.
              </p>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Previous Score:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {previousSubmission.score || `${previousSubmission.percentage}%`} ({previousSubmission.isPassed ? "Passed" : "Completed"})
                </span>
              </div>
            </div>

            <Link href="/practice/result" className="block w-full">
              <Button
                type="button"
                className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#0092E3]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                View Your Results & Review Answers
              </Button>
            </Link>
          </div>
        ) : (
          /* Student Verification Form */
          <form onSubmit={handleStartExam} className="space-y-4 pt-1">
            {!isPaid && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-950/80 border border-blue-200/80 dark:border-slate-800 space-y-1.5">
                <label className="block text-xs font-bold text-[#152234] dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-[#0092E3]" />
                    Teacher's Exam Key (Room Passcode) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Instructor Provided</span>
                </label>
                <Input
                  value={enteredJoinCode}
                  onChange={(e) => {
                    setEnteredJoinCode(e.target.value);
                    setPasscodeError(null);
                  }}
                  placeholder="Enter 6-digit key (e.g. COMPZPN)..."
                  className="font-mono font-extrabold uppercase tracking-widest text-sm h-11 rounded-xl bg-white dark:bg-slate-900 border-blue-200 dark:border-slate-700"
                  required
                  autoComplete="off"
                />
                {passcodeError ? (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {passcodeError}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    You must enter the unique key provided by your teacher to unlock this exam room.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your candidate full name..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
              />
            </div>

            {/* Academic Integrity Check */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-cyan-950/30 border border-blue-200/60 dark:border-cyan-800 text-xs">
              <input
                type="checkbox"
                id="agreeRules"
                checked={agreeRules}
                onChange={(e) => setAgreeRules(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0092E3] focus:ring-[#0092E3] cursor-pointer"
                required
              />
              <label htmlFor="agreeRules" className="text-slate-700 dark:text-slate-300 leading-snug cursor-pointer">
                I agree to adhere to academic integrity rules. This session will be timed and automatically evaluated.
              </label>
            </div>

            {/* Start CTA */}
            <Button
              type="submit"
              disabled={!studentName.trim() || !agreeRules || isStarting}
              className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-xl shadow-[#0092E3]/25 cursor-pointer"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {isStarting ? "Initializing Assessment Engine..." : "Enter Examination Room"}
            </Button>
          </form>
        )}
      </motion.div>

      {/* Student Exam Purchase Modal (Identical payment system to Teacher Subscription) */}
      {exam && (
        <StudentExamPurchaseModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          onSuccess={() => {
            setIsPurchased(true);
            setToastMessage(`✓ Stripe Payment of ৳${exam.price || 50} confirmed! Exam Unlocked.`);
            setTimeout(() => setToastMessage(null), 4000);
          }}
          exam={exam}
        />
      )}
    </div>
  );
}
