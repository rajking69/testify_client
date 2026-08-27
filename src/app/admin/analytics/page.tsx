"use client";

import React from "react";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  BookOpen,
  Clock,
  Cpu,
  HardDrive,
} from "lucide-react";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { cn, formatNumber, formatDateTime } from "@/lib/admin/utils";
import { mockAnalyticsData } from "@/lib/admin/mock-data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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

export default function AdminAnalyticsPage() {
  const { systemHealth, examStats, userStats, examPerformance } =
    mockAnalyticsData;

  // Prepare data for charts
  const systemHealthData = systemHealth.map((metric) => ({
    time: new Date(metric.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    cpu: metric.cpuUsage,
    memory: metric.memoryUsage,
    apiLatency: metric.apiLatency,
    connections: metric.activeConnections,
  }));

  const dailyActiveUsersData = userStats.dailyActiveUsers.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: day.count,
  }));

  const examPerformanceData = examPerformance.map((subject) => ({
    subject: subject.subject,
    passCount: subject.passCount,
    failCount: subject.failCount,
    averageScore: subject.averageScore,
  }));

  const COLORS = [
    "#10b981",
    "#ef4444",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Real-time platform metrics and performance insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(userStats.totalUsers)}
          change={`+${userStats.newUsers} new this month`}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(userStats.activeUsers)}
          change={`${userStats.retentionRate}% retention rate`}
          icon={Activity}
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
        <StatCard
          title="Total Exams"
          value={formatNumber(examStats.totalExams)}
          change={`${examStats.publishedExams} published`}
          icon={BookOpen}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Avg. Score"
          value={`${examStats.averageScore}%`}
          change={`${examStats.passRate}% pass rate`}
          icon={TrendingUp}
          iconColor="text-purple-600 dark:text-purple-400"
          trend="up"
        />
      </div>

      {/* System Health Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                System Health Overview
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  Live
                </span>
              </div>
            </div>

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
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name="CPU %"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Memory %"
                />
                <Area
                  type="monotone"
                  dataKey="apiLatency"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name="API Latency (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        {/* Daily Active Users Chart */}
        <AdminCard>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
              Daily Active Users
            </h3>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Bar
                  dataKey="count"
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
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Peak:{" "}
                  {formatNumber(
                    Math.max(...userStats.dailyActiveUsers.map((d) => d.count)),
                  )}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Avg:{" "}
                  {formatNumber(
                    Math.round(
                      userStats.dailyActiveUsers.reduce(
                        (a, b) => a + b.count,
                        0,
                      ) / userStats.dailyActiveUsers.length,
                    ),
                  )}
                </span>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Exam Performance Chart */}
      <AdminCard>
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
            Exam Performance by Subject
          </h3>
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
              />
              <YAxis
                dataKey="subject"
                type="category"
                width={100}
                className="text-xs text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#1e293b" }}
              />
              <Legend />
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
        </div>
      </AdminCard>

      {/* Score Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
              Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Excellent (90-100%)",
                      value: examPerformance.filter((e) => e.averageScore >= 90)
                        .length,
                    },
                    {
                      name: "Good (75-89%)",
                      value: examPerformance.filter(
                        (e) => e.averageScore >= 75 && e.averageScore < 90,
                      ).length,
                    },
                    {
                      name: "Average (60-74%)",
                      value: examPerformance.filter(
                        (e) => e.averageScore >= 60 && e.averageScore < 75,
                      ).length,
                    },
                    {
                      name: "Below Average (<60%)",
                      value: examPerformance.filter((e) => e.averageScore < 60)
                        .length,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  padding={10}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        {/* Exam Statistics */}
        <AdminCard>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
              Exam Statistics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Published",
                    value: examStats.publishedExams,
                    color: "#10b981",
                  },
                  {
                    name: "Scheduled",
                    value: examStats.scheduledExams,
                    color: "#3b82f6",
                  },
                  {
                    name: "Draft",
                    value: examStats.draftExams,
                    color: "#6b7280",
                  },
                  {
                    name: "Completed",
                    value: examStats.completedExams,
                    color: "#8b5cf6",
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {examStats.publishedExams}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Published Exams
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {examStats.scheduledExams}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Scheduled Exams
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-3">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {examStats.completionRate}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Completion Rate
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mb-3">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {userStats.averageSessionDuration}m
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Avg. Session
            </p>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
