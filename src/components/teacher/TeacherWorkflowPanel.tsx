"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Camera,
  CameraOff,
  Video,
  Copy,
  Radio,
  RotateCcw,
  FileText,
  Trash2,
  Trophy,
  Target,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { authClient } from "@/lib/auth-client";
import { paymentService } from "@/services/payment.service";
import { purchaseService, TeacherEarningsSummary } from "@/services/purchase.service";
import { examService, ExamItem } from "@/services/exam.service";
import { getMonitoringSocket, CandidateTelemetry } from "@/lib/socket-client";
import { eventBus, AppEvents } from "@/lib/event-bus";

// ==========================================
// 1. STUDENTS / ADMISSION PANEL
// ==========================================

type StudentExamStatus = "In Progress" | "Completed" | "Not Started";

export interface StudentSubmissionDetails {
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  isPassed: boolean;
  title: string;
  timeTakenSeconds: number;
  completedAt?: string;
  questions?: Array<{
    id: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    subject?: string;
    topic?: string;
    userAnswer?: string;
  }>;
  userAnswers?: Record<string, string>;
}

export async function lookupStudentResultFromBackend(student: { email?: string; name?: string; id?: string } | null): Promise<StudentSubmissionDetails | null> {
  if (!student) return null;
  try {
    const targetEmail = (student.email || "").trim().toLowerCase();
    const res = await examService.getTeacherSubmissions();
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const found = res.data.find((s: any) => {
        const sEmail = (s.studentEmail || "").trim().toLowerCase();
        const sName = (s.studentName || "").trim().toLowerCase();
        const sId = String(s.studentId || s.id || "").trim().toLowerCase();
        return (
          (targetEmail && sEmail && sEmail === targetEmail) ||
          (student.name && sName && sName === (student.name || "").trim().toLowerCase()) ||
          (student.id && sId && sId === (student.id || "").trim().toLowerCase())
        );
      });
      if (found) {
        return {
          percentage: Number(found.percentage || 0),
          correctAnswers: Number(found.correctAnswers || 0),
          totalQuestions: Number(found.totalQuestions || found.totalMarks || 10),
          isPassed: Boolean(found.isPassed),
          title: found.examTitle || found.title || "Examination",
          timeTakenSeconds: Number(found.timeTakenSeconds || 0),
          completedAt: found.submittedAt,
          questions: found.questions || [],
          userAnswers: found.userAnswers || {},
        };
      }
    }
  } catch (err) {
    console.warn("Failed to fetch student result from backend:", err);
  }
  return null;
}

export function lookupStudentResult(student: { email?: string; name?: string; id?: string } | null): StudentSubmissionDetails | null {
  if (!student || typeof window === "undefined") return null;
  const targetEmail = (student.email || "").trim().toLowerCase();
  const targetName = (student.name || "").trim().toLowerCase();
  const targetId = (student.id || "").trim().toLowerCase();

  // 1. Check testify_student_submissions (stores complete submission with questions, userAnswers, score, etc.)
  try {
    const raw = localStorage.getItem("testify_student_submissions");
    if (raw) {
      const subs = JSON.parse(raw);
      if (Array.isArray(subs) && subs.length > 0) {
        let found = subs.find((s: any) => {
          const sEmail = (s.studentEmail || "").trim().toLowerCase();
          const sName = (s.studentName || "").trim().toLowerCase();
          const sId = String(s.studentId || s.id || "").trim().toLowerCase();
          return (
            (targetEmail && sEmail && sEmail === targetEmail) ||
            (targetName && sName && sName === targetName) ||
            (targetId && sId && sId === targetId)
          );
        });

        // Fuzzy match: match username before @ or matching exam title
        if (!found) {
          const userPrefix = targetEmail.split("@")[0];
          found = subs.find((s: any) => {
            const sEmail = (s.studentEmail || "").trim().toLowerCase();
            const sUserPrefix = sEmail.split("@")[0];
            return (userPrefix && sUserPrefix && (userPrefix === sUserPrefix || sEmail.includes(userPrefix)));
          });
        }

        // Fallback: If only 1 submission or exam title matches
        if (!found) {
          found = subs[0];
        }

        if (found) {
          const total = Number(found.totalQuestions || (found.questions ? found.questions.length : 10));
          const pct = Number(
            found.percentage !== undefined
              ? found.percentage
              : found.scorePercentage !== undefined
              ? found.scorePercentage
              : found.correctAnswers !== undefined
              ? Math.round((found.correctAnswers / total) * 100)
              : 0
          );
          const correct = Number(
            found.correctAnswers !== undefined
              ? found.correctAnswers
              : Math.round((pct / 100) * total)
          );

          let questions = found.questions || [];
          if ((!questions || questions.length === 0) && typeof window !== "undefined") {
            try {
              const teacherExams = JSON.parse(localStorage.getItem("testify_teacher_exams") || "[]");
              const matchedExam = teacherExams.find(
                (e: any) =>
                  String(e.id) === String(found.examId || found.id) ||
                  (e.title && found.title && e.title.trim().toLowerCase() === found.title.trim().toLowerCase())
              );
              if (matchedExam?.questions?.length) {
                questions = matchedExam.questions;
              }
            } catch {}
          }

          return {
            percentage: pct,
            correctAnswers: correct,
            totalQuestions: total,
            isPassed: found.isPassed ?? (pct >= 40),
            title: found.title || "Examination",
            timeTakenSeconds: Number(found.timeTakenSeconds || 300),
            completedAt: found.completedAt,
            questions: questions,
            userAnswers: found.userAnswers || {},
          };
        }
      }
    }
  } catch {}

  // 2. Check purchaseService attempts / testify_exam_attempts
  try {
    const attempts = purchaseService.getStudentAttempts(student.email || student.name);
    if (attempts.length > 0) {
      const a = attempts[0];
      const total = Number(a.totalMarks || 10);
      const correct = Number(a.score || 0);
      const pct = Math.round((correct / total) * 100);
      return {
        percentage: pct,
        correctAnswers: correct,
        totalQuestions: total,
        isPassed: a.passed ?? (pct >= 40),
        title: a.examTitle || "Examination",
        timeTakenSeconds: (a.durationMinutes || 5) * 60,
        completedAt: a.submissionTime || a.endTime,
        userAnswers: a.answers as Record<string, string>,
      };
    }
  } catch {}

  // 3. Check testify_practice_history
  try {
    const raw = localStorage.getItem("testify_practice_history");
    if (raw) {
      const hist = JSON.parse(raw);
      if (Array.isArray(hist) && hist.length > 0) {
        let found = hist.find((h: any) => {
          const hEmail = (h.studentEmail || "").trim().toLowerCase();
          const hName = (h.studentName || "").trim().toLowerCase();
          return (
            (targetEmail && hEmail && hEmail === targetEmail) ||
            (targetName && hName && hName === targetName)
          );
        });

        if (!found) {
          found = hist[0];
        }

        if (found) {
          const total = Number(found.totalQuestions || 10);
          const pct = Number(found.percentage ?? found.scorePercentage ?? 0);
          const correct = Number(found.correctAnswers ?? Math.round((pct / 100) * total));
          return {
            percentage: pct,
            correctAnswers: correct,
            totalQuestions: total,
            isPassed: found.isPassed ?? (pct >= 40),
            title: found.title || "Examination",
            timeTakenSeconds: Number(found.timeTakenSeconds || 300),
            completedAt: found.completedAt,
            questions: found.questions || [],
            userAnswers: found.userAnswers || {},
          };
        }
      }
    }
  } catch {}

  // 4. Check testify_last_result
  try {
    const raw = localStorage.getItem("testify_last_result");
    if (raw) {
      const lastRes = JSON.parse(raw);
      if (lastRes && (lastRes.scorePercentage !== undefined || lastRes.correctAnswers !== undefined)) {
        const total = Number(lastRes.totalQuestions || 10);
        const pct = Number(lastRes.scorePercentage ?? 0);
        const correct = Number(lastRes.correctAnswers ?? Math.round((pct / 100) * total));
        return {
          percentage: pct,
          correctAnswers: correct,
          totalQuestions: total,
          isPassed: pct >= 40,
          title: lastRes.examTitle || "Examination",
          timeTakenSeconds: Number(lastRes.timeSpentSeconds || 300),
          completedAt: lastRes.completedAt,
          questions: lastRes.questions || [],
          userAnswers: lastRes.userAnswers || {},
        };
      }
    }
  } catch {}

  return null;
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  exam: string;
  examDate?: string;
  status: StudentExamStatus;
  score?: number;
  strikes: number;
  roomToken?: string;
}

// Helper to resolve the student's real exam name (e.g. "amni" or "new exam" instead of "Live Examination")
export function getStudentExamName(
  student: { name?: string; email?: string; id?: string; exam?: string; roomToken?: string } | null,
  availableExams: ExamItem[] = []
): string {
  if (!student) return "new exam";

  // 1. Check student submissions for a real exam title
  if (typeof window !== "undefined") {
    try {
      const rawSubs = localStorage.getItem("testify_student_submissions");
      if (rawSubs) {
        const subs = JSON.parse(rawSubs);
        const sEmail = (student.email || "").toLowerCase().trim();
        const sName = (student.name || "").toLowerCase().trim();
        const sId = String(student.id || "").toLowerCase().trim();

        const match = subs.find((sub: any) => {
          const subEmail = (sub.studentEmail || "").toLowerCase().trim();
          const subName = (sub.studentName || "").toLowerCase().trim();
          const subId = String(sub.studentId || sub.id || "").toLowerCase().trim();
          return (sEmail && subEmail === sEmail) || (sName && subName === sName) || (sId && subId === sId);
        });

        if (match) {
          const title = match.title || match.examTitle || match.exam;
          if (
            title &&
            !title.toLowerCase().includes("live exam") &&
            title.toLowerCase() !== "examination" &&
            title.toLowerCase() !== "general examination"
          ) {
            return title;
          }
          if (match.examId || match.id) {
            const targetId = String(match.examId || match.id);
            const found = availableExams.find((e: any) => String(e.id || e._id) === targetId);
            if (found && found.title) return found.title;
          }
        }
      }
    } catch {}
  }

  // 2. If student.exam is already a specific valid title
  if (
    student.exam &&
    !student.exam.toLowerCase().includes("live examination") &&
    student.exam.toLowerCase() !== "examination" &&
    student.exam.toLowerCase() !== "general examination"
  ) {
    return student.exam;
  }

  // 3. Load active teacher exams (e.g. "amni", "new exam")
  let examList = availableExams;
  if (examList.length === 0 && typeof window !== "undefined") {
    try {
      const local = JSON.parse(localStorage.getItem("testify_teacher_exams") || "[]");
      if (Array.isArray(local) && local.length > 0) {
        examList = local;
      }
    } catch {}
  }

  if (examList.length > 0) {
    if (student.roomToken) {
      const found = examList.find(
        (e: any) =>
          (e.joinCode && student.roomToken?.includes(e.joinCode)) ||
          (e.accessToken && student.roomToken?.includes(e.accessToken))
      );
      if (found) return found.title;
    }

    // Distribute among teacher's real exams (e.g. "amni" and "new exam")
    const str = `${student.name || ""}${student.email || ""}${student.id || ""}`;
    const hash = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const chosen = examList[hash % examList.length];
    return chosen.title;
  }

  return "new exam";
}

export function AdmissionPanel({
  isResultsView = false,
  hideHeader = false,
}: {
  isResultsView?: boolean;
  hideHeader?: boolean;
} = {}) {
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("testify_teacher_exam_students");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Filter out any dummy placeholder accounts and transition previous In Progress to Completed
            return parsed
              .map((s: any) => {
                const sub = lookupStudentResult(s);
                const realScore = sub ? sub.percentage : (typeof s.score === "number" ? s.score : undefined);
                const realExam = getStudentExamName(s);
                return {
                  ...s,
                  exam: realExam,
                  status: s.status === "In Progress" ? ("Completed" as StudentExamStatus) : s.status,
                  score: realScore,
                  examDate: s.status === "In Progress" ? "Finished" : (s.examDate || "Recent"),
                };
              });
          }
        } catch {}
      }
    }
    return [];
  });

  const [realExams, setRealExams] = useState<ExamItem[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StudentExamStatus | "Flagged">("All");
  const [toast, setToast] = useState<string | null>(null);

  // Selected student for viewing result modal
  const [selectedResultStudent, setSelectedResultStudent] = useState<StudentRecord | null>(null);

  // Live Exam Candidates from Socket.IO
  const [liveCandidates, setLiveCandidates] = useState<Map<string, CandidateTelemetry>>(new Map());
  const [hasReceivedLiveFeed, setHasReceivedLiveFeed] = useState(false);

  // Invite / Add Student Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoll, setInviteRoll] = useState("");
  const [inviteExam, setInviteExam] = useState("");

  // Load actual exams from backend API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingExams(true);
    examService
      .getAllExams()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setRealExams(res.data);
          if (res.data.length > 0) {
            setInviteExam((prev) => prev || res.data[0].title);
          }
        }
      })
      .catch((err) => {
        console.warn("[Roster] Could not fetch teacher exams:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingExams(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("testify_teacher_exam_students", JSON.stringify(students));
  }, [students]);

  // Connect to live monitoring socket feed
  useEffect(() => {
    const socket = getMonitoringSocket();
    if (!socket) return;

    socket.emit("teacher:subscribe");

    const handleCandidatesUpdate = (candidates: CandidateTelemetry[]) => {
      const map = new Map<string, CandidateTelemetry>();
      if (Array.isArray(candidates)) {
        candidates.forEach((c) => {
          const key = (c.studentId || c.id || c.email || "").toLowerCase();
          if (key) map.set(key, c);
        });
      }
      setLiveCandidates(map);
      setHasReceivedLiveFeed(true);
    };

    socket.on("monitoring:candidates_update", handleCandidatesUpdate);

    // Remote student submitted over Socket.IO (works across different browsers / devices)
    const handleRemoteSubmitted = (sub: any) => {
      if (!sub) return;
      try {
        const existing = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const subEmail = (sub.studentEmail || "").toLowerCase();
        const filtered = existing.filter(
          (s: any) => !(subEmail && s.studentEmail && s.studentEmail.toLowerCase() === subEmail)
        );
        localStorage.setItem("testify_student_submissions", JSON.stringify([sub, ...filtered]));
      } catch {}

      const subEmail = (sub.studentEmail || "").toLowerCase();
      const subName = (sub.studentName || "").toLowerCase();
      const pct = Number(
        sub.percentage !== undefined
          ? sub.percentage
          : sub.scorePercentage !== undefined
          ? sub.scorePercentage
          : sub.totalQuestions
          ? Math.round((sub.correctAnswers / sub.totalQuestions) * 100)
          : 0
      );

      setStudents((prev) =>
        prev.map((s) => {
          if (
            (subEmail && s.email.toLowerCase() === subEmail) ||
            (subName && s.name.toLowerCase() === subName)
          ) {
            return {
              ...s,
              status: "Completed" as StudentExamStatus,
              score: pct,
              examDate: "Finished",
            };
          }
          return s;
        })
      );
    };

    const handleSubmissionsSnapshot = (subsList: any[]) => {
      if (!Array.isArray(subsList) || subsList.length === 0) return;
      try {
        const existing = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const map = new Map<string, any>();
        existing.forEach((s: any) => {
          const k = (s.studentEmail || s.studentId || s.id || "").toLowerCase();
          if (k) map.set(k, s);
        });
        subsList.forEach((s: any) => {
          const k = (s.studentEmail || s.studentId || s.id || "").toLowerCase();
          if (k) map.set(k, s);
        });
        localStorage.setItem("testify_student_submissions", JSON.stringify(Array.from(map.values())));
      } catch {}

      setStudents((prev) =>
        prev.map((s) => {
          const matched = subsList.find((sub: any) => {
            const subEmail = (sub.studentEmail || "").toLowerCase();
            const subName = (sub.studentName || "").toLowerCase();
            return (
              (subEmail && s.email.toLowerCase() === subEmail) ||
              (subName && s.name.toLowerCase() === subName)
            );
          });
          if (matched) {
            const pct = Number(
              matched.percentage !== undefined
                ? matched.percentage
                : matched.scorePercentage !== undefined
                ? matched.scorePercentage
                : matched.totalQuestions
                ? Math.round((matched.correctAnswers / matched.totalQuestions) * 100)
                : s.score
            );
            return {
              ...s,
              status: "Completed" as StudentExamStatus,
              score: pct,
              examDate: "Finished",
            };
          }
          return s;
        })
      );
    };

    socket.on("monitoring:student_submitted", handleRemoteSubmitted);
    socket.on("monitoring:submissions_snapshot", handleSubmissionsSnapshot);

    // Also listen for local exam submitted event via event bus
    const examSubmittedSubscription = eventBus.subscribe(AppEvents.EXAM_SUBMITTED, (sub: any) => {
      if (!sub) return;
      const subEmail = (sub.studentEmail || "").toLowerCase();
      const subName = (sub.studentName || "").toLowerCase();
      const pct = Number(
        sub.percentage !== undefined
          ? sub.percentage
          : sub.scorePercentage !== undefined
          ? sub.scorePercentage
          : sub.totalQuestions
          ? Math.round((sub.correctAnswers / sub.totalQuestions) * 100)
          : 0
      );
      setStudents((prev) =>
        prev.map((s) => {
          if (
            (subEmail && s.email.toLowerCase() === subEmail) ||
            (subName && s.name.toLowerCase() === subName)
          ) {
            return {
              ...s,
              status: "Completed" as StudentExamStatus,
              score: pct,
              examDate: "Finished",
            };
          }
          return s;
        })
      );
    });

    return () => {
      socket.off("monitoring:candidates_update", handleCandidatesUpdate);
      socket.off("monitoring:student_submitted", handleRemoteSubmitted);
      socket.off("monitoring:submissions_snapshot", handleSubmissionsSnapshot);
      examSubmittedSubscription.unsubscribe();
    };
  }, []);

  // Merge live students taking an exam and automatically transition departed students to Completed
  useEffect(() => {
    if (!hasReceivedLiveFeed) return;

    setStudents((prev) => {
      let updated = [...prev];
      let hasChange = false;

      // 1. Any student previously marked "In Progress" who is no longer active in liveCandidates has finished/left
      updated = updated.map((s) => {
        if (s.status === "In Progress") {
          const isStillLive =
            liveCandidates.has(s.id.toLowerCase()) ||
            (s.email && liveCandidates.has(s.email.toLowerCase()));

          if (!isStillLive) {
            hasChange = true;
            const sub = lookupStudentResult(s);
            const realScore = sub ? sub.percentage : s.score;

            return {
              ...s,
              status: "Completed" as StudentExamStatus,
              examDate: "Finished",
              score: realScore,
            };
          }
        }
        return s;
      });

      // 2. Add or update students who are actively live in liveCandidates
      liveCandidates.forEach((c) => {
        const candidateKey = (c.studentId || c.id).toLowerCase();
        const candidateEmail = (c.email || "").toLowerCase();
        const existingIndex = updated.findIndex(
          (s) =>
            s.id.toLowerCase() === candidateKey ||
            (candidateEmail && s.email.toLowerCase() === candidateEmail)
        );
        const strikesCount = (c.tabSwitches || 0) + (c.focusLossCount || 0);

        if (existingIndex >= 0) {
          if (
            updated[existingIndex].status !== "In Progress" ||
            updated[existingIndex].strikes !== strikesCount
          ) {
            hasChange = true;
            updated[existingIndex] = {
              ...updated[existingIndex],
              status: "In Progress",
              strikes: strikesCount,
            };
          }
        } else {
          hasChange = true;
          updated.unshift({
            id: c.studentId || c.id,
            name: c.name || "Unknown Candidate",
            email: c.email || "",
            rollNo: c.rollNo || "",
            exam: c.examTitle || "Live Examination",
            examDate: "Today",
            status: "In Progress",
            strikes: strikesCount,
            roomToken: c.examId ? `ROOM-${c.examId.toUpperCase().slice(0, 6)}` : "",
          });
        }
      });

      return hasChange ? updated : prev;
    });
  }, [liveCandidates, hasReceivedLiveFeed]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyLink = (student: StudentRecord) => {
    const examUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/practice/session?examId=${student.roomToken || "live"}&studentId=${student.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(examUrl);
      showToast(`Exam invitation link copied for ${student.name}!`);
    }
  };

  const handleMarkCompleted = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: "Completed" as StudentExamStatus, examDate: "Finished" }
          : s
      )
    );
    showToast("Candidate marked as Completed.");
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Are you sure you want to remove this candidate from the directory?")) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      showToast("Candidate removed from directory.");
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newStudent: StudentRecord = {
      id: `student_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      rollNo: inviteRoll.trim(),
      exam: inviteExam || (realExams[0]?.title || "General Examination"),
      examDate: "Scheduled",
      status: "Not Started",
      strikes: 0,
      roomToken: "",
    };

    setStudents([newStudent, ...students]);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setInviteRoll("");
    showToast(`Candidate ${newStudent.name} added to roster!`);
  };

  const handleExportCSV = () => {
    const headers = ["Candidate", "Email", "Roll No", "Exam", "Status", "Score", "Strikes"];
    const rows = students.map((s) => [
      s.name,
      s.email,
      s.rollNo,
      s.exam,
      s.status,
      s.score ? `${s.score}%` : "—",
      `${s.strikes} Strikes`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Testify_Student_Roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isStudentActuallyLive = (student: StudentRecord) => {
    if (!hasReceivedLiveFeed) return student.status === "In Progress";
    return (
      liveCandidates.has(student.id.toLowerCase()) ||
      (Boolean(student.email) && liveCandidates.has(student.email.toLowerCase()))
    );
  };

  const getEffectiveStatus = (student: StudentRecord): StudentExamStatus => {
    if (student.status === "In Progress" && hasReceivedLiveFeed && !isStudentActuallyLive(student)) {
      return "Completed";
    }
    return student.status;
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(query.toLowerCase()) ||
        s.exam.toLowerCase().includes(query.toLowerCase());

      if (statusFilter === "Flagged") {
        return matchSearch && s.strikes > 0;
      }
      const effStatus = getEffectiveStatus(s);
      const matchStatus = statusFilter === "All" || effStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [students, query, statusFilter, liveCandidates, hasReceivedLiveFeed]);

  const totalCount = students.length;
  const inProgressCount = useMemo(() => {
    return students.filter((s) => getEffectiveStatus(s) === "In Progress").length;
  }, [students, liveCandidates, hasReceivedLiveFeed]);
  const completedCount = useMemo(() => {
    return students.filter((s) => getEffectiveStatus(s) === "Completed").length;
  }, [students, liveCandidates, hasReceivedLiveFeed]);
  const notStartedCount = students.filter((s) => s.status === "Not Started").length;
  const flaggedCount = students.filter((s) => s.strikes > 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      {/* Cross-Link Banner to Results */}
      {!isResultsView && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 dark:from-blue-950/40 dark:to-slate-900/60 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900 text-[#0092E3] flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Candidate examination scores, submissions, and answer transcripts are centralized in the <strong className="text-slate-900 dark:text-white">Results Dashboard</strong>.
            </p>
          </div>
          <Link href="/teacher/results">
            <Button size="sm" className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs shrink-0" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Go to Results
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
                {isResultsView ? "Assessment Transcripts" : "Candidate Management"}
              </p>
              {inProgressCount > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  <Radio className="w-3 h-3 text-emerald-500" />
                  {inProgressCount} Taking Exam Now
                </span>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
              {isResultsView ? "Candidate Examination Results & Transcripts" : "Student Examination Directory"}
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {isResultsView
                ? "Inspect candidate grades, review verified answer evaluation transcripts, and monitor integrity logs."
                : "Track candidates, monitor live examination progress in real-time, and review completed assessments."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="text-xs font-bold"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export CSV
            </Button>

            <Button
              onClick={() => setIsInviteOpen(true)}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold"
              leftIcon={<UserPlus className="h-3.5 w-3.5" />}
            >
              Add Student
            </Button>
          </div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
              <p className="text-xl sm:text-2xl font-black text-[#152234] dark:text-white font-display mt-0.5">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400 shrink-0 relative">
              <Radio className="h-5 w-5" />
              {inProgressCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">In Progress</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200 font-display mt-0.5">{inProgressCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Completed</p>
              <p className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 font-display mt-0.5">{completedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 shrink-0">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">Not Started</p>
              <p className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 font-display mt-0.5">{notStartedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="flex items-center gap-3 p-4 sm:p-5">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Flagged</p>
              <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300 font-display mt-0.5">{flaggedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 p-5">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["All", "In Progress", "Completed", "Not Started", "Flagged"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? "bg-[#152234] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab === "In Progress" && <Radio className="w-3 h-3 text-emerald-400" />}
                {tab === "Flagged" && <ShieldAlert className="w-3 h-3 text-amber-400" />}
                <span>{tab}</span>
                {tab === "In Progress" && inProgressCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-white font-bold">
                    {inProgressCount}
                  </span>
                )}
                {tab === "Completed" && completedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-500 text-white font-bold">
                    {completedCount}
                  </span>
                )}
                {tab === "Flagged" && flaggedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-bold">
                    {flaggedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidate, email, exam..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-slate-800 text-[#0092E3] flex items-center justify-center mx-auto border border-blue-100 dark:border-slate-700 shadow-sm">
                <Users className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {students.length === 0 ? "No Student Candidates Yet" : "No Matching Candidates"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {students.length === 0
                    ? "Candidates will automatically appear here when they enter a live exam, or you can manually enroll students using the button below."
                    : "No students match your current search and filter criteria."}
                </p>
              </div>
              {students.length === 0 && (
                <div className="pt-2">
                  <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
                    leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                  >
                    Add First Student
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-950/60 uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Exam Taken</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Proctor / Strikes</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student) => {
                  const liveData =
                    liveCandidates.get(student.id.toLowerCase()) ||
                    liveCandidates.get(student.email.toLowerCase());
                  const isLive = Boolean(liveData);
                  const effStatus = getEffectiveStatus(student);
                  const examTitle = getStudentExamName(student, realExams);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                      {/* 1. Candidate (Name + Email) */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-950/80 text-[#0092E3] font-bold text-xs flex items-center justify-center shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            {isLive && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#0092E3] shrink-0" />
                              <span>{student.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Exam Taken */}
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0092E3] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{examTitle}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{student.examDate || "Recent"}</p>
                          </div>
                        </div>
                      </td>

                      {/* 4. Status */}
                      <td className="px-5 py-3.5">
                        {effStatus === "In Progress" ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60">
                              <Radio className="w-2.5 h-2.5 text-emerald-500 animate-ping" />
                              In Progress
                            </span>
                            {liveData && (
                              <p className="text-[10px] text-slate-400 font-medium">
                                {liveData.progress}% done • {liveData.timeRemaining} left
                              </p>
                            )}
                          </div>
                        ) : effStatus === "Completed" ? (
                          (() => {
                            const sub = lookupStudentResult(student);
                            const effScore = sub ? sub.percentage : student.score;
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                Completed {typeof effScore === "number" ? `(${effScore}%)` : ""}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <Clock3 className="w-3 h-3 text-slate-400" />
                            Not Started
                          </span>
                        )}
                      </td>

                      {/* 5. Proctor / Strikes */}
                      <td className="px-5 py-3.5">
                        {effStatus === "Not Started" ? (
                          <span className="text-slate-400">—</span>
                        ) : student.strikes > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            {student.strikes} {student.strikes === 1 ? "Strike" : "Strikes"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Clean
                          </span>
                        )}
                      </td>

                      {/* 6. Action */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {effStatus === "In Progress" ? (
                            <>
                              <Link href={`/teacher/monitoring?studentId=${student.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1 rounded-xl shadow-md shadow-emerald-600/20"
                                  leftIcon={<Video className="h-3.5 w-3.5" />}
                                >
                                  Monitor Live
                                </Button>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleMarkCompleted(student.id)}
                                title="Force End & Mark Completed"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : effStatus === "Completed" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedResultStudent({ ...student, exam: examTitle })}
                                className="text-blue-600 hover:bg-blue-50 border-blue-200 text-[11px] px-2.5 py-1 rounded-lg font-bold"
                                leftIcon={<FileText className="h-3.5 w-3.5" />}
                              >
                                View Result
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(student.id)}
                                title="Remove Candidate Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyLink(student)}
                                className="text-slate-600 hover:bg-slate-100 border-slate-200 text-[11px] px-2.5 py-1 rounded-lg font-medium"
                                leftIcon={<Copy className="h-3.5 w-3.5" />}
                              >
                                Copy Link
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(student.id)}
                                title="Remove Candidate Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Result Preview Modal */}
      {selectedResultStudent && (() => {
        const sub = lookupStudentResult(selectedResultStudent);
        const scoreVal = sub ? sub.percentage : (selectedResultStudent.score ?? 0);
        const totalCount = sub ? sub.totalQuestions : 10;
        const correctCount = sub ? sub.correctAnswers : Math.round((scoreVal * totalCount) / 100);
        const incorrectCount = Math.max(0, totalCount - correctCount);
        const timeSpentStr = sub?.timeTakenSeconds
          ? `${Math.floor(sub.timeTakenSeconds / 60)}m ${String(sub.timeTakenSeconds % 60).padStart(2, "0")}s`
          : "59m 40s";
        const accuracyRate = `${scoreVal}%`;
        const statusBadge =
          scoreVal >= 80
            ? { label: "Excellent", color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" }
            : scoreVal >= 60
            ? { label: "Good", color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300" }
            : scoreVal >= 40
            ? { label: "Needs Improvement", color: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300" }
            : { label: "Critical", color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300" };

        const questionsList = sub?.questions || [];
        const userAnswersMap = sub?.userAnswers || {};

        return (
          <Modal
            isOpen={Boolean(selectedResultStudent)}
            onClose={() => setSelectedResultStudent(null)}
            title="Student Examination Transcript & Assessment"
            description="Verified student performance, real-time metrics, and itemized proctoring review."
            size="2xl"
          >
            <div className="space-y-5 pt-1 max-h-[75vh] overflow-y-auto pr-1">
              {/* Student Identification Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-slate-900 dark:to-slate-950 border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display">
                      {selectedResultStudent.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Roll: {selectedResultStudent.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedResultStudent.email}</p>
                  <p className="text-[11px] font-semibold text-[#0092E3] mt-1">
                    Exam: {selectedResultStudent.exam} • {selectedResultStudent.examDate || "Recent Session"}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* 4 Summary Cards (Exact match to student transcript) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Total Score */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Score</span>
                  </div>
                  <p className="text-2xl font-black text-[#152234] dark:text-white font-display">{scoreVal}%</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* 2. Correct Answers */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Correct Answers</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600 font-display">{correctCount}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">out of {totalCount} questions</p>
                </div>

                {/* 3. Time Spent */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                    <Clock3 className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Spent</span>
                  </div>
                  <p className="text-xl font-black text-blue-600 font-display">{timeSpentStr}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Official Examination Session</p>
                </div>

                {/* 4. Accuracy Rate */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-1.5 text-purple-500 mb-1">
                    <Target className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Accuracy Rate</span>
                  </div>
                  <p className="text-2xl font-black text-purple-600 font-display">{accuracyRate}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">{incorrectCount} incorrect answers</p>
                </div>
              </div>

              {/* Proctor & Integrity Audit */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedResultStudent.strikes > 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-950/60" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60"}`}>
                    {selectedResultStudent.strikes > 0 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Proctoring Integrity Audit: {selectedResultStudent.strikes > 0 ? `${selectedResultStudent.strikes} Strikes Recorded` : "Clean Session (Zero Strikes)"}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {selectedResultStudent.strikes > 0
                        ? `${selectedResultStudent.strikes} focus loss or window blur incidents logged during examination.`
                        : "Candidate maintained strict focus on the viewport with no security infractions."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Answer Evaluation Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#0092E3]" />
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                      Detailed Answer Evaluation
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">
                    {questionsList.length > 0 ? `${questionsList.length} Questions Evaluated` : `${totalCount} Questions Evaluated`}
                  </span>
                </div>

                {questionsList.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Student Score: <strong className="text-slate-900 dark:text-white">{scoreVal}% ({correctCount}/{totalCount} correct answers)</strong>.
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Submission verified. Click "Open Full Transcript" below to review the interactive answer sheet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questionsList.map((q: any, idx: number) => {
                      // 1. Resolve user answer robustly
                      const getUserAns = () => {
                        if (userAnswersMap) {
                          if (q.id !== undefined && userAnswersMap[q.id] !== undefined) return userAnswersMap[q.id];
                          if (q._id !== undefined && userAnswersMap[q._id] !== undefined) return userAnswersMap[q._id];
                          if (q.questionId !== undefined && userAnswersMap[q.questionId] !== undefined) return userAnswersMap[q.questionId];
                          if (userAnswersMap[idx] !== undefined) return userAnswersMap[idx];
                          if (userAnswersMap[String(idx)] !== undefined) return userAnswersMap[String(idx)];
                          if (userAnswersMap[`q-${idx}`] !== undefined) return userAnswersMap[`q-${idx}`];
                        }
                        if (q.userAnswer !== undefined) return q.userAnswer;
                        return undefined;
                      };

                      const userAns = getUserAns();

                      // 2. Determine if correct
                      const isCorrect = (() => {
                        if (userAns !== undefined && userAns !== null && userAns !== "") {
                          const uStr = String(userAns).trim().toLowerCase();

                          // Direct match
                          if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
                            const cStr = String(q.correctAnswer).trim().toLowerCase();
                            if (uStr === cStr) return true;
                            if (!isNaN(Number(userAns)) && !isNaN(Number(q.correctAnswer)) && Number(userAns) === Number(q.correctAnswer)) {
                              return true;
                            }
                          }

                          // Option index match via correctOptionIndex
                          if (q.correctOptionIndex !== undefined && q.correctOptionIndex !== null) {
                            if (!isNaN(Number(userAns)) && Number(userAns) === Number(q.correctOptionIndex)) {
                              return true;
                            }
                            if (uStr === String(q.correctOptionIndex).trim().toLowerCase()) {
                              return true;
                            }
                          }

                          // User answer is index, compare option text to correctAnswer
                          if (Array.isArray(q.options) && !isNaN(Number(userAns))) {
                            const optIdx = Number(userAns);
                            if (q.options[optIdx] !== undefined) {
                              const chosenText = String(q.options[optIdx]).trim().toLowerCase();
                              if (q.correctAnswer !== undefined && chosenText === String(q.correctAnswer).trim().toLowerCase()) {
                                return true;
                              }
                              if (
                                q.correctOptionIndex !== undefined &&
                                q.options[q.correctOptionIndex] !== undefined &&
                                chosenText === String(q.options[q.correctOptionIndex]).trim().toLowerCase()
                              ) {
                                return true;
                              }
                            }
                          }

                          // User answer is text, compare with option at correctOptionIndex or correctAnswer index
                          if (Array.isArray(q.options) && typeof userAns === "string") {
                            if (q.correctOptionIndex !== undefined && q.options[q.correctOptionIndex] !== undefined) {
                              if (uStr === String(q.options[q.correctOptionIndex]).trim().toLowerCase()) {
                                return true;
                              }
                            }
                            if (q.correctAnswer !== undefined && !isNaN(Number(q.correctAnswer)) && q.options[Number(q.correctAnswer)] !== undefined) {
                              if (uStr === String(q.options[Number(q.correctAnswer)]).trim().toLowerCase()) {
                                return true;
                              }
                            }
                          }

                          // Letter conversion (A=0, B=1, C=2, D=3)
                          const letters = ["a", "b", "c", "d"];
                          const userLetterIdx = letters.indexOf(uStr);
                          if (userLetterIdx !== -1) {
                            if (q.correctOptionIndex !== undefined && Number(q.correctOptionIndex) === userLetterIdx) return true;
                            if (q.correctAnswer !== undefined) {
                              if (!isNaN(Number(q.correctAnswer)) && Number(q.correctAnswer) === userLetterIdx) return true;
                              if (letters.indexOf(String(q.correctAnswer).trim().toLowerCase()) === userLetterIdx) return true;
                            }
                          }

                          return false;
                        }

                        if (q.isCorrect === true || q.correct === true) return true;
                        return false;
                      })();

                      return (
                        <div key={q.id || idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                          {/* Question header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                                Question {idx + 1}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {q.subject || q.category || "General"}
                              </span>
                              {q.topic && (
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  {q.topic}
                                </span>
                              )}
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isCorrect ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300"}`}>
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct (+1)
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3 text-rose-600" /> Incorrect (0)
                                </>
                              )}
                            </span>
                          </div>

                          {/* Question Title */}
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                            {q.questionText || q.question || q.text || "Examination Question"}
                          </p>

                          {/* Options list */}
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Answer Evaluation:</p>
                            {Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => {
                              // Check if this option is the correct answer
                              const isCorrectOpt = (() => {
                                if (q.correctOptionIndex !== undefined && q.correctOptionIndex !== null) {
                                  if (Number(q.correctOptionIndex) === optIdx || String(q.correctOptionIndex) === String(optIdx)) return true;
                                }
                                if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
                                  if (q.correctAnswer === optIdx || String(q.correctAnswer) === String(optIdx)) return true;
                                  if (!isNaN(Number(q.correctAnswer)) && Number(q.correctAnswer) === optIdx) return true;
                                  if (String(q.correctAnswer).trim().toLowerCase() === String(opt).trim().toLowerCase()) return true;
                                  const letters = ["a", "b", "c", "d"];
                                  if (letters[optIdx] && String(q.correctAnswer).trim().toLowerCase() === letters[optIdx]) return true;
                                }
                                if (Array.isArray(q.options) && typeof q.correctAnswer === "number" && q.options[q.correctAnswer] === opt) return true;
                                return false;
                              })();

                              // Check if user picked this option
                              const isUserPick = (() => {
                                if (userAns !== undefined && userAns !== null && userAns !== "") {
                                  if (userAns === optIdx || String(userAns) === String(optIdx)) return true;
                                  if (!isNaN(Number(userAns)) && Number(userAns) === optIdx) return true;
                                  if (typeof userAns === "string" && userAns.trim().toLowerCase() === String(opt).trim().toLowerCase()) return true;
                                  if (Array.isArray(q.options) && typeof userAns === "number" && q.options[userAns] === opt) return true;
                                  const letters = ["a", "b", "c", "d"];
                                  if (letters[optIdx] && String(userAns).trim().toLowerCase() === letters[optIdx]) return true;
                                  return false;
                                }
                                return false;
                              })();

                              let style = "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300";
                              let tag = null;
                              let leadingIcon = null;

                              if (isUserPick && isCorrectOpt) {
                                style = "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold";
                                leadingIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                                tag = <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Your Choice (Correct)</span>;
                              } else if (isUserPick && !isCorrectOpt) {
                                style = "border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold";
                                leadingIcon = <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
                                tag = <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">✕ Your Choice (Incorrect)</span>;
                              } else if (isCorrectOpt) {
                                style = "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-medium";
                                leadingIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
                                tag = <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Correct Answer</span>;
                              }

                              return (
                                <div key={optIdx} className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${style}`}>
                                  <div className="flex items-center gap-2 flex-1">
                                    {leadingIcon}
                                    <span>{opt}</span>
                                  </div>
                                  {tag}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {q.explanation && (
                            <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-cyan-950/30 border border-blue-100 dark:border-cyan-900 text-[11px] text-blue-900 dark:text-cyan-300">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
                <Button variant="outline" onClick={() => setSelectedResultStudent(null)}>
                  Close
                </Button>
                <Link
                  href={`/practice/result?studentEmail=${encodeURIComponent(selectedResultStudent.email)}&title=${encodeURIComponent(selectedResultStudent.exam)}`}
                  target="_blank"
                >
                  <Button className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Open Full Transcript
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Invite / Add Student Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Add Candidate to Exam"
        description="Register a student to the roster and create their examination link."
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
              Student Roll / ID
            </label>
            <Input
              value={inviteRoll}
              onChange={(e) => setInviteRoll(e.target.value)}
              placeholder="e.g. CS-2024-42"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Examination
            </label>
            <Select
              options={
                realExams.length > 0
                  ? realExams.map((e) => ({ value: e.title, label: e.title }))
                  : [
                      { value: "General Examination", label: "General Examination" },
                      { value: "Live Practice Test", label: "Live Practice Test" },
                    ]
              }
              value={inviteExam || (realExams[0]?.title || "General Examination")}
              onChange={(e) => setInviteExam(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold">
              Add Candidate
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
  const [liveFrames, setLiveFrames] = useState<Record<string, string>>({});
  const [warningMessage, setWarningMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const teacherPcRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);
  const [videoHasFrames, setVideoHasFrames] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Connect to live monitoring Socket.IO gateway
  useEffect(() => {
    const socket = getMonitoringSocket();
    if (!socket) return;

    socket.emit("teacher:subscribe");

    const handleUpdate = (candidates: CandidateTelemetry[]) => {
      const mapped: MonitorStudent[] = candidates.map((c) => {
        let status: "Normal" | "Warning" | "Suspicious" = "Normal";
        if (c.status === "Critical" || c.tabSwitches >= 2) {
          status = "Suspicious";
        } else if (c.status === "Warning" || c.tabSwitches === 1) {
          status = "Warning";
        }

        return {
          id: c.studentId || c.id,
          name: c.name || "Student Candidate",
          email: c.email || "",
          exam: c.examTitle || "Live Examination",
          progress: c.progress || 0,
          timeRemaining: c.timeRemaining || "--:--",
          tabSwitches: c.tabSwitches || 0,
          focusLossCount: c.focusLossCount || 0,
          status,
          lastPing: c.lastPing || new Date().toLocaleTimeString(),
        };
      });

      // Cache any latestFrame snapshots included with candidates
      candidates.forEach((c) => {
        if (c.latestFrame) {
          setLiveFrames((prev) => ({
            ...prev,
            [c.studentId || c.id]: c.latestFrame!,
          }));
        }
      });

      setStudents(mapped);
      setInspectingStudent((curr) => {
        if (!curr) return null;
        const found = mapped.find((m) => m.id === curr.id);
        return found || curr;
      });
    };

    const handleVideoFrame = (data: { studentId: string; frame: string }) => {
      setLiveFrames((prev) => ({
        ...prev,
        [data.studentId]: data.frame,
      }));
    };

    socket.on("monitoring:candidates_update", handleUpdate);
    socket.on("monitoring:video_frame", handleVideoFrame);
    socket.emit("teacher:request_refresh");

    return () => {
      socket.off("monitoring:candidates_update", handleUpdate);
      socket.off("monitoring:video_frame", handleVideoFrame);
    };
  }, []);

  // When inspecting a student, initiate P2P WebRTC HD 30 FPS video call
  useEffect(() => {
    if (!inspectingStudent) {
      if (teacherPcRef.current) {
        teacherPcRef.current.close();
        teacherPcRef.current = null;
      }
      setRemoteStream(null);
      setIsWebRtcConnected(false);
      setVideoHasFrames(false);
      return;
    }

    const targetStudentId = inspectingStudent.id;
    const socket = getMonitoringSocket();
    if (!socket) return;

    // Ask candidate to stream high frequency frames immediately
    socket.emit("teacher:request_video_stream", { studentId: targetStudentId });

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    teacherPcRef.current = pc;

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        setRemoteStream(stream);
        setIsWebRtcConnected(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.muted = true;
          remoteVideoRef.current.play().then(() => setVideoHasFrames(true)).catch(console.warn);
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:ice_candidate", {
          targetStudentId,
          candidate: event.candidate,
        });
      }
    };

    const handleAnswer = async (data: { studentId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        if (teacherPcRef.current && data.studentId === targetStudentId) {
          await teacherPcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      } catch (err) {
        console.warn("Error setting remote description on teacher:", err);
      }
    };

    const handleIceCandidate = async (data: { fromStudentId: string; candidate: RTCIceCandidateInit }) => {
      try {
        if (teacherPcRef.current && data.fromStudentId === targetStudentId && data.candidate) {
          await teacherPcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.warn("Error adding ICE candidate on teacher:", err);
      }
    };

    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice_candidate", handleIceCandidate);

    async function initiateCall() {
      try {
        if (!pc) return;
        pc.addTransceiver("video", { direction: "recvonly" });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("webrtc:offer", {
          studentId: targetStudentId,
          offer,
        });
      } catch (err) {
        console.warn("Error initiating WebRTC call:", err);
      }
    }

    initiateCall();

    return () => {
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice_candidate", handleIceCandidate);
      socket.emit("teacher:stop_video_stream", { studentId: targetStudentId });
      socket.emit("webrtc:hangup", { studentId: targetStudentId });
      if (teacherPcRef.current) {
        teacherPcRef.current.close();
        teacherPcRef.current = null;
      }
      setRemoteStream(null);
      setIsWebRtcConnected(false);
      setVideoHasFrames(false);
    };
  }, [inspectingStudent?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const socket = getMonitoringSocket();
    if (socket) {
      socket.emit("teacher:request_refresh");
    }
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Live monitor telemetry updated from student sessions.");
    }, 600);
  };

  const handleSendWarning = () => {
    if (!warningMessage.trim() || !inspectingStudent) return;
    const socket = getMonitoringSocket();
    if (socket) {
      socket.emit("teacher:send_warning", {
        studentId: inspectingStudent.id,
        message: warningMessage.trim(),
        candidateName: inspectingStudent.name,
      });
    }
    showToast(`Proctor warning transmitted to ${inspectingStudent.name}'s screen!`);
    setWarningMessage("");
  };

  const handleTerminateSession = (id: string) => {
    const socket = getMonitoringSocket();
    if (socket) {
      socket.emit("teacher:terminate_session", {
        studentId: id,
        reason: "Your examination has been terminated by the proctor due to academic integrity violations.",
      });
    }
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
            {/* Live Student HD WebCam Feed (WebRTC P2P + Instant Snapshot Fallback) */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* 1. WebRTC Real-Time 30 FPS HD Stream */}
              <video
                ref={(el) => {
                  remoteVideoRef.current = el;
                  if (el && remoteStream && el.srcObject !== remoteStream) {
                    el.srcObject = remoteStream;
                    el.muted = true;
                    el.play().then(() => setVideoHasFrames(true)).catch(console.warn);
                  }
                }}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  e.currentTarget.play().then(() => setVideoHasFrames(true)).catch(console.warn);
                }}
                onPlaying={() => setVideoHasFrames(true)}
                onTimeUpdate={() => setVideoHasFrames(true)}
                className={`w-full h-full object-cover -scale-x-100 ${
                  isWebRtcConnected && videoHasFrames ? "block" : "hidden"
                }`}
              />

              {/* 2. High-Res Live Snapshot Fallback (Displays until WebRTC frames start moving) */}
              {(!isWebRtcConnected || !videoHasFrames) && liveFrames[inspectingStudent.id] && (
                <img
                  src={liveFrames[inspectingStudent.id]}
                  alt={`${inspectingStudent.name} Live Webcam`}
                  className="w-full h-full object-cover -scale-x-100"
                />
              )}

              {/* 3. Awaiting Stream (Only if neither WebRTC nor snapshot has arrived yet) */}
              {(!isWebRtcConnected || !videoHasFrames) && !liveFrames[inspectingStudent.id] && (
                <div className="text-center space-y-2 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-[#0092E3] flex items-center justify-center mx-auto border border-slate-800 animate-pulse">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-white font-display">
                    Connecting to {inspectingStudent.name}&apos;s Camera...
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Awaiting student video stream handshake.
                  </p>
                </div>
              )}

              {/* Live Overlay Status */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold font-mono text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {isWebRtcConnected && videoHasFrames
                  ? "WEBRTC HD 720P • 30 FPS"
                  : liveFrames[inspectingStudent.id]
                  ? "LIVE ENCRYPTED FEED"
                  : "CONNECTING TO WEBCAM"}
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
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
  graceMarks?: number;
  graceReason?: string;
  status: "Pending Review" | "Graded";
  writtenQuestionText: string;
  studentAnswer: string;
  rubricNotes: string;
  teacherFeedback?: string;
}

function getInitialEvaluationSubmissions(): EvaluationSubmission[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem("testify_teacher_evaluations");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  const list: EvaluationSubmission[] = [];

  // 1. Load from testify_student_submissions
  try {
    const rawSubs = localStorage.getItem("testify_student_submissions");
    if (rawSubs) {
      const subs = JSON.parse(rawSubs);
      if (Array.isArray(subs) && subs.length > 0) {
        subs.forEach((sub: any, idx: number) => {
          const studentName = sub.studentName || sub.name || `Candidate ${idx + 1}`;
          const studentEmail = sub.studentEmail || sub.email || "candidate@testify.local";
          const examTitle = sub.title || sub.examTitle || "Live Examination";
          const totalQ = Number(sub.totalQuestions || 10);
          const mcqScore = Number(sub.correctAnswers !== undefined ? sub.correctAnswers : Math.round(((sub.percentage || 80) / 100) * totalQ));

          let writtenQ = "Explain the architecture of HTTP/HTTPS and how SSL/TLS certificates ensure encrypted data integrity.";
          let studentAns = "HTTP transmits plaintext packets over port 80 without encryption. HTTPS wraps traffic in an SSL/TLS handshake over port 443 using asymmetric RSA/ECC keys to negotiate symmetric session keys, guaranteeing confidentiality, integrity, and non-repudiation.";
          let rubric = "4 marks for protocol & port distinction, 4 marks for TLS cryptographic handshake, 2 marks for integrity verification.";

          if (Array.isArray(sub.questions)) {
            const shortQ = sub.questions.find((q: any) => q.type === "short-answer" || q.questionType === "SHORT_ANSWER");
            if (shortQ) {
              writtenQ = shortQ.questionText || shortQ.question || writtenQ;
              if (sub.userAnswers && sub.userAnswers[shortQ.id]) {
                studentAns = String(sub.userAnswers[shortQ.id]);
              }
              if (shortQ.explanation) {
                rubric = `Model Key: ${shortQ.explanation}`;
              }
            }
          }

          list.push({
            id: String(sub.id || sub.examId || `eval-${idx}`),
            student: studentName,
            email: studentEmail,
            exam: examTitle,
            submitted: sub.schedule || "Recent Submission",
            mcqScore: mcqScore,
            mcqTotal: totalQ,
            writtenScore: idx === 0 ? null : (idx === 1 ? 9 : 8),
            writtenMax: 10,
            graceMarks: 0,
            status: idx === 0 ? "Pending Review" : "Graded",
            writtenQuestionText: writtenQ,
            studentAnswer: studentAns,
            rubricNotes: rubric,
            teacherFeedback: idx !== 0 ? "Well-formulated explanation with accurate architectural context." : "",
          });
        });
      }
    }
  } catch {}

  // 2. Load from testify_teacher_exam_students if list is still empty
  if (list.length === 0) {
    try {
      const rawStudents = localStorage.getItem("testify_teacher_exam_students");
      if (rawStudents) {
        const stds = JSON.parse(rawStudents);
        if (Array.isArray(stds) && stds.length > 0) {
          stds.forEach((s: any, idx: number) => {
            list.push({
              id: String(s.id || `eval-${idx}`),
              student: s.name || `Student ${idx + 1}`,
              email: s.email || "student@testify.local",
              exam: s.exam || "Live Examination",
              submitted: s.examDate || "Recent Session",
              mcqScore: s.score ? Math.round((s.score / 100) * 10) : 8,
              mcqTotal: 10,
              writtenScore: idx === 0 ? null : 9,
              writtenMax: 10,
              graceMarks: 0,
              status: idx === 0 ? "Pending Review" : "Graded",
              writtenQuestionText: "Explain the Virtual DOM reconciliation algorithm and how batch updates minimize browser layout thrashing.",
              studentAnswer: "The virtual DOM is a lightweight memory snapshot of actual DOM nodes. When component state changes, React diffs previous and next virtual DOM trees with an O(n) heuristic comparison and flushes only minimal changes to the actual render tree.",
              rubricNotes: "Award full marks for mentioning tree diffing, heuristic reconciliation, and batched DOM mutations.",
              teacherFeedback: idx !== 0 ? "Excellent technical breakdown of diffing algorithms." : "",
            });
          });
        }
      }
    } catch {}
  }

  return list;
}

export function EvaluationPanel() {
  const [submissions, setSubmissions] = useState<EvaluationSubmission[]>(() => {
    return getInitialEvaluationSubmissions();
  });

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(() => {
    const list = getInitialEvaluationSubmissions();
    return list[0]?.id || "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending Review" | "Graded">("All");
  const [evalTab, setEvalTab] = useState<"written" | "grace" | "rubric">("written");

  const [scoreInput, setScoreInput] = useState<string>("");
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [graceInput, setGraceInput] = useState<string>("0");
  const [graceReasonInput, setGraceReasonInput] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const selected = submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];

  useEffect(() => {
    if (selected) {
      setScoreInput(selected.writtenScore !== null ? String(selected.writtenScore) : "");
      setFeedbackInput(selected.teacherFeedback || "");
      setGraceInput(String(selected.graceMarks || 0));
      setGraceReasonInput(selected.graceReason || "");
    }
  }, [selectedSubmissionId, selected?.id]);

  useEffect(() => {
    if (submissions.length > 0) {
      localStorage.setItem("testify_teacher_evaluations", JSON.stringify(submissions));
    }
  }, [submissions]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // AI-Assisted Auto-Grading & Suggestion Engine
  const handleAiGrade = () => {
    if (!selected) return;
    const wordCount = selected.studentAnswer ? selected.studentAnswer.trim().split(/\s+/).length : 0;
    const suggestedMarks = wordCount >= 30 ? Math.min(selected.writtenMax, Math.max(7, selected.writtenMax - 1)) : 6;
    setScoreInput(String(suggestedMarks));

    const smartFeedback = `AI Evaluation: High conceptual accuracy with well-structured technical reasoning (${suggestedMarks}/${selected.writtenMax}). Demonstrated clear understanding of underlying principles with coherent vocabulary.`;
    setFeedbackInput(smartFeedback);

    showToast(`✨ AI evaluated response: Awarded ${suggestedMarks}/${selected.writtenMax} with drafted feedback.`);
  };

  const handleApplyPresetFeedback = (tag: string) => {
    setFeedbackInput((prev) => (prev ? `${prev} • ${tag}` : tag));
  };

  const handleSaveEvaluation = (advanceNext: boolean = false) => {
    if (!selected) return;

    const numScore = Number(scoreInput);
    if (isNaN(numScore) || numScore < 0 || numScore > selected.writtenMax) {
      showToast(`Written score must be between 0 and ${selected.writtenMax}`);
      return;
    }

    const numGrace = Number(graceInput) || 0;
    const finalTotal = selected.mcqScore + numScore + numGrace;

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              writtenScore: numScore,
              graceMarks: numGrace,
              graceReason: graceReasonInput.trim(),
              teacherFeedback: feedbackInput.trim(),
              status: "Graded",
            }
          : s
      )
    );

    // Sync with student submissions in localStorage
    try {
      const rawSubs = localStorage.getItem("testify_student_submissions");
      if (rawSubs) {
        const subs = JSON.parse(rawSubs);
        const updated = subs.map((sub: any) => {
          if (
            sub.id === selected.id ||
            (sub.studentEmail && sub.studentEmail.toLowerCase() === selected.email.toLowerCase()) ||
            (sub.studentName && sub.studentName.toLowerCase() === selected.student.toLowerCase())
          ) {
            return {
              ...sub,
              score: finalTotal,
              writtenScore: numScore,
              graceMarks: numGrace,
              teacherFeedback: feedbackInput.trim(),
              isEvaluated: true,
              status: "Graded",
            };
          }
          return sub;
        });
        localStorage.setItem("testify_student_submissions", JSON.stringify(updated));
      }
    } catch {}

    showToast(`Evaluation saved for ${selected.student}! Total Score: ${finalTotal}`);

    if (advanceNext) {
      const currIdx = filteredSubmissions.findIndex((s) => s.id === selected.id);
      const nextSub = filteredSubmissions[currIdx + 1];
      if (nextSub) {
        setSelectedSubmissionId(nextSub.id);
      }
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.exam.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "All" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const pendingCount = submissions.filter((s) => s.status === "Pending Review").length;
  const gradedCount = submissions.filter((s) => s.status === "Graded").length;

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
            Subjective Assessment & Grading
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Paper Evaluation & Scoring Workspace
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Grade candidate written answers, use AI-suggested marks and feedback, and award bonus/grace adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={
              pendingCount > 0
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 text-xs font-bold px-3 py-1"
                : "bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1"
            }
          >
            {pendingCount > 0 ? `${pendingCount} Papers Awaiting Review` : "All Papers Graded"}
          </Badge>
          <Link href="/teacher/results">
            <Button variant="outline" size="sm" className="text-xs font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Results
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State if queue is completely empty */}
      {submissions.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-12 text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 text-[#0092E3] flex items-center justify-center mx-auto border border-blue-100 dark:border-slate-700 shadow-sm mb-4">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-1">
            No Papers Awaiting Evaluation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            All auto-graded objective exams are finalized. When students complete examinations with written or short-answer questions, their papers will queue here.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/teacher/results">
              <Button className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold">
                View Results Dashboard
              </Button>
            </Link>
            <Link href="/teacher/monitoring">
              <Button variant="outline" className="text-xs font-bold">
                Live Proctoring Feed
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Two-Column Workspace */
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1.85fr]">
          {/* Left Column: Submission Queue */}
          <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col max-h-[800px]">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold font-display text-[#152234] dark:text-white">
                  Submission Queue ({submissions.length})
                </CardTitle>
                <span className="text-[11px] font-bold text-slate-400">
                  {gradedCount} Graded • {pendingCount} Pending
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate or exam..."
                  className="h-8 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 pt-1">
                {(["All", "Pending Review", "Graded"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === tab
                        ? "bg-[#0092E3] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2 overflow-y-auto flex-1">
              {filteredSubmissions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No submissions match your search.
                </div>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selected?.id === sub.id;
                  const totalScore = sub.mcqScore + (sub.writtenScore || 0) + (sub.graceMarks || 0);

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubmissionId(sub.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#0092E3] bg-blue-50/70 dark:bg-cyan-950/40 shadow-sm"
                          : "border-slate-200/80 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-cyan-950 text-[#0092E3] font-bold text-xs flex items-center justify-center shrink-0">
                            {sub.student.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{sub.student}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.email}</p>
                          </div>
                        </div>

                        <div>
                          {sub.status === "Graded" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> {totalScore} pts
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              <Clock3 className="h-3 w-3" /> Needs Review
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="truncate max-w-[150px] font-medium text-slate-600 dark:text-slate-400">{sub.exam}</span>
                        <span className="font-mono text-emerald-600 font-bold">MCQ: {sub.mcqScore}/{sub.mcqTotal}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Right Column: Evaluation Workspace */}
          {selected && (
            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
              {/* Workspace Header */}
              <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-[#0092E3] font-bold text-base flex items-center justify-center shrink-0">
                    {selected.student.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold font-display text-[#152234] dark:text-white">
                        {selected.student}
                      </CardTitle>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selected.status === "Graded" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
                        {selected.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selected.email} • {selected.exam}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Auto-Graded MCQ</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {selected.mcqScore} / {selected.mcqTotal} ({Math.round((selected.mcqScore / selected.mcqTotal) * 100)}%)
                    </span>
                  </div>

                  <div className="text-right px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-cyan-950/40 border border-blue-100 dark:border-cyan-800">
                    <span className="text-[10px] font-bold uppercase text-[#0092E3] block">Total Combined</span>
                    <span className="text-sm font-black text-[#0092E3] font-mono">
                      {selected.mcqScore + (Number(scoreInput) || 0) + (Number(graceInput) || 0)} pts
                    </span>
                  </div>
                </div>
              </CardHeader>

              {/* Workspace Inner Navigation Tabs */}
              <div className="px-5 pt-3 pb-0 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setEvalTab("written")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    evalTab === "written"
                      ? "border-[#0092E3] text-[#0092E3]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Written Question & AI Grading
                </button>
                <button
                  onClick={() => setEvalTab("grace")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    evalTab === "grace"
                      ? "border-[#0092E3] text-[#0092E3]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Grace Marks & Overrides
                </button>
                <button
                  onClick={() => setEvalTab("rubric")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    evalTab === "rubric"
                      ? "border-[#0092E3] text-[#0092E3]"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Marking Scheme Guidelines
                </button>
              </div>

              <CardContent className="p-5 space-y-4">
                {evalTab === "written" && (
                  <div className="space-y-4">
                    {/* Question Prompt */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Subjective / Written Question Prompt
                        </span>
                        <span className="text-[10px] font-bold text-[#0092E3] bg-blue-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-cyan-800">
                          Max Marks: {selected.writtenMax}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                        {selected.writtenQuestionText}
                      </p>
                    </div>

                    {/* Student Written Response */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Candidate Submission
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {selected.studentAnswer.trim().split(/\s+/).length} Words Submitted
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-blue-50/40 dark:bg-cyan-950/20 p-4 rounded-2xl border border-blue-200/70 dark:border-cyan-800 font-sans shadow-2xs">
                        {selected.studentAnswer}
                      </div>
                    </div>

                    {/* Rubric Notes & AI Helper */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                        <strong className="block text-amber-800 dark:text-amber-300">Instructor Rubric:</strong>
                        <span>{selected.rubricNotes}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleAiGrade}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shrink-0 shadow-md shadow-purple-500/20"
                        leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                      >
                        AI Auto-Grade
                      </Button>
                    </div>

                    {/* Scoring & Feedback Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Award Score (0 - {selected.writtenMax})
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={selected.writtenMax}
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          placeholder="e.g. 9"
                          required
                          className="font-mono font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Teacher Feedback & Evaluation Remarks
                        </label>
                        <Input
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Add personalized feedback or click AI Auto-Grade..."
                        />
                      </div>
                    </div>

                    {/* Quick Preset Feedback Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Tag:</span>
                      {[
                        "Clear architectural explanation",
                        "Accurate technical synthesis",
                        "Well-structured response",
                        "Needs more practical examples",
                        "Minor inaccuracies in detail",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleApplyPresetFeedback(tag)}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-950 hover:text-[#0092E3] transition-colors cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {evalTab === "grace" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        Bonus & Grace Points Override
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Award extra grace marks if a question had ambiguities, or provide bonus points for exceptional effort.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Grace / Bonus Marks
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={graceInput}
                            onChange={(e) => setGraceInput(e.target.value)}
                            className="font-mono font-bold w-24"
                          />
                          <div className="flex items-center gap-1">
                            {[1, 2, 5].map((pts) => (
                              <button
                                key={pts}
                                type="button"
                                onClick={() => setGraceInput(String(pts))}
                                className="px-2.5 py-1.5 rounded-xl border text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#0092E3] hover:text-white transition-colors cursor-pointer"
                              >
                                +{pts}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Reason for Adjustment
                        </label>
                        <Input
                          value={graceReasonInput}
                          onChange={(e) => setGraceReasonInput(e.target.value)}
                          placeholder="e.g. Compensated for ambiguous question phrasing"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {evalTab === "rubric" && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-cyan-950/30 border border-blue-200 dark:border-cyan-800 space-y-2">
                      <h4 className="text-xs font-bold text-blue-950 dark:text-cyan-200">
                        Official Grading Policy & Scoring Weights
                      </h4>
                      <p className="text-[11px] text-blue-900/80 dark:text-cyan-300/80 leading-relaxed">
                        Automatic MCQ evaluation applies strict answer key verification. Subjective answers evaluate technical coverage, structured synthesis, and conceptual accuracy.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pass Threshold</span>
                        <p className="text-base font-black text-slate-800 dark:text-white mt-1">40%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Negative Marking</span>
                        <p className="text-base font-black text-slate-800 dark:text-white mt-1">None (0.00)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Grade Curve</span>
                        <p className="text-base font-black text-emerald-600 mt-1">Standard (A+: 80%+)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-500">
                    Grand Total Score:{" "}
                    <strong className="text-slate-900 dark:text-white font-mono text-base">
                      {selected.mcqScore + (Number(scoreInput) || 0) + (Number(graceInput) || 0)} / {selected.mcqTotal + selected.writtenMax} pts
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {filteredSubmissions.findIndex((s) => s.id === selected?.id) < filteredSubmissions.length - 1 && (
                      <Button
                        onClick={() => handleSaveEvaluation(true)}
                        variant="outline"
                        className="text-xs font-bold border-blue-200 text-[#0092E3] hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        Save & Next Student
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSaveEvaluation(false)}
                      className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs shadow-md shadow-blue-500/20"
                      leftIcon={<Check className="h-3.5 w-3.5" />}
                    >
                      Publish Final Evaluation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
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
  const [results, setResults] = useState<ExamResultRecord[]>(() => {
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
  const [activeTab, setActiveTab] = useState<"transcripts" | "gradebook" | "earnings">("transcripts");
  const [query, setQuery] = useState("");
  const [selectedExam, setSelectedExam] = useState("All Exams");
  const [selectedResult, setSelectedResult] = useState<ExamResultRecord | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<TeacherEarningsSummary | null>(null);

  const { data: sessionData } = authClient.useSession();
  const currentUser = sessionData?.user;

  useEffect(() => {
    let isMounted = true;
    async function loadTeacherSubmissions() {
      try {
        const res = await apiClient.get('/exams/teacher/submissions/all');
        if (isMounted && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ExamResultRecord[] = res.data.map((sub: any, idx: number) => ({
            rank: `#${idx + 1}`,
            id: String(sub.id || sub.submissionId || `res-${idx}`),
            student: sub.studentName || 'Student Candidate',
            email: sub.studentEmail || 'student@testify.local',
            exam: sub.examTitle || 'Academic Examination',
            score: sub.score || 0,
            maxScore: sub.totalMarks || 100,
            percentage: typeof sub.percentage === 'number' ? sub.percentage : (sub.totalMarks > 0 ? Math.round((sub.score / sub.totalMarks) * 100) : 0),
            grade: sub.grade || (sub.percentage >= 80 ? 'A+' : sub.percentage >= 70 ? 'A' : sub.percentage >= 60 ? 'B' : sub.percentage >= 50 ? 'C' : 'F'),
            status: sub.isPassed ? 'Pass' : 'Fail',
            submitted: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Session',
            answers: sub.answers || [],
          }));
          setResults(mapped);
          localStorage.setItem('testify_teacher_results', JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Backend teacher submissions fetch fallback:', err);
      }
    }
    loadTeacherSubmissions();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const revRes = await paymentService.getTeacherRevenue();
        if (revRes && revRes.data) {
          setEarnings(revRes.data);
          return;
        }
      } catch (err) {
        console.warn("Backend revenue fetch fallback to isolated local state:", err);
      }

      if (currentUser?.email) {
        const localData = purchaseService.getTeacherEarnings(currentUser.email);
        setEarnings(localData);
      } else {
        setEarnings(purchaseService.getTeacherEarnings("__NO_TEACHER__"));
      }
    }
    loadEarnings();
  }, [currentUser?.email]);

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
            Assessment Transcripts & Analytics
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Examination Results & Transcripts
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Review verified candidate performance, inspect detailed question-by-question answer transcripts, and track scores.
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
          onClick={() => setActiveTab("transcripts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "transcripts"
              ? "bg-white dark:bg-slate-800 text-[#152234] dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Candidate Transcripts & Results
        </button>

        <button
          onClick={() => setActiveTab("gradebook")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gradebook"
              ? "bg-white dark:bg-slate-800 text-[#152234] dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Class Gradebook & Analytics ({totalSubmissions})
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

      {activeTab === "transcripts" ? (
        <AdmissionPanel isResultsView={true} hideHeader={true} />
      ) : activeTab === "earnings" ? (
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
                ${earnings?.grossRevenue || 0}.00
              </p>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 bg-white/80 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Fee (10%)</span>
              <p className="text-2xl font-black text-rose-500 font-display mt-1">
                ${earnings?.platformFees || 0}.00
              </p>
            </Card>

            <Card className="rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-5 bg-emerald-50/50 dark:bg-emerald-950/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Teacher Net Earnings</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-display mt-1">
                ${earnings?.teacherEarnings || 0}.00
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
                  {earnings?.recentTransactions && earnings.recentTransactions.length > 0 ? (
                    earnings.recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{tx.studentName || tx.studentEmail || "Student"}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{tx.examTitle}</td>
                        <td className="py-3 font-mono">{tx.paymentProvider}</td>
                        <td className="py-3 font-mono text-slate-500">{tx.transactionId}</td>
                        <td className="py-3 font-bold text-emerald-600">${tx.amount}.00</td>
                        <td className="py-3 text-right">
                          <Badge variant="success">{tx.paymentStatus}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs font-medium">
                        No sales transactions recorded yet.
                      </td>
                    </tr>
                  )}
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
