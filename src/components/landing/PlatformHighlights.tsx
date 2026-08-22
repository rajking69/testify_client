"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Globe2,
  CheckCircle2,
  BookOpen,
  Laptop,
  GraduationCap,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

export default function PlatformHighlights() {
  const [activeSecurityTab, setActiveSecurityTab] = useState<number>(0);

  const useCases = [
    {
      icon: <Laptop className="h-6 w-6 text-[#00A3C4]" />,
      title: "Classroom Midterms & Finals",
      desc: "Run scheduled semester evaluations in computer labs or on students' BYOD laptops with full lockdown browser options.",
    },
    {
      icon: <Globe2 className="h-6 w-6 text-[#00A3C4]" />,
      title: "Remote & Distance Testing",
      desc: "Deliver high-integrity online exams to remote candidates with AI audio & tab focus detection.",
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-[#E8922C]" />,
      title: "Weekly Quizzes & Practice Tests",
      desc: "Help students prepare for certification with low-stakes randomized quiz pools and immediate explanations.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[#00A3C4]" />,
      title: "Departmental Common Exams",
      desc: "Standardize grading across multiple classrooms with unified question banks and centralized rubrics.",
    },
  ];

  const securityModes = [
    {
      title: "High Security (Lockdown Mode)",
      desc: "Full browser lockdown preventing tab switching, copy-pasting, keyboard shortcuts, and external applications.",
      badge: "High Security",
      features: [
        "Blocks opening other tabs or windows",
        "Disables clipboard & keyboard shortcuts",
        "Requires invigilator PIN to exit early",
        "Live focus loss alerts sent to teacher",
      ],
    },
    {
      title: "Medium Security (Monitored Mode)",
      desc: "Standard browser window with background monitoring of tab switches and time spent away.",
      badge: "Balanced",
      features: [
        "Logs when a student leaves the tab",
        "Records timestamp of focus changes",
        "Allows reference documents if configured",
        "Non-intrusive for everyday quizzes",
      ],
    },
    {
      title: "Open Book Mode",
      desc: "Allows approved external resources and digital notes while still recording comprehensive answer logs.",
      badge: "Flexible",
      features: [
        "Permits access to whitelisted digital references",
        "Enables built-in scientific calculator & formulas",
        "Auto-records all submitted draft revisions",
        "Ideal for research & open-book tasks",
      ],
    },
    {
      title: "AI Proctoring & Verification",
      desc: "Continuous webcam presence, multi-face alerts, and background audio anomaly detection.",
      badge: "Intelligent",
      features: [
        "Webcam periodic presence verification",
        "Background audio spike detection",
        "Real-time integrity score calculation",
        "Automated flagged incident log for review",
      ],
    },
  ];

  const currentMode = securityModes[activeSecurityTab];

  return (
    <section id="security" className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#EFF6FB] to-[#FAF8F5] text-[#0B2238] py-16 lg:py-24 border-t border-[#E8EEF3]">
      {/* Dynamic Animated Glow & Tech Grid */}
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20 z-10">
        {/* Section 1: 4 Use Cases Header & Grid */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] bg-blue-50/90 px-3.5 py-1 rounded-full border border-blue-200 shadow-2xs">
              Flexible &amp; Adaptable
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238]">
              Adaptable for every assessment type
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              From fast 5-minute warm-up quizzes to campus-wide university finals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="p-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-xs hover:shadow-lg transition-all duration-200 space-y-3"
              >
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 w-fit shadow-2xs">
                  {uc.icon}
                </div>
                <h3 className="text-sm font-bold font-display text-[#0B2238]">
                  {uc.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {uc.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 2: Interactive Security & Proctoring Modes */}
        <div className="space-y-10 pt-8 border-t border-[#E8EEF3]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              Configurable Security
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238]">
              Choose the right security level for your test
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Teachers can set customized security rules ranging from casual practice mode to full AI-monitored lockdown.
            </p>
          </motion.div>

          {/* Interactive Security Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {securityModes.map((mode, idx) => (
              <motion.button
                key={mode.title}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSecurityTab(idx)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeSecurityTab === idx
                    ? "bg-[#0B2238] text-white shadow-md"
                    : "bg-white/90 border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {mode.title.split("(")[0]}
              </motion.button>
            ))}
          </div>

          {/* Tab Content Display Box with Framer Motion AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2"
            >
              {/* Left Mockup View */}
              <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-sm p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#00A3C4]" /> {currentMode.title}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Integrity Verified
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F7FB] border border-[#D5DFE8] text-[#0B2238] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-semibold">Lockdown Status:</span>
                    <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold text-[10px]">ACTIVE</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#D5DFE8] text-[11px] text-slate-700 font-medium">
                    Student screen locked. Exiting requires teacher unlock PIN.
                  </div>
                </div>
              </div>

              {/* Right Feature Checklist */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xl font-bold text-[#0B2238] font-display">{currentMode.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentMode.desc}
                </p>
                <ul className="space-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-700">
                  {currentMode.features.map((feat) => (
                    <motion.li whileHover={{ x: 3 }} key={feat} className="flex items-center gap-2.5 transition-transform">
                      <CheckCircle2 className="h-4 w-4 text-[#00A3C4] shrink-0" />
                      <span>{feat}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
