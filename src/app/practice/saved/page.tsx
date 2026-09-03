"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  BookmarkCheck,
  Play,
  X,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Home,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { subjects } from "@/lib/practice/mock-data";
import { Difficulty } from "@/lib/practice/practice-types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export default function SavedQuestionsPage() {
  const router = useRouter();
  const {
    bookmarkedQuestions,
    toggleBookmark,
    startPracticeSession,
    setConfig,
  } = usePractice();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "">(
    "",
  );
  const [showFilters, setShowFilters] = useState(false);

  const subjectOptions = [
    { value: "", label: "All Subjects" },
    ...subjects.map((subject) => ({
      value: subject.name,
      label: subject.name,
    })),
  ];

  const difficultyOptions = [
    { value: "", label: "All Difficulties" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  // Filter bookmarked questions
  const filteredQuestions = useMemo(() => {
    return bookmarkedQuestions.filter((question) => {
      const matchesSearch =
        searchQuery === "" ||
        question.questionText
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        question.topic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === "" || question.subject === selectedSubject;
      const matchesDifficulty =
        selectedDifficulty === "" || question.difficulty === selectedDifficulty;

      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [bookmarkedQuestions, searchQuery, selectedSubject, selectedDifficulty]);

  const handleRemoveBookmark = (questionId: string) => {
    toggleBookmark(questionId);
  };

  const handlePracticeBookmarked = () => {
    if (filteredQuestions.length === 0) {
      alert(
        "No questions available to practice. Please adjust your filters or bookmark some questions.",
      );
      return;
    }

    const practiceConfig = {
      mode: "normal" as const,
      subject: selectedSubject || "Mixed",
      topics: [],
      difficulty: selectedDifficulty
        ? [selectedDifficulty as Difficulty]
        : (["easy", "medium", "hard"] as Difficulty[]),
      questionCount: filteredQuestions.length,
    };

    setConfig(practiceConfig);
    startPracticeSession(practiceConfig);
    router.push("/practice/session");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedDifficulty("");
  };

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BookmarkCheck className="h-8 w-8 text-amber-500" />
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
                My Saved Questions
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {bookmarkedQuestions.length} questions bookmarked across all
              subjects
            </p>
          </div>

          <Button
            size="lg"
            onClick={handlePracticeBookmarked}
            disabled={filteredQuestions.length === 0}
            className="bg-gradient-to-r from-[#0B2238] to-[#153E65] dark:from-blue-600 dark:to-indigo-600 hover:from-[#112F4C] hover:to-[#1B4D7D] dark:hover:from-blue-500 dark:hover:to-indigo-500"
          >
            <span className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Practice Bookmarked Questions ({filteredQuestions.length})
            </span>
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions by text or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0B2238] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3C4] dark:focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </span>
            </Button>

            {(searchQuery || selectedSubject || selectedDifficulty) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Clear all filters
                </span>
              </Button>
            )}
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <Select
                  label="Filter by Subject"
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={(e) =>
                    setSelectedSubject((e.target as HTMLSelectElement).value)
                  }
                />
                <Select
                  label="Filter by Difficulty"
                  options={difficultyOptions}
                  value={selectedDifficulty}
                  onChange={(e) =>
                    setSelectedDifficulty(
                      (e.target as HTMLSelectElement).value as Difficulty | "",
                    )
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400"
        >
          <span>
            Showing {filteredQuestions.length} of {bookmarkedQuestions.length}{" "}
            saved questions
          </span>
          {searchQuery || selectedSubject || selectedDifficulty ? (
            <span className="text-xs">Filters active</span>
          ) : null}
        </motion.div>

        {/* Questions Grid */}
        {filteredQuestions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-4"
          >
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="hoverEffect">
                <CardContent className="p-5">
                  <div className="space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]">
                            {question.subject}
                          </Badge>
                          <Badge variant="info" className="text-[10px]">
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
                        </div>
                        <p className="text-sm font-medium text-[#0B2238] dark:text-white leading-relaxed">
                          {question.questionText}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveBookmark(question.id)}
                          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors"
                          title="Remove bookmark"
                        >
                          <BookmarkCheck className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Question Options Preview */}
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => {
                        const isCorrect = question.correctAnswer === optIndex;
                        return (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-lg border text-xs ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              <span className="flex-1">{option}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-semibold">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        ID: {question.id}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Start practice with just this question
                          const singleQuestionConfig = {
                            mode: "normal" as const,
                            subject: question.subject,
                            topics: [question.topic],
                            difficulty: [question.difficulty],
                            questionCount: 1,
                          };
                          setConfig(singleQuestionConfig);
                          startPracticeSession(singleQuestionConfig);
                          router.push("/practice/session");
                        }}
                        className="text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <Play className="h-3 w-3" />
                          Practice This Question
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16 space-y-4"
          >
            <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-[#0B2238] dark:text-white">
              {bookmarkedQuestions.length === 0
                ? "No saved questions yet"
                : "No questions match your filters"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto">
              {bookmarkedQuestions.length === 0
                ? "Bookmark questions during practice sessions to build your personal collection for focused review."
                : "Try adjusting your search or filters to find the questions you're looking for."}
            </p>
            {bookmarkedQuestions.length === 0 && (
              <Button onClick={() => router.push("/practice")}>
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Practice Session
                </span>
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
