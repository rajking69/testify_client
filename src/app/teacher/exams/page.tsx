"use client";

import React, { useState } from "react";
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

export interface ExamItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  duration: number; // in minutes
  totalMarks: number;
  passMark: number;
  studentsCount: number;
  status: "Published" | "Scheduled" | "Draft" | "Ready";
  accessType?: "FREE" | "PAID";
  price?: number;
  joinCode?: string;
  accessToken?: string;
  teacherEmail?: string;
  createdBy?: string;
  questions?: any[];
}

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
              .filter((item: any) => item.creatorEmail === userEmail || item.teacherId === (session?.user as any)?.id)
              .map((item: any) => ({
                id: item._id,
                title: item.title,
                subject: item.subject || item.category || "General",
                description: item.description || "",
                date: "Active",
                duration: item.durationMinutes || 60,
                totalMarks: item.totalMarks || 50,
                passMark: Math.round((item.totalMarks || 50) * (item.passPercentage || 40) / 100),
                studentsCount: 0,
                status: item.status === "PUBLISHED" ? "Published" : "Draft",
                accessType: item.accessType === "PAID" ? "PAID" : "FREE",
                price: item.price || 0,
                teacherEmail: userEmail,
                createdBy: userEmail,
                questions: item.questions || [],
              }));

            apiExams.forEach((ae) => {
              if (!myExams.some((m) => m.id === ae.id)) {
                myExams.unshift(ae);
              }
            });
          }
        } catch {
          // Backend offline fallback
        }

        setExamsList(myExams);
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
    setExamsList(newList);
    try {
      const userEmail = session?.user?.email;
      const stored = localStorage.getItem("testify_teacher_exams");
      let allExams: ExamItem[] = stored ? JSON.parse(stored) : [];

      // Remove current teacher's previous exams from allExams and insert updated
      if (userEmail) {
        allExams = allExams.filter((e) => e.teacherEmail !== userEmail && e.createdBy !== userEmail);
      }
      allExams = [...newList, ...allExams];

      localStorage.setItem("testify_teacher_exams", JSON.stringify(allExams));
    } catch {
      // Fallback
    }
  };

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passMark, setPassMark] = useState(40);
  const [status, setStatus] = useState<"Published" | "Scheduled" | "Draft" | "Ready">("Draft");
  const [accessType, setAccessType] = useState<"FREE" | "PAID">("FREE");
  const [price, setPrice] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    setEditingExam(null);
    setTitle("");
    setSubject("");
    setDescription("");
    setDate("Today, 3:00 PM");
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
    setTitle(exam.title);
    setSubject(exam.subject);
    setDescription(exam.description);
    setDate(exam.date);
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

    const finalPrice = accessType === "PAID" ? Number(price) : 0;

    if (editingExam) {
      const updated: ExamItem[] = examsList.map((item) =>
        item.id === editingExam.id
          ? {
              ...item,
              title: title.trim(),
              subject: subject.trim(),
              description: description.trim(),
              date,
              duration: Number(duration),
              totalMarks: Number(totalMarks),
              passMark: Number(passMark),
              status,
              accessType,
              price: finalPrice,
            }
          : item
      );
      updateExamsState(updated);
      try {
        await examService.updateExam(editingExam.id, {
          title: title.trim(),
          description: description.trim(),
          durationMinutes: Number(duration),
          totalMarks: Number(totalMarks),
          accessType,
          price: finalPrice,
        });
      } catch {}
      showToast("Exam updated successfully!");
      setIsModalOpen(false);
    } else {
      const newExamId = String(Date.now());
      const joinCode = generateJoinCode(subject);
      const accessToken = generateAccessToken();
      const newExam: ExamItem = {
        id: newExamId,
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        date: date || "Scheduled Soon",
        duration: Number(duration) || 60,
        totalMarks: Number(totalMarks) || 50,
        passMark: Number(passMark) || 20,
        studentsCount: 0,
        status: "Draft",
        accessType,
        price: finalPrice,
        joinCode,
        accessToken,
        teacherEmail: session?.user?.email || "",
        createdBy: session?.user?.email || "",
        questions: [],
      };
      updateExamsState([newExam, ...examsList]);
      try {
        await examService.createExam({
          title: title.trim(),
          category: subject.trim(),
          subject: subject.trim(),
          description: description.trim(),
          durationMinutes: Number(duration) || 60,
          totalMarks: Number(totalMarks) || 50,
          passPercentage: Math.round(((Number(passMark) || 20) / (Number(totalMarks) || 50)) * 100),
          accessType,
          price: finalPrice,
          status: "DRAFT",
          questions: [],
        });
      } catch {}
      showToast("Exam created! Redirecting to Question Setup...");
      setIsModalOpen(false);
      // Seamlessly redirect teacher to Question Setup Console
      router.push(`/teacher/exams/${newExamId}/setup`);
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

  const handleToggleStatus = (id: string) => {
    const updated: ExamItem[] = examsList.map((item) => {
      if (item.id === id) {
        const nextStatus: "Published" | "Scheduled" | "Draft" =
          item.status === "Published" ? "Scheduled" : "Published";
        return { ...item, status: nextStatus };
      }
      return item;
    });
    updateExamsState(updated);
    showToast("Exam status updated!");
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {examsList.map((exam) => (
          <Card key={exam.id} hoverEffect className="flex flex-col justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  {exam.accessType === "PAID" ? (
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Paid • ${exam.price || 5}
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
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-[#0092E3]" /> {exam.date}
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
        ))}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exam Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Physics Final Exam"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject / Course <span className="text-rose-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quantum Mechanics"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Date & Time
              </label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Tomorrow, 2:00 PM"
              />
            </div>
          </div>

          {/* Exam Access & Pricing Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Exam Access & Pricing Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setAccessType("FREE"); setPrice(0); }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  accessType === "FREE"
                    ? "border-[#0092E3] bg-blue-50/70 dark:bg-cyan-950/50 shadow-sm"
                    : "border-slate-200 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-bold text-[#152234] dark:text-white">Free Exam</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Students can join without payment</div>
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
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  accessType === "PAID"
                    ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-sm"
                    : "border-slate-200 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#152234] dark:text-white">
                  <span>Paid Exam</span>
                  {!hasPremium && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">Premium</span>}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Students purchase access before entry</div>
              </button>
            </div>

            {accessType === "PAID" && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Price (Ã Â§Â³ / BDT) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Math.max(1, Number(e.target.value) || 0))}
                  placeholder="e.g. 50"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Minutes) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 60)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Marks <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value) || 100)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pass Mark <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={passMark}
                onChange={(e) => setPassMark(Number(e.target.value) || 40)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <Select
              options={[
                { value: "Published", label: "Published (Live)" },
                { value: "Scheduled", label: "Scheduled (Upcoming)" },
                { value: "Draft", label: "Draft (Saved)" },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Instructions
            </label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide guidelines, topics covered, or anti-cheat warnings for students..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
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
