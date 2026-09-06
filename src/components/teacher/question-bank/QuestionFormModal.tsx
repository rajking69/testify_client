"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QuestionItem, QuestionPayload, QuestionType, QuestionDifficulty, QuestionStatus } from "@/services/question.service";
import { Eye, Edit3, CheckCircle2, History, Award } from "lucide-react";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: QuestionPayload) => Promise<void>;
  initialData?: QuestionItem | null;
  isSubmitting?: boolean;
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: QuestionFormModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const [prevInitialData, setPrevInitialData] = useState<QuestionItem | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  const [questionType, setQuestionType] = useState<QuestionType>(initialData?.questionType || "MCQ");
  const [questionText, setQuestionText] = useState(initialData?.questionText || "");
  const [category, setCategory] = useState(initialData?.subject || initialData?.category || "General");
  const [topic, setTopic] = useState(initialData?.topic || "");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(initialData?.difficulty || "MEDIUM");
  const [marks, setMarks] = useState(initialData?.marks || 1);
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags ? initialData.tags.join(", ") : "");
  const [status, setStatus] = useState<QuestionStatus>(initialData?.status || "READY");
  const [errorMessage, setErrorMessage] = useState("");

  const [options, setOptions] = useState<string[]>(
    initialData
      ? initialData.questionType === "SHORT_ANSWER"
        ? []
        : initialData.questionType === "TRUE_FALSE"
        ? ["True", "False"]
        : initialData.options && initialData.options.length === 4
        ? [...initialData.options]
        : ["", "", "", ""]
      : ["", "", "", ""]
  );
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(
    initialData?.correctOptionIndex ?? (initialData?.correctAnswer?.toLowerCase() === "false" ? 1 : 0)
  );
  const [shortAnswerText, setShortAnswerText] = useState(
    initialData?.questionType === "SHORT_ANSWER" ? initialData.correctAnswer : ""
  );

  if (prevInitialData !== initialData || prevIsOpen !== isOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setActiveTab("edit");
    if (initialData) {
      setQuestionType(initialData.questionType);
      setQuestionText(initialData.questionText);
      setCategory(initialData.subject || initialData.category || "General");
      setTopic(initialData.topic || "");
      setDifficulty(initialData.difficulty || "MEDIUM");
      setMarks(initialData.marks || 1);
      setExplanation(initialData.explanation || "");
      setTagsInput(initialData.tags ? initialData.tags.join(", ") : "");
      setStatus(initialData.status || "READY");
      setErrorMessage("");

      if (initialData.questionType === "SHORT_ANSWER") {
        setShortAnswerText(initialData.correctAnswer);
        setOptions([]);
      } else if (initialData.questionType === "TRUE_FALSE") {
        setOptions(["True", "False"]);
        const idx = initialData.correctOptionIndex ?? (initialData.correctAnswer.toLowerCase() === "false" ? 1 : 0);
        setCorrectOptionIndex(idx);
      } else {
        const opts = initialData.options && initialData.options.length === 4 ? [...initialData.options] : ["", "", "", ""];
        setOptions(opts);
        setCorrectOptionIndex(initialData.correctOptionIndex ?? 0);
      }
    } else {
      setQuestionType("MCQ");
      setQuestionText("");
      setCategory("General");
      setTopic("");
      setDifficulty("MEDIUM");
      setMarks(1);
      setExplanation("");
      setTagsInput("");
      setStatus("READY");
      setOptions(["", "", "", ""]);
      setCorrectOptionIndex(0);
      setShortAnswerText("");
      setErrorMessage("");
    }
  }

  const handleQuestionTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    if (type === "TRUE_FALSE") {
      setOptions(["True", "False"]);
      setCorrectOptionIndex(0);
    } else if (type === "MCQ" || type === "FILL_IN_THE_BLANK") {
      if (options.length !== 4) {
        setOptions(["", "", "", ""]);
      }
      setCorrectOptionIndex(0);
    } else if (type === "SHORT_ANSWER") {
      setOptions([]);
    }
  };

  const handleOptionTextChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!questionText.trim()) {
      setErrorMessage("Question text is required.");
      return;
    }

    let finalOptions: string[] = [];
    let finalCorrectAnswer = "";
    let finalCorrectIndex = 0;

    if (questionType === "MCQ" || questionType === "FILL_IN_THE_BLANK") {
      if (options.some((opt) => !opt.trim())) {
        setErrorMessage("All 4 options must be filled.");
        return;
      }
      finalOptions = options.map((o) => o.trim());
      finalCorrectIndex = correctOptionIndex;
      finalCorrectAnswer = finalOptions[correctOptionIndex] || "";
    } else if (questionType === "TRUE_FALSE") {
      finalOptions = ["True", "False"];
      finalCorrectIndex = correctOptionIndex;
      finalCorrectAnswer = finalOptions[correctOptionIndex];
    } else if (questionType === "SHORT_ANSWER") {
      if (!shortAnswerText.trim()) {
        setErrorMessage("Please specify the correct answer for the short answer question.");
        return;
      }
      finalOptions = [];
      finalCorrectAnswer = shortAnswerText.trim();
    }

    const tagsArr = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: QuestionPayload = {
      questionText: questionText.trim(),
      questionType,
      options: finalOptions,
      correctAnswer: finalCorrectAnswer,
      correctOptionIndex: finalCorrectIndex,
      explanation: explanation.trim(),
      category: category.trim() || "General",
      subject: category.trim() || "General",
      topic: topic.trim(),
      difficulty,
      marks: Number(marks) || 1,
      tags: tagsArr,
      status,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "Failed to save question.");
    }
  };

  const typeSelectOptions = [
    { value: "MCQ", label: "MCQ (Multiple Choice)" },
    { value: "TRUE_FALSE", label: "True / False" },
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "FILL_IN_THE_BLANK", label: "Fill in the Blank" },
  ];

  const difficultySelectOptions = [
    { value: "EASY", label: "Easy" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HARD", label: "Hard" },
  ];

  const statusSelectOptions = [
    { value: "READY", label: "Ready (Active)" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Question (v${initialData.version || 1})` : "Create New Question"}
      description="Configure question text, options, subject, topic, and test in live preview."
      size="xl"
    >
      <div className="space-y-4">
        {/* Navigation Tabs: Edit vs Live Preview */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "edit"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Student Preview
            </button>
          </div>

          {initialData && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <History className="h-3.5 w-3.5 text-indigo-500" />
              <span>Version {initialData.version || 1}</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* LIVE PREVIEW TAB */}
        {activeTab === "preview" ? (
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="info">{questionType}</Badge>
                <Badge variant={difficulty === "EASY" ? "success" : difficulty === "MEDIUM" ? "info" : "danger"}>
                  {difficulty}
                </Badge>
                <span className="text-xs font-semibold text-slate-500">
                  {category} {topic ? `• ${topic}` : ""}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <Award className="h-3.5 w-3.5" /> {marks} {marks === 1 ? "Mark" : "Marks"}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              {questionText || "(Question text will appear here...)"}
            </h3>

            {(questionType === "MCQ" || questionType === "FILL_IN_THE_BLANK") && (
              <div className="space-y-2 pt-2">
                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium ${
                      correctOptionIndex === idx
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 font-bold"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt || `Option ${String.fromCharCode(65 + idx)}`}</span>
                    {correctOptionIndex === idx && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            )}

            {questionType === "TRUE_FALSE" && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {["True", "False"].map((tf, idx) => (
                  <div
                    key={tf}
                    className={`p-3 rounded-xl border text-center font-bold text-xs ${
                      correctOptionIndex === idx
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    {tf} {correctOptionIndex === idx && "✓ (Correct)"}
                  </div>
                ))}
              </div>
            )}

            {questionType === "SHORT_ANSWER" && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Expected Answer:</span>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {shortAnswerText || "(Enter expected answer...)"}
                </p>
              </div>
            )}

            {explanation && (
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
                <strong>Explanation:</strong> {explanation}
              </div>
            )}

            <div className="pt-2 text-right">
              <Button size="sm" onClick={() => setActiveTab("edit")}>
                Return to Editing
              </Button>
            </div>
          </div>
        ) : (
          /* EDIT FORM TAB */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Question Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type <span className="text-rose-500">*</span>
                </label>
                <Select
                  options={typeSelectOptions}
                  placeholder=""
                  value={questionType}
                  onChange={(e) => handleQuestionTypeChange(e.target.value as QuestionType)}
                />
              </div>

              {/* Subject / Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. JavaScript"
                  required
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Chapter
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Async / Await"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty <span className="text-rose-500">*</span>
                </label>
                <Select
                  options={difficultySelectOptions}
                  placeholder=""
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Question Text <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={
                  questionType === "FILL_IN_THE_BLANK"
                    ? "e.g. Bangladesh became independent in ____."
                    : "Enter the complete question prompt..."
                }
                required
              />
            </div>

            {/* DYNAMIC OPTIONS FORM PER TYPE */}
            {(questionType === "MCQ" || questionType === "FILL_IN_THE_BLANK") && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Options (Exactly 4 options, select 1 correct answer)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["A", "B", "C", "D"].map((letter, idx) => (
                    <div
                      key={letter}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                        correctOptionIndex === idx
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOption"
                        id={`opt-radio-${letter}`}
                        checked={correctOptionIndex === idx}
                        onChange={() => setCorrectOptionIndex(idx)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor={`opt-radio-${letter}`}
                        className="text-xs font-bold text-slate-500 shrink-0 w-6"
                      >
                        {letter}.
                      </label>
                      <Input
                        value={options[idx] || ""}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Option ${letter}`}
                        className="text-xs"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questionType === "TRUE_FALSE" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Correct Answer (True / False)
                </span>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all ${
                      correctOptionIndex === 0
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tfOption"
                      checked={correctOptionIndex === 0}
                      onChange={() => setCorrectOptionIndex(0)}
                      className="h-4 w-4 text-emerald-600"
                    />
                    True
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-bold text-sm transition-all ${
                      correctOptionIndex === 1
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tfOption"
                      checked={correctOptionIndex === 1}
                      onChange={() => setCorrectOptionIndex(1)}
                      className="h-4 w-4 text-emerald-600"
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            {questionType === "SHORT_ANSWER" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Expected / Correct Answer <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  rows={2}
                  value={shortAnswerText}
                  onChange={(e) => setShortAnswerText(e.target.value)}
                  placeholder="Enter the expected textual answer..."
                  required
                />
              </div>
            )}

            {/* Marks, Tags, Status, Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Marks <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. react, hooks, frontend"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <Select
                  options={statusSelectOptions}
                  placeholder=""
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Explanation / Rationale (Optional)
              </label>
              <Textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Provide context or explanation for why the answer is correct..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                  ? `Update Question (v${(initialData.version || 1) + 1})`
                  : "Create Question"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
