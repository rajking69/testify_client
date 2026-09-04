"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import {
  questionService,
  QuestionItem,
  QuestionDifficulty,
} from "@/services/question.service";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Filter,
  Plus,
  Layers,
  HelpCircle,
} from "lucide-react";

interface QuestionBankSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examSubject: string;
  alreadyAddedQuestionIds: string[];
  onAddSelectedQuestions: (selectedQuestions: QuestionItem[]) => void;
}

export function QuestionBankSelectorModal({
  isOpen,
  onClose,
  examSubject,
  alreadyAddedQuestionIds,
  onAddSelectedQuestions,
}: QuestionBankSelectorModalProps) {
  const [repositoryQuestions, setRepositoryQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSelectedIds([]);
      questionService
        .getQuestions({ subject: examSubject, limit: 100 })
        .then((res) => {
          // If backend returns questions for subject, use them
          if (res.data && res.data.length > 0) {
            setRepositoryQuestions(res.data);
          } else {
            // Also fetch all questions as fallback if subject has no strict tags
            questionService.getQuestions({ limit: 100 }).then((allRes) => {
              setRepositoryQuestions(allRes.data || []);
            });
          }
        })
        .catch(() => {
          setRepositoryQuestions([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, examSubject]);

  // Filter available questions (excluding already added to this exam)
  const availableQuestions = repositoryQuestions.filter(
    (q) => !alreadyAddedQuestionIds.includes(q._id)
  );

  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch =
      !search ||
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.topic?.toLowerCase().includes(search.toLowerCase());

    const matchesDiff =
      !selectedDifficulty || q.difficulty === selectedDifficulty;

    const matchesTopic =
      !selectedTopic || q.topic === selectedTopic;

    return matchesSearch && matchesDiff && matchesTopic;
  });

  const availableTopics = Array.from(
    new Set(availableQuestions.map((q) => q.topic).filter(Boolean))
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map((q) => q._id));
    }
  };

  const handleConfirmAdd = () => {
    const questionsToAdd = availableQuestions.filter((q) =>
      selectedIds.includes(q._id)
    );
    onAddSelectedQuestions(questionsToAdd);
    onClose();
  };

  const selectedMarksSum = availableQuestions
    .filter((q) => selectedIds.includes(q._id))
    .reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Questions from Question Bank"
      description={`Choose reusable questions for ${examSubject}. Questions will be linked without duplicating database records.`}
      size="xl"
    >
      <div className="space-y-4 pt-1">
        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by keyword..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Select
            value={selectedDifficulty}
            placeholder="All Difficulties"
            options={[
              { value: "", label: "All Difficulties" },
              { value: "EASY", label: "Easy" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HARD", label: "Hard" },
            ]}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          />

          <Select
            value={selectedTopic}
            placeholder={`All Topics (${availableTopics.length})`}
            options={[
              { value: "", label: `All Topics (${availableTopics.length})` },
              ...availableTopics.map((t) => ({
                value: t as string,
                label: t as string,
              })),
            ]}
            onChange={(e) => setSelectedTopic(e.target.value)}
          />
        </div>

        {/* Selection Stats Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                filteredQuestions.length > 0 &&
                selectedIds.length === filteredQuestions.length
              }
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-[#0092E3] focus:ring-[#0092E3] cursor-pointer"
            />
            <label htmlFor="selectAll" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Select All Filtered ({filteredQuestions.length})
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Selected: <strong className="text-[#0092E3]">{selectedIds.length}</strong> questions
            </span>
            <span className="text-slate-500">
              Total Marks: <strong className="text-[#0092E3]">{selectedMarksSum}</strong> pts
            </span>
          </div>
        </div>

        {/* Question Items Scrollable List */}
        <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Loading questions from repository...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                No available questions found.
              </p>
              <p className="text-[11px] text-slate-400">
                Create new questions or import via CSV to expand your Question Bank.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = selectedIds.includes(q._id);
              return (
                <div
                  key={q._id}
                  onClick={() => handleToggleSelect(q._id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/60 dark:bg-cyan-950/30"
                      : "hover:bg-slate-50/60 dark:hover:bg-slate-900/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-[#0092E3] focus:ring-[#0092E3] cursor-pointer"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {q.questionText}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <p className="text-[11px] text-slate-500 truncate">
                        Options: {q.options.join(" | ")}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {q.topic || "General"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ans: <strong className="text-emerald-600">{q.correctAnswer}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleConfirmAdd}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold px-6"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add {selectedIds.length} Questions ({selectedMarksSum} Marks)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
