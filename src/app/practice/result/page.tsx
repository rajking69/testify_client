"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Target,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  TrendingUp,
  BookOpen,
  Home,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function PracticeResultPage() {
  const router = useRouter();
  const { lastResult, resetPracticeSession, startPracticeSession, config } =
    usePractice();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );

  if (!lastResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Trophy className="h-16 w-16 text-slate-400 mx-auto" />
          <h2 className="text-2xl font-bold text-[#0B2238] dark:text-white">
            No Results Available
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Complete a practice session to view your results.
          </p>
          <Button onClick={() => router.push("/practice")}>
            Start New Practice
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleRetry = () => {
    resetPracticeSession();
    startPracticeSession(config);
    router.push("/practice/session");
  };

  const handlePracticeMissed = () => {
    const missedQuestions = lastResult.questions.filter((question) => {
      const userAnswer = lastResult.userAnswers[question.id];
      return userAnswer !== question.correctAnswer;
    });

    if (missedQuestions.length === 0) {
      alert("You answered all questions correctly! Great job!");
      return;
    }

    resetPracticeSession();
    // Start a new session with only missed questions
    const missedConfig = {
      ...config,
      questionCount: missedQuestions.length,
    };
    startPracticeSession(missedConfig);
    router.push("/practice/session");
  };

  const handleBackToSetup = () => {
    resetPracticeSession();
    router.push("/practice");
  };

  const correctCount = lastResult.correctAnswers;
  const wrongCount = lastResult.totalQuestions - correctCount;
  const accuracyRate = Math.round(
    (correctCount / lastResult.totalQuestions) * 100,
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleBackToSetup}>
              <span className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Setup
              </span>
            </Button>
            <Badge variant="primary" className="text-xs font-bold uppercase">
              {lastResult.mode} Practice Results
            </Badge>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Completed: {new Date(lastResult.completedAt).toLocaleDateString()}
          </div>
        </motion.div>

        {/* Performance Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Score Card */}
          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <Trophy className="h-4 w-4" />
                Total Score
              </div>
              <div
                className={`text-3xl font-extrabold font-display ${getScoreColor(lastResult.scorePercentage)}`}
              >
                {lastResult.scorePercentage}%
              </div>
              <Badge
                variant={getScoreBadge(lastResult.scorePercentage)}
                className="text-xs"
              >
                {lastResult.scorePercentage >= 80
                  ? "Excellent"
                  : lastResult.scorePercentage >= 60
                    ? "Good"
                    : "Needs Improvement"}
              </Badge>
            </CardContent>
          </Card>

          {/* Correct Answers Card */}
          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Correct Answers
              </div>
              <div className="text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                of {lastResult.totalQuestions} questions
              </div>
            </CardContent>
          </Card>

          {/* Time Spent Card */}
          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <Clock className="h-4 w-4 text-blue-500" />
                Time Spent
              </div>
              <div className="text-3xl font-extrabold font-display text-blue-600 dark:text-blue-400">
                {formatTime(lastResult.timeSpentSeconds)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {lastResult.mode === "timed" ? "Timed session" : "Self-paced"}
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Rate Card */}
          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <Target className="h-4 w-4 text-purple-500" />
                Accuracy Rate
              </div>
              <div className="text-3xl font-extrabold font-display text-purple-600 dark:text-purple-400">
                {accuracyRate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {wrongCount} incorrect answers
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={handleRetry}
            className="bg-gradient-to-r from-[#0B2238] to-[#153E65] dark:from-blue-600 dark:to-indigo-600 hover:from-[#112F4C] hover:to-[#1B4D7D] dark:hover:from-blue-500 dark:hover:to-indigo-500"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Retry Practice
            </span>
          </Button>
          {wrongCount > 0 && (
            <Button size="lg" variant="outline" onClick={handlePracticeMissed}>
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Practice Missed Questions ({wrongCount})
              </span>
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/practice/saved")}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              View Saved Questions
            </span>
          </Button>
        </motion.div>

        {/* Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#00A3C4] dark:text-cyan-400" />
            Question Breakdown
          </h2>

          <div className="space-y-3">
            {lastResult.questions.map((question, index) => {
              const userAnswer = lastResult.userAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const isExpanded = expandedQuestions.has(question.id);

              return (
                <Card key={question.id} className="hoverEffect">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="info" className="text-[10px]">
                              Q{index + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {question.topic}
                            </Badge>
                            <Badge
                              variant={
                                question.difficulty === "easy"
                                  ? "success"
                                  : question.difficulty === "medium"
                                    ? "warning"
                                    : "danger"
                              }
                              className="text-[10px]"
                            >
                              {question.difficulty}
                            </Badge>
                            <Badge
                              variant={isCorrect ? "success" : "danger"}
                              className="text-[10px]"
                            >
                              {isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-[#0B2238] dark:text-white">
                            {question.questionText}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleQuestionExpansion(question.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-500" />
                          )}
                        </motion.button>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3"
                          >
                            {/* Answer Options */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Your Answer:
                              </p>
                              <div className="space-y-2">
                                {question.options?.map((option, optIndex) => {
                                  const isUserAnswer = userAnswer === optIndex;
                                  const isCorrectAnswer =
                                    question.correctAnswer === optIndex;

                                  return (
                                    <div
                                      key={optIndex}
                                      className={`p-3 rounded-lg border text-sm ${
                                        isUserAnswer && isCorrectAnswer
                                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                          : isUserAnswer && !isCorrectAnswer
                                            ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                                            : isCorrectAnswer
                                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isUserAnswer && isCorrectAnswer && (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                        {isUserAnswer && !isCorrectAnswer && (
                                          <XCircle className="h-4 w-4" />
                                        )}
                                        {!isUserAnswer && isCorrectAnswer && (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}
                                        <span>{option}</span>
                                        {isUserAnswer && !isCorrectAnswer && (
                                          <span className="ml-auto text-xs font-semibold">
                                            (Your choice)
                                          </span>
                                        )}
                                        {!isUserAnswer && isCorrectAnswer && (
                                          <span className="ml-auto text-xs font-semibold">
                                            (Correct answer)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-2">
                                <Eye className="h-4 w-4" />
                                Explanation
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {question.explanation}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hoverEffect">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00A3C4] dark:text-cyan-400" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {correctCount}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    Questions Mastered
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {wrongCount}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                    Questions to Review
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {lastResult.questions.filter((q) => q.isBookmarked).length}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                    Questions Bookmarked
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {lastResult.scorePercentage >= 80
                  ? "Excellent performance! You've demonstrated strong understanding of the material. Consider practicing more advanced topics to further challenge yourself."
                  : lastResult.scorePercentage >= 60
                    ? "Good job! You have a solid foundation. Focus on reviewing the missed questions to strengthen your weak areas."
                    : "Keep practicing! Review the explanations for missed questions and consider focusing on specific topics where you need more practice."}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
