"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Lock,
  Sparkles,
  BarChart2,
  Users,
  Settings,
  ArrowRight,
  PlayCircle,
  Building2,
  GraduationCap,
  Award,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

export default function Features() {
  const featureBoxes = [
    {
      icon: <FileText className="h-6 w-6 text-[#00A3C4]" />,
      title: "Comprehensive Question Bank",
      desc: "Rich math formulas (LaTeX), audio listening questions, programming syntax highlighting, and multiple question formats for Teachers.",
      badge: "Teachers",
      color: "border-blue-200/80 bg-gradient-to-b from-white to-blue-50/40",
    },
    {
      icon: <Lock className="h-6 w-6 text-[#00A3C4]" />,
      title: "Distraction-Free Exam Room",
      desc: "Single-window lockdown mode, prevent copy-paste, and full-screen enforcement to ensure genuine test integrity for Students.",
      badge: "Students",
      color: "border-cyan-200/80 bg-gradient-to-b from-white to-cyan-50/40",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-[#E8922C]" />,
      title: "AI Rubric Auto-Grading",
      desc: "Automated scoring for objective questions and AI-assisted grading suggestions for descriptive answers with teacher override.",
      badge: "AI Powered",
      color: "border-amber-200/80 bg-gradient-to-b from-white to-amber-50/40",
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-[#00A3C4]" />,
      title: "Instant Results & Analytics",
      desc: "Real-time scorecards, class distribution curves, question difficulty index, and exportable gradebooks for faculty.",
      badge: "Analytics",
      color: "border-sky-200/80 bg-gradient-to-b from-white to-sky-50/40",
    },
    {
      icon: <Users className="h-6 w-6 text-[#00A3C4]" />,
      title: "Live Student Monitoring",
      desc: "Live invigilation matrix displaying real-time focus detection, student progress, timer alerts, and instant direct teacher chat.",
      badge: "Proctoring",
      color: "border-indigo-200/80 bg-gradient-to-b from-white to-indigo-50/40",
    },
    {
      icon: <Settings className="h-6 w-6 text-[#E8922C]" />,
      title: "Campus-Wide Admin Oversight",
      desc: "Role security, multi-department faculty control, scheduled examination windows, and institutional audit trails for Admins.",
      badge: "Admins",
      color: "border-purple-200/80 bg-gradient-to-b from-white to-purple-50/40",
    },
  ];

  return (
    <section id="features" className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F0F6FA] to-[#FAF8F5] text-[#0B2238] py-16 lg:py-24 border-t border-[#E8EEF3]">
      {/* Dynamic Animated Glow & Tech Grid */}
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 z-10">
        {/* Section 1 Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] bg-blue-50/90 px-3.5 py-1 rounded-full border border-blue-200 shadow-2xs">
            Purpose-Built Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238]">
            Complete assessment architecture for every role
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            Everything educators and institutions need to create, deliver, and evaluate modern examinations securely.
          </p>
        </motion.div>

        {/* 6 Blueprint Feature Cards with Framer Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureBoxes.map((box, idx) => (
            <motion.div
              key={box.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`p-6 sm:p-7 rounded-2xl border shadow-xs hover:shadow-lg transition-all duration-200 relative flex flex-col justify-between ${box.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    {box.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white/90 border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {box.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold font-display text-[#0B2238] pt-1">
                  {box.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  {box.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center Pill Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="#why-testify"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-[#0B2238] font-semibold text-xs px-6 py-2.5 shadow-sm transition-all"
            >
              Explore all features <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/teacher/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#0B2238] hover:bg-[#153450] text-white font-semibold text-xs px-6 py-2.5 shadow-sm transition-all"
            >
              <PlayCircle className="mr-1.5 h-3.5 w-3.5 text-[#00A3C4]" /> See Teacher Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Section 2: Platform Pillars matching reference layout */}
        <div className="pt-12 border-t border-[#E8EEF3]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto space-y-2 mb-10"
          >
            <h3 className="text-2xl font-bold font-display text-[#0B2238]">
              Built with precision for modern online education
            </h3>
            <p className="text-xs text-slate-500">
              Delivering high availability, strict exam integrity, and seamless role-based workflows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
            {/* Pillar 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#D5DFE8] shadow-xs hover:shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-center justify-center text-[#00A3C4]">
                <Building2 className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[#0B2238] font-display">
                Zero Infrastructure Setup
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Run exams seamlessly inside any standard modern web browser without complex desktop installs.
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#D5DFE8] shadow-xs hover:shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-center justify-center text-[#E8922C]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[#0B2238] font-display">
                Real-Time Synchronization
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous auto-save and offline caching guarantees that zero student answers are ever lost.
              </p>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#D5DFE8] shadow-xs hover:shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-center justify-center text-[#0B2238]">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[#0B2238] font-display">
                Intelligent Evaluation
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant score calculation for objective questions alongside AI rubric assistance for essays.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
