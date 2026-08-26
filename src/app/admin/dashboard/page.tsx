"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  ShieldAlert,
  Settings,
  Activity,
  ArrowRight,
  Building2,
  Lock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";

export default function AdminDashboardPage() {
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

  if (session.user.role !== "admin") {
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
            cannot access the Admin dashboard.
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

  const adminStats = [
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
      icon: Activity,
      title: "Pending Actions",
      description: "Admin attention required",
      value: "7",
      change: "Requires review",
      color:
        "border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900/90 dark:to-amber-950/40",
      iconBg:
        "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
    },
  ];

  const adminActions = [
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
      link: "/admin/users",
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
      link: "/admin/security",
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Platform settings and preferences",
      details:
        "Configure platform-wide settings, manage integrations, and customize system behavior.",
      color:
        "border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40",
      iconBg:
        "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
      link: "/admin/settings",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Platform performance metrics",
      details:
        "View comprehensive analytics, generate reports, and track platform usage patterns.",
      color:
        "border-cyan-200/80 dark:border-cyan-500/30 bg-gradient-to-b from-white to-cyan-50/40 dark:from-slate-900/90 dark:to-cyan-950/40",
      iconBg:
        "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
      link: "/admin/analytics",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-700 p-8 sm:p-10 text-white shadow-xl shadow-purple-500/10"
      >
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 backdrop-blur-md font-bold uppercase tracking-wider"
          >
            Admin Workspace
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-sm leading-relaxed opacity-90">
            Welcome back to your system oversight portal. Monitor platform analytics, manage users, and oversee system operations.
          </p>
          <div className="pt-2">
            <Link href="/admin/settings">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-50 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                System Settings
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
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
                <stat.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
        {adminActions.map((action, index) => (
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
                  <action.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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

      {/* Platform Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="rounded-3xl border border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40 p-6 sm:p-8 shadow-xs"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl border shadow-2xs bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800">
            <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-[#152234] dark:text-white">
              Platform Overview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Institutional performance metrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Faculty Members
              </span>
            </div>
            <p className="text-2xl font-extrabold font-display text-[#152234] dark:text-white">
              180
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              +5 this month
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active Students
              </span>
            </div>
            <p className="text-2xl font-extrabold font-display text-[#152234] dark:text-white">
              4,250
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              +120 this week
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Security Status
              </span>
            </div>
            <p className="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
              Secure
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              0 incidents this month
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}