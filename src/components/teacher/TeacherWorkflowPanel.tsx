"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  AlertTriangle,
  Send,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  BarChart3,
  UserCheck,
  UserX,
  ExternalLink,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { purchaseService, TeacherEarningsSummary } from "@/services/purchase.service";

// ==========================================
// 1. STUDENTS / ADMISSION PANEL
// ==========================================

type StudentStatus = "Admitted" | "Pending" | "Rejected";

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  exam: string;
  registeredDate: string;
  status: StudentStatus;
}

const initialStudents: StudentRecord[] = [];

export function AdmissionPanel() {
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("testify_teacher_students");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [];
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StudentStatus>("All");
  const [toast, setToast] = useState<string | null>(null);

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExam, setInviteExam] = useState("Computer Science Mid Term Exam");

  useEffect(() => {
    localStorage.setItem("testify_teacher_students", JSON.stringify(students));
  }, [students]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = (id: string, newStatus: StudentStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    showToast(`Student marked as ${newStatus}.`);
  };

  const handleAdmitAllPending = () => {
    setStudents((prev) =>
      prev.map((s) => (s.status === "Pending" ? { ...s, status: "Admitted" } : s))
    );
    showToast("All pending candidates admitted!");
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newStudent: StudentRecord = {
      id: `std-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      rollNo: `CS-2024-${Math.floor(100 + Math.random() * 900)}`,
      exam: inviteExam,
      registeredDate: "Just now",
      status: "Admitted",
    };

    setStudents([newStudent, ...students]);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    showToast(`Invitation sent and ${newStudent.name} admitted!`);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Roll No", "Exam", "Registered Date", "Status"];
    const rows = students.map((s) => [s.id, s.name, s.email, s.rollNo, s.exam, s.registeredDate, s.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Testify_Enrolled_Students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(query.toLowerCase()) ||
        s.exam.toLowerCase().includes(query.toLowerCase());

      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [students, query, statusFilter]);

  const totalCount = students.length;
  const admittedCount = students.filter((s) => s.status === "Admitted").length;
  const pendingCount = students.filter((s) => s.status === "Pending").length;
  const rejectedCount = students.filter((s) => s.status === "Rejected").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
            Candidate Management
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Student Admissions & Roster
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Review candidate entry requests, admit enrolled students, and manage exam room access tokens.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs font-bold"
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export Roster
          </Button>

          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold"
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Invite Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Roster</p>
              <p className="text-2xl font-black text-[#152234] dark:text-white font-display mt-0.5">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Admitted</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-display mt-0.5">{admittedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300 font-display mt-0.5">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Rejected</p>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-300 font-display mt-0.5">{rejectedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 p-5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(["All", "Pending", "Admitted", "Rejected"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab
                    ? "bg-[#152234] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab} {tab === "Pending" && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidates..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {pendingCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdmitAllPending}
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-xs font-bold shrink-0"
                leftIcon={<Check className="h-3.5 w-3.5" />}
              >
                Admit All ({pendingCount})
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No student records found matching this filter.
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/60 uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Roll No</th>
                  <th className="px-5 py-3">Registered Exam</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-950/80 text-[#0092E3] font-bold text-xs flex items-center justify-center">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {student.rollNo}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {student.exam}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {student.registeredDate}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        student.status === "Admitted"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : student.status === "Pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {student.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(student.id, "Admitted")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg"
                            leftIcon={<Check className="h-3 w-3" />}
                          >
                            Admit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(student.id, "Rejected")}
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 text-[11px] px-2.5 py-1 rounded-lg font-bold"
                            leftIcon={<X className="h-3 w-3" />}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : student.status === "Rejected" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(student.id, "Admitted")}
                          className="text-xs font-bold text-emerald-600"
                        >
                          Re-admit
                        </Button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Admitted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Candidate to Examination"
        description="Provide student details to generate admission token and grant exam room access."
        size="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Rachel Adams"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="rachel.a@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Examination
            </label>
            <Select
              options={[
                { value: "Computer Science Mid Term Exam", label: "Computer Science Mid Term Exam" },
                { value: "Algorithms & Data Structures Assessment", label: "Algorithms & Data Structures Assessment" },
                { value: "Networking & Cloud Architecture Quiz", label: "Networking & Cloud Architecture Quiz" },
              ]}
              value={inviteExam}
              onChange={(e) => setInviteExam(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold">
              Send Invitation & Admit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ==========================================
// 2. LIVE MONITORING / PROCTORING PANEL
// ==========================================

interface MonitorStudent {
  id: string;
  name: string;
  email: string;
  exam: string;
  progress: number;
  timeRemaining: string;
  tabSwitches: number;
  focusLossCount: number;
  status: "Normal" | "Warning" | "Suspicious";
  lastPing: string;
}

const initialMonitorRows: MonitorStudent[] = [];

export function MonitoringPanel() {
  const [students, setStudents] = useState<MonitorStudent[]>(initialMonitorRows);
  const [inspectingStudent, setInspectingStudent] = useState<MonitorStudent | null>(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Live monitor telemetry updated from student sessions.");
    }, 600);
  };

  const handleSendWarning = () => {
    if (!warningMessage.trim() || !inspectingStudent) return;
    showToast(`Proctor warning transmitted to ${inspectingStudent.name}'s screen!`);
    setWarningMessage("");
  };

  const handleTerminateSession = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setInspectingStudent(null);
    showToast("Session terminated due to academic integrity violation.");
  };

  const onlineCount = students.length;
  const flaggedCount = students.filter((s) => s.status !== "Normal").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-blue-600 text-white text-xs font-bold border border-blue-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
              Real-Time Proctoring
            </p>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Live Exam Monitoring
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Monitor real-time student progress, tab switches, webcam telemetry, and anti-cheat alerts.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs font-bold"
          leftIcon={<Activity className={`h-3.5 w-3.5 text-[#0092E3] ${isRefreshing ? "animate-spin" : ""}`} />}
        >
          {isRefreshing ? "Pinging Nodes..." : "Refresh Telemetry"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Test Takers</p>
              <p className="text-2xl font-black text-[#152234] dark:text-white font-display mt-0.5">{onlineCount} Online</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Integrity Verified</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-display mt-0.5">{onlineCount - flaggedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`rounded-3xl border shadow-sm ${
          flaggedCount > 0 ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20" : "border-slate-200/80 dark:border-slate-800"
        }`}>
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Flagged Anomalies</p>
              <p className="text-2xl font-black text-amber-800 dark:text-amber-200 font-display mt-0.5">{flaggedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Monitoring Table */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold font-display text-[#152234] dark:text-white">
            Active Candidates Feed ({students.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No live examination sessions active right now.
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/60 uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Exam Paper</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3">Time Left</th>
                  <th className="px-5 py-3">Integrity Status</th>
                  <th className="px-5 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-cyan-950 text-[#0092E3] font-bold text-[11px] flex items-center justify-center">
                          {row.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Ping: {row.lastPing}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {row.exam}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>{row.progress}%</span>
                        </div>
                        <div className="w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#0092E3]"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                      {row.timeRemaining}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        row.status === "Normal"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : row.status === "Warning"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}>
                        {row.status === "Normal" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        {row.status} {row.tabSwitches > 0 && `(${row.tabSwitches} tabs)`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setInspectingStudent(row)}
                        className="text-xs font-bold"
                        leftIcon={<Eye className="h-3.5 w-3.5 text-[#0092E3]" />}
                      >
                        Inspect Proctor
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Inspect Proctoring Modal */}
      {inspectingStudent && (
        <Modal
          isOpen={!!inspectingStudent}
          onClose={() => setInspectingStudent(null)}
          title={`Proctoring Telemetry: ${inspectingStudent.name}`}
          description={`Live examination room stream for ${inspectingStudent.exam}`}
          size="lg"
        >
          <div className="space-y-4 pt-1">
            {/* Simulated Live Proctor Feed */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto animate-pulse">
                  <Eye className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  [LIVE WEBCAM ENCRYPTED STREAM • 30 FPS • 1080P]
                </p>
              </div>

              {/* Live Overlay Status */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold font-mono text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                AI PROCTOR: ACTIVE
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded">
                PING: {inspectingStudent.lastPing}
              </div>
            </div>

            {/* Integrity Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Progress</span>
                <p className="text-base font-extrabold text-[#0092E3] mt-0.5">{inspectingStudent.progress}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Tab Switches</span>
                <p className="text-base font-extrabold text-amber-600 mt-0.5">{inspectingStudent.tabSwitches}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400">Focus Loss</span>
                <p className="text-base font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{inspectingStudent.focusLossCount}</p>
              </div>
            </div>

            {/* Transmit Warning */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Transmit Live Proctor Warning to Candidate
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="e.g. Please look directly at the screen and close background applications."
                  className="text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleSendWarning}
                  disabled={!warningMessage.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  Send Warning
                </Button>
              </div>
            </div>

            {/* Terminate Action */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTerminateSession(inspectingStudent.id)}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs font-bold"
              >
                Terminate Exam Session
              </Button>

              <Button size="sm" onClick={() => setInspectingStudent(null)} className="font-bold text-xs">
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==========================================
// 3. POST-EXAM EVALUATION / GRADING PANEL
// ==========================================

interface EvaluationSubmission {
  id: string;
  student: string;
  email: string;
  exam: string;
  submitted: string;
  mcqScore: number;
  mcqTotal: number;
  writtenScore: number | null;
  writtenMax: number;
  status: "Pending Review" | "Graded";
  writtenQuestionText: string;
  studentAnswer: string;
  rubricNotes: string;
  teacherFeedback?: string;
}

const initialEvaluationRows: EvaluationSubmission[] = [];

export function EvaluationPanel() {
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("testify_teacher_evaluations");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [];
  });

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    initialEvaluationRows[0]?.id || ""
  );
  const [scoreInput, setScoreInput] = useState<string>("");
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const selected = submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];

  useEffect(() => {
    if (selected) {
      setScoreInput(selected.writtenScore !== null ? String(selected.writtenScore) : "8");
      setFeedbackInput(selected.teacherFeedback || "");
    }
  }, [selectedSubmissionId]);

  useEffect(() => {
    localStorage.setItem("testify_teacher_evaluations", JSON.stringify(submissions));
  }, [submissions]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveEvaluation = () => {
    if (!selected) return;

    const numScore = Number(scoreInput);
    if (isNaN(numScore) || numScore < 0 || numScore > selected.writtenMax) {
      showToast(`Score must be between 0 and ${selected.writtenMax}`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              writtenScore: numScore,
              teacherFeedback: feedbackInput.trim(),
              status: "Graded",
            }
          : s
      )
    );

    showToast(`Evaluation saved for ${selected.student}! Total: ${selected.mcqScore + numScore} / 50`);
  };

  const pendingCount = submissions.filter((s) => s.status === "Pending Review").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
            Post-Exam Evaluation
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Review & Grade Submissions
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Evaluate student open-ended questions, inspect auto-graded MCQ scores, and publish final gradebooks.
          </p>
        </div>

        <Badge
          className={
            pendingCount > 0
              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 text-xs font-bold px-3 py-1"
              : "bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1"
          }
        >
          {pendingCount > 0 ? `${pendingCount} Submissions Awaiting Review` : "All Submissions Graded"}
        </Badge>
      </div>

      {/* Two-Column Workspace */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
        {/* Left: Submission Queue */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold font-display text-[#152234] dark:text-white">
              Submission Queue ({submissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {submissions.map((sub) => {
              const isSelected = selected?.id === sub.id;
              const totalScore = sub.mcqScore + (sub.writtenScore || 0);

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubmissionId(sub.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0092E3] bg-blue-50/60 dark:bg-cyan-950/40 shadow-sm"
                      : "border-slate-200/80 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{sub.student}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sub.exam}</p>
                    </div>
                    <div>
                      {sub.status === "Graded" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> {totalScore} / 50
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock3 className="h-3 w-3" /> Needs Review
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>MCQ: {sub.mcqScore}/{sub.mcqTotal}</span>
                    <span>{sub.submitted}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Right: Evaluation Workspace */}
        {selected && (
          <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display text-[#152234] dark:text-white">
                  {selected.student}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">{selected.exam}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">Auto-Graded MCQ</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{selected.mcqScore} / {selected.mcqTotal}</p>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Written Question Card */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Written Question Prompt
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {selected.writtenQuestionText}
                </p>
              </div>

              {/* Student Response */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Candidate Response
                </span>
                <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-blue-50/50 dark:bg-cyan-950/20 p-3.5 rounded-xl border border-blue-200/60 dark:border-cyan-800">
                  {selected.studentAnswer}
                </div>
              </div>

              {/* Rubric Notes */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                <strong>Rubric Guidelines:</strong> {selected.rubricNotes}
              </div>

              {/* Grading Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Award Score (Max {selected.writtenMax})
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={selected.writtenMax}
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teacher Feedback Note
                  </label>
                  <Input
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="e.g. Excellent explanation of complexity."
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500">
                  Total Final Score: <strong className="text-slate-900 dark:text-white font-mono text-sm">{selected.mcqScore + (Number(scoreInput) || 0)} / 50</strong>
                </div>
                <Button
                  onClick={handleSaveEvaluation}
                  className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs"
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                >
                  Publish Evaluation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. RESULTS & ANALYTICS PANEL
// ==========================================

interface ExamResultRecord {
  id: string;
  student: string;
  email: string;
  exam: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail";
  submitted: string;
  rank: number;
}

const initialResultRows: ExamResultRecord[] = [];

export function ResultsPanel() {
  const [results] = useState<ExamResultRecord[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("testify_teacher_results");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<"gradebook" | "earnings">("gradebook");
  const [query, setQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("All Exams");
  const [selectedResult, setSelectedResult] = useState<ExamResultRecord | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<TeacherEarningsSummary | null>(null);

  useEffect(() => {
    const data = purchaseService.getTeacherEarnings();
    setEarnings(data);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const exams = ["All Exams", ...new Set(results.map((r) => r.exam))];

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const matchSearch =
        r.student.toLowerCase().includes(query.toLowerCase()) ||
        r.email.toLowerCase().includes(query.toLowerCase()) ||
        r.exam.toLowerCase().includes(query.toLowerCase());

      const matchExam = selectedExam === "All Exams" || r.exam === selectedExam;
      return matchSearch && matchExam;
    });
  }, [results, query, selectedExam]);

  const totalSubmissions = results.length;
  const averagePercentage =
    totalSubmissions > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalSubmissions)
      : 0;
  const passingRate =
    totalSubmissions > 0
      ? Math.round((results.filter((r) => r.status === "Pass").length / totalSubmissions) * 100)
      : 0;

  const handleExportCSV = () => {
    const headers = ["Rank", "Student", "Email", "Exam", "Score", "Max Score", "Percentage", "Grade", "Status", "Submitted"];
    const rows = results.map((r) => [r.rank, r.student, r.email, r.exam, r.score, r.maxScore, `${r.percentage}%`, r.grade, r.status, r.submitted]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Testify_Exam_Results_Gradebook.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-blue-600 text-white text-xs font-bold border border-blue-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
            Assessment Analytics & Revenue
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Results & Earnings Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Review candidate grades, grade curves, and manage income from Paid Examination sales.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs font-bold"
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export Gradebook
          </Button>

          <Button
            onClick={() => {
              setIsPublished(!isPublished);
              showToast(isPublished ? "Results hidden from candidate portal." : "Results published to student portal!");
            }}
            className={
              isPublished
                ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                : "bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold"
            }
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            {isPublished ? "Results Live (Published)" : "Publish Results"}
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 w-fit">
        <button
          onClick={() => setActiveTab("gradebook")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gradebook"
              ? "bg-white dark:bg-slate-800 text-[#152234] dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Candidate Gradebook ({totalSubmissions})
        </button>

        <button
          onClick={() => setActiveTab("earnings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "earnings"
              ? "bg-white dark:bg-slate-800 text-[#152234] dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          💰 Paid Exam Earnings
        </button>
      </div>

      {activeTab === "earnings" ? (
        /* Teacher Earnings & Revenue View */
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 bg-white/80 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paid Exams Sold</span>
              <p className="text-2xl font-black text-[#152234] dark:text-white font-display mt-1">
                {earnings?.totalSalesCount || 14}
              </p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 bg-white/80 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Sales Volume</span>
              <p className="text-2xl font-black text-[#0092E3] dark:text-cyan-400 font-display mt-1">
                ৳{earnings?.grossRevenue || 700}.00
              </p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 bg-white/80 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Fee (10%)</span>
              <p className="text-2xl font-black text-rose-500 font-display mt-1">
                ৳{earnings?.platformFees || 70}.00
              </p>
            </Card>

            <Card className="rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 bg-emerald-50/50 dark:bg-emerald-950/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Teacher Net Earnings</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-display mt-1">
                ৳{earnings?.teacherEarnings || 630}.00
              </p>
            </Card>
          </div>

          <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 p-5 space-y-4">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Recent Paid Exam Transactions
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Exam Paper</th>
                    <th className="pb-3">Gateway</th>
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Alex Morgan</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">Advanced JavaScript & React Mock Test</td>
                    <td className="py-3 font-mono">SSLCOMMERZ</td>
                    <td className="py-3 font-mono text-slate-500">TXN_984128</td>
                    <td className="py-3 font-bold text-emerald-600">৳50.00</td>
                    <td className="py-3 text-right">
                      <Badge variant="success">Settled</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Samantha Reed</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">Database Engineering & SQL Optimization</td>
                    <td className="py-3 font-mono">BKASH</td>
                    <td className="py-3 font-mono text-slate-500">TXN_774912</td>
                    <td className="py-3 font-bold text-emerald-600">৳60.00</td>
                    <td className="py-3 text-right">
                      <Badge variant="success">Settled</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">Daniel Kim</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">Quantum Mechanics Assessment</td>
                    <td className="py-3 font-mono">STRIPE</td>
                    <td className="py-3 font-mono text-slate-500">TXN_512933</td>
                    <td className="py-3 font-bold text-emerald-600">৳80.00</td>
                    <td className="py-3 text-right">
                      <Badge variant="success">Settled</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Standard Gradebook View */
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Graded Papers</p>
                  <p className="text-2xl font-black text-[#152234] dark:text-white font-display mt-0.5">{totalSubmissions}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Class Average</p>
                  <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-display mt-0.5">{averagePercentage}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Passing Rate</p>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-display mt-0.5">{passingRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CardContent className="flex items-center gap-3.5 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Top Score</p>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300 font-display mt-0.5">96% (A+)</p>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Main Results Table Card */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 p-5">
          <CardTitle className="text-base font-bold font-display text-[#152234] dark:text-white">
            Candidate Scores & Transcripts
          </CardTitle>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search candidate or exam..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="w-full sm:w-52">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
              >
                {exams.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No results found matching this filter.
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/60 uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Exam</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Percentage</th>
                  <th className="px-5 py-3">Grade</th>
                  <th className="px-5 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-400">
                      #{row.rank}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-cyan-950 text-[#0092E3] font-bold text-[11px] flex items-center justify-center">
                          {row.student.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{row.student}</p>
                          <p className="text-[10px] text-slate-400">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {row.exam}
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      {row.score} / {row.maxScore}
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-[#0092E3]">
                      {row.percentage}%
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        row.grade.startsWith("A")
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : row.grade.startsWith("B")
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}>
                        {row.grade} ({row.status})
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedResult(row)}
                        className="text-xs font-bold text-[#0092E3] hover:text-[#007AC9]"
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        Analytics
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      </>
      )}

      {/* Individual Result Analytics Modal */}
      {selectedResult && (
        <Modal
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          title={`Performance Report: ${selectedResult.student}`}
          description={`Comprehensive assessment transcript for ${selectedResult.exam}`}
          size="md"
        >
          <div className="space-y-4 pt-1">
            {/* Score Banner */}
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-cyan-950/40 border border-blue-200/80 dark:border-cyan-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Final Score
                </span>
                <p className="text-2xl font-black text-[#152234] dark:text-white font-display mt-0.5">
                  {selectedResult.score} / {selectedResult.maxScore} ({selectedResult.percentage}%)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Class Rank
                </span>
                <p className="text-2xl font-black text-[#0092E3] font-display mt-0.5">
                  #{selectedResult.rank}
                </p>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Topic Mastery Breakdown
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Algorithms & Complexity</span>
                    <span className="text-emerald-600 font-mono">95%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Database Indexing & Architecture</span>
                    <span className="text-[#0092E3] font-mono">88%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-[#0092E3] rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Networking Protocols</span>
                    <span className="text-amber-600 font-mono">75%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" onClick={() => setSelectedResult(null)} className="font-bold text-xs">
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
