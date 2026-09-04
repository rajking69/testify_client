"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ExamHeaderSummaryProps {
  exam: {
    id: string;
    title: string;
    subject: string;
    description?: string;
    date: string;
    duration: number;
    totalMarks: number;
    passMark: number;
    status: "Published" | "Scheduled" | "Draft" | "Ready";
    joinCode?: string;
    accessToken?: string;
  };
  totalQuestions: number;
  currentMarks: number;
  onOpenPublishModal: () => void;
  onOpenShareModal?: () => void;
}

export function ExamHeaderSummary({
  exam,
  totalQuestions,
  currentMarks,
  onOpenPublishModal,
  onOpenShareModal,
}: ExamHeaderSummaryProps) {
  const isMarksMatching = currentMarks === exam.totalMarks;
  const isMarksOver = currentMarks > exam.totalMarks;
  const marksDifference = Math.abs(exam.totalMarks - currentMarks);

  const statusVariant = {
    Published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    Scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    Draft: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    Ready: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  }[exam.status] || "bg-slate-100 text-slate-800";

  return (
    <div className="space-y-4">
      {/* Back Link & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/teacher/exams"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0092E3] dark:text-slate-400 dark:hover:text-cyan-300 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Examinations</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusVariant}`}>
            {exam.status}
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 shadow-sm border border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Exam Title & Subject Info */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-300 text-xs font-bold border border-blue-200/80 dark:border-cyan-800">
                <BookOpen className="h-3.5 w-3.5" />
                Subject: {exam.subject}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {exam.duration} Minutes
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {exam.date}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white">
              {exam.title}
            </h1>

            {exam.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                {exam.description}
              </p>
            )}
          </div>

          {/* Real-time Marks & Question Count Cards */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Total Questions Count Card */}
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 min-w-[120px] text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Questions
              </span>
              <span className="text-2xl font-black font-display text-[#152234] dark:text-white mt-0.5">
                {totalQuestions}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Items added
              </span>
            </div>

            {/* Total Marks Progress Card */}
            <div className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border min-w-[140px] text-center ${
              isMarksMatching
                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Question Marks
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black font-display">
                  {currentMarks}
                </span>
                <span className="text-sm font-bold opacity-60">
                  / {exam.totalMarks}
                </span>
              </div>
              <span className="text-[10px] font-semibold mt-0.5">
                Pass Mark: {exam.passMark}
              </span>
            </div>

            {/* Share & Room Code Button */}
            {onOpenShareModal && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenShareModal}
                className="bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm cursor-pointer h-full"
                leftIcon={<Sparkles className="h-4 w-4 text-[#0092E3]" />}
              >
                Share & Code
              </Button>
            )}

            {/* Review & Publish Action Button */}
            <Button
              onClick={onOpenPublishModal}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-[#0092E3]/20 transition-all cursor-pointer h-full"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Review & Publish
            </Button>
          </div>
        </div>

        {/* Warning Banner if Marks Do Not Match Target */}
        {!isMarksMatching && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/80 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div className="flex-1">
              {isMarksOver ? (
                <span>
                  <strong>Mark Overflow:</strong> Added question marks ({currentMarks}) exceed the configured exam total ({exam.totalMarks}) by {marksDifference} marks.
                </span>
              ) : (
                <span>
                  <strong>Target Incomplete:</strong> Current questions total {currentMarks} marks. You need {marksDifference} more marks to reach the target of {exam.totalMarks} marks.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
