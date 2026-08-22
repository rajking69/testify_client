"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FilePlus2,
  Send,
  MonitorPlay,
  CheckCircle,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <FilePlus2 className="h-6 w-6 text-[#00A3C4]" />,
      title: "Teacher Creates Exam",
      desc: "Assemble questions from your Question Bank or generate new ones using AI prompts and LaTeX equations.",
      badge: "Step 1",
    },
    {
      number: "02",
      icon: <Send className="h-6 w-6 text-[#00A3C4]" />,
      title: "Distribute Test Code",
      desc: "Share a 6-digit exam code with your students or auto-schedule it via your connected Google Classroom or LMS.",
      badge: "Step 2",
    },
    {
      number: "03",
      icon: <MonitorPlay className="h-6 w-6 text-[#E8922C]" />,
      title: "Students Attend Test",
      desc: "Students enter the locked test room on their laptops with auto-saving answers and continuous proctoring checks.",
      badge: "Step 3",
    },
    {
      number: "04",
      icon: <CheckCircle className="h-6 w-6 text-[#00A3C4]" />,
      title: "Auto-Grade & Analytics",
      desc: "Instant score generation, AI rubric assistance, and class performance analytics available immediately on submission.",
      badge: "Step 4",
    },
  ];

  return (
    <section id="how-it-works" className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F1F7FB] to-[#FAF8F5] text-[#0B2238] py-16 lg:py-24 border-t border-[#E8EEF3]">
      {/* Moving Animated Glow & Tech Grid */}
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] bg-blue-50/90 px-3.5 py-1 rounded-full border border-blue-200 shadow-2xs">
            Simple 4-Step Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238]">
            How Testify works from start to finish
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A frictionless journey designed for maximum speed, security, and student ease.
          </p>
        </motion.div>

        {/* 4 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-xs hover:shadow-lg transition-all duration-200 space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs">
                    {s.icon}
                  </div>
                  <span className="text-xs font-extrabold font-mono text-[#00A3C4] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full">
                    {s.number}
                  </span>
                </div>
                <h3 className="text-base font-bold font-display text-[#0B2238]">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>{s.badge}</span>
                <span className="text-[#00A3C4]">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
