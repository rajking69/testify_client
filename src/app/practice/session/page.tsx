"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { purchaseService } from "@/services/purchase.service";
import { examService } from "@/services/exam.service";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

function PracticeSessionContent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentSession,
    setCurrentSession,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    timeRemaining,
    setTimeRemaining,
    isTimerRunning,
    setIsTimerRunning,
    toggleBookmark,
    endPracticeSession,
    config,
  } = usePractice();

  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);

  // Auto-initialize exam session from URL query parameters or backend exam
  useEffect(() => {
    if (currentSession && currentSession.length > 0) return;

    const subjectParam = searchParams.get("subject");
    const examIdParam = searchParams.get("examId");

    // 0. Strict 1-Attempt Guard: Check if student has already completed this exam
    if (examIdParam && typeof window !== "undefined") {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const currentEmail = (session?.user?.email || "").trim().toLowerCase();
        const currentUserId = session?.user?.id;

        const alreadyTaken = storedSubs.find((sub: any) => {
          const matchExam =
            String(sub.examId) === examIdParam ||
            String(sub.id) === examIdParam ||
            sub.token === examIdParam;

          const matchUser =
            (currentEmail && sub.studentEmail && sub.studentEmail.trim().toLowerCase() === currentEmail) ||
            (currentUserId && sub.studentId && sub.studentId === currentUserId);

          return matchExam && matchUser;
        });

        if (alreadyTaken) {
          router.replace(`/practice/result?examId=${examIdParam}`);
          return;
        }
      } catch (e) {
        console.error("Retake guard error:", e);
      }
    }

    async function initializeQuestions() {
      let questionsToUse: any[] = [];
      let examDurationSec = 600; // 10 mins default

      if (examIdParam && typeof window !== "undefined") {
        // 1. Check if active live exam was stored by waiting room
        try {
          const storedActive = localStorage.getItem("testify_active_live_exam");
          if (storedActive) {
            const active = JSON.parse(storedActive);
            if (
              (String(active.examId) === examIdParam || active.token === examIdParam) &&
              active.questions &&
              active.questions.length > 0
            ) {
              if (active.duration) {
                examDurationSec = active.duration * 60;
              }
              questionsToUse = active.questions.map((q: any, idx: number) => ({
                id: q.id || q._id || `q-${idx}`,
                subject: active.subject || "Examination",
                topic: q.topic || "General",
                type: q.type || q.questionType?.toLowerCase() || "mcq",
                difficulty: q.difficulty?.toLowerCase() || "medium",
                questionText: q.questionText || q.text || q.question || "Examination Question",
                question: q.questionText || q.text || q.question || "Examination Question",
                options: q.options || [],
                correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                explanation: q.explanation || "Official answer explanation.",
              }));
            }
          }
        } catch {}

        // 2. If not found in active live storage, fetch from backend API
        if (questionsToUse.length === 0) {
          try {
            const single = await examService.getExamById(examIdParam);
            if (single?.data && single.data.questions && single.data.questions.length > 0) {
              if (single.data.durationMinutes) {
                examDurationSec = single.data.durationMinutes * 60;
              }
              questionsToUse = single.data.questions.map((q: any, idx: number) => ({
                id: q.id || q._id || `q-${idx}`,
                subject: single.data.subject || single.data.category || "Examination",
                topic: q.topic || "General",
                type: q.type || q.questionType?.toLowerCase() || "mcq",
                difficulty: q.difficulty?.toLowerCase() || "medium",
                questionText: q.questionText || q.text || q.question || "Examination Question",
                question: q.questionText || q.text || q.question || "Examination Question",
                options: q.options || [],
                correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                explanation: q.explanation || "Official answer explanation.",
              }));
            }
          } catch (e) {
            console.error("Failed to fetch exam questions from API:", e);
          }
        }

        // 3. Check teacher custom exams in localStorage
        if (questionsToUse.length === 0) {
          try {
            const stored = localStorage.getItem("testify_teacher_exams");
            if (stored) {
              const list = JSON.parse(stored);
              const found = list.find(
                (e: any) =>
                  String(e.id) === examIdParam ||
                  e.joinCode?.toUpperCase() === examIdParam.toUpperCase() ||
                  e.accessToken === examIdParam
              );
              if (found) {
                if (found.duration) {
                  examDurationSec = found.duration * 60;
                }
                if (found.questions && found.questions.length > 0) {
                  questionsToUse = found.questions.map((q: any, idx: number) => ({
                    id: q.id || `q-${idx}`,
                    subject: found.subject || "Examination",
                    topic: q.topic || "General",
                    type: q.type || "mcq",
                    difficulty: q.difficulty || "medium",
                    questionText: q.questionText || q.text || q.question || "Sample examination question",
                    question: q.questionText || q.text || q.question || "Sample examination question",
                    options: q.options || [],
                    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
                    explanation: q.explanation || "Official answer explanation provided by instructor.",
                  }));
                }
              }
            }
          } catch {}
        }

        // Strict Zero-Mock Policy: If no questions found for this exam, set error
        if (questionsToUse.length === 0) {
          setSessionLoadError("No examination questions are configured for this session. Please contact your instructor.");
          return;
        }
      }

      if (questionsToUse.length > 0) {
        setCurrentSession(questionsToUse);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeRemaining(examDurationSec);
        setIsTimerRunning(true);
      }
    }

    initializeQuestions();
  }, [
    currentSession,
    searchParams,
    setCurrentSession,
    setCurrentQuestionIndex,
    setUserAnswers,
    setTimeRemaining,
    setIsTimerRunning,
    router,
    session,
  ]);

  // Derive selectedAnswer from userAnswers instead of using useEffect
  const selectedAnswer =
    currentSession && currentSession[currentQuestionIndex] && userAnswers[currentSession[currentQuestionIndex].id] !== undefined
      ? userAnswers[currentSession[currentQuestionIndex].id]
      : null;

  // Derive showExplanation - in normal mode, show when answer is selected
  const showExplanation = false; // Hidden during exam; revealed only on result page after completion

  const handleEndSession = async () => {
    const result = endPracticeSession();

    try {
      const examIdParam = searchParams.get("examId");
      const subjectParam = searchParams.get("subject") || (currentSession && currentSession[0]?.subject) || "Computer Science";

      let examTitle = "Live Assessment Examination";
      let examDuration = "30 mins";
      let studentEmail = session?.user?.email || "";
      let studentName = session?.user?.name || "Student Scholar";

      const activeExamRaw = localStorage.getItem("testify_active_live_exam");
      if (activeExamRaw) {
        try {
          const parsed = JSON.parse(activeExamRaw);
          if (parsed.title) examTitle = parsed.title;
          if (parsed.duration) examDuration = `${parsed.duration} mins`;
          if (parsed.studentEmail) studentEmail = parsed.studentEmail;
          if (parsed.studentName) studentName = parsed.studentName;
        } catch {}
      }

      const teacherExamsRaw = localStorage.getItem("testify_teacher_exams");
      if (teacherExamsRaw && examTitle === "Live Assessment Examination") {
        try {
          const tList = JSON.parse(teacherExamsRaw);
          const found = tList.find((e: any) => String(e.id) === examIdParam || e.joinCode === examIdParam || e.accessToken === examIdParam);
          if (found) {
            examTitle = found.title;
            examDuration = `${found.duration || 30} mins`;
          }
        } catch {}
      }

      const finalEmail = studentEmail || session?.user?.email || "student@example.com";
      const finalName = studentName || session?.user?.name || "Student Scholar";

      const newSubmission = {
        id: examIdParam || `sub-${Date.now()}`,
        examId: examIdParam || `sub-${Date.now()}`,
        title: examTitle,
        subject: subjectParam,
        duration: examDuration,
        schedule: `Completed on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        status: "Completed",
        score: `${result.scorePercentage}%`,
        percentage: result.scorePercentage,
        isPassed: result.scorePercentage >= 40,
        studentEmail: finalEmail,
        studentName: finalName,
        token: examIdParam || "exam_session",
        completedAt: new Date().toISOString(),
        timeTakenSeconds: result.timeSpentSeconds || 600,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        questions: result.questions || currentSession,
        userAnswers: result.userAnswers || userAnswers,
      };

      const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
      const filtered = storedSubs.filter((s: any) => !(String(s.examId) === String(newSubmission.examId) && (s.studentEmail === newSubmission.studentEmail || !s.studentEmail)));
      const updated = [newSubmission, ...filtered];
      localStorage.setItem("testify_student_submissions", JSON.stringify(updated));

      // Submit directly to backend API if this is an official examination
      if (examIdParam) {
        try {
          const apiAnswers = Object.entries(userAnswers).map(([k, v]) => ({
            questionId: String(k),
            submittedAnswer: String(v),
          }));
          await examService.submitExam(examIdParam, apiAnswers);
        } catch (apiErr) {
          console.warn("Backend API exam submission note:", apiErr);
        }
      }

      const storedHist = JSON.parse(localStorage.getItem("testify_practice_history") || "[]");
      localStorage.setItem("testify_practice_history", JSON.stringify([newSubmission, ...storedHist]));

      try {
        purchaseService.saveAttempt({
          id: newSubmission.id,
          studentId: session?.user?.id || "student-1",
          studentName: finalName,
          studentEmail: finalEmail,
          examId: examIdParam || newSubmission.id,
          examTitle: examTitle,
          subject: subjectParam,
          startTime: new Date(Date.now() - (result.timeSpentSeconds || 600) * 1000).toISOString(),
          endTime: new Date().toISOString(),
          submissionTime: new Date().toISOString(),
          durationMinutes: Math.max(1, Math.round((result.timeSpentSeconds || 600) / 60)),
          status: "SUBMITTED",
          answers: Object.fromEntries(Object.entries(userAnswers).map(([k, v]) => [k, String(v)])),
          score: result.correctAnswers,
          totalMarks: result.totalQuestions,
          passMark: Math.ceil(result.totalQuestions * 0.4),
          passed: result.scorePercentage >= 40,
          evaluationStatus: "AUTO_EVALUATED",
        });
      } catch {}

      window.dispatchEvent(new CustomEvent("testify_exam_submitted", { detail: newSubmission }));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to save student submission", e);
    }

    router.push("/practice/result");
  };

  // Use refs to avoid circular dependency in timer effects
  const endPracticeSessionRef = useRef(endPracticeSession);
  const routerRef = useRef(router);

  useEffect(() => {
    endPracticeSessionRef.current = endPracticeSession;
    routerRef.current = router;
  }, [endPracticeSession, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev: number) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timeRemaining]);

  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (!isTimerRunning && timeRemaining === 0 && config.mode === "timed") {
      endPracticeSessionRef.current();
      routerRef.current.push("/practice/result");
    }
  }, [isTimerRunning, timeRemaining, config.mode]);

  if (session?.user?.role === "teacher") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Teacher Access Restricted
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You are currently logged in as a <strong>Teacher ({session?.user?.email})</strong>. Teachers are strictly prohibited from attempting or submitting practice tests and examinations.
          </p>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/teacher/dashboard">
              <Button className="w-full bg-[#152234] text-white text-xs font-bold h-10 rounded-xl">
                Go to Teacher Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sessionLoadError) {
    const examIdParam = searchParams.get("examId");
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <AlertCircle className="h-14 w-14 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Questions Unavailable
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {sessionLoadError}
          </p>
          <div className="pt-3 flex gap-2 justify-center">
            {examIdParam && (
              <Link href={`/exam/${examIdParam}`}>
                <Button className="bg-[#0092E3] text-white text-xs font-semibold px-5">
                  Back to Exam Room
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" className="text-xs px-5">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession || currentSession.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-[#0B2238] dark:text-white">
            No Active Session
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Please configure and start a practice session first.
          </p>
          <Button onClick={() => router.push("/practice")}>
            Back to Practice Setup
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentSession[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentSession.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string | number) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSession.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleClearAnswer = () => {
    const newAnswers = { ...userAnswers };
    delete newAnswers[currentQuestion.id];
    setUserAnswers(newAnswers);
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(currentQuestion.id);
  };

  const handleNavigationClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const isBookmarked = currentQuestion.isBookmarked;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-start"
        >
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </span>
          </Button>
        </motion.div>

        {/* Header with Timer and Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="text-xs font-bold uppercase">
              {config.mode} Practice
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.subject}
            </Badge>
          </div>

          {/* Timer Display */}
          {config.mode === "timed" && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${
                timeRemaining < 120
                  ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                  : "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              }`}
            >
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}

          {/* Stopwatch for non-timed modes */}
          {config.mode !== "timed" && isTimerRunning && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-lg">
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>
              Question {currentQuestionIndex + 1} of {currentSession.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#00A3C4] to-[#0284C7] dark:from-cyan-500 dark:to-blue-600 rounded-full"
            />
          </div>
        </motion.div>

        {/* Question Navigation Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {currentSession.map((_, index) => {
            const isAnswered =
              userAnswers[currentSession[index].id] !== undefined;
            const isCurrent = index === currentQuestionIndex;

            return (
              <button
                key={index}
                onClick={() => handleNavigationClick(index)}
                className={`w-10 h-10 rounded-lg text-xs font-bold border transition-all ${
                  isCurrent
                    ? "bg-[#00A3C4] dark:bg-cyan-600 text-white border-[#00A3C4] dark:border-cyan-600 scale-110"
                    : isAnswered
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#00A3C4] dark:hover:border-cyan-500"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </motion.div>

        {/* Main Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hoverEffect">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="info" className="text-[10px]">
                    {currentQuestion.topic}
                  </Badge>
                  <Badge
                    variant={
                      currentQuestion.difficulty === "easy"
                        ? "success"
                        : currentQuestion.difficulty === "medium"
                          ? "warning"
                          : "danger"
                    }
                    className="text-[10px]"
                  >
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  {currentQuestion.questionText || currentQuestion.question || "Examination Question"}
                </CardTitle>
              </div>

              {/* Bookmark Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-xl border transition-all ${
                  isBookmarked
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 hover:text-amber-500"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </motion.button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected =
                    selectedAnswer === index ||
                    selectedAnswer === option ||
                    String(selectedAnswer) === String(index) ||
                    (typeof selectedAnswer === 'string' && String(selectedAnswer).trim().toLowerCase() === String(option).trim().toLowerCase());

                  const isCorrect =
                    currentQuestion.correctAnswer === index ||
                    currentQuestion.correctAnswer === option ||
                    String(currentQuestion.correctAnswer) === String(index) ||
                    String(currentQuestion.correctAnswer).trim().toLowerCase() === String(option).trim().toLowerCase() ||
                    (currentQuestion.correctOptionIndex !== undefined && Number(currentQuestion.correctOptionIndex) === index) ||
                    (Array.isArray(currentQuestion.options) && typeof currentQuestion.correctAnswer === 'number' && currentQuestion.options[currentQuestion.correctAnswer] === option);

                  const isUserCorrectChoice = showExplanation && isSelected && isCorrect;
                  const isUserWrongChoice = showExplanation && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0092E3] dark:bg-cyan-600 text-white border-[#0092E3] dark:border-cyan-600 shadow-md font-semibold"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#0092E3] dark:hover:border-cyan-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-white bg-white/20 text-white"
                              : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="flex-1 font-medium">{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation Section */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                      <Eye className="h-4 w-4" />
                      Explanation
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Navigation & Submit Buttons Group */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <span className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleClearAnswer}
              disabled={selectedAnswer === null}
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>Clear</span>
              </span>
            </Button>

            {currentQuestionIndex === currentSession.length - 1 ? (
              <Button
                size="md"
                onClick={() => setShowEndModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 px-5"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit Exam</span>
                </span>
              </Button>
            ) : (
              <Button
                size="md"
                onClick={handleNext}
                className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold shadow-md shadow-[#0092E3]/20 px-5"
              >
                <span className="flex items-center gap-2">
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Answered: {answeredCount}/{currentSession.length}
          </div>
          <div className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-amber-500" />
            Bookmarked: {currentSession.filter((q) => q.isBookmarked).length}
          </div>
        </motion.div>
      </div>

      {/* End Session Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End Practice Session"
        description="Are you sure you want to end this practice session? Your progress will be saved and you'll be able to view your results."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEndModal(false)}>
              Continue Practice
            </Button>
            <Button onClick={handleEndSession}>End & View Results</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Questions Answered:
              </span>
              <span className="font-bold text-[#0B2238] dark:text-white">
                {answeredCount}/{currentSession.length}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You can always retry this practice session or practice missed
            questions from the results page.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-slate-400 text-xs font-semibold animate-pulse">
            Loading examination questions...
          </div>
        </div>
      }
    >
      <PracticeSessionContent />
    </React.Suspense>
  );
}
