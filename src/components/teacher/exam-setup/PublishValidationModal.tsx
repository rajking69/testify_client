"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { QuestionItem } from "@/services/question.service";
import { subscriptionService, UserSubscriptionStatus } from "@/services/subscription.service";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Sparkles,
  ShieldCheck,
  Crown,
  Lock,
} from "lucide-react";

interface PublishValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: {
    id: string;
    title: string;
    subject: string;
    duration: number;
    totalMarks: number;
    passMark: number;
    status: "Published" | "Scheduled" | "Draft" | "Ready";
  };
  questions: QuestionItem[];
  onUpdateStatus: (newStatus: "Published" | "Scheduled" | "Draft" | "Ready") => void;
}

export function PublishValidationModal({
  isOpen,
  onClose,
  exam,
  questions,
  onUpdateStatus,
}: PublishValidationModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<"Published" | "Scheduled" | "Draft" | "Ready">(
    exam.status === "Draft" ? "Published" : exam.status
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<UserSubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingSubscription(true);
      subscriptionService
        .getMyStatus()
        .then((res) => {
          if (res && res.data) {
            setSubscriptionStatus(res.data);
          }
        })
        .catch(() => {
          // In offline or local mode, default to true or non-blocking
          setSubscriptionStatus({ hasActiveSubscription: true, role: "teacher" });
        })
        .finally(() => {
          setIsLoadingSubscription(false);
        });
    }
  }, [isOpen]);

  const isLiveAction = selectedStatus === "Published" || selectedStatus === "Scheduled";
  const hasPremium = subscriptionStatus?.hasActiveSubscription ?? true;

  // Calculate Checklists
  const currentMarksSum = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  const hasQuestions = questions.length > 0;
  const isMarksMatching = currentMarksSum === exam.totalMarks;
  const isPassMarkValid = exam.passMark > 0 && exam.passMark <= exam.totalMarks;
  const hasValidAnswers = questions.every(
    (q) => q.correctAnswer && q.correctAnswer.trim().length > 0
  );

  const checklist = [
    {
      title: "Title & Subject Configured",
      details: `${exam.title} (${exam.subject})`,
      passed: Boolean(exam.title && exam.subject),
      critical: true,
    },
    {
      title: "Duration & Pass Mark Validity",
      details: `${exam.duration} mins • Pass: ${exam.passMark} / ${exam.totalMarks}`,
      passed: exam.duration > 0 && isPassMarkValid,
      critical: true,
    },
    {
      title: "Question Paper Items",
      details: `${questions.length} questions configured`,
      passed: hasQuestions,
      critical: true,
    },
    {
      title: "Total Marks Match",
      details: `Question marks sum: ${currentMarksSum} / ${exam.totalMarks} target marks`,
      passed: isMarksMatching,
      critical: false,
    },
    {
      title: "Answer Keys Verified",
      details: "All questions have designated correct answers",
      passed: hasValidAnswers,
      critical: true,
    },
  ];

  const canPublish =
    hasQuestions &&
    Boolean(exam.title && exam.subject) &&
    exam.duration > 0 &&
    isPassMarkValid &&
    hasValidAnswers;

  const handleConfirmPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      onUpdateStatus(selectedStatus);
      setIsPublishing(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exam Review & Publishing Console"
      description="Review pre-flight validation checklist before setting exam availability."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Validation Checklist */}
        <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Pre-Flight Quality Checklist
          </h4>

          <div className="space-y-2.5">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2">
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : item.critical ? (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span
                      className={`font-bold ${
                        item.passed
                          ? "text-slate-900 dark:text-white"
                          : item.critical
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.title}
                    </span>
                    <p className="text-[11px] text-slate-500">{item.details}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                    item.passed
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : item.critical
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  {item.passed ? "Passed" : item.critical ? "Required" : "Warning"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Selector */}
        <div className="space-y-1.5 pt-1">
          <Select
            label="Target Publication Status"
            value={selectedStatus}
            placeholder="Select publication status"
            options={[
              { value: "Published", label: "Published (Live for enrolled students)" },
              { value: "Scheduled", label: "Scheduled (Locks room until date/time)" },
              { value: "Ready", label: "Ready (Prepared, pending launch)" },
              { value: "Draft", label: "Draft (Work in progress)" },
            ]}
            onChange={(e) =>
              setSelectedStatus(e.target.value as "Published" | "Scheduled" | "Draft" | "Ready")
            }
          />
        </div>

        {/* Premium Lock Banner for Live Publishing */}
        {isLiveAction && !hasPremium && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Crown className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Live examinations are available with Premium.
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upgrade your instructor membership to unlock live proctored examination rooms and scheduled publishing.
                </p>
              </div>
            </div>

            <Link href="/admin/subscriptions">
              <Button
                type="button"
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shrink-0"
                leftIcon={<Crown className="h-3.5 w-3.5" />}
              >
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        )}

        {!canPublish && (
          <p className="text-[11px] text-rose-500 font-semibold">
            Cannot publish exam: Please resolve critical checklist requirements first (add at least 1 question with valid answers).
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!canPublish || (isLiveAction && !hasPremium) || isPublishing}
            onClick={handleConfirmPublish}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold px-6"
            leftIcon={<Send className="h-4 w-4" />}
          >
            {isPublishing ? "Updating..." : "Save & Update Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
