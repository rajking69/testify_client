"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Tag,
  BookOpen,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { AdminTable } from "@/components/admin/shared/AdminTable";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useFilterState } from "@/lib/admin/url-state";
import { formatRelativeTime, cn } from "@/lib/admin/utils";
import { mockQuestions } from "@/lib/admin/mock-data";
import {
  Question,
  QuestionType,
  TableColumn,
  ActionMenuItem,
} from "@/lib/admin/types";

export default function AdminQuestionsPage() {
  const {
    filters,
    updateFilter,
    updateFilters,
    updateSearch,
    updatePagination,
  } = useFilterState({
    type: undefined,
    difficulty: undefined,
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [questionModal, setQuestionModal] = useState<{
    type: "create" | "edit";
    question?: Question;
  } | null>(null);

  // Filter questions
  const filteredQuestions = mockQuestions.filter((question) => {
    if (filters.type && question.type !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        question.question.toLowerCase().includes(search) ||
        question.subject.toLowerCase().includes(search) ||
        question.category.toLowerCase().includes(search) ||
        question.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }
    return true;
  });

  // Pagination
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + filters.pageSize,
  );

  // Stats
  const stats = {
    total: mockQuestions.length,
    mcq: mockQuestions.filter((q) => q.type === "mcq").length,
    trueFalse: mockQuestions.filter((q) => q.type === "true_false").length,
    shortAnswer: mockQuestions.filter((q) => q.type === "short_answer").length,
  };

  // Table columns
  const columns: TableColumn<Question>[] = [
    {
      key: "question",
      header: "Question",
      sortable: true,
      render: (value, question) => (
        <div className="max-w-md">
          <p className="font-medium text-slate-900 dark:text-white line-clamp-2">
            {question.question}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {question.type === "mcq"
                ? "MCQ"
                : question.type === "true_false"
                  ? "T/F"
                  : "Short"}
            </Badge>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {question.category}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <BookOpen className="h-3 w-3" />
          {value}
        </div>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      sortable: true,
      render: (value) => {
        const valStr = String(value || "");
        return (
          <Badge
            variant="outline"
            className={cn(
              valStr === "easy" &&
                "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
              valStr === "medium" &&
                "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
              valStr === "hard" &&
                "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
            )}
          >
            {valStr ? valStr.charAt(0).toUpperCase() + valStr.slice(1) : ""}
          </Badge>
        );
      },
    },
    {
      key: "tags",
      header: "Tags",
      render: (value) => {
        const tags = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "usageCount",
      header: "Usage",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <TrendingUp className="h-3 w-3" />
          {String(value ?? 0)}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">
          {value ? formatRelativeTime(String(value)) : "-"}
        </span>
      ),
    },
  ];

  // Action menu items
  const getActionMenuItems = (question: Question): ActionMenuItem<Question>[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (q) => setSelectedQuestion(q),
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (q) => setQuestionModal({ type: "edit", question: q }),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (q) => console.log("Delete question", q.id),
      danger: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Question Bank
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and organize exam questions
          </p>
        </div>
        <Button onClick={() => setQuestionModal({ type: "create" })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Questions"
          value={stats.total}
          icon={HelpCircle}
        />
        <StatCard
          title="Multiple Choice"
          value={stats.mcq}
          icon={HelpCircle}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="True/False"
          value={stats.trueFalse}
          icon={HelpCircle}
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Short Answer"
          value={stats.shortAnswer}
          icon={HelpCircle}
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Table */}
      <AdminTable
        data={paginatedQuestions}
        columns={columns}
        filters={filters}
        onFilterChange={updateFilters}
        total={filteredQuestions.length}
        actionMenuItems={getActionMenuItems}
        emptyMessage="No questions found"
      />

      {/* Question Details Modal */}
      {selectedQuestion && (
        <Modal
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          title="Question Details"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Question
              </p>
              <p className="text-slate-900 dark:text-white">
                {selectedQuestion.question}
              </p>
            </div>

            {selectedQuestion.type === "mcq" && selectedQuestion.options && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Options
                </p>
                <div className="space-y-2">
                  {selectedQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded border",
                        option === selectedQuestion.correctAnswer
                          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                          : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
                      )}
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {option}
                        {option === selectedQuestion.correctAnswer && " ✓"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedQuestion.explanation && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Explanation
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {selectedQuestion.explanation}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Subject
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedQuestion.subject}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Difficulty
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedQuestion.difficulty}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedQuestion(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Question Modal */}
      {questionModal && (
        <Modal
          isOpen={!!questionModal}
          onClose={() => setQuestionModal(null)}
          title={
            questionModal.type === "create"
              ? "Add New Question"
              : "Edit Question"
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Question Type
              </label>
              <Select
                defaultValue={questionModal.question?.type || "mcq"}
                options={[
                  { value: "mcq", label: "Multiple Choice" },
                  { value: "true_false", label: "True/False" },
                  { value: "short_answer", label: "Short Answer" },
                ]}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Question
              </label>
              <Textarea
                defaultValue={questionModal.question?.question}
                placeholder="Enter your question"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Subject
                </label>
                <Input
                  defaultValue={questionModal.question?.subject}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Difficulty
                </label>
                <Select
                  defaultValue={questionModal.question?.difficulty || "medium"}
                  options={[
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Tags (comma separated)
              </label>
              <Input
                defaultValue={questionModal.question?.tags.join(", ")}
                placeholder="algorithms, sorting, complexity"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setQuestionModal(null)}>
                Cancel
              </Button>
              <Button>
                {questionModal.type === "create"
                  ? "Add Question"
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
