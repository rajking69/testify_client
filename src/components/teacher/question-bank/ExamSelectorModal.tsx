"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { questionService, QuestionItem } from "@/services/question.service";
import { Layers, Shuffle, CheckCircle, AlertCircle } from "lucide-react";

interface ExamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onExamQuestionsSelected: (questions: QuestionItem[]) => void;
}

export function ExamSelectorModal({
  isOpen,
  onClose,
  selectedIds,
  onExamQuestionsSelected,
}: ExamSelectorModalProps) {
  const [mode, setMode] = useState<"manual" | "random">("manual");
  const [randomCount, setRandomCount] = useState(10);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const MAX_QUESTIONS_PER_EXAM = 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === "manual") {
      if (selectedIds.length === 0) {
        setErrorMessage("Please select at least 1 question from the Question Bank list.");
        return;
      }
      if (selectedIds.length > MAX_QUESTIONS_PER_EXAM) {
        setErrorMessage(`Maximum allowed questions per exam is ${MAX_QUESTIONS_PER_EXAM}. You have selected ${selectedIds.length}.`);
        return;
      }
    } else {
      if (randomCount < 1 || randomCount > MAX_QUESTIONS_PER_EXAM) {
        setErrorMessage(`Random question count must be between 1 and ${MAX_QUESTIONS_PER_EXAM}.`);
        return;
      }
    }

    try {
      setIsLoading(true);
      const res = await questionService.selectQuestionsForExam({
        mode,
        questionIds: mode === "manual" ? selectedIds : undefined,
        count: mode === "random" ? randomCount : undefined,
        category: mode === "random" && category ? category : undefined,
        difficulty: mode === "random" && difficulty ? difficulty : undefined,
        questionType: mode === "random" && questionType ? questionType : undefined,
      });

      setSuccessMessage(`Successfully fetched ${res.data.length} questions for exam creation.`);
      onExamQuestionsSelected(res.data);
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Failed to select questions for exam.");
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyOptions = [
    { value: "", label: "Any" },
    { value: "EASY", label: "Easy" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HARD", label: "Hard" },
  ];

  const typeOptions = [
    { value: "", label: "Any" },
    { value: "MCQ", label: "MCQ" },
    { value: "TRUE_FALSE", label: "True / False" },
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "FILL_IN_THE_BLANK", label: "Fill in Blank" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exam Question Selection Foundation"
      description="Choose questions manually or generate a random set for an exam (Max 100 questions per exam)."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
              mode === "manual"
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold"
                : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <Layers className="h-5 w-5 mb-1 text-indigo-600" />
            <span className="text-xs">Manual Selection</span>
            <span className="text-[10px] text-slate-400 mt-0.5">({selectedIds.length} selected)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("random")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
              mode === "random"
                ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold"
                : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <Shuffle className="h-5 w-5 mb-1 text-indigo-600" />
            <span className="text-xs">Random Selection</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Auto-pick by filter</span>
          </button>
        </div>

        {mode === "manual" ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Selected Questions:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedIds.length} / {MAX_QUESTIONS_PER_EXAM}</span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedIds.length === 0
                ? "Please check questions in the table behind this modal to select them."
                : `You have chosen ${selectedIds.length} specific questions for your upcoming exam.`}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Number of Random Questions (1 - {MAX_QUESTIONS_PER_EXAM})
              </label>
              <Input
                type="number"
                min={1}
                max={MAX_QUESTIONS_PER_EXAM}
                value={randomCount}
                onChange={(e) => setRandomCount(parseInt(e.target.value, 10) || 1)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Optional"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Difficulty</label>
                <Select
                  options={difficultyOptions}
                  placeholder=""
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Type</label>
                <Select
                  options={typeOptions}
                  placeholder=""
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isLoading}>
            {isLoading ? "Fetching..." : "Confirm Selection"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
