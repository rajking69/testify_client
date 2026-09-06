"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import {
  QuestionItem,
  QuestionPayload,
  QuestionType,
  QuestionDifficulty,
} from "@/services/question.service";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  Lock,
} from "lucide-react";

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  examSubject: string;
  onSaveQuestion: (question: QuestionItem) => void;
  editingQuestion?: QuestionItem | null;
}

export function CreateQuestionModal({
  isOpen,
  onClose,
  examSubject,
  onSaveQuestion,
  editingQuestion,
}: CreateQuestionModalProps) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("MCQ");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("MEDIUM");
  const [marks, setMarks] = useState<number>(1);
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.questionText);
      setQuestionType(editingQuestion.questionType);
      setTopic(editingQuestion.topic || "");
      setDifficulty(editingQuestion.difficulty);
      setMarks(editingQuestion.marks || 1);
      setOptions(
        editingQuestion.options && editingQuestion.options.length > 0
          ? editingQuestion.options
          : ["", "", "", ""]
      );
      setCorrectAnswer(editingQuestion.correctAnswer || "");
      setExplanation(editingQuestion.explanation || "");
      setTagsInput(editingQuestion.tags ? editingQuestion.tags.join(", ") : "");
    } else {
      setQuestionText("");
      setQuestionType("MCQ");
      setTopic("");
      setDifficulty("MEDIUM");
      setMarks(1);
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setExplanation("");
      setTagsInput("");
    }
    setErrors({});
  }, [editingQuestion, isOpen]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
      if (correctAnswer === options[index]) {
        setCorrectAnswer("");
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!questionText.trim()) {
      newErrors.questionText = "Question text is required";
    }

    if (questionType === "MCQ") {
      const validOptions = options.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        newErrors.options = "At least 2 options are required for MCQ";
      }
      if (!correctAnswer.trim()) {
        newErrors.correctAnswer = "Please select or type the correct option";
      } else if (!validOptions.includes(correctAnswer)) {
        newErrors.correctAnswer = "Correct answer must match one of the options";
      }
    } else if (questionType === "TRUE_FALSE") {
      if (!correctAnswer.trim()) {
        newErrors.correctAnswer = "Please select True or False";
      }
    } else {
      if (!correctAnswer.trim()) {
        newErrors.correctAnswer = "Correct answer is required";
      }
    }

    if (!marks || Number(marks) <= 0) {
      newErrors.marks = "Marks must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const finalOptions =
        questionType === "MCQ"
          ? options.filter((o) => o.trim().length > 0)
          : questionType === "TRUE_FALSE"
          ? ["True", "False"]
          : [];

      const newQuestion: QuestionItem = {
        _id: editingQuestion?._id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        questionText: questionText.trim(),
        questionType,
        options: finalOptions,
        correctAnswer: correctAnswer.trim(),
        explanation: explanation.trim(),
        category: "Academic",
        subject: examSubject,
        topic: topic.trim() || "General",
        difficulty,
        marks: Number(marks),
        tags,
        status: "READY",
        createdBy: "Teacher",
        createdAt: editingQuestion?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveQuestion(newQuestion);
      onClose();
    } catch (err) {
      console.error("Failed to save question:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingQuestion ? "Edit Exam Question" : "Create New Exam Question"}
      description={`Configuring question for ${examSubject}. The subject is automatically inherited.`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Subject Lock Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/80 dark:bg-cyan-950/40 border border-blue-200/80 dark:border-cyan-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#0092E3] dark:text-cyan-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Exam Subject:
            </span>
            <span className="text-xs font-extrabold text-[#0092E3] dark:text-cyan-300">
              {examSubject}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
            <Lock className="h-3 w-3" /> Auto-Inherited
          </span>
        </div>

        {/* Row 1: Question Type & Difficulty & Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Select
              label="Question Type"
              value={questionType}
              placeholder="Select question type"
              options={[
                { value: "MCQ", label: "Multiple Choice (MCQ)" },
                { value: "TRUE_FALSE", label: "True / False" },
                { value: "SHORT_ANSWER", label: "Short Answer" },
              ]}
              onChange={(e) => {
                const newType = e.target.value as QuestionType;
                setQuestionType(newType);
                if (newType === "TRUE_FALSE") {
                  setCorrectAnswer("True");
                }
              }}
            />
          </div>

          <div>
            <Select
              label="Difficulty"
              value={difficulty}
              placeholder="Select difficulty"
              options={[
                { value: "EASY", label: "Easy" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HARD", label: "Hard" },
              ]}
              onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Marks <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              placeholder="1"
            />
            {errors.marks && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {errors.marks}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Topic / Chapter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Topic / Chapter <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Data Structures, Thermodynamics, Grammar"
          />
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Question Text <span className="text-rose-500">*</span>
          </label>
          <Textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter the full question prompt..."
          />
          {errors.questionText && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              {errors.questionText}
            </p>
          )}
        </div>

        {/* Dynamic Options for MCQ */}
        {questionType === "MCQ" && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Answer Options & Correct Answer <span className="text-rose-500">*</span>
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-[11px] font-bold text-[#0092E3] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Option
                </button>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx); // A, B, C, D
                const isCorrect = correctAnswer === opt && opt.trim().length > 0;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => opt.trim() && setCorrectAnswer(opt)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                        isCorrect
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                          : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#0092E3]"
                      }`}
                      title={isCorrect ? "Correct Answer" : "Click to mark as correct"}
                    >
                      {label}
                    </button>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        handleOptionChange(idx, e.target.value);
                        if (correctAnswer === opt) {
                          setCorrectAnswer(e.target.value);
                        }
                      }}
                      placeholder={`Option ${label}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.options && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {errors.options}
              </p>
            )}
            {errors.correctAnswer && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {errors.correctAnswer}
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Click the letter icon (A, B, C, D) to designate the correct answer.
            </p>
          </div>
        )}

        {/* Dynamic Options for TRUE / FALSE */}
        {questionType === "TRUE_FALSE" && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Correct Answer <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-3">
              {["True", "False"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCorrectAnswer(val)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                    correctAnswer === val
                      ? "bg-[#0092E3] text-white border-[#0092E3] shadow-md"
                      : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#0092E3]"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Short Answer Correct Text */}
        {questionType === "SHORT_ANSWER" && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expected Answer / Key Phrase <span className="text-rose-500">*</span>
            </label>
            <Input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="e.g. Photosynthesis"
            />
            {errors.correctAnswer && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {errors.correctAnswer}
              </p>
            )}
          </div>
        )}

        {/* Explanation / Rationale */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Explanation / Solution Rationale <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Help students understand why this is the correct answer..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tags <span className="text-slate-400 font-normal">(Comma-separated)</span>
          </label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. final, unit-1, mid-term"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold px-5"
          >
            {isSubmitting
              ? "Saving..."
              : editingQuestion
              ? "Update Question"
              : "Add Question to Exam"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
