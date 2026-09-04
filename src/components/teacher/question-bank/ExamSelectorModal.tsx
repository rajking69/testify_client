"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { QuestionItem } from "@/services/question.service";
import {
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalMarks: number;
  passMark: number;
  status: string;
  questions?: QuestionItem[];
}

interface ExamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  allQuestions?: QuestionItem[];
  onExamQuestionsSelected?: (questions: QuestionItem[]) => void;
}

export function ExamSelectorModal({
  isOpen,
  onClose,
  selectedIds,
  allQuestions = [],
  onExamQuestionsSelected,
}: ExamSelectorModalProps) {
  const router = useRouter();
  const [examsList, setExamsList] = useState<ExamRecord[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<{
    examId: string;
    examTitle: string;
    addedCount: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActionSuccess(null);
      setErrorMessage("");
      try {
        const stored = localStorage.getItem("testify_teacher_exams");
        if (stored) {
          const list: ExamRecord[] = JSON.parse(stored);
          setExamsList(list);
          if (list.length > 0) {
            setSelectedExamId(String(list[0].id));
          }
        } else {
          setExamsList([]);
        }
      } catch {
        setExamsList([]);
      }
    }
  }, [isOpen]);

  const handleAddToExam = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (selectedIds.length === 0) {
      setErrorMessage("Please select at least 1 question using the checkboxes in the Question Bank.");
      return;
    }

    if (!selectedExamId) {
      setErrorMessage("Please select an exam from the dropdown or create a new one.");
      return;
    }

    try {
      const stored = localStorage.getItem("testify_teacher_exams");
      let list: ExamRecord[] = stored ? JSON.parse(stored) : [];

      const targetExam = list.find((item) => String(item.id) === String(selectedExamId));
      if (!targetExam) {
        setErrorMessage("Selected exam could not be found.");
        return;
      }

      // Find question objects corresponding to selectedIds
      const selectedQuestions = allQuestions.filter((q) =>
        selectedIds.includes(q._id)
      );

      const existingQuestions = targetExam.questions || [];
      // Filter out duplicates
      const newItems = selectedQuestions.filter(
        (sq) => !existingQuestions.some((eq) => eq._id === sq._id)
      );

      const updatedQuestions = [...existingQuestions, ...newItems];
      const updatedExam = {
        ...targetExam,
        questions: updatedQuestions,
      };

      const updatedList = list.map((item) =>
        String(item.id) === String(selectedExamId) ? updatedExam : item
      );

      localStorage.setItem("testify_teacher_exams", JSON.stringify(updatedList));

      setActionSuccess({
        examId: String(targetExam.id),
        examTitle: targetExam.title,
        addedCount: newItems.length,
      });

      if (onExamQuestionsSelected) {
        onExamQuestionsSelected(selectedQuestions);
      }
    } catch (err) {
      console.error("Error adding questions to exam:", err);
      setErrorMessage("Failed to add questions to exam.");
    }
  };

  const examOptions = examsList.map((exam) => ({
    value: String(exam.id),
    label: `${exam.title} (${exam.subject}) • ${exam.questions?.length || 0} Questions`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Selected Questions to Exam"
      description={`Select the examination you want to attach these ${selectedIds.length} questions to.`}
      size="md"
    >
      {actionSuccess ? (
        <div className="space-y-4 pt-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Questions Attached Successfully!
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Added <strong>{actionSuccess.addedCount}</strong> questions to <strong>{actionSuccess.examTitle}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>

            <Link href={`/teacher/exams/${actionSuccess.examId}/setup`}>
              <Button
                size="sm"
                className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Open Exam Question Setup
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddToExam} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected Questions Badge */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-cyan-950/40 border border-blue-200/70 dark:border-cyan-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0092E3] dark:text-cyan-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Selected Questions:
              </span>
            </div>
            <span className="font-extrabold text-[#0092E3] dark:text-cyan-300">
              {selectedIds.length} Items Selected
            </span>
          </div>

          {/* Exam Selector Dropdown */}
          {examsList.length > 0 ? (
            <div className="space-y-1.5">
              <Select
                label="Target Examination"
                value={selectedExamId}
                placeholder="Choose target exam..."
                options={examOptions}
                onChange={(e) => setSelectedExamId(e.target.value)}
                required
              />
              <p className="text-[11px] text-slate-400">
                The questions will be linked directly to this exam without creating duplicate database records.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-2">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                No exams created yet.
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Go to the Examinations page to create your first exam paper draft.
              </p>
              <Link href="/teacher/exams">
                <Button
                  size="sm"
                  type="button"
                  className="bg-[#0092E3] text-white font-bold text-xs"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Create Examination
                </Button>
              </Link>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={examsList.length === 0 || selectedIds.length === 0}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold"
              leftIcon={<Layers className="h-4 w-4" />}
            >
              Add {selectedIds.length} Questions to Exam
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
