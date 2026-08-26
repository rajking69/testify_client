"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  HelpCircle,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  TrendingUp,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";

export default function TeacherDashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">
          Please sign in to access your dashboard
        </div>
      </div>
    );
  }

  if (session.user.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#152234]">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You are currently signed in as a{" "}
            <strong className="text-[#0092E3]">{session.user.role}</strong>. You
            cannot access the Teacher dashboard.
          </p>
          <div className="pt-2">
            <Link
              href={`/${session.user.role}/dashboard`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-sm transition-all"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const teacherStats = [
    {
      icon: BookOpen,
      title: "Total Exams",
      description: "Created assessments",
      value: "42",
      change: "+5 this month",
      color:
        "border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/40",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
    },
    {
      icon: Users,
      title: "Active Students",
      description: "Enrolled learners",
      value: "156",
      change: "+12 new this week",
      color:
        "border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900/90 dark:to-indigo-950/40",
      iconBg:
        "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
    },
    {
      icon: BarChart3,
      title: "Average Score",
      description: "Class performance",
      value: "78%",
      change: "+3% improvement",
      color:
        "border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/40",
      iconBg:
        "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
    },
    {
      icon: HelpCircle,
      title: "Questions",
      description: "Question bank size",
      value: "847",
      change: "Across all subjects",
      color:
        "border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900/90 dark:to-amber-950/40",
      iconBg:
        "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
    },
  ];

  const teacherActions = [
    {
      icon: BookOpen,
      title: "Question Bank",
      description: "Manage your question repository",
      details:
        "Create, edit, and organize questions for your assessments. Build comprehensive question banks by subject and difficulty.",
      color:
        "border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/40",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
      link: "/teacher/questions",
    },
    {
      icon: HelpCircle,
      title: "Exam Management",
      description: "Create and schedule assessments",
      details:
        "Design exams with your question bank, set time limits, configure anti-cheat measures, and schedule assessments for students.",
      color:
        "border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900/90 dark:to-indigo-950/40",
      iconBg:
        "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
      link: "/teacher/exams",
    },
    {
      icon: Users,
      title: "Student Admission",
      description: "Review requests and approve access",
      details:
        "Assign students to the right exam and track pending requests. Manage student enrollment and exam permissions.",
      color:
        "border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40",
      iconBg:
        "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
      link: "/teacher/students",
    },
    {
      icon: BarChart3,
      title: "Results & Analytics",
      description: "View performance and publish results",
      details:
        "Analyze student performance, view detailed analytics, and publish final results for completed assessments.",
      color:
        "border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/40",
      iconBg:
        "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
      link: "/teacher/results",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 p-8 sm:p-10 text-white shadow-xl shadow-indigo-500/10"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 backdrop-blur-md font-bold uppercase tracking-wider"
          >
            Teacher Workspace
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            Teacher Dashboard
          </h2>
          <p className="text-sm leading-relaxed opacity-90">
            Welcome back to your assessment portal. Create exams, manage
            question banks, and evaluate student performance.
          </p>
          <div className="pt-2">
            <Link href="/teacher/exams">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-50 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create New Exam
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teacherStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${stat.color}`}
          >
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl border shadow-2xs flex items-center justify-center w-fit">
                <stat.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-[#152234] dark:text-white">
                  {stat.title}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {stat.description}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-2xl font-extrabold font-display text-[#152234] dark:text-white">
                {stat.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teacherActions.map((action, index) => (
          <Link key={action.title} href={action.link}>
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -6 }}
              className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${action.color} cursor-pointer`}
            >
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl border shadow-2xs flex items-center justify-center w-fit">
                  <action.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-[#152234] dark:text-white">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {action.details}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="rounded-3xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900/90 dark:to-indigo-950/40 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl border shadow-2xs bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-[#152234] dark:text-white">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your latest assessment updates
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            whileHover={{ x: 3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Mathematics Midterm - Results Published
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  45 students completed • Average score: 78%
                </p>
              </div>
            </div>
            <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              Completed
            </Badge>
          </motion.div>

          <motion.div
            whileHover={{ x: 3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Physics Quiz - In Progress
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  12 students currently taking • 20 minutes remaining
                </p>
              </div>
            </div>
            <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              Active
            </Badge>
          </motion.div>

          <motion.div
            whileHover={{ x: 3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Chemistry Lab - Pending Admission
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  8 student requests awaiting approval
                </p>
              </div>
            </div>
            <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Action Required
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="rounded-3xl border border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl border shadow-2xs bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-[#152234] dark:text-white">
              Class Performance Overview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Student achievement metrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
              Class Average
            </p>
            <p className="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
              78%
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              +3% from last month
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
              Completion Rate
            </p>
            <p className="text-2xl font-extrabold font-display text-[#152234] dark:text-white">
              94%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              On-time submissions
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">
              Top Performer
            </p>
            <p className="text-2xl font-extrabold font-display text-indigo-600 dark:text-indigo-400">
              98%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Highest score this term
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
