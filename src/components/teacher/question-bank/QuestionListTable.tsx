"use client";

import React from "react";
import { Eye, Edit3, Trash2, HelpCircle, Archive, ArchiveRestore } from "lucide-react";
import { QuestionItem } from "@/services/question.service";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface QuestionListTableProps {
  questions: QuestionItem[];
  isLoading: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (selectAll: boolean) => void;
  onView: (question: QuestionItem) => void;
  onEdit: (question: QuestionItem) => void;
  onArchive?: (question: QuestionItem) => void;
  onDelete: (question: QuestionItem) => void;
}

export function QuestionListTable({
  questions,
  isLoading,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onView,
  onEdit,
  onArchive,
  onDelete,
}: QuestionListTableProps) {
  const allSelected =
    questions.length > 0 && selectedIds.length === questions.length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MCQ":
        return <Badge variant="info">MCQ</Badge>;
      case "TRUE_FALSE":
        return <Badge variant="secondary">True / False</Badge>;
      case "SHORT_ANSWER":
        return <Badge variant="warning">Short Answer</Badge>;
      case "FILL_IN_THE_BLANK":
        return <Badge variant="success">Fill in Blank</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Badge variant="success">Easy</Badge>;
      case "MEDIUM":
        return <Badge variant="info">Medium</Badge>;
      case "HARD":
        return <Badge variant="danger">Hard</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "READY") {
      return <Badge variant="success">Ready</Badge>;
    }
    if (status === "ARCHIVED") {
      return <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Archived</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <HelpCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white font-display">
          No questions found
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No questions match your filter criteria or you haven&apos;t created any questions yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              {onToggleSelect && (
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
              )}
              <th className="px-4 py-3.5">Question Text</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Subject / Topic</th>
              <th className="px-4 py-3.5">Difficulty</th>
              <th className="px-4 py-3.5 text-center">Marks</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {questions.map((q) => {
              const isSelected = selectedIds.includes(q._id);
              return (
                <tr
                  key={q._id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                  } ${q.status === "ARCHIVED" ? "opacity-75" : ""}`}
                >
                  {onToggleSelect && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(q._id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 max-w-xs xl:max-w-md">
                    <div className="font-medium text-slate-900 dark:text-white line-clamp-2">
                      {q.questionText}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {q.version && q.version > 1 && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                          v{q.version}
                        </span>
                      )}
                      {q.tags && q.tags.length > 0 && q.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block text-[10px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{getTypeBadge(q.questionType)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {q.subject || q.category}
                    </div>
                    {q.topic && (
                      <div className="text-xs text-slate-400 truncate max-w-[140px]">
                        {q.topic}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{getDifficultyBadge(q.difficulty)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-center font-bold text-slate-800 dark:text-slate-200">
                    {q.marks}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(q.status)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(q)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title="View Details & Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(q)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 rounded-lg transition-colors"
                        title="Edit Question"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {onArchive && (
                        <button
                          onClick={() => onArchive(q)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 dark:hover:text-amber-400 rounded-lg transition-colors"
                          title={q.status === "ARCHIVED" ? "Unarchive / Restore" : "Archive Question"}
                        >
                          {q.status === "ARCHIVED" ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:hidden">
        {questions.map((q) => {
          const isSelected = selectedIds.includes(q._id);
          return (
            <div
              key={q._id}
              className={`rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3 transition-all ${
                isSelected ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {onToggleSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(q._id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  )}
                  {getTypeBadge(q.questionType)}
                  {getDifficultyBadge(q.difficulty)}
                </div>
                {getStatusBadge(q.status)}
              </div>

              <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-3 leading-snug">
                {q.questionText}
              </h4>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Subject: <strong className="text-slate-700 dark:text-slate-300">{q.subject || q.category}</strong></span>
                <span>Marks: <strong className="text-indigo-600 dark:text-indigo-400">{q.marks}</strong></span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => onView(q)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(q)}>
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                {onArchive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onArchive(q)}
                    className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  >
                    {q.status === "ARCHIVED" ? "Restore" : "Archive"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(q)}
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
