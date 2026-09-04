"use client";

import React, { useState } from "react";
import { QuestionItem } from "@/services/question.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Eye,
  Edit,
  Trash2,
  HelpCircle,
  Plus,
  Upload,
  Layers,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface ExamQuestionsTableProps {
  questions: QuestionItem[];
  onOpenCreateModal: () => void;
  onOpenBulkImportModal: () => void;
  onOpenQuestionBankModal: () => void;
  onEditQuestion: (question: QuestionItem) => void;
  onRemoveQuestion: (questionId: string) => void;
  onReorderQuestions?: (newQuestions: QuestionItem[]) => void;
}

export function ExamQuestionsTable({
  questions,
  onOpenCreateModal,
  onOpenBulkImportModal,
  onOpenQuestionBankModal,
  onEditQuestion,
  onRemoveQuestion,
  onReorderQuestions,
}: ExamQuestionsTableProps) {
  const [viewingQuestion, setViewingQuestion] = useState<QuestionItem | null>(null);
  const [questionToRemove, setQuestionToRemove] = useState<QuestionItem | null>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0 || !onReorderQuestions) return;
    const reordered = [...questions];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    onReorderQuestions(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1 || !onReorderQuestions) return;
    const reordered = [...questions];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    onReorderQuestions(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Table Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800 shadow-sm">
        <div>
          <h3 className="text-base font-bold font-display text-[#152234] dark:text-white">
            Configured Exam Questions ({questions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage question items, marks breakdown, and test structure.
          </p>
        </div>

        {/* 3 Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={onOpenCreateModal}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm cursor-pointer"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create Question
          </Button>

          <Button
            onClick={onOpenBulkImportModal}
            variant="outline"
            className="bg-white hover:bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
            leftIcon={<Upload className="h-3.5 w-3.5 text-[#0092E3]" />}
          >
            Bulk Import
          </Button>

          <Button
            onClick={onOpenQuestionBankModal}
            variant="outline"
            className="bg-white hover:bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
            leftIcon={<Layers className="h-3.5 w-3.5 text-purple-600" />}
          >
            Question Bank
          </Button>
        </div>
      </div>

      {/* Main Questions List Table */}
      {questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#0092E3] flex items-center justify-center mx-auto">
            <HelpCircle className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-base font-bold font-display text-[#152234] dark:text-white">
              No questions added to this exam yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Start building your exam paper by creating individual questions, bulk importing from CSV, or picking existing questions from your Question Bank repository.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={onOpenCreateModal}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create First Question
            </Button>
            <Button
              onClick={onOpenBulkImportModal}
              variant="outline"
              className="font-bold text-xs px-4 py-2.5 rounded-xl"
              leftIcon={<Upload className="h-4 w-4 text-[#0092E3]" />}
            >
              Bulk Import CSV (50–100+)
            </Button>
            <Button
              onClick={onOpenQuestionBankModal}
              variant="outline"
              className="font-bold text-xs px-4 py-2.5 rounded-xl"
              leftIcon={<Layers className="h-4 w-4 text-purple-600" />}
            >
              Select from Repository
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">#</th>
                  <th className="p-3.5">Question Prompt</th>
                  <th className="p-3.5">Type & Topic</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5">Marks</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {questions.map((q, idx) => (
                  <tr
                    key={q._id || idx}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 pl-5 font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="p-3.5 max-w-md">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {q.questionText}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {q.options.join(" • ")}
                        </p>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#0092E3] dark:text-cyan-400">
                          {q.questionType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {q.topic || "General"}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.difficulty === "EASY"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : q.difficulty === "HARD"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {q.marks || 1} pts
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Reordering Controls */}
                        {onReorderQuestions && (
                          <div className="flex items-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveUp(idx)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Move Up"
                            >
                              <span className="text-xs font-bold leading-none">▲</span>
                            </button>
                            <button
                              type="button"
                              disabled={idx === questions.length - 1}
                              onClick={() => handleMoveDown(idx)}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title="Move Down"
                            >
                              <span className="text-xs font-bold leading-none">▼</span>
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setViewingQuestion(q)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditQuestion(q)}
                          className="p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-500 hover:text-[#0092E3] transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuestionToRemove(q)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove from Exam"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Question Details Modal */}
      {viewingQuestion && (
        <Modal
          isOpen={!!viewingQuestion}
          onClose={() => setViewingQuestion(null)}
          title="Question Details"
          description={`Subject: ${viewingQuestion.subject || "Academic"} • Topic: ${viewingQuestion.topic || "General"}`}
          size="md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {viewingQuestion.questionType} • {viewingQuestion.difficulty}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {viewingQuestion.marks} Marks
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {viewingQuestion.questionText}
              </p>
            </div>

            {viewingQuestion.options && viewingQuestion.options.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Options:
                </label>
                <div className="space-y-1.5">
                  {viewingQuestion.options.map((opt, i) => {
                    const isCorrect = opt === viewingQuestion.correctAnswer;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                          isCorrect
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200 font-bold"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>
                          {String.fromCharCode(65 + i)}. {opt}
                        </span>
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Correct Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewingQuestion.explanation && (
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-cyan-950/30 border border-blue-200/60 dark:border-cyan-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-[#0092E3]">Explanation / Rationale:</span>
                <p>{viewingQuestion.explanation}</p>
              </div>
            )}

            <div className="text-right pt-2">
              <Button onClick={() => setViewingQuestion(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Confirmation Modal */}
      {questionToRemove && (
        <Modal
          isOpen={!!questionToRemove}
          onClose={() => setQuestionToRemove(null)}
          title="Remove Question from Exam"
          description="Are you sure you want to remove this question from this examination paper?"
          size="sm"
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Note: This question will remain available in your master Question Bank repository. It will only be unlinked from this exam.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setQuestionToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                onClick={() => {
                  onRemoveQuestion(questionToRemove._id);
                  setQuestionToRemove(null);
                }}
              >
                Remove from Exam
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
