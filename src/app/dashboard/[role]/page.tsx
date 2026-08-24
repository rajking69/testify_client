"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  HelpCircle,
  Users,
  BarChart3,
  ShieldAlert,
  GraduationCap,
  Trophy,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";

export default function RoleDashboardPage({
  params,
}: {
  params: { role: string };
}) {
  const { data: session, isPending } = authClient.useSession();
  const role = params.role;
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

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

  // Role validation
  if (session.user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#152234]">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You are currently signed in as a{" "}
            <strong className="text-[#0092E3]">{session.user.role}</strong>. You
            cannot access the {roleDisplay} dashboard.
          </p>
          <div className="pt-2">
            <Link
              href={`/dashboard/${session.user.role}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-sm transition-all"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role-specific configurations
  const roleConfig = {
    teacher: {
      gradient: "from-indigo-700 via-purple-700 to-blue-700",
      shadowColor: "indigo",
      accentColor: "#0092E3",
      badgeColor:
        "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      badgeText: "Teacher Workspace",
      stats: [
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
      ],
      actions: [
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
        },
      ],
    },
    admin: {
      gradient: "from-purple-700 via-indigo-700 to-violet-700",
      shadowColor: "purple",
      accentColor: "#8E44AD",
      badgeColor:
        "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      badgeText: "Admin Workspace",
      stats: [
        {
          icon: Users,
          title: "Total Users",
          description: "Platform-wide user count",
          value: "1,248",
          change: "+12% from last month",
          color:
            "border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40",
          iconBg:
            "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
        },
        {
          icon: BarChart3,
          title: "Active Exams",
          description: "Currently running assessments",
          value: "342",
          change: "+8% from last week",
          color:
            "border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/40",
          iconBg:
            "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
        },
        {
          icon: ShieldAlert,
          title: "System Health",
          description: "Platform performance status",
          value: "99.9%",
          change: "All systems operational",
          color:
            "border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/40",
          iconBg:
            "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
        },
        {
          icon: HelpCircle,
          title: "Pending Actions",
          description: "Admin attention required",
          value: "7",
          change: "Requires review",
          color:
            "border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900/90 dark:to-amber-950/40",
          iconBg:
            "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
        },
      ],
      actions: [
        {
          icon: Users,
          title: "User Management",
          description: "Manage user accounts and permissions",
          details:
            "View, edit, and manage user accounts across the platform. Handle role assignments and account status.",
          color:
            "border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900/90 dark:to-indigo-950/40",
          iconBg:
            "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
        },
        {
          icon: ShieldAlert,
          title: "Security Oversight",
          description: "Monitor security events and logs",
          details:
            "Review security incidents, monitor authentication patterns, and ensure platform integrity.",
          color:
            "border-rose-200/80 dark:border-rose-500/30 bg-gradient-to-b from-white to-rose-50/40 dark:from-slate-900/90 dark:to-rose-950/40",
          iconBg:
            "bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800",
        },
      ],
    },
    student: {
      gradient: "from-blue-700 via-cyan-700 to-teal-700",
      shadowColor: "blue",
      accentColor: "#00CBB8",
      badgeColor:
        "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      badgeText: "Student Workspace",
      stats: [
        {
          icon: BookOpen,
          title: "Completed Exams",
          description: "Assessments finished",
          value: "24",
          change: "+3 this week",
          color:
            "border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/40",
          iconBg:
            "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
        },
        {
          icon: Trophy,
          title: "Average Score",
          description: "Overall performance",
          value: "87%",
          change: "+5% improvement",
          color:
            "border-emerald-200/80 dark:border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/40",
          iconBg:
            "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
        },
        {
          icon: Clock,
          title: "Study Time",
          description: "Total hours logged",
          value: "48h",
          change: "This month",
          color:
            "border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900/90 dark:to-amber-950/40",
          iconBg:
            "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
        },
        {
          icon: GraduationCap,
          title: "Courses",
          description: "Enrolled subjects",
          value: "6",
          change: "Active enrollment",
          color:
            "border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40",
          iconBg:
            "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
        },
      ],
      actions: [
        {
          icon: BookOpen,
          title: "Available Exams",
          description: "Take new assessments",
          details:
            "Browse and take available exams. View exam details, time limits, and requirements before starting.",
          color:
            "border-cyan-200/80 dark:border-cyan-500/30 bg-gradient-to-b from-white to-cyan-50/40 dark:from-slate-900/90 dark:to-cyan-950/40",
          iconBg:
            "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
        },
        {
          icon: Trophy,
          title: "My Results",
          description: "View past performance",
          details:
            "Review your exam history, analyze your performance trends, and track your academic progress over time.",
          color:
            "border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-white to-indigo-50/40 dark:from-slate-900/90 dark:to-indigo-950/40",
          iconBg:
            "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
        },
      ],
    },
  };

  const config =
    roleConfig[role as keyof typeof roleConfig] || roleConfig.student;

  return (
    <div className="space-y-16">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${config.gradient} p-8 sm:p-10 text-white shadow-xl shadow-${config.shadowColor}-500/10`}
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge
            variant="secondary"
            className={`bg-white/20 text-white border-white/30 backdrop-blur-md font-bold uppercase tracking-wider`}
          >
            {config.badgeText}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            {roleDisplay} Dashboard
          </h2>
          <p className="text-sm leading-relaxed opacity-90">
            {role === "teacher" &&
              "Welcome back to your assessment portal. Create exams, manage question banks, and evaluate student performance."}
            {role === "admin" &&
              "Welcome back to your system oversight portal. Monitor platform analytics, manage users, and oversee system operations."}
            {role === "student" &&
              "Welcome back to your learning portal. Access your exams, track your progress, and view your achievements."}
          </p>
          <div className="pt-2">
            <Link href={`/profile/${role}`}>
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-50 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Profile Settings
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {config.stats.map((stat, index) => (
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
                <stat.icon
                  className={`h-5 w-5 text-[#0092E3] dark:text-cyan-400`}
                />
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
        {config.actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            whileHover={{ y: -6 }}
            className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${action.color}`}
          >
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl border shadow-2xs flex items-center justify-center w-fit">
                <action.icon
                  className={`h-5 w-5 text-[#0092E3] dark:text-cyan-400`}
                />
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
        ))}
      </div>
    </div>
  );
}
