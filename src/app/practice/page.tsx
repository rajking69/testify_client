"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Clock,
  Target,
  Shuffle,
  BookOpen,
  ChevronRight,
  Settings,
  CheckCircle2,
  Home,
} from "lucide-react";
import { usePractice } from "@/lib/practice/practice-context";
import { subjects } from "@/lib/practice/mock-data";
import { PracticeMode, Difficulty } from "@/lib/practice/practice-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export default function PracticePage() {
  const router = useRouter();
  const { config, setConfig, startPracticeSession } = usePractice();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    Difficulty[]
  >(["easy", "medium", "hard"]);

  const practiceModes = [
    {
      id: "normal" as PracticeMode,
      title: "Normal Practice",
      description: "Un-timed practice with immediate explanations",
      icon: <BookOpen className="h-6 w-6" />,
      color:
        "border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/40",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
    },
    {
      id: "timed" as PracticeMode,
      title: "Timed Practice",
      description: "Official countdown timer with auto-submit",
      icon: <Clock className="h-6 w-6" />,
      color:
        "border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900/90 dark:to-amber-950/40",
      iconBg:
        "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
    },
    {
      id: "topic" as PracticeMode,
      title: "Topic Practice",
      description: "Drill down into specific subjects/topics",
      icon: <Target className="h-6 w-6" />,
      color:
        "border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/40",
      iconBg:
        "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
    },
    {
      id: "random" as PracticeMode,
      title: "Random Practice",
      description: "Dynamic shuffle across all subject banks",
      icon: <Shuffle className="h-6 w-6" />,
      color:
        "border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40",
      iconBg:
        "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
    },
  ];

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const questionCountOptions = [
    { value: "5", label: "5 Questions" },
    { value: "10", label: "10 Questions" },
    { value: "20", label: "20 Questions" },
    { value: "50", label: "50 Questions" },
  ];

  const subjectOptions = subjects.map((subject) => ({
    value: subject.name,
    label: subject.name,
  }));

  const getTopicsForSubject = (subjectName: string) => {
    const subject = subjects.find((s) => s.name === subjectName);
    return subject?.topics || [];
  };

  const handleSubjectChange = (subjectName: string) => {
    setConfig({ ...config, subject: subjectName, topics: [] });
    setSelectedTopics([]);
  };

  const handleTopicToggle = (topic: string) => {
    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter((t) => t !== topic)
      : [...selectedTopics, topic];
    setSelectedTopics(newTopics);
    setConfig({ ...config, topics: newTopics });
  };

  const handleDifficultyToggle = (difficulty: Difficulty) => {
    const newDifficulties = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter((d) => d !== difficulty)
      : [...selectedDifficulties, difficulty];
    setSelectedDifficulties(newDifficulties);
    setConfig({ ...config, difficulty: newDifficulties });
  };

  const handleStartPractice = () => {
    if (config.mode === "topic" && selectedTopics.length === 0) {
      alert("Please select at least one topic for Topic Practice mode.");
      return;
    }

    startPracticeSession(config);
    router.push("/practice/session");
  };

  const currentTopics = getTopicsForSubject(config.subject);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Badge
            variant="primary"
            className="text-xs font-bold uppercase tracking-wider"
          >
            Practice Mode
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight bg-gradient-to-r from-[#0B2238] via-[#0284C7] to-[#00A3C4] dark:from-white dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
            Configure Your Practice Session
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Choose your practice mode, customize subjects and topics, set
            difficulty levels, and start improving your knowledge.
          </p>
        </motion.div>

        {/* Practice Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#00A3C4] dark:text-cyan-400" />
            Select Practice Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {practiceModes.map((mode) => (
              <motion.div
                key={mode.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfig({ ...config, mode: mode.id })}
                className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                  config.mode === mode.id
                    ? `${mode.color} ring-2 ring-[#00A3C4] dark:ring-cyan-400 shadow-lg`
                    : `${mode.color} hover:shadow-md`
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl border shadow-2xs ${mode.iconBg} text-[#00A3C4] dark:text-cyan-400`}
                  >
                    {mode.icon}
                  </div>
                  {config.mode === mode.id && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <h3 className="text-base font-bold font-display text-[#0B2238] dark:text-white mb-1">
                  {mode.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {mode.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Configuration Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left Column: Subject & Topic */}
          <Card className="hoverEffect">
            <CardHeader>
              <CardTitle className="text-lg">
                Subject & Topic Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject Selection */}
              <div>
                <Select
                  label="Select Subject"
                  options={subjectOptions}
                  placeholder="Choose a subject"
                  value={config.subject}
                  onChange={(e) =>
                    handleSubjectChange((e.target as HTMLSelectElement).value)
                  }
                />
              </div>

              {/* Topic Selection */}
              {config.subject && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    Select Topics
                    {config.mode === "topic" && (
                      <span className="text-rose-500">*</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentTopics.map((topic) => (
                      <motion.button
                        key={topic}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTopicToggle(topic)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          selectedTopics.includes(topic)
                            ? "bg-[#00A3C4] dark:bg-cyan-600 text-white border-[#00A3C4] dark:border-cyan-600"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#00A3C4] dark:hover:border-cyan-500"
                        }`}
                      >
                        {selectedTopics.includes(topic) && (
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                        )}
                        {topic}
                      </motion.button>
                    ))}
                  </div>
                  {config.mode === "topic" && selectedTopics.length === 0 && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      Please select at least one topic for Topic Practice mode.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Difficulty & Question Count */}
          <Card className="hoverEffect">
            <CardHeader>
              <CardTitle className="text-lg">
                Difficulty & Question Count
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Select Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  {difficultyOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleDifficultyToggle(option.value as Difficulty)
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedDifficulties.includes(
                          option.value as Difficulty,
                        )
                          ? "bg-[#00A3C4] dark:bg-cyan-600 text-white border-[#00A3C4] dark:border-cyan-600"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-[#00A3C4] dark:hover:border-cyan-500"
                      }`}
                    >
                      {selectedDifficulties.includes(
                        option.value as Difficulty,
                      ) && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Question Count Selection */}
              <div>
                <Select
                  label="Number of Questions"
                  options={questionCountOptions}
                  placeholder="Select question count"
                  value={config.questionCount.toString()}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      questionCount: parseInt(
                        (e.target as HTMLSelectElement).value,
                      ),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Practice Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-4"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={handleStartPractice}
              className="bg-gradient-to-r from-[#0B2238] to-[#153E65] dark:from-blue-600 dark:to-indigo-600 hover:from-[#112F4C] hover:to-[#1B4D7D] dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white font-semibold py-4 shadow-lg shadow-blue-900/20 dark:shadow-blue-500/20"
            >
              <span className="flex items-center gap-2">
                Start Practice Session
                <ChevronRight className="h-5 w-5" />
              </span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Quick Access Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/practice/saved")}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Saved Questions
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/practice/history")}
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Practice History
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
