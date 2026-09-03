"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

export default function PracticeSessionPage() {
  const router = useRouter();
  const {
    currentSession,
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

  // Derive selectedAnswer from userAnswers instead of using useEffect
  const selectedAnswer =
    currentSession && currentSession[currentQuestionIndex]
      ? userAnswers[currentSession[currentQuestionIndex].id]
      : null;

  // Derive showExplanation - in normal mode, show when answer is selected
  const showExplanation = config.mode === "normal" && selectedAnswer !== null;

  const handleEndSession = () => {
    endPracticeSession();
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
                  {currentQuestion.questionText}
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
                  const isSelected = selectedAnswer === index;
                  const isCorrect = currentQuestion.correctAnswer === index;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={config.mode === "normal" && showExplanation}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-[#00A3C4] dark:bg-cyan-600 text-white border-[#00A3C4] dark:border-cyan-600"
                          : showExplanation && isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : showExplanation && isSelected && !isCorrect
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#00A3C4] dark:hover:border-cyan-500"
                      } ${config.mode === "normal" && showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-white bg-white/20"
                              : showExplanation && isCorrect
                                ? "border-emerald-500 bg-emerald-500"
                                : showExplanation && isSelected && !isCorrect
                                  ? "border-rose-500 bg-rose-500"
                                  : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                          {showExplanation && isCorrect && !isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                          {showExplanation && isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
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
          {/* Navigation Buttons Group */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <span className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
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
                <span className="hidden sm:inline">Clear</span>
              </span>
            </Button>
            <Button
              size="md"
              onClick={handleNext}
              disabled={currentQuestionIndex === currentSession.length - 1}
            >
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          </div>

          {/* End Practice Button - Separated */}
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowEndModal(true)}
            className="w-full sm:w-auto justify-center"
          >
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">End Practice</span>
              <span className="sm:hidden">End</span>
            </span>
          </Button>
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
