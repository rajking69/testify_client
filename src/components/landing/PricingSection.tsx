"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";

interface Plan {
  _id: string;
  name: string;
  targetRole: string;
  interval: string;
  price: number;
  features: string[];
  isActive: boolean;
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"teacher" | "student">("teacher");
  const [intervalFilter, setIntervalFilter] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    apiClient
      .get("/subscriptions/plans")
      .then((res: any) => {
        if (res.success && res.data) {
          setPlans(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayPlans = plans.filter(
    (p) => p.targetRole === activeTab && p.interval === intervalFilter
  );

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-slate-900/30">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white">
            Choose the Perfect Plan for Your Goals
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Empower your institution with AI proctoring, automated evaluations, and unlimited assessment creation
          </p>

          {/* Controls: Role & Interval Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Role Tab */}
            <div className="p-1 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setActiveTab("teacher")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "teacher"
                    ? "bg-[#5B67F7] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                For Instructors
              </button>
              <button
                onClick={() => setActiveTab("student")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "student"
                    ? "bg-[#5B67F7] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                For Candidates / Students
              </button>
            </div>

            {/* Interval Toggle */}
            <div className="p-1 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setIntervalFilter("monthly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  intervalFilter === "monthly"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIntervalFilter("yearly")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  intervalFilter === "yearly"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Yearly <span className="text-[10px] text-emerald-400 font-bold ml-1">(Save 20%)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
            {displayPlans.length === 0 ? (
              <div className="col-span-full text-center text-slate-400 py-12">
                No active plans currently configured for this tier.
              </div>
            ) : (
              displayPlans.map((plan, idx) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative p-8 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 shadow-2xl flex flex-col justify-between group transition-all"
                >
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        {plan.targetRole} Tier
                      </span>
                      <h3 className="text-xl font-bold font-display text-white mt-1">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-4xl font-extrabold font-display text-white">
                          ${plan.price}
                        </span>
                        <span className="text-slate-400 text-sm">/{plan.interval}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      {plan.features?.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-3 text-xs text-slate-300">
                          <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link href="/auth/register">
                      <Button className="w-full rounded-2xl bg-gradient-to-r from-[#5B67F7] to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs py-3 shadow-lg shadow-purple-500/20 gap-2">
                        <span>Get Started Now</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
