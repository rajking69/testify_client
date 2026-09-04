"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { examService } from "@/services/exam.service";
import { purchaseService } from "@/services/purchase.service";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  FileText,
  Users,
  Clock,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

export default function TestifyHero() {
  const [activeRoleView, setActiveRoleView] = useState<"teacher" | "student" | "admin">("teacher");
  const { data: session } = authClient.useSession();

  const [heroData, setHeroData] = useState({
    teacherTitle: "{heroData.teacherTitle}",
    teacherQCount: 48,
    teacherSubmissions: 32,
    teacherQNumber: 1,
    teacherQTopic: "Data Structures",
    teacherQMarks: "{heroData.teacherQMarks}",
    teacherQText: "{heroData.teacherQText}",
    teacherQAnswer: "Stack (LIFO)",
    studentCandidate: "Alex Morgan (ID: ST-8921)",
    studentExamTitle: "Student Exam Room",
    studentQNum: 14,
    studentTotalQ: 40,
    studentAnswered: 14,
    adminStudents: "{heroData.adminStudents}",
    adminTeachers: "{heroData.adminTeachers}",
    adminLiveExams: "{heroData.adminLiveExams}",
    adminIntegrity: "{heroData.adminIntegrity}",
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
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F5F9FC]/60 via-[#EEF5FA]/50 to-[#F8FBFE]/60 dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 pt-20 sm:pt-24 pb-16 lg:pt-28 lg:pb-24 transition-colors duration-300">
      {/* Moving Vibrant Gradient Orbs & Tech Grid */}
      <AnimatedBackground variant="hero" />

      {/* Top Asymmetrical Curved Graphic matching reference */}
      <div className="absolute top-0 right-0 w-[55%] h-24 lg:h-32 bg-gradient-to-l from-[#F9B233] to-[#F59E0B] -z-0 rounded-bl-[100px] lg:rounded-bl-[140px] opacity-90 dark:opacity-40 shadow-md" />
      <div className="absolute top-0 right-0 w-[45%] h-20 lg:h-28 bg-[#0B2238] dark:bg-slate-950/80 -z-0 rounded-bl-[90px] lg:rounded-bl-[120px] shadow-lg" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10 pt-4 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline & Action tailored to 3 Roles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* 3 Roles Quick Selector Pills with Vibrant Glowing Border */}
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-cyan-200/80 dark:border-slate-800 shadow-md shadow-cyan-500/10">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveRoleView("student")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleView === "student"
                    ? "bg-gradient-to-r from-[#00A3C4] to-[#008BB0] text-[#0B2238] shadow-sm font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" /> Student
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveRoleView("teacher")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleView === "teacher"
                    ? "bg-[#0B2238] dark:bg-blue-600 text-white shadow-sm font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" /> Teacher
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveRoleView("admin")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleView === "admin"
                    ? "bg-gradient-to-r from-[#E8922C] to-[#D97706] text-white shadow-sm font-extrabold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Admin
              </motion.button>
            </div>

            <div className="space-y-1">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0B2238] dark:text-slate-100 tracking-tight font-serif italic opacity-95"
              >
                Simple and Powerful
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.08] bg-gradient-to-r from-[#0B2238] via-[#0284C7] to-[#00A3C4] dark:from-white dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-xs"
              >
                Online Exams
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl font-sans"
            >
              An AI-powered assessment ecosystem connecting <strong className="text-[#0284C7] dark:text-cyan-400">Students</strong>, <strong className="text-[#0B2238] dark:text-blue-400">Teachers</strong>, and <strong className="text-[#D97706] dark:text-amber-400">Admins</strong> for secure, automated, and intelligent examinations.
            </motion.p>

            {/* Action Buttons with Gradient & Shadow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B2238] to-[#153E65] dark:from-blue-600 dark:to-indigo-600 hover:from-[#112F4C] hover:to-[#1B4D7D] dark:hover:from-blue-500 dark:hover:to-indigo-500 text-white font-semibold text-sm px-7 py-3 shadow-lg shadow-blue-900/20 dark:shadow-blue-500/20 transition-all"
                >
                  Create free account
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href={
                    activeRoleView === "teacher"
                      ? "/teacher/dashboard"
                      : activeRoleView === "admin"
                      ? "/admin/dashboard"
                      : "/auth/login"
                  }
                  className="inline-flex items-center justify-center rounded-full border-2 border-cyan-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-[#0B2238] dark:text-slate-100 font-bold text-sm px-6 py-3 shadow-sm hover:shadow-md transition-all"
                >
                  Open {activeRoleView.charAt(0).toUpperCase() + activeRoleView.slice(1)} Portal <ArrowRight className="ml-1.5 h-4 w-4 text-[#00A3C4]" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Platform Feature Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <motion.span whileHover={{ y: -2, scale: 1.03 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00A3C4]" /> AI Proctoring
              </motion.span>
              <motion.span whileHover={{ y: -2, scale: 1.03 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-500/30 shadow-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#E8922C]" /> Automated Grading
              </motion.span>
              <motion.span whileHover={{ y: -2, scale: 1.03 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-blue-200/80 dark:border-blue-500/30 shadow-xs text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00A3C4]" /> Real-Time Analytics
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Right Column: Layered UI Mockup Card Stack */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Vibrant Multi-Color Pulsing Glow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400/40 via-blue-500/30 to-amber-400/40 dark:from-cyan-500/20 dark:via-indigo-500/25 dark:to-purple-500/20 rounded-3xl blur-2xl opacity-80 -z-10" />

              {/* Main Interface Mockup Card with Glassmorphism */}
              <div className="rounded-2xl border-2 border-white/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300">
                {/* Mockup Window Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#F4F8FC] to-[#EDF4FA] dark:from-slate-900 dark:to-slate-950 border-b border-[#E1E8EE] dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#EF5350]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FFA726]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#66BB6A]" />
                    <span className="ml-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      testify.edu/{activeRoleView}/portal
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                    <Shield className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> AI Proctoring is Active
                  </div>
                </div>

                {/* Animated Views Container */}
                <AnimatePresence mode="wait">
                  {/* Teacher View Mockup */}
                  {activeRoleView === "teacher" && (
                    <motion.div
                      key="teacher"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-12 min-h-[300px] text-xs"
                    >
                      <div className="col-span-4 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] dark:from-slate-900 dark:to-slate-950 border-r border-[#E9EFF4] dark:border-slate-800 p-3 space-y-3">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teacher Controls</p>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0B2238] dark:bg-blue-600 text-white font-semibold shadow-xs">
                            <FileText className="h-3.5 w-3.5 text-[#00A3C4] dark:text-cyan-200" /> Question Bank ({heroData.teacherQCount} Questions)
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                            <Users className="h-3.5 w-3.5 text-blue-500" /> Live Monitor ({heroData.teacherSubmissions})
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                            <Clock className="h-3.5 w-3.5 text-amber-500" /> Exam Scheduling
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase text-slate-400">AI Evaluation</span>
                          <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            <span>Autograding</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Enabled</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-8 p-4 space-y-3 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Computer Science Midterm</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Teacher Workspace • 32 Students</p>
                          </div>
                          <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                            Active
                          </span>
                        </div>

                        <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-[#FCFDFE] to-[#F3F8FC] dark:from-slate-800/90 dark:to-slate-900/90 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Question {heroData.teacherQNumber}: {heroData.teacherQTopic}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">2.0 Marks</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                            Which data structure operates on a Last-In, First-Out (LIFO) order?
                          </p>
                          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-900 dark:text-blue-200 font-semibold flex items-center justify-between">
                            <span>Answer: {heroData.teacherQAnswer}</span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-[10px]">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{heroData.teacherSubmissions} Submissions • 0 Violations</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Integrity Score</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Student View Mockup */}
                  {activeRoleView === "student" && (
                    <motion.div
                      key="student"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="p-5 space-y-3.5 text-xs bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Student Exam Room</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Candidate: {heroData.studentCandidate}</p>
                        </div>
                        <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-bold px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800 text-[11px]">
                          ⏱ 28:45 Remaining
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-[#FFFDF9] to-[#FFF8F0] dark:from-slate-800/90 dark:to-slate-900/90 space-y-2">
                        <span className="font-bold text-slate-900 dark:text-white text-[11px]">Question {heroData.studentQNum} of {heroData.studentTotalQ}</span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                          Explain the primary difference between synchronous and asynchronous execution in JavaScript.
                        </p>
                        <div className="p-2 rounded-md bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px]">
                          Type response here... (Automatically saved every 5 seconds)
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                        <span>Questions Answered: <strong className="text-slate-900 dark:text-white">{heroData.studentAnswered} / {heroData.studentTotalQ}</strong></span>
                        <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00A3C4] to-[#008BB0] dark:from-cyan-500 dark:to-blue-600 text-[#0B2238] dark:text-white font-bold shadow-xs">
                          Next Question →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Admin View Mockup */}
                  {activeRoleView === "admin" && (
                    <motion.div
                      key="admin"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="p-5 space-y-3.5 text-xs bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Institutional Admin Oversight</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Campus-Wide Assessment Overview</p>
                        </div>
                        <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 text-[10px]">
                          System Healthy
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Students</p>
                          <p className="text-sm font-extrabold text-[#0B2238] dark:text-white">4,250</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-slate-800/80 border border-purple-200/80 dark:border-slate-700">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Active Teachers</p>
                          <p className="text-sm font-extrabold text-[#0B2238] dark:text-white">180</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Live Exams</p>
                          <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">12 Live</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F0F7FB] dark:bg-slate-800/80 border border-[#D5DFE8] dark:border-slate-700 text-[#0B2238] dark:text-slate-200 flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Sparkles className="h-3.5 w-3.5 text-[#00A3C4]" /> AI Integrity Score across all rooms:
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">99.4%</span>
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