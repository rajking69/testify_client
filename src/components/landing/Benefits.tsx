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
    <section id="why-testify" className="relative w-full bg-gradient-to-b from-[#FAF8F5] via-[#F4F9FD] to-[#FAF8F5] text-[#0B2238] py-16 lg:py-24 overflow-hidden border-t border-[#E8EEF3]">
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
            className="lg:col-span-6 rounded-3xl border border-[#D5DFE8] bg-white/95 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#00A3C4]" /> Teacher Question &amp; Test Studio
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                Exam Ready
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FB] border border-[#D5DFE8] text-xs text-slate-700 space-y-2.5">
              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-slate-600">Question Pool Type:</span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold text-[#0B2238]">Math + Code + MCQ</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-slate-600">AI Proctoring Policy:</span>
                <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold text-[10px]">Strict Lockdown</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-slate-600">Auto-Grading Rubric:</span>
                <span className="text-[#00A3C4] font-bold">Active (100% Automated)</span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
              For Teachers &amp; Examiners
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238]">
              Create, conduct, and auto-grade exams in minutes
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Testify gives teachers powerful tools to craft multifaceted assessments. Mix objective questions with mathematical formulas, audio prompts, and coding challenges while saving hours with intelligent automated evaluation.
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Rich question authoring with LaTeX equations and code syntax</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>AI rubric evaluation suggestions for written answers</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8922C] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
              For Students &amp; Examinees
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238]">
              Distraction-free exam room with real-time feedback and accommodations
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Students take exams on a clean, responsive interface on laptops, tablets, or Chromebooks. Answers are auto-saved in real time, preventing data loss on accidental disconnects.
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Offline recovery and automatic continuous answer caching</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Built-in accessibility: text-to-speech, font sizing, and extra time</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Instant automated test feedback upon completion</span>
              </motion.li>
            </ul>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="order-1 lg:order-2 lg:col-span-6 rounded-3xl border border-[#D5DFE8] bg-white/95 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#E8922C]" /> Student Examination View
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                Auto-Saving Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FFE8D1] text-[#0B2238] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Timer Countdown</span>
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-bold font-mono text-[11px]">42:15 Remaining</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#FFE8D1] text-[11px] text-slate-700 font-medium">
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
            className="lg:col-span-6 rounded-3xl border border-[#D5DFE8] bg-white/95 backdrop-blur-sm p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-purple-600" /> Institutional Admin Dashboard
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                Security Enforced
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs text-slate-700 space-y-2.5">
              <div className="flex justify-between font-semibold text-[11px]">
                <span className="text-slate-600">Registered Faculty Members:</span>
                <span className="text-slate-900 font-bold">180 Teachers</span>
              </div>
              <div className="flex justify-between font-semibold text-[11px]">
                <span className="text-slate-600">Active Student Accounts:</span>
                <span className="text-slate-900 font-bold">4,250 Enrolled</span>
              </div>
              <div className="flex justify-between font-semibold text-[11px]">
                <span className="text-slate-600">Security Audit Log:</span>
                <span className="text-emerald-700 font-bold">100% Clean (0 Incidents)</span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 shadow-2xs">
              For School &amp; University Admins
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238]">
              Campus-wide user oversight, role security, and analytics
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Maintain institutional control with granular role-based permissions, automated student rosters, scheduled examination windows, and compliance-ready audit logs.
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Centralized management of Teacher, Student, and Examiner accounts</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Institutional performance analytics and department benchmarks</span>
              </motion.li>
              <motion.li whileHover={{ x: 3 }} className="flex items-center gap-2.5 transition-transform">
                <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                <span>Role-based access control and system activity audit logging</span>
              </motion.li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
