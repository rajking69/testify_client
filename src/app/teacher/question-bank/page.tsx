"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, Layers, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  questionService,
  QuestionItem,
  GetQuestionsParams,
  QuestionPayload,
} from "@/services/question.service";

import { QuestionFilters } from "@/components/teacher/question-bank/QuestionFilters";
import { QuestionListTable } from "@/components/teacher/question-bank/QuestionListTable";
import { QuestionFormModal } from "@/components/teacher/question-bank/QuestionFormModal";
import { QuestionDetailsModal } from "@/components/teacher/question-bank/QuestionDetailsModal";
import { DeleteConfirmationModal } from "@/components/teacher/question-bank/DeleteConfirmationModal";
import { ExamSelectorModal } from "@/components/teacher/question-bank/ExamSelectorModal";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  // Selection state for exam foundation
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // UI & Modals state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<QuestionItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExamSelectorOpen, setIsExamSelectorOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: GetQuestionsParams = {
        page,
        limit,
        search: debouncedSearch || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        questionType: questionType || undefined,
        status: status || undefined,
        sort: sort || "newest",
      };

      const res = await questionService.getQuestions(params);
      setQuestions(res.data);
      setTotalQuestions(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      console.error("Failed to load questions:", err);
      setError((err as Error).message || "Unable to load questions. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, category, difficulty, questionType, status, sort]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: GetQuestionsParams = {
          page,
          limit,
          search: debouncedSearch || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined,
          questionType: questionType || undefined,
          status: status || undefined,
          sort: sort || "newest",
        };

        const res = await questionService.getQuestions(params);
        if (isMounted) {
          setQuestions(res.data);
          setTotalQuestions(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Failed to load questions:", err);
          setError((err as Error).message || "Unable to load questions. Please check your connection.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [page, limit, debouncedSearch, category, difficulty, questionType, status, sort]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setDifficulty("");
    setQuestionType("");
    setStatus("");
    setSort("newest");
    setPage(1);
  };

  // Selection handlers for exam assignment
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const pageIds = questions.map((q) => q._id);
      const combined = Array.from(new Set([...selectedIds, ...pageIds]));
      setSelectedIds(combined);
    } else {
      const pageIds = new Set(questions.map((q) => q._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  // Form Handlers (Create & Edit)
  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (question: QuestionItem) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleSaveQuestion = async (payload: QuestionPayload) => {
    try {
      setIsSubmittingForm(true);
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion._id, payload);
        showToast("Question updated successfully!", "success");
      } else {
        await questionService.createQuestion(payload);
        showToast("Question created successfully!", "success");
      }
      fetchQuestions();
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to save question", "error");
      throw err;
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // View Details Handler
  const handleViewDetails = (question: QuestionItem) => {
    setViewingQuestion(question);
    setIsDetailsOpen(true);
  };

  // Archive / Restore Handler
  const handleToggleArchive = async (question: QuestionItem) => {
    try {
      const res = await questionService.toggleArchiveQuestion(question._id);
      showToast(res.message || "Archive status updated!", "success");
      fetchQuestions();
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to toggle archive status", "error");
    }
  };

  // Delete Handler
  const handleOpenDeleteModal = (question: QuestionItem) => {
    setDeletingQuestion(question);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    try {
      setIsDeleting(true);
      await questionService.deleteQuestion(deletingQuestion._id);
      showToast("Question deleted successfully!", "success");
      setIsDeleteOpen(false);
      setDeletingQuestion(null);
      // Remove from selection if deleted
      setSelectedIds((prev) => prev.filter((id) => id !== deletingQuestion._id));
      fetchQuestions();
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to delete question", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-rose-600 text-white border-rose-500"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Assessment Assets
            </p>
            <Badge variant="outline">{totalQuestions} Questions</Badge>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl font-display">
            Question Bank
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Create, organize, sort, preview, and reuse questions across all your exams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsExamSelectorOpen(true)}
            leftIcon={<Layers className="h-4 w-4" />}
          >
            Select for Exam {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Question
          </Button>
        </div>
      </div>

      {/* Search & Filters Section with Sorting */}
      <QuestionFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={(val) => {
          setCategory(val);
          setPage(1);
        }}
        difficulty={difficulty}
        onDifficultyChange={(val) => {
          setDifficulty(val);
          setPage(1);
        }}
        questionType={questionType}
        onQuestionTypeChange={(val) => {
          setQuestionType(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        sort={sort}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Error Banner State */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900/50 dark:bg-rose-950/40 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
            Unable to load questions
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuestions}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry Loading
          </Button>
        </div>
      )}

      {/* Question Table & Card List */}
      {!error && (
        <QuestionListTable
          questions={questions}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onView={handleViewDetails}
          onEdit={handleOpenEditModal}
          onArchive={handleToggleArchive}
          onDelete={handleOpenDeleteModal}
        />
      )}

      {/* Pagination Controls */}
      {!error && !isLoading && questions.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{questions.length}</strong> of{" "}
            <strong className="text-slate-800 dark:text-slate-200">{totalQuestions}</strong> questions (Page {page} of {totalPages})
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pNum) => pNum === 1 || pNum === totalPages || Math.abs(pNum - page) <= 1)
                .map((pNum, idx, arr) => {
                  const prevNum = arr[idx - 1];
                  const showEllipsis = prevNum && pNum - prevNum > 1;
                  return (
                    <React.Fragment key={pNum}>
                      {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                      <button
                        onClick={() => setPage(pNum)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                          page === pNum
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {pNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuestionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveQuestion}
        initialData={editingQuestion}
        isSubmitting={isSubmittingForm}
      />

      <QuestionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        question={viewingQuestion}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        question={deletingQuestion}
        isDeleting={isDeleting}
      />

      <ExamSelectorModal
        isOpen={isExamSelectorOpen}
        onClose={() => setIsExamSelectorOpen(false)}
        selectedIds={selectedIds}
        onExamQuestionsSelected={(selected) => {
          showToast(`Selected ${selected.length} questions for exam creation!`, "success");
        }}
      />
    </div>
  );
}
