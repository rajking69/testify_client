"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Clock,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Layers,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { authClient } from "@/lib/auth-client";
import { examService } from "@/services/exam.service";
import { purchaseService } from "@/services/purchase.service";

export default function TestifyHero() {
  const [activeRoleView, setActiveRoleView] = useState<"teacher" | "student" | "admin">("teacher");
  const { data: session } = authClient.useSession();

  const [heroData, setHeroData] = useState({
    teacherTitle: "Computer Science Midterm",
    teacherQCount: 48,
    teacherSubmissions: 32,
    teacherQNumber: 1,
    teacherQTopic: "Data Structures",
    teacherQMarks: "2.0 Marks",
    teacherQText: "Which data structure operates on a Last-In, First-Out (LIFO) order?",
    teacherQAnswer: "Stack (LIFO)",
    studentCandidate: "Alex Morgan (ID: ST-8921)",
    studentExamTitle: "Student Exam Room",
    studentQNum: 14,
    studentTotalQ: 40,
    studentAnswered: 14,
    adminStudents: "4,250",
    adminTeachers: "180",
    adminLiveExams: "12 Live",
    adminIntegrity: "99.4%",
  });

  useEffect(() => {
    const syncReal = async () => {
      try {
        const storedTeacher = localStorage.getItem("testify_teacher_exams");
        let tList = storedTeacher ? JSON.parse(storedTeacher) : [];
        try {
          const apiRes = await examService.getAllExams();
          if (apiRes?.data?.length > 0) {
            apiRes.data.forEach((ae: any) => {
              if (!tList.some((t: any) => String(t.id) === String(ae._id))) {
                tList.push({ id: ae._id, title: ae.title, questions: ae.questions || [] });
              }
            });
          }
        } catch {}

        const activeExam = tList[0];
        const subs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const studentName = session?.user?.name || "Alex Morgan";
        const studentEmail = session?.user?.email || "student@testify.edu";

        const q0 = activeExam?.questions?.[0];

        setHeroData({
          teacherTitle: activeExam?.title || "Computer Science Midterm",
          teacherQCount: Math.max(activeExam?.questions?.length || 48, 1),
          teacherSubmissions: subs.length > 0 ? subs.length : 32,
          teacherQNumber: 1,
          teacherQTopic: q0?.topic || "Data Structures",
          teacherQMarks: q0?.marks ? `${q0.marks}.0 Marks` : "2.0 Marks",
          teacherQText: q0?.questionText || q0?.question || "Which data structure operates on a Last-In, First-Out (LIFO) order?",
          teacherQAnswer: q0?.correctAnswer !== undefined ? String(q0.correctAnswer) : "Stack (LIFO)",
          studentCandidate: `${studentName} (${studentEmail})`,
          studentExamTitle: activeExam?.title || "Student Exam Room",
          studentQNum: 1,
          studentTotalQ: Math.max(activeExam?.questions?.length || 40, 10),
          studentAnswered: subs.length > 0 ? subs.length : 14,
          adminStudents: subs.length > 0 ? String(subs.length + 4200) : "4,250",
          adminTeachers: tList.length > 0 ? String(tList.length + 175) : "180",
          adminLiveExams: `${Math.max(tList.length, 12)} Live`,
          adminIntegrity: "99.4%",
        });
      } catch {}
    };

    syncReal();
    window.addEventListener("testify_exam_submitted", syncReal);
    window.addEventListener("testify_teacher_exams_updated", syncReal);
    window.addEventListener("storage", syncReal);
    window.addEventListener("focus", syncReal);
    return () => {
      window.removeEventListener("testify_exam_submitted", syncReal);
      window.removeEventListener("testify_teacher_exams_updated", syncReal);
      window.removeEventListener("storage", syncReal);
      window.removeEventListener("focus", syncReal);
    };
  }, [session?.user?.name, session?.user?.email]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F5F9FC]/60 via-[#EEF5FA]/50 to-[#F8FBFE]/60 dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 pt-8 sm:pt-10 pb-8 sm:pb-10 transition-colors duration-300">
      {/* Moving Vibrant Gradient Orbs & Tech Grid */}
      <AnimatedBackground variant="hero" />

      {/* Top Asymmetrical Curved Graphic */}
      <div className="absolute top-0 right-0 w-[50%] h-16 sm:h-20 lg:h-24 bg-gradient-to-l from-[#F9B233] to-[#F59E0B] -z-0 rounded-bl-[80px] lg:rounded-bl-[100px] opacity-90 dark:opacity-40 shadow-sm pointer-events-none" />
      <div className="absolute top-0 right-0 w-[40%] h-14 sm:h-16 lg:h-20 bg-[#0B2238] dark:bg-slate-950/80 -z-0 rounded-bl-[70px] lg:rounded-bl-[90px] shadow-md pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Compact Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-3 sm:space-y-4 text-left"
          >
            {/* 3 Roles Quick Selector Pills */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-cyan-200/80 dark:border-slate-800 shadow-sm shadow-cyan-500/10">
              <button
                type="button"
                onClick={() => setActiveRoleView("student")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleView === "student"
                    ? "bg-gradient-to-r from-[#00A3C4] to-[#008BB0] text-[#0B2238] shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" /> Student
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleView("teacher")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleView === "teacher"
                    ? "bg-[#0B2238] dark:bg-blue-600 text-white shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Teacher
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleView("admin")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleView === "admin"
                    ? "bg-gradient-to-r from-[#E8922C] to-[#D97706] text-white shadow-xs font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Admin
              </button>
            </div>

            <div className="space-y-0.5">
              <span className="block text-base sm:text-lg lg:text-xl font-semibold text-[#0B2238] dark:text-slate-100 tracking-tight font-serif italic opacity-95">
                Simple and Powerful
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight leading-[1.1] bg-gradient-to-r from-[#0B2238] via-[#0284C7] to-[#00A3C4] dark:from-white dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
                Online Exams
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-sans">
              An AI-powered assessment ecosystem connecting <strong className="text-[#0284C7] dark:text-cyan-400">Students</strong>, <strong className="text-[#0B2238] dark:text-blue-400">Teachers</strong>, and <strong className="text-[#D97706] dark:text-amber-400">Admins</strong> for secure, automated examinations.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B2238] to-[#153E65] dark:from-blue-600 dark:to-indigo-600 hover:from-[#112F4C] hover:to-[#1B4D7D] dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 shadow-md shadow-blue-900/15 transition-all whitespace-nowrap cursor-pointer"
              >
                Create free account
              </Link>
              <Link
                href={
                  activeRoleView === "teacher"
                    ? "/teacher/dashboard"
                    : activeRoleView === "admin"
                    ? "/admin/dashboard"
                    : "/student/dashboard"
                }
                className="inline-flex items-center justify-center rounded-full border border-cyan-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0B2238] dark:text-slate-100 font-bold text-xs px-4 py-2.5 shadow-2xs hover:shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                Open {activeRoleView.charAt(0).toUpperCase() + activeRoleView.slice(1)} Portal <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#00A3C4]" />
              </Link>
            </div>

            {/* Platform Feature Highlights */}
            <div className="pt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-cyan-200/80 dark:border-cyan-500/30 shadow-2xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3 w-3 text-[#00A3C4]" /> AI Proctoring
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-500/30 shadow-2xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3 w-3 text-[#E8922C]" /> Automated Grading
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-blue-200/80 dark:border-blue-500/30 shadow-2xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3 w-3 text-[#00A3C4]" /> Real-Time Analytics
              </span>
            </div>
          </motion.div>

          {/* Right Column: Compact Layered UI Mockup Card Stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            {/* Dynamic Ambient Glow Behind Card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-blue-500/15 to-indigo-500/20 rounded-[28px] blur-lg opacity-70 pointer-events-none" />

            <div className="relative w-full max-w-lg rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-cyan-100 dark:border-slate-800 shadow-xl overflow-hidden">
              {/* Mockup Window Top Navigation Bar */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="ml-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    testify.edu/{activeRoleView}/portal
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Active
                </span>
              </div>

              {/* Dynamic Compact View Content */}
              <div className="relative overflow-hidden min-h-[235px] sm:min-h-[250px]">
                <AnimatePresence mode="wait">
                  {/* Teacher View Mockup */}
                  {activeRoleView === "teacher" && (
                    <motion.div
                      key="teacher"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-3 sm:p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs bg-white dark:bg-slate-900"
                    >
                      {/* Left Side Sub-Menu */}
                      <div className="sm:col-span-5 space-y-1 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-2 sm:pb-0 sm:pr-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Teacher Controls
                        </span>
                        <div className="p-1.5 rounded-lg bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 font-bold flex items-center gap-1.5 shadow-2xs text-[10px]">
                          <Layers className="h-3 w-3 text-[#00A3C4]" />
                          <span>Question Bank ({heroData.teacherQCount})</span>
                        </div>
                        <div className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 text-[10px]">
                          <Users className="h-3 w-3 text-blue-500" />
                          <span>Submissions ({heroData.teacherSubmissions})</span>
                        </div>
                        <div className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 text-[10px]">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span>Scheduling</span>
                        </div>
                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-500 flex items-center justify-between">
                          <span>Auto Evaluation</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                        </div>
                      </div>

                      {/* Right Side Main Preview */}
                      <div className="sm:col-span-7 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-[11px] truncate max-w-[150px]">
                            {heroData.teacherTitle}
                          </h4>
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        </div>

                        <div className="p-2 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-[#FCFDFE] to-[#F3F8FC] dark:from-slate-800/90 dark:to-slate-900/90 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px] truncate max-w-[120px]">
                              Q{heroData.teacherQNumber}: {heroData.teacherQTopic}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {heroData.teacherQMarks}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[10px] line-clamp-2 leading-snug">
                            {heroData.teacherQText}
                          </p>
                          <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[9px] text-blue-900 dark:text-blue-200 font-semibold flex items-center justify-between">
                            <span className="truncate">Answer: {heroData.teacherQAnswer}</span>
                            <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-[9px]">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {heroData.teacherSubmissions} Submissions
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Integrity</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Student View Mockup */}
                  {activeRoleView === "student" && (
                    <motion.div
                      key="student"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-3 sm:p-3.5 space-y-2 text-xs bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                        <div className="truncate max-w-[190px]">
                          <h4 className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                            {heroData.studentExamTitle}
                          </h4>
                          <p className="text-[9px] text-slate-500 truncate">
                            Candidate: {heroData.studentCandidate}
                          </p>
                        </div>
                        <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-[9px] shrink-0">
                          ⏱ 28:45 Rem.
                        </span>
                      </div>

                      <div className="p-2 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-[#FFFDF9] to-[#FFF8F0] dark:from-slate-800/90 dark:to-slate-900/90 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-[10px]">
                            Question {heroData.studentQNum} of {heroData.studentTotalQ}
                          </span>
                          <span className="text-[9px] text-emerald-600 font-bold">Autosaved</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[10px] line-clamp-2 leading-snug">
                          {heroData.teacherQText}
                        </p>
                        <div className="p-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-400 text-[9px] truncate">
                          Option selected: {heroData.teacherQAnswer}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 pt-0.5">
                        <span>
                          Solved: <strong className="text-slate-900 dark:text-white">{heroData.studentAnswered}/{heroData.studentTotalQ}</strong>
                        </span>
                        <Link href="/practice">
                          <button className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#00A3C4] to-[#008BB0] text-[#0B2238] dark:text-white font-bold text-[9px] shadow-2xs hover:opacity-90 transition-opacity cursor-pointer">
                            Launch Practice →
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {/* Admin View Mockup */}
                  {activeRoleView === "admin" && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-3 sm:p-3.5 space-y-2 text-xs bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-[11px]">Admin Oversight</h4>
                          <p className="text-[9px] text-slate-500">Real-Time Assessment System</p>
                        </div>
                        <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-[9px]">
                          Healthy
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="p-1.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700">
                          <p className="text-[9px] text-slate-500 font-medium">Exams</p>
                          <p className="text-xs sm:text-sm font-extrabold text-[#0B2238] dark:text-white">{heroData.adminLiveExams}</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-purple-50/70 dark:bg-slate-800/80 border border-purple-200/80 dark:border-slate-700">
                          <p className="text-[9px] text-slate-500 font-medium">Teachers</p>
                          <p className="text-xs sm:text-sm font-extrabold text-[#0B2238] dark:text-white">{heroData.adminTeachers}</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700">
                          <p className="text-[9px] text-slate-500 font-medium">Students</p>
                          <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{heroData.adminStudents}</p>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-xl bg-[#F0F7FB] dark:bg-slate-800/80 border border-[#D5DFE8] dark:border-slate-700 text-[#0B2238] dark:text-slate-200 flex items-center justify-between text-[9px]">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <Sparkles className="h-3 w-3 text-[#00A3C4]" /> AI Integrity Score:
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded text-[9px]">
                          {heroData.adminIntegrity}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
