"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  TrendingUp,
  Award,
  RefreshCw,
  Filter,
  ChevronDown,
  ArrowLeft,
  Target,
  Bookmark,
  Home,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { PracticeMode } from "@/lib/practice/practice-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export default function PracticeHistoryPage() {
  const router = useRouter();
  const { history, resetPracticeSession, startPracticeSession, setConfig } =
    usePractice();

  const [selectedMode, setSelectedMode] = useState<PracticeMode | "">("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const modeOptions = [
    { value: "", label: "All Modes" },
    { value: "normal", label: "Normal Practice" },
    { value: "timed", label: "Timed Practice" },
    { value: "topic", label: "Topic Practice" },
    { value: "random", label: "Random Practice" },
  ];

  const subjectOptions = [
    { value: "", label: "All Subjects" },
    ...Array.from(new Set(history.map((item) => item.subject))).map(
      (subject) => ({
        value: subject,
        label: subject,
      }),
    ),
  ];

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesMode = selectedMode === "" || item.mode === selectedMode;
    const matchesSubject =
      selectedSubject === "" || item.subject === selectedSubject;
    return matchesMode && matchesSubject;
  });

  const handleRetrySession = (historyItem: (typeof history)[0]) => {
    // For this demo, we'll just start a new session with similar settings
    // In a real app, you'd store the full session config
    const practiceConfig = {
      mode: historyItem.mode,
      subject: historyItem.subject,
      topics: [],
      difficulty: ["easy", "medium", "hard"],
      questionCount: 10,
    };

    resetPracticeSession();
    setConfig(practiceConfig);
    startPracticeSession(practiceConfig);
    router.push("/practice/session");
  };

  const clearFilters = () => {
    setSelectedMode("");
    setSelectedSubject("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModeBadgeColor = (mode: PracticeMode) => {
    switch (mode) {
      case "normal":
        return "primary";
      case "timed":
        return "warning";
      case "topic":
        return "success";
      case "random":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getScoreColor = (score: string) => {
    const percentage = parseInt(score);
    if (percentage >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBadge = (score: string) => {
    const percentage = parseInt(score);
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  // Calculate statistics
  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + parseInt(item.score), 0) /
            history.length,
        )
      : 0;

  const totalSessions = history.length;
  const bestScore =
    history.length > 0
      ? Math.max(...history.map((item) => parseInt(item.score)))
      : 0;

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
              <Clock className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
                Practice History
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Track your progress and review past practice sessions
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/practice")}
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Practice
            </span>
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <Calendar className="h-4 w-4" />
                Total Sessions
              </div>
              <div className="text-3xl font-extrabold font-display text-[#0B2238] dark:text-white">
                {totalSessions}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Practice sessions completed
              </div>
            </CardContent>
          </Card>

          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                Average Score
              </div>
              <div
                className={`text-3xl font-extrabold font-display ${getScoreColor(averageScore.toString())}`}
              >
                {averageScore}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Across all sessions
              </div>
            </CardContent>
          </Card>

          <Card className="hoverEffect">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <Award className="h-4 w-4" />
                Best Score
              </div>
              <div
                className={`text-3xl font-extrabold font-display ${getScoreColor(bestScore.toString())}`}
              >
                {bestScore}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Highest achievement
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
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

          {(selectedMode || selectedSubject) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-slate-600 dark:text-slate-400"
            >
              Clear all filters
            </Button>
          )}
        </motion.div>

        {/* Filter Options */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: showFilters ? 1 : 0,
            height: showFilters ? "auto" : 0,
          }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Select
              label="Filter by Mode"
              options={modeOptions}
              value={selectedMode}
              onChange={(e) =>
                setSelectedMode(
                  (e.target as HTMLSelectElement).value as PracticeMode | "",
                )
              }
            />
            <Select
              label="Filter by Subject"
              options={subjectOptions}
              value={selectedSubject}
              onChange={(e) =>
                setSelectedSubject((e.target as HTMLSelectElement).value)
              }
            />
          </div>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hoverEffect">
            <CardHeader>
              <CardTitle className="text-lg">Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Mode
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Time Taken
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={getModeBadgeColor(item.mode)}
                              className="text-[10px]"
                            >
                              {item.mode.charAt(0).toUpperCase() +
                                item.mode.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                            {item.subject}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={getScoreBadge(item.score)}
                              className="text-xs font-bold"
                            >
                              {item.score}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                            {item.timeTaken}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRetrySession(item)}
                              className="text-xs"
                            >
                              <span className="flex items-center gap-1.5">
                                <RefreshCw className="h-3 w-3" />
                                Re-take
                              </span>
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Target className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-[#0B2238] dark:text-white">
                    {history.length === 0
                      ? "No practice history yet"
                      : "No sessions match your filters"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {history.length === 0
                      ? "Complete practice sessions to build your history and track your progress."
                      : "Try adjusting your filters to see more sessions."}
                  </p>
                  {history.length === 0 && (
                    <Button onClick={() => router.push("/practice")}>
                      <span className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Start Your First Practice
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button variant="outline" onClick={() => router.push("/practice")}>
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              New Practice Session
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/practice/saved")}
          >
            <span className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              View Saved Questions
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
