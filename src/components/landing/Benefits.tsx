"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  GraduationCap,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

export default function Benefits() {
  return (
    <section id="why-testify" className="relative w-full bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 py-16 lg:py-24 overflow-hidden border-t border-[#E8EEF3] dark:border-slate-800 transition-colors duration-300">
      {/* Moving Animated Glow & Tech Grid */}
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 z-10">
        {/* Role 1: For Teachers (Mockup Left, Text Right) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-6 rounded-3xl border border-[#D5DFE8] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400" /> Teacher Question &amp; Test Studio
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Active Assessment
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F8FC] dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Midterm Exam - Computer Architecture</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">45 Questions • 60 Mins • Auto-Proctored</p>
                </div>
                <span className="text-xs font-extrabold text-[#00A3C4] dark:text-cyan-400">94 Submitted</span>
              </div>

              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Auto-Grading Rubric:</span>
                <span className="text-[#00A3C4] dark:text-cyan-400 font-bold">Active (100% Automated)</span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs">
              For Teachers &amp; Examiners
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238] dark:text-white">
              Create, conduct, and auto-grade exams in minutes
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Testify gives teachers powerful tools to craft multifaceted assessments. Mix objective questions with mathematical formulas, audio prompts, and coding challenges while saving hours with intelligent automated evaluation.
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Rich question authoring with LaTeX equations and code syntax</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>AI rubric evaluation suggestions for written answers</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>One-click gradebook export to CSV, PDF, or your LMS</span>
              </motion.li>
            </ul>
          </div>
        </motion.div>

        {/* Role 2: For Students (Text Left, Mockup Right) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
        >
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8922C] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 shadow-2xs">
              For Students &amp; Examinees
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238] dark:text-white">
              Distraction-free exam room with real-time feedback and accommodations
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Students take exams on a clean, responsive interface on laptops, tablets, or Chromebooks. Answers are auto-saved in real time, preventing data loss on accidental disconnects.
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Offline recovery and automatic continuous answer caching</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Built-in accessibility: text-to-speech, font sizing, and extra time</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Instant automated test feedback upon completion</span>
              </motion.li>
            </ul>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="order-1 lg:order-2 lg:col-span-6 rounded-3xl border border-[#D5DFE8] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#E8922C] dark:text-amber-400" /> Student Examination View
              </span>
              <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Auto-Saving Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-amber-950/20 border border-[#FFE8D1] dark:border-amber-900/30 text-[#0B2238] dark:text-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Timer Countdown</span>
                <span className="text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md font-bold font-mono text-[11px] border border-amber-200 dark:border-amber-800">42:15 Remaining</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-[#FFE8D1] dark:border-amber-900/40 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                ✓ Answer to Question 8 saved (100% Synced to Server)
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Role 3: For Admins (Mockup Left, Text Right) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-6 rounded-3xl border border-[#D5DFE8] dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Institutional Admin Dashboard
              </span>
              <span className="text-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Security Enforced
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF5FF] dark:bg-purple-950/20 border border-[#E9D5FF] dark:border-purple-900/30 text-xs text-slate-700 dark:text-slate-300 space-y-2.5">
              <div className="flex justify-between font-semibold text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Registered Faculty Members:</span>
                <span className="text-slate-900 dark:text-white font-bold">180 Teachers</span>
              </div>
              <div className="flex justify-between font-semibold text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Active Student Accounts:</span>
                <span className="text-slate-900 dark:text-white font-bold">4,250 Enrolled</span>
              </div>
              <div className="flex justify-between font-semibold text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Security Audit Log:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Clean (0 Incidents)</span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 shadow-2xs">
              For School &amp; University Admins
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238] dark:text-white">
              Campus-wide user oversight, role security, and analytics
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Maintain institutional control with granular role-based permissions, automated student rosters, scheduled examination windows, and compliance-ready audit logs.
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Centralized management of Teacher, Student, and Examiner accounts</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Institutional performance analytics and department benchmarks</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                <span>Role-based access control and system activity audit logging</span>
              </motion.li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
