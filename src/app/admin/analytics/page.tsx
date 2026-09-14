"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  BookOpen,
  Clock,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { formatNumber, formatDateTime } from "@/lib/admin/utils";
import { initialAnalyticsData } from "@/lib/admin/initial-state";
import { authClient } from "@/lib/auth-client";
import { adminService } from "@/services/admin.service";
import { AnalyticsData } from "@/lib/admin/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#10b981", // emerald - excellent
  "#3b82f6", // blue - good
  "#f59e0b", // amber - average
  "#ef4444", // rose - below average
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export default function AdminAnalyticsPage() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const [data, setData] = React.useState<AnalyticsData>(initialAnalyticsData);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date | null>(null);

  const fetchAnalytics = React.useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await adminService.getAnalytics();
      if (res.success && res.data) {
        setData(res.data);
        setLastRefreshed(new Date());
      } else {
        setError("Failed to retrieve platform analytics telemetry.");
      }
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(err?.message || "Failed to load telemetry data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchAnalytics();
    }
  }, [session?.user?.role, fetchAnalytics]);

  // Auth guard states
  if (isSessionPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Initializing Analytics Telemetry...
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
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Admin Authentication Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Please sign in with administrator credentials to view system metrics and telemetry.
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
            You are signed in as a <strong className="text-cyan-600 capitalize">{session.user.role}</strong>. Administrative privileges are required.
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

  const { systemHealth, examStats, userStats, examPerformance, scoreDistribution } = data;

  // Prepare chart data safely
  const systemHealthData = (systemHealth || []).map((metric) => ({
    time: new Date(metric.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    cpu: metric.cpuUsage,
    memory: metric.memoryUsage,
    apiLatency: metric.apiLatency,
    connections: metric.activeConnections,
  }));

  const dailyActiveUsersData = (userStats?.dailyActiveUsers || []).map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: day.count,
  }));

  const examPerformanceData = (examPerformance || []).map((subject) => ({
    subject: subject.subject,
    passCount: subject.passCount,
    failCount: subject.failCount,
    averageScore: subject.averageScore,
  }));

  // Calculate DAU Peak and Average with safe empty guards
  const dauList = userStats?.dailyActiveUsers || [];
  const dauCounts = dauList.map((d) => d.count);
  const peakDau = dauCounts.length > 0 ? Math.max(...dauCounts) : 0;
  const avgDau = dauCounts.length > 0
    ? Math.round(dauCounts.reduce((a, b) => a + b, 0) / dauCounts.length)
    : 0;

  // Determine score distribution slices
  const totalGradedSubmissions =
    (scoreDistribution?.excellent || 0) +
    (scoreDistribution?.good || 0) +
    (scoreDistribution?.average || 0) +
    (scoreDistribution?.belowAverage || 0);

  const scoreDistributionData = totalGradedSubmissions > 0
    ? [
        { name: "Excellent (90-100%)", value: scoreDistribution?.excellent || 0 },
        { name: "Good (75-89%)", value: scoreDistribution?.good || 0 },
        { name: "Average (60-74%)", value: scoreDistribution?.average || 0 },
        { name: "Below Average (<60%)", value: scoreDistribution?.belowAverage || 0 },
      ]
    : [
        {
          name: "Excellent (90-100%)",
          value: (examPerformance || []).filter((e) => e.averageScore >= 90).length,
        },
        {
          name: "Good (75-89%)",
          value: (examPerformance || []).filter(
            (e) => e.averageScore >= 75 && e.averageScore < 90,
          ).length,
        },
        {
          name: "Average (60-74%)",
          value: (examPerformance || []).filter(
            (e) => e.averageScore >= 60 && e.averageScore < 75,
          ).length,
        },
        {
          name: "Below Average (<60%)",
          value: (examPerformance || []).filter((e) => e.averageScore < 60 && e.averageScore > 0).length,
        },
      ];

  const hasScoreData = scoreDistributionData.some((d) => d.value > 0);
  const hasSubjectPerformance = examPerformanceData.some(
    (s) => s.passCount > 0 || s.failCount > 0 || s.averageScore > 0,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Platform Telemetry & Analytics
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Real-time platform metrics, assessment outcomes, and server infrastructure health
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastRefreshed && (
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              Synced: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing || isLoading}
            className="rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold px-4 cursor-pointer"
            leftIcon={
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-500" : ""}`}
              />
            }
          >
            {isRefreshing ? "Refreshing..." : "Refresh Telemetry"}
          </Button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAnalytics(false)}
            className="font-bold underline hover:no-underline ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Key Metrics StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={isLoading ? "..." : formatNumber(userStats?.totalUsers || 0)}
          change={`+${userStats?.newUsers || 0} new this month`}
          icon={Users}
          trend="up"
          badge={`${userStats?.activeUsers || 0} Active`}
          iconColor="text-[#5B67F7] dark:text-indigo-400"
          delay={0.05}
        />
        <StatCard
          title="Active Users"
          value={isLoading ? "..." : formatNumber(userStats?.activeUsers || 0)}
          change={`${userStats?.retentionRate || 0}% retention rate`}
          icon={Activity}
          iconColor="text-[#00CBB8] dark:text-emerald-400"
          trend="up"
          delay={0.1}
        />
        <StatCard
          title="Total Exams"
          value={isLoading ? "..." : formatNumber(examStats?.totalExams || 0)}
          change={`${examStats?.publishedExams || 0} published`}
          icon={BookOpen}
          iconColor="text-[#00A3C4] dark:text-cyan-400"
          badge={`${examStats?.scheduledExams || 0} scheduled`}
          delay={0.15}
        />
        <StatCard
          title="Avg. Score"
          value={isLoading ? "..." : `${examStats?.averageScore || 0}%`}
          change={`${examStats?.passRate || 0}% pass rate`}
          icon={TrendingUp}
          iconColor="text-purple-600 dark:text-purple-400"
          trend="up"
          delay={0.2}
        />
      </div>

      {/* System Health & Daily Active Users Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health AreaChart */}
        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  System Health Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  CPU %, Memory %, and Database API latency
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </div>
            </div>

            {systemHealthData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
                No system telemetry points available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemHealthData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="time"
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.25}
                    name="CPU %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                    name="Memory %"
                  />
                  <Area
                    type="monotone"
                    dataKey="apiLatency"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.25}
                    name="DB Ping (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </AdminCard>

        {/* Daily Active Users BarChart */}
        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Daily Active Users (7 Days)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Unique student submissions & user registrations
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                Rolling Window
              </span>
            </div>

            {dailyActiveUsersData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
                No activity records recorded in the past 7 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyActiveUsersData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    className="text-xs text-slate-600 dark:text-slate-400"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Active Users"
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#00A3C4" />
                      <stop offset="100%" stopColor="#5B67F7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Peak: <strong className="text-slate-900 dark:text-white font-bold">{formatNumber(peakDau)}</strong>
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg: <strong className="text-slate-900 dark:text-white font-bold">{formatNumber(avgDau)}</strong> / day
                </span>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Exam Performance by Subject */}
      <AdminCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Exam Performance by Subject
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparative analysis of student pass/fail distribution per subject
              </p>
            </div>
            {hasSubjectPerformance && (
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                {examPerformanceData.length} Subjects Evaluated
              </span>
            )}
          </div>

          {!hasSubjectPerformance ? (
            <div className="h-[250px] flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Exam Submission Records Yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Once students take exams across subjects, their passing and failing metrics will populate automatically here.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={examPerformanceData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <XAxis
                  type="number"
                  className="text-xs text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="subject"
                  type="category"
                  width={120}
                  className="text-xs text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar
                  dataKey="passCount"
                  fill="#10b981"
                  name="Passed"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="failCount"
                  fill="#ef4444"
                  name="Failed"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminCard>

      {/* Score Distribution & Exam Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution PieChart */}
        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Score Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Percentage grading breakdown across student submissions
                </p>
              </div>
            </div>

            {!hasScoreData ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800">
                <TrendingUp className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No Submission Scores Recorded
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                  Grade tiers (Excellent, Good, Average, Below Average) will show once exams are evaluated.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ? name.split(" ")[0] : ""}: ${(Number(percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {scoreDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </AdminCard>

        {/* Exam Lifecycle Statistics BarChart */}
        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Exam Lifecycle Statistics
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assessment volume categorized by operational status
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                {examStats?.totalExams || 0} Total
              </span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Published",
                    value: examStats?.publishedExams || 0,
                    fill: "#10b981",
                  },
                  {
                    name: "Scheduled",
                    value: examStats?.scheduledExams || 0,
                    fill: "#3b82f6",
                  },
                  {
                    name: "Draft",
                    value: examStats?.draftExams || 0,
                    fill: "#6b7280",
                  },
                  {
                    name: "Completed",
                    value: examStats?.completedExams || 0,
                    fill: "#8b5cf6",
                  },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-800"
                />
                <XAxis
                  dataKey="name"
                  className="text-xs text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  className="text-xs text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Bar dataKey="value" name="Exams" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      {/* System Operational Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {formatNumber(examStats?.publishedExams || 0)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Active Published Exams
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {formatNumber(examStats?.scheduledExams || 0)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Upcoming Scheduled Exams
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {examStats?.completionRate || 0}%
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Exam Completion Rate
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-3">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {userStats?.averageSessionDuration || 0}m
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Avg. Assessment Session
            </p>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
