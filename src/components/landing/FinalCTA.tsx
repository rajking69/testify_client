"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { TeacherSubscriptionModal } from "@/components/teacher/TeacherSubscriptionModal";
import { apiClient } from "@/lib/apiClient";

interface SubscriptionPlan {
  _id: string;
  name: string;
  targetRole: "teacher" | "student";
  interval: "monthly" | "yearly";
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
}

export default function FinalCTA() {
  const router = useRouter();
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<SubscriptionPlan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [teacherMonthlyPlan, setTeacherMonthlyPlan] = useState<SubscriptionPlan>({
    _id: "teacher-monthly-fallback",
    name: "Teacher Monthly Pro",
    targetRole: "teacher",
    interval: "monthly",
    price: 19.99,
    durationDays: 30,
    features: [
      "Create & Host Unlimited Exams",
      "Access to Question Bank Studio",
      "Detailed Student Analytics & Scorecards",
      "Instant Result Publishing & Evaluation",
    ],
    isActive: true,
  });

  const [teacherYearlyPlan, setTeacherYearlyPlan] = useState<SubscriptionPlan>({
    _id: "teacher-yearly-fallback",
    name: "Teacher Yearly Elite",
    targetRole: "teacher",
    interval: "yearly",
    price: 199.99,
    durationDays: 365,
    features: [
      "All Monthly Pro Features Included",
      "Priority Teacher Dedicated Support",
      "Custom Exam Branding & Certifications",
      "Bulk Student Invite & Gradebook Export",
    ],
    isActive: true,
  });

  const [loading, setLoading] = useState(true);

  // Fetch live Teacher subscription plans directly from MongoDB
  const fetchLiveTeacherPlans = async () => {
    try {
      const res: any = await apiClient.get("/subscriptions/plans");
      if (res.success && Array.isArray(res.data)) {
        const monthly = res.data.find(
          (p: SubscriptionPlan) =>
            p.targetRole === "teacher" && p.interval === "monthly" && p.isActive !== false
        );
        if (monthly) setTeacherMonthlyPlan(monthly);

        const yearly = res.data.find(
          (p: SubscriptionPlan) =>
            p.targetRole === "teacher" && p.interval === "yearly" && p.isActive !== false
        );
        if (yearly) setTeacherYearlyPlan(yearly);
      }
    } catch (err) {
      console.error("Error loading teacher plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTeacherPlans();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const platformCapabilities = [
    "CSV / JSON Bulk Import",
    "Live Webcam Proctoring",
    "1-Strike Tab Lockdown",
    "Stripe Paid Exam Checkout",
    "Real-time Telemetry Engine",
    "Instant Automated Scorecard",
  ];

  const handleOpenTeacherModal = (plan: SubscriptionPlan) => {
    setSelectedPlanForModal(plan);
    setIsSubscriptionOpen(true);
  };

  const pricingPlans = [
    {
      id: "student-free",
      name: "Student & Free Exam Access",
      price: "$0",
      period: "forever free",
      description: "Attend free exams using access codes and practice self-assessment tests. Pay per-exam for paid exams.",
      badge: "Free Access",
      popular: false,
      features: [
        "Attend free teacher-hosted exams via access code",
        "Take self-assessment practice tests with instant feedback",
        "Direct per-exam checkout for monetized paid exams",
        "Auto-saving answer engine preventing connectivity loss",
        "View detailed pass/fail scorecards upon submission",
        "Full mobile, tablet, and desktop browser support",
      ],
      buttonText: "Start as Student",
      action: () => router.push("/public-exams"),
    },
    {
      id: teacherMonthlyPlan._id,
      name: teacherMonthlyPlan.name,
      price: `$${teacherMonthlyPlan.price}`,
      period: "per month",
      description: "Full exam creation studio, paid exam marketplace monetization, and live proctoring on monthly billing.",
      badge: "Teacher Monthly",
      popular: false,
      features: teacherMonthlyPlan.features?.length > 0
        ? teacherMonthlyPlan.features
        : [
            "Create & Host Unlimited Exams",
            "Access to Question Bank Studio",
            "Detailed Student Analytics & Scorecards",
            "Instant Result Publishing & Evaluation",
          ],
      buttonText: `Get Teacher Monthly ($${teacherMonthlyPlan.price})`,
      action: () => handleOpenTeacherModal(teacherMonthlyPlan),
    },
    {
      id: teacherYearlyPlan._id,
      name: teacherYearlyPlan.name,
      price: `$${teacherYearlyPlan.price}`,
      period: "per year (1-Year Access)",
      description: "Complete yearly access, priority teacher support, custom branding, and bulk student export.",
      badge: "Most Popular",
      popular: true,
      features: teacherYearlyPlan.features?.length > 0
        ? teacherYearlyPlan.features
        : [
            "All Monthly Pro Features Included",
            "Priority Teacher Dedicated Support",
            "Custom Exam Branding & Certifications",
            "Bulk Student Invite & Gradebook Export",
          ],
      buttonText: `Get Teacher Yearly ($${teacherYearlyPlan.price})`,
      action: () => handleOpenTeacherModal(teacherYearlyPlan),
    },
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden bg-[#F8FAFC] dark:bg-[#060B14]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Section 1: Capabilities Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="max-w-xl mx-auto space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-display text-[#0B2238] dark:text-white">
              Built for seamless online exam creation &amp; proctoring
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Core functional capabilities powering Testify&apos;s assessment ecosystem
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {platformCapabilities.map((cap) => (
              <motion.span
                whileHover={{ scale: 1.05 }}
                key={cap}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#F0F7FB] dark:bg-slate-800 text-[#00A3C4] dark:text-cyan-400 border border-[#D5DFE8] dark:border-slate-700 shadow-2xs cursor-default"
              >
                {cap}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Section 2: Pricing Cards Grid (Exact 3 Cards UI: Student Free + Teacher Monthly + Teacher Yearly Live DB Plans) */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A3C4] dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
              Choose the right plan for your role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 border ${
                  plan.popular
                    ? "bg-white dark:bg-slate-900 border-[#00A3C4] shadow-xl ring-2 ring-[#00A3C4]/20"
                    : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00A3C4] text-white text-[11px] font-extrabold px-3.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
                        {plan.name}
                      </h3>
                      {!plan.popular && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold font-display text-[#0B2238] dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 pt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-[#00A3C4] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={plan.action}
                    className={`w-full py-3 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      plan.popular
                        ? "bg-[#00A3C4] hover:bg-[#008ea9] text-white"
                        : "bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900"
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Final Clean CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2238] via-[#102D4A] to-[#0B2238] dark:from-[#060D1A] dark:via-[#0D1E36] dark:to-[#060D1A] border border-[#1E4366]/60 dark:border-slate-800 p-8 sm:p-14 text-white text-center shadow-xl space-y-5"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00A3C4]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#E8922C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              Ready to transform your assessment workflow?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              Empowering Students with fair proctored tests, Teachers with rapid auto-grading, and instant exam setup.
            </p>

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
                  href="/public-exams"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs px-7 py-3 backdrop-blur-sm transition-all"
                >
                  Browse Available Exams
                </Link>
              </motion.div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Free setup in under 2 minutes &bull; Instant access
            </p>
          </div>
        </motion.div>
      </div>

      {/* Teacher Subscription Modal */}
      <TeacherSubscriptionModal
        isOpen={isSubscriptionOpen}
        selectedPlan={selectedPlanForModal}
        onClose={() => setIsSubscriptionOpen(false)}
        onSuccess={() => {
          showToast("Teacher Premium Membership activated!");
          router.push("/teacher/exams");
        }}
        initialMessage="Unlock full examination hosting, live proctoring, and question bank privileges on Testify."
      />
    </section>
  );
}
