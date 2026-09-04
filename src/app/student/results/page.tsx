"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  CreditCard,
  FileCheck2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";
import { purchaseService, ExamAttemptRecord, ExamPurchaseRecord } from "@/services/purchase.service";

export default function StudentResultsPage() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"results" | "purchases">("results");
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);
  const [purchases, setPurchases] = useState<ExamPurchaseRecord[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttemptRecord | null>(null);

  useEffect(() => {
    // 1. Load Real Attempts
    const userAttempts = purchaseService.getStudentAttempts();
    setAttempts(userAttempts);

    // 2. Load Real Purchases
    const userPurchases = purchaseService.getPurchasedExams();
    setPurchases(userPurchases);
  }, [session]);

  const totalExamsTaken = attempts.length;
  const passedExams = attempts.filter((a) => a.passed).length;
  const averageScore = totalExamsTaken > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) / totalExamsTaken)
    : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
            Academic Performance
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#152234] dark:text-white font-display">
            My Results & Exam Access
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View your verified examination scorecards, feedback, and unlocked assessment papers.
          </p>
        </div>

        <Link href="/student/exams">
          <Button
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Explore More Exams
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Exams Completed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0092E3] flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-[#152234] dark:text-white mt-2">
            {totalExamsTaken}
          </p>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 mt-2">
            {totalExamsTaken > 0 ? Math.round((passedExams / totalExamsTaken) * 100) : 0}%
          </p>
        </Card>

        <Card className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Average Mastery</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#0092E3] flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-display text-[#0092E3] dark:text-cyan-400 mt-2">
            {averageScore}%
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 w-fit">
        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "results"
              ? "bg-white dark:bg-slate-800 text-[#152234] dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Exam Scorecards ({attempts.length})
        </button>

        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "purchases"
              ? "bg-white dark:bg-slate-800 text-[#152234] dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Purchased Access ({purchases.length})
        </button>
      </div>

      {/* Tab 1: Scorecards */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {attempts.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-400">
              No examination attempts found yet. Take an exam to view results.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {attempts.map((att) => {
                const percentage = Math.round((att.score / att.totalMarks) * 100);
                return (
                  <Card
                    key={att.id}
                    hoverEffect
                    className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0092E3]">
                          {att.subject}
                        </span>
                        <h3 className="text-base font-bold font-display text-[#152234] dark:text-white mt-0.5">
                          {att.examTitle}
                        </h3>
                      </div>

                      <Badge variant={att.passed ? "success" : "danger"}>
                        {att.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 text-center text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Score</span>
                        <p className="font-extrabold text-[#152234] dark:text-white">
                          {att.score} / {att.totalMarks}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Percentage</span>
                        <p className="font-extrabold text-[#0092E3]">
                          {percentage}%
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Pass Mark</span>
                        <p className="font-extrabold text-emerald-600">
                          {att.passMark}
                        </p>
                      </div>
                    </div>

                    {att.teacherFeedback && (
                      <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-cyan-950/30 border border-blue-200/60 dark:border-cyan-800 text-[11px] text-slate-700 dark:text-slate-300">
                        <strong className="text-[#0092E3]">Instructor Note:</strong> {att.teacherFeedback}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Submitted: {att.submissionTime}</span>
                      <Link href={`/practice/result?score=${att.score}&total=${att.totalMarks}&subject=${encodeURIComponent(att.subject)}`}>
                        <Button size="sm" variant="outline" className="text-xs font-bold h-7">
                          Review Paper
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Purchases */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-400">
              You haven&apos;t purchased any paid examinations yet.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {purchases.map((pur) => (
                <Card
                  key={pur.id}
                  hoverEffect
                  className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Paid Exam Entry
                      </span>
                      <h3 className="text-base font-bold font-display text-[#152234] dark:text-white mt-0.5">
                        {pur.examTitle}
                      </h3>
                    </div>

                    <span className="text-sm font-black text-emerald-600">
                      ${pur.amount}.00
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span>Transaction ID:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{pur.transactionId}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gateway:</span>
                      <span>{pur.paymentProvider}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Purchased:</span>
                      <span>{pur.purchasedAt}</span>
                    </div>
                  </div>

                  <Link href={`/exam/${pur.examId}`} className="block w-full">
                    <Button
                      className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs py-2 rounded-xl"
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Launch Examination
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
