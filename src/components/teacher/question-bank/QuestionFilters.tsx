"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface QuestionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  questionType: string;
  onQuestionTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  categoriesList?: string[];
}

export function QuestionFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  questionType,
  onQuestionTypeChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onClearFilters,
  categoriesList = ["General", "Programming", "Mathematics", "Science", "Database", "English"],
}: QuestionFiltersProps) {
  const hasActiveFilters =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(difficulty) ||
    Boolean(questionType) ||
    Boolean(status) ||
    Boolean(sort && sort !== "newest");

  const typeOptions = [
    { value: "", label: "All Question Types" },
    { value: "MCQ", label: "MCQ" },
    { value: "TRUE_FALSE", label: "True / False" },
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "FILL_IN_THE_BLANK", label: "Fill in the Blank" },
  ];

  const difficultyOptions = [
    { value: "", label: "All Difficulties" },
    { value: "EASY", label: "Easy" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HARD", label: "Hard" },
  ];

  const categoryOptions = [
    { value: "", label: "All Subjects" },
    ...categoriesList.map((cat) => ({ value: cat, label: cat })),
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "READY", label: "Ready" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  const sortOptions = [
    { value: "newest", label: "Sort: Newest First" },
    { value: "oldest", label: "Sort: Oldest First" },
    { value: "marks_desc", label: "Sort: Highest Marks" },
    { value: "marks_asc", label: "Sort: Lowest Marks" },
    { value: "title_asc", label: "Sort: Alphabetical (A-Z)" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Bar */}
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search questions by text, subject, topic, or tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          />
        </div>

        {/* Filters Group */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Question Type Filter */}
          <Select
            options={typeOptions}
            placeholder=""
            value={questionType}
            onChange={(e) => onQuestionTypeChange(e.target.value)}
          />

          {/* Difficulty Filter */}
          <Select
            options={difficultyOptions}
            placeholder=""
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
          />

          {/* Category / Subject Filter */}
          <Select
            options={categoryOptions}
            placeholder=""
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          />

          {/* Status Filter */}
          <Select
            options={statusOptions}
            placeholder=""
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          />

          {/* Sort By Filter */}
          <Select
            options={sortOptions}
            placeholder=""
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="shrink-0"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
