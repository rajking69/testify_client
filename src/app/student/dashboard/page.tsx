"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Award,
  Clock,
  Target,
  Zap,
  Home,
  Key,
  BarChart2,
  ChevronRight,
  Edit3,
  Check,
  AlertCircle,
  Camera,
  Upload,
  User,
  Calendar,
  ArrowRight,
  CheckCircle,
  Activity,
  TrendingUp,
  Layers,
  Filter,
  ExternalLink,
  Search,
  ChevronLeft,
  FileText,
  PlayCircle,
  Bookmark,
  Shield,
  GraduationCap,
  Sparkles,
  Rocket,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TestifyLogoIcon, Logo } from "@/components/ui/Logo";
import { authClient } from "@/lib/auth-client";
import { examService } from "@/services/exam.service";
import { purchaseService, ExamPurchaseRecord } from "@/services/purchase.service";
import { StudentInvoiceModal } from "@/components/student/StudentInvoiceModal";
import { studentService } from "@/services/student.service";
interface EnrolledExamItem {
  id: string;
  title: string;
  subject: string;
  schedule: string;
  duration: string;
  status: "Available" | "Scheduled" | "Completed";
  score?: string;
  percentage?: number;
  token: string;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();

  const [dashboardStats, setDashboardStats] = useState({
    completedExams: 0,
    averageScore: 0,
    practiceSolved: 0,
    practiceSessionsCount: 0,
    activeStudyTimeHours: 0,
  });

  const [liveAssessmentItems, setLiveAssessmentItems] = useState<EnrolledExamItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "available">("all");

  const [quickRoomCode, setQuickRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState<string | null>(null);

  const [customProfile, setCustomProfile] = useState<{ name?: string; image?: string }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTranscriptsModalOpen, setIsTranscriptsModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transcriptFilter, setTranscriptFilter] = useState<"all" | "passed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [studentInvoices, setStudentInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoicePage, setInvoicePage] = useState(1);
  const invoicesPerPage = 10;

  const [completedExamIds, setCompletedExamIds] = useState<string[]>([]);

  // Load Submissions from Backend & LocalStorage
  useEffect(() => {
    async function syncSubmissions() {
      const currentEmail = (session?.user?.email || "").trim().toLowerCase();
      const currentUserId = session?.user?.id;
      if (!currentEmail && !currentUserId) return;

      try {
        let completed: string[] = [];

        if (typeof window !== "undefined") {
          try {
            const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
            completed = storedSubs
              .filter((s: any) =>
                (currentEmail && s.studentEmail && s.studentEmail.trim().toLowerCase() === currentEmail) ||
                (currentUserId && s.studentId && s.studentId === currentUserId)
              )
              .flatMap((s: any) => [
                String(s.examId || ""),
                String(s.id || ""),
                String(s.token || ""),
                String(s.accessToken || ""),
                String(s.joinCode || ""),
                String(s.title || "").toLowerCase(),
                String(s.examTitle || "").toLowerCase()
              ].filter(Boolean));
          } catch {}
        }

        try {
          const res = await examService.getMySubmissions();
          if (res && res.data && res.data.length > 0) {
            const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
            const apiSubsConverted = res.data.map((sub: any) => ({
              id: String(sub._id || sub.examId),
              examId: String(sub.examId),
              title: (sub.exam as any)?.title || sub.title || "Completed Assessment",
              subject: (sub.exam as any)?.subject || sub.subject || "General",
              duration: `${(sub.exam as any)?.durationMinutes || 60} mins`,
              status: "Completed",
              score: `${sub.score || 0}%`,
              percentage: sub.score || 0,
              isPassed: Boolean(sub.passed),
              studentEmail: currentEmail,
              studentId: currentUserId,
              token: String(sub.examId),
              completedAt: sub.submittedAt || new Date().toISOString(),
            }));

            const merged = [...storedSubs];
            apiSubsConverted.forEach((apiItem: any) => {
              if (!merged.some((m: any) => String(m.examId) === String(apiItem.examId) && ((currentEmail && m.studentEmail === currentEmail) || (currentUserId && m.studentId === currentUserId)))) {
                merged.unshift(apiItem);
              }
            });
            localStorage.setItem("testify_student_submissions", JSON.stringify(merged));

            const userOnlySubs = merged.filter((s: any) =>
              (currentEmail && s.studentEmail && s.studentEmail.trim().toLowerCase() === currentEmail) ||
              (currentUserId && s.studentId && s.studentId === currentUserId)
            );

            completed = userOnlySubs.flatMap((s: any) => [
              String(s.examId || ""),
              String(s.id || ""),
              String(s.token || ""),
              String(s.accessToken || ""),
              String(s.joinCode || ""),
              String(s.title || "").toLowerCase(),
              String(s.examTitle || "").toLowerCase()
            ].filter(Boolean));
          }
        } catch {}

        setCompletedExamIds(completed);
      } catch {}
    }

    syncSubmissions();

    window.addEventListener("testify_exam_submitted", syncSubmissions);
    return () => window.removeEventListener("testify_exam_submitted", syncSubmissions);
  }, [session?.user?.email, session?.user?.id]);

  const isExamCompleted = (examIdStr: string, examTitleStr: string) => {
    const currentEmail = (session?.user?.email || "").trim().toLowerCase();
    const currentUserId = session?.user?.id;

    if (!currentEmail && !currentUserId) return false;

    const idStr = String(examIdStr || "");
    const titleStr = String(examTitleStr || "").trim().toLowerCase();

    const inLive = liveAssessmentItems.some(
      (item: any) =>
        String(item.id || item.examId) === idStr ||
        (titleStr && item.title && item.title.trim().toLowerCase() === titleStr)
    );
    if (inLive) return true;

    if (
      (idStr && completedExamIds.includes(idStr)) ||
      (titleStr && completedExamIds.includes(titleStr))
    ) {
      return true;
    }

    if (typeof window !== "undefined") {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        return storedSubs.some((s: any) => {
          const sEmail = (s.studentEmail || "").trim().toLowerCase();
          const sUserId = s.studentId || s.userId;

          const matchUser =
            (currentEmail && sEmail && sEmail === currentEmail) ||
            (currentUserId && sUserId && sUserId === currentUserId);

          if (!matchUser) return false;

          const sExamId = String(s.examId || s.id || s.token || "");
          const sTitle = String(s.title || s.examTitle || "").trim().toLowerCase();
          return (
            sExamId === idStr ||
            (sTitle && titleStr && (sTitle === titleStr || sTitle.includes(titleStr) || titleStr.includes(sTitle)))
          );
        });
      } catch {}
    }

    return false;
  };

  const isExamExpired = (inv: any) => {
    if (inv.endDateTime) {
      const endDate = new Date(inv.endDateTime);
      if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
        return true;
      }
    }
    const statusUpper = String(inv.status || "").toUpperCase();
    if (statusUpper === "EXPIRED") return true;
    return false;
  };


  // Sync & Load Student Purchased Invoices
  useEffect(() => {
    const loadStudentInvoices = async () => {
      if (!session?.user) {
        setStudentInvoices([]);
        return;
      }
      try {
        const studentEmail = session.user.email;
        const studentId = session.user.id;

        // Sync backend purchases for logged in user if available
        try {
          const apiRes = await examService.getMyPurchases();
          if (apiRes && apiRes.data && Array.isArray(apiRes.data)) {
            apiRes.data.forEach((p: any) => {
              const finalPrice = Number(p.paidAmount || p.pricePaid || p.amount || 0);
              purchaseService.recordPurchase({
                id: p.id || p._id || `INV-${Date.now()}`,
                transactionId: p.transactionId || p.paymentId || `TXN-${Date.now()}`,
                studentId: studentId,
                studentName: p.studentName || session.user.name || "Student",
                studentEmail: studentEmail,
                examId: String(p.examId),
                examTitle: p.examTitle || p.exam?.title || "Examination Assessment",
                teacherId: p.teacherId || "",
                teacherName: p.teacherName || p.exam?.teacherName || "Instructor",
                teacherEmail: p.teacherEmail || "",
                originalExamPrice: finalPrice,
                paidAmount: finalPrice,
                amount: finalPrice,
                currency: p.currency || "USD",
                paymentProvider: p.paymentProvider || "STRIPE",
                paymentStatus: "SUCCESS",
                purchasedAt: p.purchasedAt || p.createdAt || new Date().toISOString(),
                purchaseDate: p.purchaseDate || p.createdAt || new Date().toISOString(),
                createdAt: p.createdAt || new Date().toISOString(),
                accessStatus: "ACTIVE",
              });
            });
          }
        } catch {}

        // Get student specific purchases ONLY for current logged in user
        const invoices = purchaseService.getStudentPurchases(studentEmail, studentId);
        setStudentInvoices(invoices);
      } catch (err) {
        console.error("Failed to load student invoices:", err);
      }
    };

    loadStudentInvoices();

    window.addEventListener("testify_profile_updated", loadStudentInvoices);
    window.addEventListener("testify_exam_submitted", loadStudentInvoices);
    window.addEventListener("testify_purchase_completed", loadStudentInvoices);

    return () => {
      window.removeEventListener("testify_profile_updated", loadStudentInvoices);
      window.removeEventListener("testify_exam_submitted", loadStudentInvoices);
      window.removeEventListener("testify_purchase_completed", loadStudentInvoices);
    };
  }, [session?.user]);


  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user) return;
      try {
        const statsRes = await studentService.getDashboardStats();
        if (statsRes && statsRes.data) {
          setDashboardStats({
            completedExams: statsRes.data.completedExams || 0,
            averageScore: statsRes.data.averageScore || 0,
            practiceSolved: statsRes.data.practiceSolved || 0,
            practiceSessionsCount: statsRes.data.practiceSessionsCount || 0,
            activeStudyTimeHours: statsRes.data.activeStudyTimeHours || 0,
          });
          
          if (statsRes.data.recentSubmissions) {
            setLiveAssessmentItems(statsRes.data.recentSubmissions.map((sub: any) => ({
              id: sub.id,
              examId: sub.id,
              title: sub.title || "Assessment",
              subject: sub.category || "General",
              schedule: `Completed on ${new Date(sub.completedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              duration: "60 mins",
              status: "Completed",
              score: `${sub.score || 0}%`,
              percentage: sub.score || 0,
              token: sub.id,
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchDashboardData();
  }, [session?.user]);

  useEffect(() => {
    const syncStudentData = () => {
      try {
        const userEmail = session?.user?.email;
        if (userEmail) {
          const userSpecific = localStorage.getItem(`testify_custom_profile_${userEmail}`);
          if (userSpecific) {
            setCustomProfile(JSON.parse(userSpecific));
          } else {
            setCustomProfile({});
          }
        }
      } catch {}
    };

    syncStudentData();
    window.addEventListener("testify_profile_updated", syncStudentData);
    return () => window.removeEventListener("testify_profile_updated", syncStudentData);
  }, [session?.user?.email]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 320;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => reject(new Error("Image decoding failed"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setProfileImage(compressedBase64);
        showToast("Image compressed & ready to save!");
      } catch {
        showToast("Failed to process image file.");
      }
    }
  };

  const displayedName = customProfile.name || session?.user?.name || "Student Scholar";
  const displayedImage = customProfile.image || session?.user?.image;

  const handleOpenEditProfile = () => {
    let savedLocalImage = "";
    try {
      const userEmail = session?.user?.email;
      if (userEmail) {
        const stored = localStorage.getItem(`testify_custom_profile_${userEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          savedLocalImage = parsed.image || "";
        }
      }
    } catch {}

    setProfileName(displayedName);
    setProfileImage(savedLocalImage || displayedImage || "");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = profileName.trim();
    const finalImage = profileImage.trim();
    if (!finalName) return;

    setIsSavingProfile(true);
    try {
      const userEmail = session?.user?.email;
      if (userEmail) {
        localStorage.setItem(
          `testify_custom_profile_${userEmail}`,
          JSON.stringify({ name: finalName, image: finalImage })
        );
      }
      localStorage.setItem(
        "testify_custom_profile",
        JSON.stringify({ name: finalName, image: finalImage, email: userEmail })
      );

      window.dispatchEvent(
        new CustomEvent("testify_profile_updated", {
          detail: { name: finalName, image: finalImage, email: userEmail },
        })
      );

      await authClient.updateUser({
        name: finalName,
        image: finalImage,
      });

      showToast("Profile updated successfully!");
      await refetch();
      setIsEditModalOpen(false);
    } catch {
      showToast("Profile saved locally & synced across portal!");
      setIsEditModalOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = quickRoomCode.trim();
    if (!code) {
      setRoomCodeError("Please enter a valid Exam Room Code.");
      return;
    }
    setRoomCodeError(null);
    router.push(`/exam/${encodeURIComponent(code)}`);
  };

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#0092E3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-[#EBF7FF] dark:bg-cyan-950/60 text-[#0092E3] flex items-center justify-center mx-auto border border-blue-100">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#152234] dark:text-white">Authentication Required</h2>
          <p className="text-xs text-slate-500">Please sign in to access your student portal.</p>
          <Link
            href="/auth/login"
            className="inline-block rounded-xl bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-sm"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (session.user.role !== "student") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white dark:bg-[#0B1220] p-8 shadow-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#152234] dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-500">Signed in as <strong className="text-[#0092E3] capitalize">{session.user.role}</strong>.</p>
          <Link
            href={`/${session.user.role}/dashboard`}
            className="inline-block rounded-xl bg-[#152234] text-white font-bold text-xs px-6 py-2.5"
          >
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ITEMS_PER_PAGE = 4;

  const filteredExams = liveAssessmentItems.filter((item) => {
    const matchesFilter = transcriptFilter === "passed" ? (item.percentage ? item.percentage >= 80 : parseInt(item.score || "0") >= 80) : true;
    const matchesSearch = !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalInvoicePages = Math.ceil(studentInvoices.length / invoicesPerPage) || 1;
  const paginatedInvoices = studentInvoices.slice((invoicePage - 1) * invoicesPerPage, invoicePage * invoicesPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl bg-[#0B2238] dark:bg-cyan-950 border border-cyan-500/40 text-white px-5 py-3 shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl"
          >
            <CheckCircle className="h-4 w-4 text-[#00CBB8] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. UNIFIED DYNAMIC TOP TOOLBAR (PROFILE + QUICK ROOM JOIN + NAV ACTIONS) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#070E1A]/95 p-4 sm:p-5 shadow-sm backdrop-blur-xl space-y-4 relative"
      >
        {/* Top Tier: Student Profile & Navigation Action Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Student Profile */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative group shrink-0">
              <div className="h-14 w-14 sm:h-15 sm:w-15 rounded-2xl overflow-hidden border-2 border-[#0092E3]/30 dark:border-cyan-500/30 bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] shadow-sm flex items-center justify-center text-white text-xl font-bold">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt={displayedName}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{displayedName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={handleOpenEditProfile}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#0092E3] hover:bg-[#007AC9] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-display text-[#152234] dark:text-white tracking-tight">
                  {displayedName}
                </h1>
                <button
                  onClick={handleOpenEditProfile}
                  className="text-slate-400 hover:text-[#0092E3] transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBF7FF] dark:bg-cyan-950/60 border border-blue-100 dark:border-cyan-800 text-[11px] font-bold text-[#0092E3] dark:text-cyan-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Student Scholar
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  Verified Student
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeft className="h-4 w-4 text-[#0092E3]" />}
                className="h-9 px-3.5 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 hover:border-[#0092E3]/40 transition-all shadow-2xs"
              >
                Back to Home
              </Button>
            </Link>

            <Link href="/practice">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Zap className="h-4 w-4 text-[#00CBB8]" />}
                className="h-9 px-3.5 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 hover:border-[#00CBB8]/40 transition-all shadow-2xs"
              >
                Practice Hub
              </Button>
            </Link>

            <Link href="/student/exams">
              <Button
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                className="h-9 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#0092E3] to-[#007AC9] text-white shadow-xs shadow-[#0092E3]/20 transition-all"
              >
                Browse Exams
              </Button>
            </Link>

            
          </div>
        </div>

        {/* Bottom Tier: Dedicated Full-Width Quick Room Join Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <form onSubmit={handleJoinByCode} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none">
                <Key className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="ENTER EXAM ROOM CODE (E.G. CS-ALGO-2026)..."
                value={quickRoomCode}
                onChange={(e) => {
                  setQuickRoomCode(e.target.value);
                  setRoomCodeError(null);
                }}
                className="w-full h-10.5 pl-10 pr-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              className="h-10.5 px-6 rounded-xl bg-gradient-to-r from-[#0092E3] to-[#007AC9] hover:from-[#007AC9] hover:to-[#0062A3] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Join Exam Room</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          {roomCodeError && (
            <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1 pl-1">
              <AlertCircle className="h-3 w-3" />
              <span>{roomCodeError}</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* 2. STATS OVERVIEW - ENTERPRISE SLEEK BENTO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completed Exams */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] shadow-xs hover:shadow-lg hover:border-cyan-500/40 transition-all group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/50 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
              {dashboardStats.completedExams > 0 ? `+${dashboardStats.completedExams} Passed` : "0 Submitted"}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.completedExams}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Completed Assessments</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 2: Average Score */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              {dashboardStats.averageScore >= 80 ? "Grade A+" : dashboardStats.averageScore > 0 ? "Active Learner" : "Pending"}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.completedExams > 0 ? `${dashboardStats.averageScore}%` : "0%"}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Overall Average Score</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 3: Practice Solved */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] shadow-xs hover:shadow-lg hover:border-indigo-500/40 transition-all group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              {dashboardStats.practiceSessionsCount} Drills
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.practiceSolved}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Practice Questions Solved</span>
            </p>
          </div>
        </motion.div>

        {/* Metric 4: Active Study Time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -3 }}
          className="relative overflow-hidden p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] shadow-xs hover:shadow-lg hover:border-amber-500/40 transition-all group"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
              {dashboardStats.activeStudyTimeHours > 0 ? "Scholar" : "Standard"}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.activeStudyTimeHours} <span className="text-sm font-medium text-slate-400">Hrs</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Active Study &amp; Exam Time</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* 3. COMPLETED TRANSCRIPTS ACTION BANNER (FULL WIDTH) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        onClick={() => setIsTranscriptsModalOpen(true)}
        className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] p-5 sm:p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Completed Examination Transcripts
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/50">
                {liveAssessmentItems.length} Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access all examination scorecards, verified transcripts, and performance breakdowns in one clean hub.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsTranscriptsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-sm shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0 self-end sm:self-auto"
        >
          <span>View All Transcripts ({liveAssessmentItems.length})</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* 4. BALANCED BOTTOM WORKSPACE (2 EQUAL COLUMNS - NO L SHAPE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Academic Progress Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Academic Progress Analytics
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50">
              Verified
            </span>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4 py-1">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Exam Accuracy</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">
                  {dashboardStats.completedExams > 0 ? `${dashboardStats.averageScore}%` : "0%"}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dashboardStats.completedExams > 0 ? dashboardStats.averageScore : 5}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Practice Target</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {Math.min(100, Math.round((dashboardStats.practiceSolved / 50) * 100))}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, Math.min(100, Math.round((dashboardStats.practiceSolved / 50) * 100)))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Study Consistency</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                  {dashboardStats.activeStudyTimeHours > 0 ? "High" : "Ready"}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dashboardStats.activeStudyTimeHours > 0 ? Math.min(100, dashboardStats.activeStudyTimeHours * 30) : 10}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Quick Learning Shortcuts & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8.5 w-8.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Quick Learning Shortcuts
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fast Access
            </span>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/practice"
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-cyan-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                    Interactive Practice Hub
                  </h4>
                  <p className="text-[11px] text-slate-500">Timed drills &amp; topic quizzes</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/practice/saved"
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-500/40 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Bookmark className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                    My Bookmarked Questions
                  </h4>
                  <p className="text-[11px] text-slate-500">Review saved questions</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 5. MY PURCHASED EXAMS & INVOICES SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#EBF7FF] dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900/50">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <span>My Purchased Exams</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[#0092E3] dark:text-cyan-400 font-extrabold">
                  {studentInvoices.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified entry passes, teacher vouchers, and official tax invoices for your account.
              </p>
            </div>
          </div>
          {studentInvoices.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 text-xs font-bold shrink-0 self-start sm:self-auto">
              <CheckCircle className="h-3.5 w-3.5" /> Stripe Verified Access Active
            </span>
          )}
        </div>

        {studentInvoices.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Purchased Exams Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the exam marketplace to enroll in certified mock assessments and unlock official invoices.
              </p>
            </div>
            <Link href="/student/exams" className="inline-block pt-1">
              <Button className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs">
                Browse Marketplace Exams
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#080E1A] shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice & Date</th>
                  <th className="py-3 px-4">Examination & Instructor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Access Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {paginatedInvoices.map((inv) => {
                  const isAttempted = isExamCompleted(inv.examId, inv.examTitle);
                  const expired = isExamExpired(inv);
                  const paidVal = Number(inv.paidAmount ?? inv.amount ?? 0);
                  const teacherDisplay = inv.teacherName || inv.teacherEmail || "Certified Teacher / Instructor";
                  const formattedDate = new Date(inv.purchaseDate || inv.purchasedAt || Date.now()).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Invoice ID & Date */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-[#0092E3] text-xs">
                            {inv.id}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {formattedDate}
                          </span>
                        </div>
                      </td>

                      {/* Title & Instructor */}
                      <td className="py-3.5 px-4 align-middle max-w-[280px]">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate" title={inv.examTitle || "Certified Examination Assessment"}>
                            {inv.examTitle || "Certified Examination Assessment"}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>Instructor: <strong className="text-slate-700 dark:text-slate-300">{teacherDisplay}</strong></span>
                          </p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 text-[11px] font-extrabold">
                          PAID • ${paidVal.toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        {isAttempted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                            <CheckCircle className="h-3.5 w-3.5" /> Completed
                          </span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100/70 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold">
                            <Clock className="h-3.5 w-3.5" /> Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-100/70 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 text-[11px] font-bold">
                            <Clock className="h-3.5 w-3.5" /> Ready to Take
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#0092E3] text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0092E3] bg-white dark:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <FileText className="h-3.5 w-3.5 text-[#0092E3]" />
                            <span>Invoice</span>
                          </button>

                          {isAttempted ? (
                            <Link
                              href={`/practice/result?examId=${inv.examId}&title=${encodeURIComponent(inv.examTitle || "Exam")}`}
                            >
                              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Result</span>
                              </Button>
                            </Link>
                          ) : expired ? (
                            <div className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] font-black flex items-center gap-1 cursor-not-allowed uppercase tracking-wider select-none shadow-2xs">
                              <Clock className="h-3.5 w-3.5 text-white" />
                              <span>Expired</span>
                            </div>
                          ) : (
                            <Link href={`/exam/${inv.examId}`}>
                              <Button className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer">
                                <span>Start</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {studentInvoices.length > invoicesPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-500">
                <div className="font-medium text-slate-600 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{(invoicePage - 1) * invoicesPerPage + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(invoicePage * invoicesPerPage, studentInvoices.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{studentInvoices.length}</span> invoices
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={invoicePage === 1}
                    onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#0092E3] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-300 px-2">
                    Page {invoicePage} of {totalInvoicePages}
                  </span>
                  <button
                    type="button"
                    disabled={invoicePage >= totalInvoicePages}
                    onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#0092E3] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Scholar Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative group">
              <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-[#0092E3] bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <span>{(profileName || displayedName).charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-[#0092E3] text-white shadow-md hover:bg-[#007AC9] transition-all cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[11px] text-slate-500">Click camera icon to upload profile photo</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Full Scholar Name
            </label>
            <Input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Registered Email (Account Bound)
            </label>
            <Input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="text-xs opacity-70 bg-slate-50 dark:bg-slate-900 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold px-5"
            >
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Tax Invoice & Payment Receipt Modal Component */}
      <StudentInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
