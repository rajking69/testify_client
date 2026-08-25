"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { QuestionItem } from "@/services/question.service";
import { CheckCircle2, Award, Tag, History, Clock, BookOpen, Layers } from "lucide-react";

interface QuestionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuestionItem | null;
}

export function QuestionDetailsModal({
  isOpen,
  onClose,
  question,
}: QuestionDetailsModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(true);

  if (!question) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MCQ":
        return "Multiple Choice (MCQ)";
      case "TRUE_FALSE":
        return "True / False";
      case "SHORT_ANSWER":
        return "Short Answer";
      case "FILL_IN_THE_BLANK":
        return "Fill in the Blank";
      default:
        return type;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Question Details & Preview"
      description="View full question specification, options, correct answer, version history, and metadata."
      size="lg"
    >
      <div className="space-y-5">
        {/* Type & Difficulty Badges Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="info">{getTypeLabel(question.questionType)}</Badge>
            <Badge
              variant={
                question.difficulty === "EASY"
                  ? "success"
                  : question.difficulty === "MEDIUM"
                  ? "info"
                  : "danger"
              }
            >
              {question.difficulty}
            </Badge>
            <Badge variant={question.status === "READY" ? "success" : question.status === "ARCHIVED" ? "secondary" : "outline"}>
              {question.status}
            </Badge>
            {question.version && (
              <span className="flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                <History className="h-3 w-3" /> Version {question.version}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 font-bold text-sm text-indigo-600 dark:text-indigo-400">
            <Award className="h-4 w-4" />
            <span>{question.marks} {question.marks === 1 ? "Mark" : "Marks"}</span>
          </div>
        </div>

        {/* Subject & Topic Banner */}
        <div className="flex items-center gap-4 text-xs p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold">
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Subject: <strong className="text-slate-900 dark:text-white">{question.subject || question.category}</strong></span>
          </div>
          {question.topic && (
            <div className="flex items-center gap-1.5 font-semibold border-l border-slate-200 dark:border-slate-800 pl-4">
              <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>Topic: <strong className="text-slate-900 dark:text-white">{question.topic}</strong></span>
            </div>
          )}
        </div>

        {/* Question Prompt */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Question Prompt
          </h4>
          <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
            {question.questionText}
          </p>
        </div>

        {/* Options & Correct Answer */}
        {question.options && question.options.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Options &amp; Answer
              </h4>
              <button
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {showAnswer ? "Hide Correct Answer" : "Reveal Correct Answer"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.options.map((opt, idx) => {
                const isCorrect =
                  idx === question.correctOptionIndex ||
                  opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                const isHighlight = showAnswer && isCorrect;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                      isHighlight
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold"
                        : selectedOption === idx
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isHighlight
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {isHighlight && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Correct Answer Display for Short Answer */}
        {question.questionType === "SHORT_ANSWER" && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Expected Correct Answer
            </h4>
            <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold text-sm">
              {question.correctAnswer}
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Explanation / Rationale
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {question.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Version History & Timestamps Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-400 block mb-0.5">Version History</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <History className="h-3 w-3 text-indigo-500" /> Version {question.version || 1}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 block mb-0.5">Created Date</span>
            <span className="font-medium text-slate-600 dark:text-slate-400">
              {new Date(question.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400 block mb-0.5">Last Updated</span>
            <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {new Date(question.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
