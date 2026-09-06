"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Send,
} from "lucide-react";
import { AnimatedBackground } from "./AnimatedBackground";
import { TeacherSubscriptionModal } from "@/components/teacher/TeacherSubscriptionModal";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

export default function FinalCTA() {
  const router = useRouter();
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Contact Sales Form State
  const [institutionName, setInstitutionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [campusSize, setCampusSize] = useState("1,000 - 5,000 students");
  const [message, setMessage] = useState("");
  const [isSubmittingSales, setIsSubmittingSales] = useState(false);
  const [salesSubmitted, setSalesSubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() || !contactEmail.trim()) return;

    setIsSubmittingSales(true);
    setTimeout(() => {
      setIsSubmittingSales(false);
      setSalesSubmitted(true);
      setTimeout(() => {
        setSalesSubmitted(false);
        setIsSalesModalOpen(false);
        showToast("Inquiry submitted! Our institutional team will contact you within 24 hours.");
        setInstitutionName("");
        setContactName("");
        setContactEmail("");
        setMessage("");
      }, 1500);
    }, 800);
  };

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
      id: "starter",
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
      action: () => router.push("/auth/register"),
    },
    {
      id: "pro",
      name: "Teacher Premium",
      price: "$20",
      period: "per year (1-Year Access)",
      description: "Unlimited exams, paid exam monetization, live proctoring, and question bank.",
      badge: "Most Popular",
      popular: true,
      features: [
        "Unlimited exams & central question bank",
        "Create Free classroom & Paid marketplace exams",
        "Bulk question import (Excel, CSV & JSON)",
        "Live proctoring & webcam telemetry",
        "Real-time focus alerts & anti-cheat engine",
        "Full student evaluation & gradebook export",
      ],
      buttonText: "Get Teacher Premium",
      action: () => setIsSubscriptionOpen(true),
    },
    {
      id: "institution",
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
      action: () => setIsSalesModalOpen(true),
    },
  ];

  return (
    <section id="pricing" className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#EFF6FB] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 py-16 lg:py-24 border-t border-[#E8EEF3] dark:border-slate-800 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Moving Animated Glow & Tech Grid */}
      <AnimatedBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 z-10">
        {/* Section 1: LMS Integrations Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#D5DFE8] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 shadow-xs space-y-4 text-center"
        >
          <div className="max-w-xl mx-auto space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-display text-[#0B2238] dark:text-white">
              Easily integrate with your existing educational workflows
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Native synchronization with the world&apos;s leading Learning Management Systems
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {lmsList.map((lms) => (
              <motion.span
                whileHover={{ scale: 1.05 }}
                key={lms}
                className="px-3.5 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#D5DFE8] dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs cursor-default"
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] dark:text-cyan-400 bg-blue-50/90 dark:bg-slate-900/90 px-3.5 py-1 rounded-full border border-blue-200 dark:border-slate-800 shadow-2xs">
              Simple &amp; Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
              Flexible pricing for every classroom
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
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
                    ? "border-[#00A3C4] dark:border-cyan-400 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl ring-2 ring-[#00A3C4]/30 dark:ring-cyan-400/20 relative"
                    : "border-[#D5DFE8] dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md shadow-xs hover:shadow-lg"
                }`}
              >
                <div className="space-y-4">
                  {/* Plan Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        plan.popular
                          ? "bg-[#00A3C4] text-[#0B2238] font-extrabold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {plan.popular && <Sparkles className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400" />}
                  </div>

                  {/* Plan Name & Price */}
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#0B2238] dark:text-white font-display">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-medium">/ {plan.period}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">What&apos;s included:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                          <Check className="h-4 w-4 text-[#00A3C4] dark:text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan Action Button */}
                <div className="pt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={plan.action}
                    className={`w-full inline-flex items-center justify-center rounded-xl py-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                      plan.popular
                        ? "bg-[#0B2238] dark:bg-blue-600 hover:bg-[#153450] dark:hover:bg-blue-500 text-white shadow-md"
                        : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0B2238] dark:text-white"
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </motion.button>
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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2238] via-[#102D4A] to-[#0B2238] dark:from-[#060D1A] dark:via-[#0D1E36] dark:to-[#060D1A] border border-[#1E4366]/60 dark:border-slate-800 p-8 sm:p-14 text-white text-center shadow-xl space-y-5"
        >
          {/* Subtle Accent Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00A3C4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#E8922C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs px-7 py-3 backdrop-blur-sm transition-all"
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

      {/* Teacher Subscription Modal ($20/year) */}
      <TeacherSubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onSuccess={() => {
          showToast("⭐ Teacher Premium Membership activated!");
          router.push("/teacher/exams");
        }}
        initialMessage="Unlock full examination hosting, live proctoring, and question bank privileges on Testify."
      />

      {/* Contact Sales / Campus Demo Inquiry Modal */}
      {isSalesModalOpen && (
        <Modal
          isOpen={isSalesModalOpen}
          onClose={() => setIsSalesModalOpen(false)}
          title="Institutional & Campus Inquiries"
          description="Transform your university, school, or coaching academy assessment ecosystem."
          size="md"
        >
          {salesSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Inquiry Received!
              </h3>
              <p className="text-xs text-slate-500">
                Our educational partnerships team will reach out with customized campus pricing and onboarding assistance.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSalesSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institution / School Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Stanford University / BRAC Academy"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="dean@university.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Student Count
                </label>
                <Select
                  options={[
                    { value: "Under 1,000 students", label: "Under 1,000 students" },
                    { value: "1,000 - 5,000 students", label: "1,000 - 5,000 students" },
                    { value: "5,000 - 20,000 students", label: "5,000 - 20,000 students" },
                    { value: "20,000+ Campus-wide", label: "20,000+ Campus-wide" },
                  ]}
                  value={campusSize}
                  onChange={(e) => setCampusSize(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Requirements & Notes
                </label>
                <Textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your LMS, proctoring requirements, or deployment schedule..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSalesModalOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmittingSales}
                  className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-5"
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  {isSubmittingSales ? "Submitting..." : "Submit Campus Inquiry"}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
}
