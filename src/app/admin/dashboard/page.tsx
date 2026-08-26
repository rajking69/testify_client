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
  BookOpen,
  HelpCircle,
  CreditCard,
  FileText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { cn } from "@/lib/admin/utils";

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

  const adminModules = [
    {
      icon: Users,
      title: "User Management",
      description: "Manage users, teachers, and administrators",
      link: "/admin/users",
      color: "purple",
      stats: { total: 1248, active: 892, new: 156 },
    },
    {
      icon: BookOpen,
      title: "Exam Management",
      description: "Create, schedule, and manage examinations",
      link: "/admin/exams",
      color: "blue",
      stats: { total: 156, published: 89, scheduled: 34 },
    },
    {
      icon: HelpCircle,
      title: "Question Bank",
      description: "Manage and organize exam questions",
      link: "/admin/questions",
      color: "emerald",
      stats: { total: 847, mcq: 523, other: 324 },
    },
    {
      icon: CreditCard,
      title: "Subscriptions",
      description: "Manage user subscriptions and plans",
      link: "/admin/subscriptions",
      color: "indigo",
      stats: { total: 425, active: 380, revenue: "$12,450" },
    },
    {
      icon: FileText,
      title: "Payments",
      description: "Monitor transactions and payment history",
      link: "/admin/payments",
      color: "amber",
      stats: { total: 1240, success: 1120, pending: 45 },
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View platform metrics and performance insights",
      link: "/admin/analytics",
      color: "cyan",
      stats: { users: 1248, exams: 156, revenue: "$45,230" },
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Configure platform settings and variables",
      link: "/admin/settings",
      color: "slate",
      stats: { configs: 15, categories: 4, updated: 3 },
    },
    {
      icon: Zap,
      title: "Feature Flags",
      description: "Toggle runtime system features and controls",
      link: "/admin/features",
      color: "rose",
      stats: { total: 12, enabled: 8, disabled: 4 },
    },
    {
      icon: Lock,
      title: "Permissions",
      description: "Configure role-based access control matrix",
      link: "/admin/permissions",
      color: "violet",
      stats: { roles: 5, permissions: 24, scopes: 6 },
    },
  ];

  return (
    <div className="space-y-8">
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
            Welcome back to your comprehensive admin portal. Monitor platform
            analytics, manage users, oversee system operations, and configure
            platform settings.
          </p>
          <div className="pt-2">
            <Link href="/admin/analytics">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-50 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="1,248"
          change="+12% from last month"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Exams"
          value="156"
          change="+8% from last week"
          icon={BarChart3}
          iconColor="text-blue-600 dark:text-blue-400"
          trend="up"
        />
        <StatCard
          title="System Health"
          value="99.9%"
          change="All systems operational"
          icon={Activity}
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Monthly Revenue"
          value="$45,230"
          change="+15% from last month"
          icon={TrendingUp}
          iconColor="text-purple-600 dark:text-purple-400"
          trend="up"
        />
      </div>

      {/* Admin Modules Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Admin Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminModules.map((module, index) => (
            <Link key={module.title} href={module.link}>
              <AdminCard>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        module.color === "purple" &&
                          "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
                        module.color === "blue" &&
                          "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
                        module.color === "emerald" &&
                          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
                        module.color === "indigo" &&
                          "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
                        module.color === "amber" &&
                          "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
                        module.color === "cyan" &&
                          "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400",
                        module.color === "slate" &&
                          "bg-slate-50 text-slate-600 dark:bg-slate-950/60 dark:text-slate-400",
                        module.color === "rose" &&
                          "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
                        module.color === "violet" &&
                          "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
                      )}
                    >
                      <module.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {module.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {Object.values(module.stats)[0] as string}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {Object.values(module.stats)[1] as string}
                      </span>
                    </div>
                  </div>
                </div>
              </AdminCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform Overview */}
      <AdminCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl border shadow-2xs bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Platform Overview
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Institutional performance metrics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Faculty Members
                </span>
              </div>
              <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                180
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                +5 this month
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active Students
                </span>
              </div>
              <p className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                4,250
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                +120 this week
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
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
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
