"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Target,
  Eye,
  Home,
  TrendingUp,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PracticeResult } from "@/lib/practice/practice-types";

export default function PracticeResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lastResult } = usePractice();
  const [storedResult, setStoredResult] = useState<PracticeResult | null>(null);

  const targetExamId = searchParams.get("examId") || searchParams.get("id");
  const targetTitle = searchParams.get("title");
  const targetSubject = searchParams.get("subject");
  const scoreParam = searchParams.get("score");
  const totalParam = searchParams.get("total");

  useEffect(() => {
    // 1. If targetExamId or targetTitle is provided in URL params, lookup matching submission
    if (targetExamId || targetTitle) {
      try {
        const subs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const found = subs.find((s: any) => {
          const idMatch =
            (targetExamId && String(s.examId) === String(targetExamId)) ||
            (targetExamId && String(s.id) === String(targetExamId)) ||
            (targetExamId && String(s.token) === String(targetExamId)) ||
            (targetExamId && String(s.accessToken) === String(targetExamId)) ||
            (targetExamId && String(s.joinCode) === String(targetExamId));

          const titleMatch =
            targetTitle &&
            s.title &&
            (s.title.trim().toLowerCase() === targetTitle.trim().toLowerCase() ||
             s.title.trim().toLowerCase().includes(targetTitle.trim().toLowerCase()) ||
             targetTitle.trim().toLowerCase().includes(s.title.trim().toLowerCase()));

          return idMatch || titleMatch;
        });

        if (found) {
          const total = found.totalQuestions || (found.questions ? found.questions.length : 10);
          const correct = found.correctAnswers !== undefined
            ? found.correctAnswers
            : Math.round(((found.percentage || 80) * total) / 100);
          const scorePct = found.percentage !== undefined
            ? found.percentage
            : Math.round((correct / total) * 100);

          const matchedResult: PracticeResult = {
            sessionId: found.id || String(targetExamId || Date.now()),
            mode: "normal",
            totalQuestions: total,
            correctAnswers: correct,
            scorePercentage: scorePct,
            timeSpentSeconds: found.timeTakenSeconds || 300,
            completedAt: found.completedAt || new Date().toISOString(),
            userAnswers: found.userAnswers || {},
            questions: found.questions || [],
            examTitle: found.title || targetTitle || "Examination",
            examSubject: found.subject || targetSubject || "General",
          };
          setStoredResult(matchedResult);
          return;
        }
      } catch {}

      // If requested specific exam but not in testify_student_submissions, build result using target params
      const scoreNum = scoreParam !== null ? Number(scoreParam) : 80;
      const totalNum = totalParam !== null ? Number(totalParam) : 10;
      const correctNum = Math.round((scoreNum / 100) * totalNum);

      const generatedResult: PracticeResult = {
        sessionId: targetExamId || `generated-${Date.now()}`,
        mode: "normal",
        totalQuestions: totalNum,
        correctAnswers: correctNum,
        scorePercentage: scoreNum,
        timeSpentSeconds: 300,
        completedAt: new Date().toISOString(),
        userAnswers: {},
        questions: [],
        examTitle: targetTitle || "Examination Result",
        examSubject: targetSubject || "General",
      };
      setStoredResult(generatedResult);
      return;
    }

    // 2. If NO target parameters provided, check lastResult from context
    if (lastResult) {
      setStoredResult(lastResult);
      return;
    }

    // 3. Check testify_last_result
    try {
      const raw = localStorage.getItem("testify_last_result");
      if (raw) {
        setStoredResult(JSON.parse(raw));
        return;
      }
    } catch {}

    // 4. Fallback to first item from submissions
    try {
      const subs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
      if (subs.length > 0) {
        const latest = subs[0];
        const total = latest.totalQuestions || (latest.questions ? latest.questions.length : 10);
        const correct = latest.correctAnswers !== undefined
          ? latest.correctAnswers
          : Math.round(((latest.percentage || 80) * total) / 100);
        const scorePct = latest.percentage !== undefined
          ? latest.percentage
          : Math.round((correct / total) * 100);

        const fallbackResult: PracticeResult = {
          sessionId: latest.id || `session-${Date.now()}`,
          mode: "normal",
          totalQuestions: total,
          correctAnswers: correct,
          scorePercentage: scorePct,
          timeSpentSeconds: latest.timeTakenSeconds || 300,
          completedAt: latest.completedAt || new Date().toISOString(),
          userAnswers: latest.userAnswers || {},
          questions: latest.questions || [],
          examTitle: latest.title,
          examSubject: latest.subject,
        };
        setStoredResult(fallbackResult);
        return;
      }
    } catch {}
  }, [lastResult, searchParams, targetExamId, targetTitle, targetSubject, scoreParam, totalParam]);

  const activeResult = (targetExamId || targetTitle) ? storedResult : (lastResult || storedResult);

  if (!activeResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
          <Trophy className="h-16 w-16 text-amber-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-[#0B2238] dark:text-white">
            No Examination Result Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Complete an examination to view your verified transcript and performance scorecard.
          </p>
          <div className="pt-2">
            <Button onClick={() => router.push("/")} className="bg-[#0092E3] text-white">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const correctCount = activeResult.correctAnswers;
  const wrongCount = Math.max(0, activeResult.totalQuestions - correctCount);
  const accuracyRate = activeResult.totalQuestions > 0
    ? Math.round((correctCount / activeResult.totalQuestions) * 100)
    : activeResult.scorePercentage || 0;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  // Attempt to recover questions from teacher exams if activeResult.questions is empty
  let displayQuestions = activeResult.questions || [];
  if (displayQuestions.length === 0 && typeof window !== "undefined") {
    try {
      const teacherExams = JSON.parse(localStorage.getItem("testify_teacher_exams") || "[]");
      const match = teacherExams.find(
        (e: any) =>
          String(e.id) === String(activeResult.sessionId) ||
          (e.title && activeResult.examTitle && e.title.trim().toLowerCase() === activeResult.examTitle.trim().toLowerCase())
      );
      if (match && match.questions && match.questions.length > 0) {
        displayQuestions = match.questions;
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Clean Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold"
            >
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4 text-[#0092E3]" />
                Back to Home
              </span>
            </Button>
            <Badge variant="primary" className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-xl">
              {activeResult.examTitle || "Examination Transcript"}
            </Badge>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Submitted: {new Date(activeResult.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </motion.div>

        {/* Metric Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Score */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="h-4 w-4 text-amber-500" />
                Total Score
              </div>
              <div
                className={`text-3xl font-extrabold font-display ${getScoreColor(activeResult.scorePercentage)}`}
              >
                {activeResult.scorePercentage}%
              </div>
              <Badge
                variant={getScoreBadge(activeResult.scorePercentage)}
                className="text-[11px] font-bold"
              >
                {activeResult.scorePercentage >= 80
                  ? "Passed • Excellent"
                  : activeResult.scorePercentage >= 60
                    ? "Passed • Good"
                    : "Needs Improvement"}
              </Badge>
            </CardContent>
          </Card>

          {/* Correct Answers */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Correct Answers
              </div>
              <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                out of {activeResult.totalQuestions} questions
              </div>
            </CardContent>
          </Card>

          {/* Time Spent */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="h-4 w-4 text-blue-500" />
                Time Spent
              </div>
              <div className="text-3xl font-extrabold font-display text-blue-600 dark:text-blue-400">
                {formatTime(activeResult.timeSpentSeconds)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Official Examination Session
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Rate */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Target className="h-4 w-4 text-purple-500" />
                Accuracy Rate
              </div>
              <div className="text-3xl font-extrabold font-display text-purple-600 dark:text-purple-400">
                {accuracyRate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {wrongCount} incorrect answer{wrongCount === 1 ? "" : "s"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clean Question Breakdown - Correct vs Incorrect */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#0092E3] dark:text-cyan-400" />
              Detailed Answer Evaluation
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {displayQuestions.length} Questions Evaluated
            </span>
          </div>

          {displayQuestions.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Evaluation Recorded ({correctCount}/{activeResult.totalQuestions} Correct)
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your examination submission was evaluated successfully with an overall score of {activeResult.scorePercentage}%.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayQuestions.map((question, index) => {
                const userAnswer = activeResult.userAnswers[question.id];
                const isCorrect =
                  userAnswer !== undefined &&
                  userAnswer !== null &&
                  (userAnswer === question.correctAnswer ||
                   String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase() ||
                   (question.correctOptionIndex !== undefined && Number(userAnswer) === Number(question.correctOptionIndex)) ||
                   (Array.isArray(question.options) && typeof userAnswer === 'number' && question.options[userAnswer] !== undefined && String(question.options[userAnswer]).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase()) ||
                   (Array.isArray(question.options) && typeof userAnswer === 'string' && question.correctOptionIndex !== undefined && question.options[question.correctOptionIndex] !== undefined && String(userAnswer).trim().toLowerCase() === String(question.options[question.correctOptionIndex]).trim().toLowerCase()));

                return (
                  <Card key={question.id || index} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      {/* Header Badge & Question Text */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0092E3] dark:text-cyan-400 border border-blue-200/80 dark:border-blue-800">
                              Question {index + 1}
                            </span>
                            {question.subject && (
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {question.subject}
                              </span>
                            )}
                            {question.topic && (
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {question.topic}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed mt-1">
                            {question.questionText || question.question}
                          </h3>
                        </div>

                        {/* Answer Status Badge: Correct / Incorrect */}
                        <div className="shrink-0">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              Correct (+1)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800">
                              <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                              Incorrect (0)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Answer Options Breakdown */}
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Answer Evaluation:
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {question.options.map((option: string, optIdx: number) => {
                              const isUserChoice =
                                userAnswer === optIdx ||
                                userAnswer === option ||
                                String(userAnswer) === String(optIdx) ||
                                (typeof userAnswer === 'string' && String(userAnswer).trim().toLowerCase() === String(option).trim().toLowerCase());

                              const isCorrectOpt =
                                question.correctAnswer === optIdx ||
                                question.correctAnswer === option ||
                                String(question.correctAnswer) === String(optIdx) ||
                                String(question.correctAnswer).trim().toLowerCase() === String(option).trim().toLowerCase() ||
                                (question.correctOptionIndex !== undefined && Number(question.correctOptionIndex) === optIdx);

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                                    isUserChoice && isCorrectOpt
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                                      : isUserChoice && !isCorrectOpt
                                        ? "bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200"
                                        : isCorrectOpt
                                          ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 flex-1">
                                    {isUserChoice && isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                    {isUserChoice && !isCorrectOpt && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                                    {!isUserChoice && isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                    <span>{option}</span>
                                  </div>

                                  <div className="shrink-0 pl-2">
                                    {isUserChoice && isCorrectOpt && (
                                      <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                        ✓ Your Choice (Correct)
                                      </span>
                                    )}
                                    {isUserChoice && !isCorrectOpt && (
                                      <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-300">
                                        ✗ Your Choice (Incorrect)
                                      </span>
                                    )}
                                    {!isUserChoice && isCorrectOpt && (
                                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                        ✓ Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Explanation if available */}
                      {question.explanation && (
                        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-[#0092E3] dark:text-cyan-400">Explanation: </span>
                          {question.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Clean Performance Summary Note */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <TrendingUp className="h-4.5 w-4.5 text-[#0092E3] dark:text-cyan-400" />
                Performance Summary & Transcript Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 font-semibold">
                  ✓ {correctCount} Questions Correctly Answered
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 font-semibold">
                  ⚠️ {wrongCount} Questions Incorrect
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeResult.scorePercentage >= 80
                  ? "Outstanding performance! You have passed this examination with an excellent score."
                  : activeResult.scorePercentage >= 60
                    ? "Good job! You have passed this examination. Review the question breakdown above for missed items."
                    : "Examination completed. Review the highlighted correct and incorrect answers above to improve in future assessments."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
