"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  FileCheck2,
  Plus,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Crown,
  Share2,
  Users,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ExamShareModal } from "@/components/teacher/exam-setup/ExamShareModal";
import { TeacherSubscriptionModal } from "@/components/teacher/TeacherSubscriptionModal";
import { generateJoinCode, generateAccessToken } from "@/lib/exam-access";
import { examService } from "@/services/exam.service";
import { useTeacherSubscription } from "@/lib/subscription-sync";
import { authClient } from "@/lib/auth-client";

export type ExamTimingStatus = "live" | "upcoming" | "finished" | "draft";

// Helper to count real-time students who took / submitted this exam
export function getExamCandidatesCount(exam: ExamItem): number {
  let count = exam.studentsCount || 0;
  if (typeof window === "undefined") return count;
  try {
    const rawSubs = localStorage.getItem("testify_student_submissions");
    if (rawSubs) {
      const subs = JSON.parse(rawSubs);
      const matched = subs.filter((sub: any) => {
        const matchId =
          (sub.examId && String(sub.examId) === String(exam.id)) ||
          (sub.id && String(sub.id) === String(exam.id));
        const matchToken =
          exam.accessToken &&
          (sub.token === exam.accessToken || sub.accessToken === exam.accessToken);
        const matchTitle =
          (sub.title && exam.title && sub.title.trim().toLowerCase() === exam.title.trim().toLowerCase()) ||
          (sub.exam && exam.title && sub.exam.trim().toLowerCase() === exam.title.trim().toLowerCase());
        return matchId || matchToken || matchTitle;
      });
      count = Math.max(count, matched.length);
    }
  } catch {}
  return count;
}

export function getExamTimingStatus(exam: ExamItem, now: Date = new Date()): ExamTimingStatus {
  if (exam.status === "Draft") {
    return "draft";
  }

  // 1. Precise ISO timestamps
  if (exam.startDateTime) {
    const start = new Date(exam.startDateTime);
    if (!isNaN(start.getTime())) {
      let end: Date;
      if (exam.endDateTime) {
        const parsedEnd = new Date(exam.endDateTime);
        end = !isNaN(parsedEnd.getTime()) ? parsedEnd : new Date(start.getTime() + (exam.duration || 60) * 60 * 1000);
      } else {
        end = new Date(start.getTime() + (exam.duration || 60) * 60 * 1000);
      }

      if (now < start) {
        return "upcoming";
      } else if (now >= start && now <= end) {
        return "live";
      } else {
        return "finished";
      }
    }
  }

  // 2. Text heuristics
  const dateStr = (exam.date || "").trim();
  if (dateStr.toLowerCase() === "active") {
    return "live";
  }

  // 3. Time range string like "Sep 9, 02:29 PM - 03:07 PM"
  if (dateStr.includes("-") && (dateStr.includes("AM") || dateStr.includes("PM") || dateStr.includes(":"))) {
    try {
      const parts = dateStr.split(",");
      if (parts.length >= 2) {
        const datePart = parts[0].trim();
        const times = parts[1].split("-");
        if (times.length === 2) {
          const startStr = times[0].trim();
          const endStr = times[1].trim();
          const curYear = now.getFullYear();
          const s = new Date(`${datePart}, ${curYear} ${startStr}`);
          const e = new Date(`${datePart}, ${curYear} ${endStr}`);
          if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
            if (now < s) return "upcoming";
            if (now >= s && now <= e) return "live";
            return "finished";
          }
        }
      }
    } catch {}
  }

  // 4. Default fallback by status
  if (exam.status === "Scheduled") {
    return "upcoming";
  }
  if (exam.status === "Published" || exam.status === "Ready") {
    return "live";
  }

  return "finished";
}

export interface ExamItem {
  scheduleType?: "flexible" | "scheduled";
  requireCamera?: boolean;
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  startDateTime?: string;
  endDateTime?: string;
  duration: number; // in minutes
  totalMarks: number;
  passMark: number;
  studentsCount: number;
  status: "Published" | "Scheduled" | "Draft" | "Ready";
  accessType?: "FREE" | "PAID";
  price?: number;
  joinCode?: string;
  accessToken?: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  createdBy?: string;
  questions?: any[];
}

// Robust deduplication utility guaranteeing unique exams per teacher
export function deduplicateExams(exams: ExamItem[]): ExamItem[] {
  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();
  const seenTokens = new Set<string>();
  const seenTitles = new Map<string, ExamItem>();

  const result: ExamItem[] = [];

  for (const exam of exams) {
    if (!exam || !exam.title) continue;

    const teacher = (exam.teacherEmail || exam.createdBy || "").toLowerCase().trim();
    const cleanTitle = exam.title.trim().toLowerCase();
    const titleKey = `${teacher}::${cleanTitle}`;

    // 1. Direct ID match
    if (exam.id && seenIds.has(exam.id)) {
      continue;
    }

    // 2. Direct joinCode match
    if (exam.joinCode && seenCodes.has(exam.joinCode.toLowerCase())) {
      continue;
    }

    // 3. Direct accessToken match
    if (exam.accessToken && seenTokens.has(exam.accessToken)) {
      continue;
    }

    // 4. Same teacher + same title match
    if (seenTitles.has(titleKey)) {
      const existing = seenTitles.get(titleKey)!;
      if (existing.subject === "General" && exam.subject && exam.subject !== "General") {
        existing.subject = exam.subject;
      }
      if ((existing.date === "Active" || !existing.date) && exam.date && exam.date !== "Active") {
        existing.date = exam.date;
      }
      if (exam.startDateTime) existing.startDateTime = exam.startDateTime;
      if (exam.endDateTime) existing.endDateTime = exam.endDateTime;
      if (exam.questions && exam.questions.length > (existing.questions?.length || 0)) {
        existing.questions = exam.questions;
      }
      if (exam.id && exam.id.length === 24 && existing.id.length !== 24) {
        existing.id = exam.id;
      }
      continue;
    }

    if (exam.id) seenIds.add(exam.id);
    if (exam.joinCode) seenCodes.add(exam.joinCode.toLowerCase());
    if (exam.accessToken) seenTokens.add(exam.accessToken);
    seenTitles.set(titleKey, exam);
    result.push(exam);
  }

  return result;
}

export const getExamScheduleDetails = (exam: {
  startDateTime?: string;
  endDateTime?: string;
  createdAt?: string;
  date?: string;
  status?: string;
}) => {
  let startFormatted = "";
  let endFormatted = "";
  let isUpcoming = false;

  const now = Date.now();

  if (exam.startDateTime) {
    const startDate = new Date(exam.startDateTime);
    if (!isNaN(startDate.getTime())) {
      if (startDate.getTime() > now) {
        isUpcoming = true;
      }
      const dStr = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const tStr = startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      startFormatted = dStr + " • " + tStr;
    }
  }

  if (exam.endDateTime) {
    const endDate = new Date(exam.endDateTime);
    if (!isNaN(endDate.getTime())) {
      const dStr = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const tStr = endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      endFormatted = dStr + " • " + tStr;
    }
  }

  if (!startFormatted) {
    if (exam.date && exam.date !== "Scheduled Soon" && !exam.date.toLowerCase().includes("soon")) {
      startFormatted = exam.date;
    } else if (exam.createdAt) {
      const created = new Date(exam.createdAt);
      if (!isNaN(created.getTime())) {
        startFormatted = created.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    if (!startFormatted) {
      startFormatted = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  if (!endFormatted) {
    endFormatted = "Open / Flexible";
  }

  if (
    exam.status &&
    (exam.status === "Scheduled" ||
      exam.status === "SCHEDULED" ||
      exam.status === "Upcoming" ||
      exam.status === "UPCOMING")
  ) {
    isUpcoming = true;
  }

  return { startFormatted, endFormatted, isUpcoming };
};
export default function TeacherExamsPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [examsList, setExamsList] = useState<ExamItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const { hasPremium, daysRemaining, expiryDateFormatted, refresh: refreshSubscription } = useTeacherSubscription(session);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [sharingExam, setSharingExam] = useState<ExamItem | null>(null);

  // Real-time ticking state for dynamic live/upcoming/finished evaluation
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Check and refresh status every 10 seconds in real time
    return () => clearInterval(timer);
  }, []);

  // Real-time dynamic count of total, live, upcoming, and finished exams
  const stats = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let finished = 0;
    let draft = 0;
    let totalCandidates = 0;

    examsList.forEach((exam) => {
      totalCandidates += getExamCandidatesCount(exam);
      const timing = getExamTimingStatus(exam, currentTime);
      if (timing === "live") live++;
      else if (timing === "upcoming") upcoming++;
      else if (timing === "finished") finished++;
      else if (timing === "draft") draft++;
    });

    return {
      total: examsList.length,
      totalCandidates,
      live,
      upcoming,
      finished,
      draft,
    };
  }, [examsList, currentTime]);

  // Dynamic filter for active view
  const displayedExams = useMemo(() => {
    if (selectedFilter === "all") return examsList;
    return examsList.filter((exam) => getExamTimingStatus(exam, currentTime) === selectedFilter);
  }, [examsList, selectedFilter, currentTime]);

  // Load exams belonging strictly to the currently logged in teacher
  React.useEffect(() => {
    async function loadExams() {
      try {
        const userEmail = session?.user?.email;
        let myExams: ExamItem[] = [];

        const stored = localStorage.getItem("testify_teacher_exams");
        if (stored && userEmail) {
          const allExams: ExamItem[] = JSON.parse(stored);
          myExams = allExams.filter(
            (e) => e.teacherEmail === userEmail || e.createdBy === userEmail
          );
        }

        // Also fetch from real backend database
        try {
          const res = await examService.getAllExams();
          if (res.data && res.data.length > 0 && userEmail) {
            const apiExams: ExamItem[] = res.data
              .filter((item: any) => item.teacherEmail === userEmail || item.creatorEmail === userEmail || item.teacherId === (session?.user as any)?.id)
              .map((item: any) => {
                let formattedDate = item.date;
                if (!formattedDate && item.startDateTime) {
                  try {
                    const sDate = new Date(item.startDateTime);
                    if (item.endDateTime) {
                      const eDate = new Date(item.endDateTime);
                      formattedDate = `${sDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    } else {
                      formattedDate = sDate.toLocaleDateString();
                    }
                  } catch {}
                }

                return {
                  id: item._id,
                  title: item.title,
                  subject: item.subject || item.category || "General",
                  description: item.description || "",
                  date: formattedDate || (item.startDateTime ? new Date(item.startDateTime).toLocaleDateString() : "Active"),
                  scheduleType: item.scheduleType || (item.startDateTime && item.endDateTime ? "scheduled" : "flexible"),
                  startDateTime: item.startDateTime,
                  endDateTime: item.endDateTime,
                  duration: item.durationMinutes || 60,
                  totalMarks: item.totalMarks || 50,
                  passMark: Math.round((item.totalMarks || 50) * (item.passPercentage || 40) / 100),
                  studentsCount: item.totalEnrolled || 0,
                  status: (item.status === "PUBLISHED" || item.isPublished) ? "Published" : "Draft",
                  accessType: (item.accessType === "PAID" || Number(item.price) > 0) ? "PAID" : "FREE",
                  price: item.price || 0,
                  joinCode: item.joinCode,
                  accessToken: item.accessToken,
                  teacherEmail: userEmail,
                  createdBy: userEmail,
                  questions: item.questions || [],
                };
              });

            // Merge apiExams with myExams intelligently without creating duplicate cards
            apiExams.forEach((ae) => {
              const localIndex = myExams.findIndex(
                (m) =>
                  m.id === ae.id ||
                  (m.joinCode && ae.joinCode && m.joinCode.toLowerCase() === ae.joinCode.toLowerCase()) ||
                  (m.accessToken && ae.accessToken && m.accessToken === ae.accessToken) ||
                  (m.title.trim().toLowerCase() === ae.title.trim().toLowerCase())
              );

              if (localIndex >= 0) {
                const local = myExams[localIndex];
                myExams[localIndex] = {
                  ...ae,
                  ...local,
                  id: ae.id, // Prefer permanent MongoDB ID
                  subject: (local.subject && local.subject !== "General") ? local.subject : ae.subject,
                  date: (local.date && local.date !== "Active") ? local.date : ae.date,
                  questions: (local.questions && local.questions.length > 0) ? local.questions : ae.questions,
                };
              } else {
                myExams.unshift(ae);
              }
            });
          }
        } catch {
          // Backend offline fallback
        }

        const cleanList = deduplicateExams(myExams);
        setExamsList(cleanList);

        // Permanently purge any duplicate records in localStorage
        try {
          const stored = localStorage.getItem("testify_teacher_exams");
          let allExams: ExamItem[] = stored ? JSON.parse(stored) : [];
          if (userEmail) {
            allExams = allExams.filter((e) => e.teacherEmail !== userEmail && e.createdBy !== userEmail);
          }
          allExams = [...cleanList, ...allExams];
          localStorage.setItem("testify_teacher_exams", JSON.stringify(deduplicateExams(allExams)));
        } catch {}
      } catch {
        setExamsList([]);
      } finally {
        setIsLoaded(true);
      }
    }
    loadExams();
  }, [session?.user?.email]);

  // Sync to localStorage on state change preserving other teachers' data
  const updateExamsState = (newList: ExamItem[]) => {
    const cleanList = deduplicateExams(newList);
    setExamsList(cleanList);
    try {
      const userEmail = session?.user?.email;
      const stored = localStorage.getItem("testify_teacher_exams");
      let allExams: ExamItem[] = stored ? JSON.parse(stored) : [];

      // Remove current teacher's previous exams from allExams and insert updated
      if (userEmail) {
        allExams = allExams.filter((e) => e.teacherEmail !== userEmail && e.createdBy !== userEmail);
      }
      allExams = [...cleanList, ...allExams];

      localStorage.setItem("testify_teacher_exams", JSON.stringify(deduplicateExams(allExams)));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("testify_public_exams_updated"));
      }
    } catch {
      // Fallback
    }
  };

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passMark, setPassMark] = useState(40);
  const [status, setStatus] = useState<"Published" | "Scheduled" | "Draft" | "Ready">("Draft");
  const [accessType, setAccessType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState<number>(0);
  const [scheduleType, setScheduleType] = useState<"flexible" | "scheduled">("flexible");
  const [requireCamera, setRequireCamera] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getDefaultDateTimeLocal = (plusMinutes = 0) => {
    const now = new Date(Date.now() + plusMinutes * 60 * 1000);
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const autoCalculateEnd = (startVal: string, durationMins: number) => {
    if (!startVal) return "";
    try {
      const d = new Date(startVal);
      if (!isNaN(d.getTime())) {
        const end = new Date(d.getTime() + durationMins * 60 * 1000);
        const tzOffset = end.getTimezoneOffset() * 60000;
        return new Date(end.getTime() - tzOffset).toISOString().slice(0, 16);
      }
    } catch {}
    return "";
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    if (!hasPremium) {
      setSubscriptionMessage("⭐ Teacher Premium Membership ($20/year) is required to create and conduct examinations on Testify.");
      setIsSubscriptionOpen(true);
      return;
    }

    const defaultStart = getDefaultDateTimeLocal(0);
    const defaultEnd = autoCalculateEnd(defaultStart, 60);

    setEditingExam(null);
    setTitle("");
    setSubject("");
    setDescription("");
    setDate("Today, 3:00 PM");
    setScheduleType("flexible");
    setStartDateTime("");
    setEndDateTime("");
    setDuration(60);
    setTotalMarks(50);
    setPassMark(20);
    setStatus("Draft");
    setAccessType("FREE");
    setPrice(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exam: ExamItem) => {
    setEditingExam(exam);
    setRequireCamera(Boolean(exam.requireCamera));
    setTitle(exam.title);
    setSubject(exam.subject);
    setDescription(exam.description);
    setDate(exam.date);
    setScheduleType(exam.scheduleType || (exam.startDateTime && exam.endDateTime ? "scheduled" : "flexible"));
    setStartDateTime(exam.startDateTime || "");
    setEndDateTime(exam.endDateTime || "");
    setDuration(exam.duration);
    setTotalMarks(exam.totalMarks);
    setPassMark(exam.passMark);
    setStatus(exam.status);
    setAccessType(exam.accessType || "FREE");
    setPrice(exam.price || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    if (!hasPremium) {
      setSubscriptionMessage("⭐ Teacher Premium Membership ($20/year) is required to create examinations.");
      setIsSubscriptionOpen(true);
      return;
    }

    if (accessType === "PAID" && (!price || price <= 0)) {
      showToast("Please specify a valid price for paid examination.");
      return;
    }

    if (startDateTime && endDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
      showToast("End Date & Time must be strictly after Start Date & Time.");
      return;
    }

    const finalPrice = accessType === "PAID" ? Number(price) : 0;

    let formattedSchedule = date;
    if (startDateTime && endDateTime) {
      try {
        const sDate = new Date(startDateTime);
        const eDate = new Date(endDateTime);
        formattedSchedule = `${sDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } catch {}
    }

    if (editingExam) {
      const updated: ExamItem[] = examsList.map((item) =>
        item.id === editingExam.id
          ? {
              ...item,
              title: title.trim(),
              subject: subject.trim(),
              description: description.trim(),
              date: formattedSchedule || date,
              startDateTime,
              endDateTime,
              duration: Number(duration),
              totalMarks: Number(totalMarks),
              passMark: Number(passMark),
              status,
              accessType,
              price: finalPrice,
              requireCamera: Boolean(requireCamera),
              teacherId: item.teacherId || session?.user?.id || session?.user?.email || "",
              teacherName: item.teacherName || session?.user?.name || "Instructor",
              teacherEmail: item.teacherEmail || session?.user?.email || "",
            }
          : item
      );
      updateExamsState(updated);
      try {
        await examService.updateExam(editingExam.id, {
          title: title.trim(),
          category: subject.trim(),
          subject: subject.trim(),
          description: description.trim(),
          startDateTime,
          endDateTime,
          durationMinutes: Number(duration),
          totalMarks: Number(totalMarks),
          passPercentage: Math.round(((Number(passMark) || 20) / (Number(totalMarks) || 50)) * 100),
          accessType,
          price: finalPrice,
          joinCode: editingExam.joinCode,
          accessToken: editingExam.accessToken,
          status: status === "Published" ? "PUBLISHED" : status === "Scheduled" ? "PUBLISHED" : "DRAFT",
          requireCamera: Boolean(requireCamera),
        });
      } catch {}
      window.dispatchEvent(new CustomEvent("testify_public_exams_updated"));
      showToast("Exam updated successfully!");
      setIsModalOpen(false);
    } else {
      let createdId = String(Date.now());
      const joinCode = generateJoinCode(subject);
      const accessToken = generateAccessToken();

      try {
        const res = await examService.createExam({
          title: title.trim(),
          category: subject.trim(),
          subject: subject.trim(),
          description: description.trim(),
          startDateTime,
          endDateTime,
          durationMinutes: Number(duration) || 60,
          totalMarks: Number(totalMarks) || 50,
          passPercentage: Math.round(((Number(passMark) || 20) / (Number(totalMarks) || 50)) * 100),
          accessType,
          price: finalPrice,
          joinCode,
          accessToken,
          status: status === "Published" ? "PUBLISHED" : status === "Scheduled" ? "PUBLISHED" : "DRAFT",
          requireCamera: Boolean(requireCamera),
          questions: [],
        });
        if (res && res.data && res.data._id) {
          createdId = String(res.data._id);
        }
      } catch {}

      const newExam: ExamItem = {
        id: createdId,
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        date: formattedSchedule || date || "Scheduled Soon",
        startDateTime,
        endDateTime,
        duration: Number(duration) || 60,
        totalMarks: Number(totalMarks) || 50,
        passMark: Number(passMark) || 20,
        studentsCount: 0,
        status: status,
        accessType,
        price: finalPrice,
        joinCode,
        accessToken,
        teacherId: session?.user?.id || session?.user?.email || "",
        teacherName: session?.user?.name || "Instructor",
        teacherEmail: session?.user?.email || "",
        createdBy: session?.user?.email || "",
        questions: [],
      };
      updateExamsState([newExam, ...examsList]);
      showToast("Exam created! Redirecting to Question Setup...");
      setIsModalOpen(false);
      // Seamlessly redirect teacher to Question Setup Console
      router.push(`/teacher/exams/${createdId}/setup`);
    }
  };

  const handleDeleteExam = async (id: string) => {
    const updated = examsList.filter((item) => item.id !== id);
    updateExamsState(updated);
    try {
      await examService.deleteExam(id);
    } catch {}
    showToast("Exam deleted.");
  };

  const handleToggleStatus = async (id: string) => {
    let newStatus: "Published" | "Scheduled" | "Draft" = "Draft";
    const updated: ExamItem[] = examsList.map((item) => {
      if (item.id === id) {
        newStatus = item.status === "Published" ? "Draft" : "Published";
        return { ...item, status: newStatus };
      }
      return item;
    });
    updateExamsState(updated);
    try {
      await examService.updateExam(id, {
        status: (newStatus as string) === "Published" ? "PUBLISHED" : "DRAFT",
      });
    } catch {}
    showToast(`Exam status updated to ${newStatus}!`);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-xs font-semibold text-slate-400 animate-pulse">
          Connecting to examination database...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Modern SaaS Teacher Premium Banner */}
      {!hasPremium && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EBF7FF] dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-[#0092E3] flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-[#0092E3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#152234] dark:text-white font-display">
                  Teacher Premium Membership
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#0092E3] border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                  $20 / Year
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active membership is required to create exams, host live proctored sessions, and publish to students.
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setSubscriptionMessage("Unlock unlimited examination hosting, proctoring, and question banking on Testify.");
              setIsSubscriptionOpen(true);
            }}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md shadow-[#0092E3]/20 shrink-0"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            Upgrade with Stripe
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0092E3]">
              Exam Operations
            </p>

            {hasPremium ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                ⭐ Premium Active • {daysRemaining} Days Left
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                Free Tier
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152234] dark:text-white sm:text-3xl font-display">
            Your Examinations ({examsList.length})
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Create, schedule, set timer limits, pass marks, and manage every assessment from one central place.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-lg hover:shadow-[#0092E3]/20 transition-all"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Exam
        </Button>
      </div>

      {/* Real-time Exam Metric Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Exams */}
        <div
          onClick={() => setSelectedFilter("all")}
          className={`p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border transition-all cursor-pointer backdrop-blur-xl shadow-xs hover:shadow-lg ${
            selectedFilter === "all"
              ? "border-[#0092E3] ring-2 ring-[#0092E3]/20 bg-blue-50/30"
              : "border-slate-200/80 dark:border-slate-800 hover:border-[#0092E3]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Exams</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-[#0092E3] flex items-center justify-center">
              <Layers className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#152234] dark:text-white font-display">
              {stats.total}
            </span>
            <span className="text-[11px] font-bold text-[#0092E3]">
              {stats.totalCandidates} {stats.totalCandidates === 1 ? "Candidate" : "Candidates"}
            </span>
          </div>
        </div>

        {/* 2. Live Now */}
        <div
          onClick={() => setSelectedFilter("live")}
          className={`p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border transition-all cursor-pointer backdrop-blur-xl shadow-xs hover:shadow-lg ${
            selectedFilter === "live"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30"
              : "border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Now
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-display">
              {stats.live}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              Active Ongoing
            </span>
          </div>
        </div>

        {/* 3. Upcoming */}
        <div
          onClick={() => setSelectedFilter("upcoming")}
          className={`p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border transition-all cursor-pointer backdrop-blur-xl shadow-xs hover:shadow-lg ${
            selectedFilter === "upcoming"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30"
              : "border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Upcoming</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-display">
              {stats.upcoming}
            </span>
            <span className="text-[11px] font-bold text-amber-600">
              Scheduled Ahead
            </span>
          </div>
        </div>

        {/* 4. Finished */}
        <div
          onClick={() => setSelectedFilter("finished")}
          className={`p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border transition-all cursor-pointer backdrop-blur-xl shadow-xs hover:shadow-lg ${
            selectedFilter === "finished"
              ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30"
              : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Finished</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 flex items-center justify-center">
              <FileCheck2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 font-display">
              {stats.finished}
            </span>
            <span className="text-[11px] font-bold text-indigo-600">
              Ended / Past
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Strip if a specific card was clicked */}
      {selectedFilter !== "all" && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Filtered by:</span>
            <Badge variant="info" className="capitalize text-xs font-bold px-2.5 py-0.5">
              {selectedFilter} Exams ({displayedExams.length})
            </Badge>
          </div>
          <button
            onClick={() => setSelectedFilter("all")}
            className="text-xs font-bold text-[#0092E3] hover:underline cursor-pointer"
          >
            Show All Exams ({examsList.length})
          </button>
        </div>
      )}

      {/* Exam List Grid */}
      {examsList.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <ClipboardList className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Examinations Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Create an examination to set up schedule windows, duration timers, and anti-cheat policies.
          </p>
          <Button size="sm" onClick={handleOpenCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Create First Exam
          </Button>
        </Card>
      ) : displayedExams.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 capitalize">
            No {selectedFilter} Examinations
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            There are currently no examinations under the &quot;{selectedFilter}&quot; filter.
          </p>
          <Button size="sm" variant="outline" onClick={() => setSelectedFilter("all")}>
            Show All Exams ({examsList.length})
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedExams.map((exam) => {
            const timingStatus = getExamTimingStatus(exam, currentTime);
            const scheduleInfo = getExamScheduleDetails(exam);
            return (
          <Card key={exam.id} hoverEffect className="flex flex-col justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* Real-time timing badge */}
                  {timingStatus === "live" && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      LIVE
                    </span>
                  )}
                  {timingStatus === "upcoming" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs animate-pulse">
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      SOON
                    </span>
                  )}
                  {timingStatus === "finished" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                      <FileCheck2 className="w-2.5 h-2.5 text-slate-500" />
                      FINISHED
                    </span>
                  )}

                  {exam.accessType === "PAID" ? (
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Paid • ${exam.price || 50}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Free
                    </span>
                  )}
                  <button onClick={() => handleToggleStatus(exam.id)} title="Click to toggle status">
                    <Badge
                      variant={
                        exam.status === "Published"
                          ? "success"
                          : exam.status === "Scheduled"
                          ? "info"
                          : "outline"
                      }
                    >
                      {exam.status}
                    </Badge>
                  </button>
                </div>
              </div>

              <CardTitle className="mt-3 text-base font-bold font-display text-[#152234] dark:text-white leading-snug">
                {exam.title}
              </CardTitle>
              <p className="text-xs font-semibold text-[#0092E3] dark:text-cyan-400 mt-0.5">
                {exam.subject}
              </p>
              {exam.description && (
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="flex flex-col justify-between flex-1 p-5 pt-0 space-y-4">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-medium truncate" title={"Start: " + scheduleInfo.startFormatted + " | End: " + scheduleInfo.endFormatted}>
                  <Calendar className="h-3.5 w-3.5 text-[#0092E3] shrink-0" /> <span className="truncate">{scheduleInfo.startFormatted}</span>
                </span>
                <span className="flex items-center gap-1.5 justify-end font-medium">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> {exam.duration} mins
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="h-3.5 w-3.5 text-emerald-500" /> Marks: {exam.totalMarks} <span className="opacity-60">(Pass: {exam.passMark})</span>
                </span>
                <span className="flex items-center gap-1.5 justify-end font-bold text-[#0092E3] dark:text-cyan-400">
                  <Layers className="h-3.5 w-3.5" /> {exam.questions?.length || 0} Questions
                </span>
              </div>

              {/* Candidates Attended Attendance Strip */}
              {(() => {
                const candidates = getExamCandidatesCount(exam);
                return (
                  <Link
                    href="/teacher/results"
                    className="flex items-center justify-between px-3 py-2 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-100/80 dark:border-blue-900/50 text-[11px] transition-all group cursor-pointer"
                    title="View candidate submissions & answer sheets in Results"
                  >
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5 text-[#0092E3] group-hover:scale-110 transition-transform" />
                      Candidates Attended:
                    </span>
                    <span className="font-extrabold text-[#0092E3] dark:text-cyan-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-xl border border-blue-100 dark:border-slate-800 shadow-2xs flex items-center gap-1">
                      {candidates} {candidates === 1 ? "Student" : "Students"}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </Link>
                );
              })()}

              {/* Ultra-Clean Single Row Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Left: Quick Utility Icon Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(exam)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Exam Details"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Exam"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {(exam.status === "Published" || exam.status === "Ready" || exam.status === "Scheduled") && (
                    <button
                      type="button"
                      onClick={() => setSharingExam(exam)}
                      className="p-2 rounded-xl text-[#0092E3] hover:bg-blue-50 dark:hover:bg-cyan-950/40 transition-colors"
                      title="Share Room Key & Direct Link"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  )}

                  {exam.status === "Published" && (
                    <Link
                      href="/teacher/monitoring"
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Live Monitoring"
                    >
                      <Activity className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                {/* Right: Primary Setup Questions CTA */}
                <Link href={`/teacher/exams/${exam.id}/setup`}>
                  <Button
                    size="sm"
                    className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Setup Questions
                  </Button>
                </Link>
              </div>
            </CardContent>
            </Card>
          );
        })}
      </div>
    )}

      {/* Create / Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? "Edit Examination" : "Create New Examination"}
        description="Fill in exam details, duration, pass marks, and pricing for your students."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Row 1: Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Title <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Physics Final Exam"
                className="h-9 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Course <span className="text-rose-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quantum Mechanics"
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Row 2: Access & Pricing + Webcam Proctoring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Access Model Card */}
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                  Access & Pricing
                </label>
                {accessType === "PAID" && (
                  <div className="w-24">
                    <Input
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(Math.max(1, Number(e.target.value) || 0))}
                      placeholder="Price $"
                      className="h-7 text-xs font-bold font-mono text-emerald-600"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setAccessType("FREE"); setPrice(0); }}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer font-semibold text-[11px] ${
                    accessType === "FREE"
                      ? "border-[#0092E3] bg-blue-50/90 dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Free Exam
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!hasPremium) {
                      setSubscriptionMessage("Teacher Premium Membership ($20/year) is required to conduct Paid examinations.");
                      setIsSubscriptionOpen(true);
                      return;
                    }
                    setAccessType("PAID");
                    if (price === 0) setPrice(50);
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer font-semibold text-[11px] flex items-center justify-center gap-1 ${
                    accessType === "PAID"
                      ? "border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>Paid Exam</span>
                  {!hasPremium && <span className="text-[8.5px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">Premium</span>}
                </button>
              </div>
            </div>

            {/* Live Camera Proctoring Card */}
            <div className="p-2.5 rounded-xl bg-blue-50/40 dark:bg-cyan-950/20 border border-blue-100 dark:border-cyan-900/50 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer text-[11.5px]">
                  <Camera className="h-3.5 w-3.5 text-[#0092E3]" />
                  <span>Webcam Proctoring</span>
                </label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {requireCamera
                    ? "📷 Video feed invigilation active"
                    : "🚫 Telemetry monitoring active"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequireCamera(!requireCamera)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  requireCamera ? "bg-[#0092E3]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    requireCamera ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 3: Availability Schedule (Optional Dates) */}
          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11.5px]">
                <Clock className="h-3.5 w-3.5 text-[#0092E3]" />
                Schedule Window
              </span>
              <span className="text-[10px] font-semibold text-[#0092E3] dark:text-cyan-400 bg-blue-100/60 dark:bg-cyan-900/40 px-2 py-0.5 rounded-md">
                ⚡ Leave Blank = Start Anytime
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  Start Date & Time <span className="text-[9.5px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="h-9 text-xs py-1.5 font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  End Date & Time <span className="text-[9.5px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="h-8 text-xs py-1"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Metrics & Status Grid (4 Columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Mins) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 60)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Marks <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value) || 100)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pass Mark <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={passMark}
                onChange={(e) => setPassMark(Number(e.target.value) || 40)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status <span className="text-rose-500">*</span>
              </label>
              <Select
                options={[
                  { value: "Published", label: "Published (Live)" },
                  { value: "Scheduled", label: "Scheduled" },
                  { value: "Draft", label: "Draft (Saved)" },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-8 text-xs py-1"
              />
            </div>
          </div>

          {/* Row 5: Instructions / Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Instructions
            </label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief guidelines or topics covered for students..."
              className="text-xs py-1.5 min-h-[48px] resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-8 text-xs px-4">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-xs px-5 bg-[#0092E3] hover:bg-[#007AC9] text-white">
              {editingExam ? "Update Exam" : "Create Exam"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share & Room Code Modal */}
      {sharingExam && (
        <ExamShareModal
          isOpen={!!sharingExam}
          onClose={() => setSharingExam(null)}
          exam={sharingExam}
        />
      )}

      {/* Teacher Premium Subscription Modal ($20/year) */}
      <TeacherSubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onSuccess={() => {
          showToast("⭐ Premium membership activated for 1 year!");
        }}
        initialMessage={subscriptionMessage}
      />
    </div>
  );
}