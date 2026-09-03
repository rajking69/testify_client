"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
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
  PlusCircle,
  Activity,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";

// Framer motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function TeacherDashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#00A3C4] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Loading your teacher workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00A3C4] flex items-center justify-center mx-auto border border-cyan-100 dark:border-cyan-800">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Please sign in to access your teacher assessments, question banks, and grading console.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2238] hover:bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-md shadow-[#0B2238]/20 transition-all cursor-pointer"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-800">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Teacher Workspace Only
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You are signed in as a{" "}
            <strong className="text-[#00A3C4] capitalize">{session.user.role}</strong>. You cannot access the Instructor console.
          </p>
          <div className="pt-2">
            <Link
              href={`/${session.user.role}/dashboard`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2238] hover:bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-md transition-all cursor-pointer"
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
      title: "Active Exams",
      description: "Live & scheduled",
      value: "42",
      change: "+5 this month",
      trend: "up" as const,
      iconColor: "text-[#00A3C4] dark:text-cyan-400",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
    },
    {
      icon: Users,
      title: "Enrolled Students",
      description: "Across all courses",
      value: "156",
      change: "+12 new learners",
      trend: "up" as const,
      iconColor: "text-[#5B67F7] dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
    },
    {
      icon: BarChart3,
      title: "Class Average",
      description: "Term performance",
      value: "78.4%",
      change: "+3.2% increase",
      trend: "up" as const,
      iconColor: "text-[#00CBB8] dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
    },
    {
      icon: HelpCircle,
      title: "Question Bank",
      description: "Ready items",
      value: "847",
      change: "4 Subject Categories",
      trend: "neutral" as const,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
    },
  ];

  const teacherActions = [
    {
      icon: BookOpen,
      title: "Question Bank Hub",
      description: "Manage & AI-generate question repositories",
      details: "Curate multi-choice, true/false, and LaTeX formula questions with taxonomy tagging.",
      accent: "cyan",
      iconColor: "text-[#00A3C4] dark:text-cyan-400",
      badge: "847 Questions",
      link: "/teacher/question-bank",
    },
    {
      icon: Calendar,
      title: "Exam Management",
      description: "Design, schedule & lock examination rooms",
      details: "Set strict timers, randomize question orders, and configure continuous anti-cheat proctoring.",
      accent: "indigo",
      iconColor: "text-[#5B67F7] dark:text-indigo-400",
      badge: "6 Scheduled",
      link: "/teacher/exams",
    },
    {
      icon: Users,
      title: "Student Admissions",
      description: "Approve enrollment & track candidates",
      details: "Review student test requests, verify identities, and distribute locked room entrance tokens.",
      accent: "purple",
      iconColor: "text-purple-600 dark:text-purple-400",
      badge: "8 Pending",
      link: "/teacher/students",
    },
    {
      icon: BarChart3,
      title: "Grading & Analytics",
      description: "Auto-scoring and class insights",
      details: "Analyze student performance histograms, export scorecards, and publish verified certificates.",
      accent: "teal",
      iconColor: "text-[#00CBB8] dark:text-emerald-400",
      badge: "Instant AI Rubrics",
      link: "/teacher/results",
    },
  ];

  const recentExams = [
    {
      id: 1,
      title: "Advanced Mathematics Midterm",
      code: "MATH-302",
      status: "Published",
      statusColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      students: "45 Submitted",
      avgScore: "82%",
      time: "Completed 2h ago",
    },
    {
      id: 2,
      title: "Applied Physics Assessment - Quiz 4",
      code: "PHYS-101",
      status: "In Progress",
      statusColor: "bg-cyan-50 text-[#00A3C4] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      students: "18 Active taking",
      avgScore: "Running",
      time: "Ends in 35m",
    },
    {
      id: 3,
      title: "Organic Chemistry Laboratory Test",
      code: "CHEM-204",
      status: "Scheduled",
      statusColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      students: "32 Enrolled",
      avgScore: "Pending",
      time: "Starts Tomorrow 10:00 AM",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Dynamic Executive Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B2238] via-[#152234] to-[#0A3D62] p-6 sm:p-10 text-white shadow-xl shadow-[#0B2238]/15 border border-slate-700/50"
      >
        {/* Subtle Ambient Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00A3C4]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-60 h-60 bg-[#5B67F7]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instructor Command Console</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              Welcome Back, {session.user.name || "Instructor"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Your examination portal is fully active. You have <strong>2 ongoing tests</strong> and <strong>8 admission requests</strong> waiting for your review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/teacher/exams">
              <Button
                className="bg-[#00A3C4] hover:bg-[#0092E3] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-[#00A3C4]/25 transition-all cursor-pointer"
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Create New Exam
              </Button>
            </Link>

            <Link href="/teacher/monitoring">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-bold text-xs px-5 py-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
                leftIcon={<Activity className="h-4 w-4 text-cyan-300" />}
              >
                Live Proctoring
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {teacherStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238] dark:text-white tracking-tight">
                  {stat.value}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${stat.iconBg} ${stat.iconColor} shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {stat.change}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {stat.description}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Core Workflow Hub Cards */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
              Assessment Workflows
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to assessment creation, administration, and evaluation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {teacherActions.map((action) => (
            <Link key={action.title} href={action.link} className="group">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {action.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-[#0B2238] dark:text-white group-hover:text-[#00A3C4] dark:group-hover:text-cyan-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {action.description}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    {action.details}
                  </p>
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-[#00A3C4] dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Workspace</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* 2-Column Section: Recent Activity & Class Performance */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Exam & Assessment Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
              Recent Examinations & Status
            </h2>
            <Link
              href="/teacher/exams"
              className="text-xs font-bold text-[#00A3C4] dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              View All Exams
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md p-4 sm:p-5 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60 space-y-3">
            {recentExams.map((exam) => (
              <div
                key={exam.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exam.code}
                    </span>
                    <h3 className="text-sm font-bold text-[#0B2238] dark:text-white">
                      {exam.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {exam.students}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {exam.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${exam.statusColor}`}>
                    {exam.status}
                  </span>
                  <Link
                    href={`/teacher/results`}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Performance Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
            Class Overview
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Average Completion Rate
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                94.8%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-[#00CBB8] h-2 rounded-full w-[94.8%]" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Top Grade Bracket (90-100%)</span>
                <span className="font-bold text-[#0B2238] dark:text-white">38% of class</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#00A3C4] h-1.5 rounded-full w-[38%]" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Passing Bracket (60-89%)</span>
                <span className="font-bold text-[#0B2238] dark:text-white">56% of class</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#5B67F7] h-1.5 rounded-full w-[56%]" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">At-Risk Bracket (&lt;60%)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">6% of class</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full w-[6%]" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Link
                href="/teacher/results"
                className="w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#00A3C4] dark:hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Analytics Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
