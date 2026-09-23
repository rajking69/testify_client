"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
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
  DollarSign,
  BookOpen,
  HelpCircle,
  CreditCard,
  FileText,
  Zap,
  CheckCircle2,
  Shield,
  Layers,
  Database,
  Sparkles,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authClient } from "@/lib/auth-client";
import { adminService } from "@/services/admin.service";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { cn } from "@/lib/admin/utils";

// Framer motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
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

export default function AdminDashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalExams: 0,
    totalSubmissions: 0,
    activeSubscriptions: 0,
    totalPurchases: 0,
  });

  React.useEffect(() => {
    let isMounted = true;
    if (session?.user?.role === "admin") {
      adminService.getDashboardOverview().then((res) => {
        if (res.success && res.data && isMounted) {
          setStats(res.data);
        }
      }).catch(console.error);
    }
    return () => { isMounted = false; };
  }, [session?.user?.role]);

  if (isPending) {
    return (
      <div suppressHydrationWarning className="min-h-[60vh] flex items-center justify-center">
        <div suppressHydrationWarning className="flex flex-col items-center gap-3">
          <div suppressHydrationWarning className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p suppressHydrationWarning className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Initializing Admin Command Center...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#5B67F7] flex items-center justify-center mx-auto border border-purple-100 dark:border-purple-800">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Admin Authentication Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Please sign in with administrator credentials to access platform governance and system metrics.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152234] hover:bg-[#0B2238] text-white font-bold text-xs px-6 py-2.5 shadow-md transition-all cursor-pointer"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-800">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Admin Access Restricted
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You are currently signed in as a{" "}
            <strong className="text-purple-600 capitalize">{session.user.role}</strong>. Administrative privileges are required.
          </p>
          <div className="pt-2">
            <Link
              href={`/${session.user.role}/dashboard`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152234] hover:bg-[#0B2238] text-white font-bold text-xs px-6 py-2.5 shadow-md transition-all cursor-pointer"
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
      icon: DollarSign,
      title: "Revenue Command Center",
      description: "Track live financial telemetry, total sales, and subscriptions",
      link: "/admin/revenue",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
      badge: "$ Live Revenue",
      subtext: "100% Real DB Data",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage students, instructors, and system administrators",
      link: "/admin/users",
      iconColor: "text-[#5B67F7] dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
      badge: `${stats.totalUsers} Users`,
      subtext: "Platform wide",
    },
    {
      icon: BookOpen,
      title: "Exam Registry",
      description: "Oversee scheduled, active, and completed assessments",
      link: "/admin/exams",
      iconColor: "text-[#00A3C4] dark:text-cyan-400",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
      badge: `${stats.totalExams} Exams`,
      subtext: `${stats.totalSubmissions} Submissions`,
    },
    {
      icon: HelpCircle,
      title: "Question Bank Hub",
      description: "Institutional repository taxonomy & moderation",
      link: "/admin/questions",
      iconColor: "text-[#00CBB8] dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
      badge: "847 Questions",
      subtext: "523 MCQ • 324 LaTeX",
    },
    {
      icon: CreditCard,
      title: "Subscriptions",
      description: "Departmental licensing tiers and billing cycles",
      link: "/admin/subscriptions",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
      badge: `${stats.activeSubscriptions} Active`,
      subtext: "Premium Tiers",
    },
    {
      icon: FileText,
      title: "Payment Records",
      description: "Audit financial transactions, invoices, and payouts",
      link: "/admin/payments",
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
      badge: `${stats.totalPurchases} Records`,
      subtext: "Verified Payments",
    },
    {
      icon: BarChart3,
      title: "Platform Analytics",
      description: "Deep analytics on student engagement & server metrics",
      link: "/admin/analytics",
      iconColor: "text-[#00A3C4] dark:text-cyan-400",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
      badge: "Live Telemetry",
      subtext: "Real-time stream",
    },
    {
      icon: Settings,
      title: "System Config",
      description: "Configure environment variables, OAuth & email gateways",
      link: "/admin/settings",
      iconColor: "text-slate-600 dark:text-slate-400",
      iconBg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
      badge: "15 Parameters",
      subtext: "Production Ready",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Executive Command Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-indigo-50/80 to-purple-50/90 dark:from-[#0B2238] dark:via-[#152234] dark:to-[#1E1B4B] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] dark:shadow-[#0B2238]/15 border border-white dark:border-slate-700/50 backdrop-blur-3xl"
      >
        {/* Premium Light Mode Inner Glow */}
        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/60 pointer-events-none dark:hidden" />

        {/* Ambient Blur Orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 dark:bg-[#5B67F7]/25 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-fuchsia-500/20 dark:bg-[#00A3C4]/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-72 h-72 bg-sky-400/20 dark:hidden rounded-full blur-3xl pointer-events-none mix-blend-multiply" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/10 border border-indigo-100 dark:border-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-purple-300 shadow-sm dark:shadow-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>Platform Core Online • v2.4.0</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white drop-shadow-sm dark:drop-shadow-none">
              Administrator Command Center
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
              Monitor institutional performance, manage active subscriptions, audit proctoring logs, and govern user permissions across all campuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/admin/revenue">
              <Button
                className="group bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-[0_8px_20px_-4px_rgba(16,185,129,0.5)] border border-emerald-300/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer gap-2"
              >
                <DollarSign className="h-4 w-4" />
                <span>Revenue Center</span>
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button
                className="group bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-[0_8px_20px_-4px_rgba(99,102,241,0.5)] border border-indigo-400/50 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                leftIcon={<BarChart3 className="h-4 w-4" />}
              >
                Telemetry & Analytics
              </Button>
            </Link>

            <Link href="/admin/settings">
              <Button
                variant="ghost"
                className="group border border-indigo-200/60 bg-white/60 dark:border-white/10 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-indigo-300 dark:hover:border-white/20 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none text-slate-700 dark:text-white font-bold text-xs px-6 py-2.5 rounded-full backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                leftIcon={
                  <Settings className="h-4 w-4 text-indigo-500 dark:text-purple-300 transition-transform duration-500 ease-out group-hover:rotate-90 group-hover:text-indigo-600 dark:group-hover:text-purple-200" />
                }
              >
                System Config
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick KPI Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="Platform Wide"
          icon={Users}
          trend="up"
          badge={`${stats.activeSubscriptions} Subscribed`}
          iconColor="text-[#5B67F7] dark:text-indigo-400"
          delay={0.1}
        />
        <StatCard
          title="Total Exams"
          value={stats.totalExams.toLocaleString()}
          change="System wide exams"
          icon={BookOpen}
          trend="up"
          badge={`${stats.totalSubmissions} Attempts`}
          iconColor="text-[#00A3C4] dark:text-cyan-400"
          delay={0.15}
        />
        <StatCard
          title="System Health"
          value="99.9%"
          change="All nodes optimal"
          icon={Activity}
          trend="up"
          badge="Latency 24ms"
          iconColor="text-[#00CBB8] dark:text-emerald-400"
          delay={0.2}
        />
        <StatCard
          title="Total Purchases"
          value={stats.totalPurchases.toLocaleString()}
          change="Verified"
          icon={CreditCard}
          trend="up"
          badge="Transactions"
          iconColor="text-purple-600 dark:text-purple-400"
          delay={0.25}
        />
      </motion.div>

      {/* 9 Admin Modules Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
              Administrative Governance Modules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a control system to manage institutional records and runtime configurations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {adminModules.map((module) => (
            <Link key={module.title} href={module.link} className="group">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/30 dark:hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-xl border shadow-2xs group-hover:scale-110 transition-transform duration-300", module.iconBg, module.iconColor)}>
                      <module.icon className="h-5 w-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {module.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-[#0B2238] dark:text-white group-hover:text-[#5B67F7] dark:group-hover:text-purple-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {module.subtext}
                  </span>
                  <div className="flex items-center text-xs font-bold text-[#5B67F7] dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                    <span>Manage</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Institutional Infrastructure & Security Posture */}
      <motion.div variants={itemVariants}>
        <AdminCard>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl border shadow-2xs bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800 text-[#5B67F7]">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
                    Platform Infrastructure & Security Posture
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time security telemetry and campus network health
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Security Audit Passed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Faculty Instructors
                  </span>
                  <Users className="h-4 w-4 text-[#5B67F7]" />
                </div>
                <p className="text-2xl font-extrabold font-display text-[#0B2238] dark:text-white">
                  180
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +5 onboarded this month
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total Active Candidates
                  </span>
                  <Activity className="h-4 w-4 text-[#00A3C4]" />
                </div>
                <p className="text-2xl font-extrabold font-display text-[#0B2238] dark:text-white">
                  4,250
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +120 active today
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Data Integrity Status
                  </span>
                  <Lock className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
                  Protected
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  0 security incidents detected
                </p>
              </div>
            </div>
          </div>
        </AdminCard>
      </motion.div>
    </motion.div>
  );
}
