"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { QuestionItem } from "@/services/question.service";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  question: QuestionItem | null;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  question,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!question) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Question?"
      description="This action cannot be undone."
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
          <p className="text-xs leading-relaxed font-medium">
            Are you sure you want to permanently delete this question from your Question Bank?
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
            &quot;{question.questionText}&quot;
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Category: {question.category} | Type: {question.questionType}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Question"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
