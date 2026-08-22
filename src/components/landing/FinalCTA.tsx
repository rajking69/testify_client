"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";

export default function FinalCTA() {
  const lmsList = [
    "Google Classroom",
    "Canvas LMS",
    "Moodle",
    "Microsoft Teams",
    "Blackboard",
    "Schoology",
  ];

  const pricingPlans = [
    {
      name: "Starter / Free",
      price: "$0",
      period: "forever",
      description: "Essential assessment tools for individual teachers and students.",
      badge: "Free Tier",
      popular: false,
      features: [
        "Up to 5 active exams",
        "Multiple-choice & basic question types",
        "Instant objective auto-grading",
        "Student real-time timer & auto-save",
        "Standard web browser security",
      ],
      buttonText: "Start for Free",
      buttonHref: "/auth/register",
      buttonVariant: "outline",
    },
    {
      name: "Pro Educator",
      price: "$15",
      period: "per teacher / month",
      description: "Advanced proctoring, AI rubrics, and rich question formatting for power educators.",
      badge: "Most Popular",
      popular: true,
      features: [
        "Unlimited exams & question banks",
        "LaTeX math, code & audio questions",
        "Full-screen lockdown browser",
        "AI rubric-assisted essay evaluation",
        "Live student monitoring & focus alerts",
        "Detailed class analytics & CSV export",
      ],
      buttonText: "Get Started Free",
      buttonHref: "/auth/register",
      buttonVariant: "primary",
    },
    {
      name: "Institution / Campus",
      price: "Custom",
      period: "per institution / year",
      description: "Full campus-wide oversight, multi-admin management, and LMS integrations.",
      badge: "For Schools & Universities",
      popular: false,
      features: [
        "Unlimited teachers, students & admins",
        "Campus-wide Single Sign-On (SSO)",
        "LMS gradebook sync (Canvas, Moodle)",
        "AI proctoring & webcam verification",
        "Institutional audit logs & reports",
        "Priority 24/7 support & onboarding",
      ],
      buttonText: "Contact Sales",
      buttonHref: "/auth/register",
      buttonVariant: "outline",
    },
  ];

  return (
    <section id="pricing" className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#EFF6FB] to-[#FAF8F5] text-[#0B2238] py-16 lg:py-24 border-t border-[#E8EEF3]">
      {/* Moving Animated Glow & Tech Grid */}
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 z-10">
        {/* Section 1: LMS Integrations Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#D5DFE8] bg-white/90 backdrop-blur-md p-6 sm:p-8 shadow-xs space-y-4 text-center"
        >
          <div className="max-w-xl mx-auto space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-display text-[#0B2238]">
              Easily integrate with your existing educational workflows
            </h3>
            <p className="text-xs text-slate-500">
              One-click roster import, single sign-on (SSO), and automated gradebook sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {lmsList.map((lms) => (
              <motion.span
                whileHover={{ scale: 1.05 }}
                key={lms}
                className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#D5DFE8] text-xs font-semibold text-slate-700 shadow-2xs cursor-default"
              >
                {lms}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Section 2: Pricing Plans */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto space-y-2"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] bg-blue-50/90 px-3.5 py-1 rounded-full border border-blue-200 shadow-2xs">
              Simple &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-[#0B2238]">
              Flexible pricing for every classroom
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Choose the plan that fits your teaching needs. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.015, transition: { duration: 0.2 } }}
                className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-200 ${
                  plan.popular
                    ? "border-[#00A3C4] bg-white/95 backdrop-blur-md shadow-2xl ring-2 ring-[#00A3C4]/30 relative"
                    : "border-[#D5DFE8] bg-white/90 backdrop-blur-md shadow-xs hover:shadow-lg"
                }`}
              >
                <div className="space-y-4">
                  {/* Plan Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        plan.popular
                          ? "bg-[#00A3C4] text-[#0B2238]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {plan.popular && <Sparkles className="h-4 w-4 text-[#00A3C4]" />}
                  </div>

                  {/* Plan Name & Price */}
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#0B2238]">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#0B2238] font-display">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">/ {plan.period}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                    <p className="font-bold text-slate-800">What&apos;s included:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5 text-slate-700">
                          <Check className="h-4 w-4 text-[#00A3C4] shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Button */}
                <div className="pt-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href={plan.buttonHref}
                      className={`w-full inline-flex items-center justify-center rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                        plan.popular
                          ? "bg-[#0B2238] hover:bg-[#153450] text-white shadow-md"
                          : "border border-slate-300 bg-white hover:bg-slate-50 text-[#0B2238]"
                      }`}
                    >
                      <span>{plan.buttonText}</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Final Clean CTA Banner with Motion */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#0B2238] bg-[#0B2238] p-8 sm:p-14 text-white text-center shadow-2xl space-y-5"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              Ready to transform your assessment workflow?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              Empowering Students with fair tests, Teachers with rapid auto-grading, and Admins with total campus oversight.
            </p>

            {/* Clean Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#00A3C4] hover:bg-[#38bdf8] text-[#0B2238] font-bold text-xs px-8 py-3 shadow-lg transition-all"
                >
                  Create Free Account <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/teacher/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-600 bg-[#13304A] hover:bg-[#1E4366] text-white font-semibold text-xs px-7 py-3 transition-all"
                >
                  Explore Teacher Demo
                </Link>
              </motion.div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Free setup in under 2 minutes • No credit card required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
