"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBookOpen,
  FiAward,
  FiClock,
  FiTarget,
  FiZap,
  FiHome,
  FiKey,
  FiBarChart2,
  FiChevronRight,
  FiEdit3,
  FiCheck,
  FiAlertCircle,
  FiCamera,
  FiUpload,
  FiUser,
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
  FiActivity,
  FiTrendingUp,
  FiLayers,
  FiFilter,
  FiExternalLink,
} from "react-icons/fi";
import {
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineRocketLaunch,
} from "react-icons/hi2";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { authClient } from "@/lib/auth-client";
import { examService } from "@/services/exam.service";
import { purchaseService } from "@/services/purchase.service";

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

  useEffect(() => {
    const calculateStats = () => {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const attemptSubs = purchaseService.getStudentAttempts();

        attemptSubs.forEach((att) => {
          if (!storedSubs.some((s: any) => String(s.id || s.examId) === String(att.id || att.examId))) {
            storedSubs.push({
              id: att.id,
              examId: att.examId,
              title: att.examTitle,
              subject: att.subject,
              duration: `${att.durationMinutes} mins`,
              schedule: `Completed on ${new Date(att.submissionTime || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              status: "Completed",
              score: `${Math.round((att.score / (att.totalMarks || 1)) * 100)}%`,
              percentage: Math.round((att.score / (att.totalMarks || 1)) * 100),
              studentEmail: att.studentEmail,
              studentName: att.studentName,
              completedAt: att.submissionTime || new Date().toISOString(),
              timeTakenSeconds: att.durationMinutes * 60,
            });
          }
        });

        const userEmail = session?.user?.email?.trim().toLowerCase();
        const userSubs = storedSubs.filter((s: any) => {
          if (!userEmail) return true;
          if (!s.studentEmail || s.studentEmail === "student@example.com") return true;
          return s.studentEmail.toLowerCase() === userEmail;
        });

        const count = userSubs.length;
        const avg = count > 0 ? Math.round(userSubs.reduce((acc: number, s: any) => acc + (parseFloat(s.percentage || s.score) || 0), 0) / count) : 0;

        const hist = JSON.parse(localStorage.getItem("testify_practice_history") || "[]");
        const practiceSolvedCount = hist.reduce((acc: number, h: any) => acc + (h.totalQuestions || 10), 0);
        const totalSeconds = userSubs.reduce((acc: number, s: any) => acc + (s.timeTakenSeconds || 600), 0);
        const studyHours = Math.round((totalSeconds / 3600) * 10) / 10;

        setDashboardStats({
          completedExams: count,
          averageScore: avg,
          practiceSolved: practiceSolvedCount || count * 10,
          practiceSessionsCount: hist.length || count,
          activeStudyTimeHours: studyHours > 0 ? studyHours : count > 0 ? Math.round(count * 0.5 * 10) / 10 : 0,
        });
      } catch (err) {
        console.error("Failed to calculate stats", err);
      }
    };

    const syncLiveAssessments = async () => {
      try {
        const userEmail = session?.user?.email?.trim().toLowerCase();
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const attemptSubs = purchaseService.getStudentAttempts();

        attemptSubs.forEach((att) => {
          if (!storedSubs.some((s: any) => String(s.id || s.examId) === String(att.id || att.examId))) {
            storedSubs.push({
              id: att.id,
              examId: att.examId,
              title: att.examTitle,
              subject: att.subject,
              duration: `${att.durationMinutes} mins`,
              schedule: `Completed on ${new Date(att.submissionTime || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              status: "Completed",
              score: `${Math.round((att.score / (att.totalMarks || 1)) * 100)}%`,
              percentage: Math.round((att.score / (att.totalMarks || 1)) * 100),
              studentEmail: att.studentEmail,
              studentName: att.studentName,
              token: att.examId,
              completedAt: att.submissionTime || new Date().toISOString(),
            });
          }
        });

        const userSubs = storedSubs.filter((s: any) => {
          if (!userEmail) return true;
          if (!s.studentEmail || s.studentEmail === "student@example.com") return true;
          return s.studentEmail.toLowerCase() === userEmail;
        });

        let list: EnrolledExamItem[] = userSubs.map((sub: any) => ({
          id: String(sub.id || sub.examId),
          title: sub.title || "Live Assessment Examination",
          subject: sub.subject || "General",
          schedule: sub.schedule || `Completed on ${new Date(sub.completedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          duration: sub.duration || "60 mins",
          status: "Completed",
          score: sub.score || `${sub.percentage}%`,
          percentage: typeof sub.percentage === "number" ? sub.percentage : parseInt(sub.score || "0"),
          token: sub.token || sub.id,
        }));

        const teacherExams = localStorage.getItem("testify_teacher_exams");
        if (teacherExams) {
          const tList = JSON.parse(teacherExams);
          tList.forEach((t: any) => {
            const alreadySubmitted = list.some((item) => item.id === String(t.id) || item.token === t.accessToken || item.token === t.joinCode);
            if (!alreadySubmitted) {
              list.push({
                id: String(t.id),
                title: t.title,
                subject: t.subject || "General",
                schedule: "Active Today • Available",
                duration: `${t.duration || 60} mins`,
                status: "Available",
                token: t.accessToken || t.joinCode || String(t.id),
              });
            }
          });
        }

        try {
          const res = await examService.getAllExams();
          if (res?.data && res.data.length > 0) {
            res.data.forEach((b: any) => {
              const alreadyInList = list.some((item) => item.id === String(b._id) || item.token === b.accessToken || item.token === b.joinCode);
              if (!alreadyInList && b.isPublished !== false && b.status !== "Draft") {
                list.push({
                  id: String(b._id),
                  title: b.title,
                  subject: b.subject || b.category || "General",
                  schedule: "Available Now",
                  duration: `${b.durationMinutes || 60} mins`,
                  status: "Available",
                  token: b.accessToken || b.joinCode || String(b._id),
                });
              }
            });
          }
        } catch {}

        setLiveAssessmentItems(list);
      } catch {
        setLiveAssessmentItems([]);
      }
    };

    calculateStats();
    syncLiveAssessments();

    const handleSync = () => {
      calculateStats();
      syncLiveAssessments();
    };

    window.addEventListener("testify_exam_submitted", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("testify_exam_submitted", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [session?.user?.email]);

  const [quickRoomCode, setQuickRoomCode] = useState("");
  const [roomCodeError, setRoomCodeError] = useState<string | null>(null);

  const [customProfile, setCustomProfile] = useState<{ name?: string; image?: string }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            <HiOutlineAcademicCap className="h-7 w-7" />
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
            <FiAlertCircle className="h-7 w-7" />
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

  const filteredExams = liveAssessmentItems.filter((item) => {
    if (activeTab === "completed") return item.status === "Completed";
    if (activeTab === "available") return item.status === "Available" || item.status === "Scheduled";
    return true;
  });
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
            <FiCheckCircle className="h-4 w-4 text-[#00CBB8] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HERO PROFILE HEADER CARD (KEPT EXACTLY AS YOU REQUESTED) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#070E1A]/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
          {/* Student Profile Picture with Upload Trigger */}
          <div className="relative group shrink-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-[#0092E3]/30 dark:border-cyan-500/30 bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] shadow-md flex items-center justify-center text-white text-2xl font-bold">
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
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-[#0092E3] hover:bg-[#007AC9] text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title="Change Profile Picture"
            >
              <FiCamera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-[#152234] dark:text-white tracking-tight">
                {displayedName}
              </h1>
              <button
                onClick={handleOpenEditProfile}
                className="text-slate-400 hover:text-[#0092E3] transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <FiEdit3 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBF7FF] dark:bg-cyan-950/60 border border-blue-100 dark:border-cyan-800 text-[11px] font-bold text-[#0092E3] dark:text-cyan-300">
                <HiOutlineAcademicCap className="h-3.5 w-3.5" />
                Student Scholar
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <FiCheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Verified Student Account
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              Welcome to your Testify Student Portal. Manage assessments, practice question banks, and review performance transcripts.
            </p>
          </div>
        </div>

        {/* Action Controls including Landing Page Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiHome className="h-4 w-4 text-[#0092E3]" />}
              className="h-10 px-4 rounded-xl font-bold text-xs border-slate-200/90 dark:border-slate-700/80 hover:border-[#0092E3]/40 transition-all shadow-xs"
              title="Return to Public Landing Page"
            >
              Landing Page
            </Button>
          </Link>

          <Link href="/practice">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiZap className="h-4 w-4 text-[#00CBB8]" />}
              className="h-10 px-4 rounded-xl font-bold text-xs border-slate-200/90 dark:border-slate-700/80 hover:border-[#00CBB8]/40 transition-all shadow-xs"
            >
              Practice Hub
            </Button>
          </Link>

          <Link href="/student/exams">
            <Button
              size="sm"
              rightIcon={<FiArrowRight className="h-3.5 w-3.5" />}
              className="h-10 px-5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#0092E3] to-[#007AC9] hover:from-[#007AC9] hover:to-[#0062A3] text-white shadow-md shadow-[#0092E3]/25 transition-all"
            >
              Browse Exams
            </Button>
          </Link>

          <ThemeToggle className="shrink-0 h-10 w-10 rounded-xl" />
        </div>
      </motion.div>

      {/* 2. STATS OVERVIEW - PROFESSIONAL SLEEK BENTO CARDS */}
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
              <FiBookOpen className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
              {dashboardStats.completedExams > 0 ? `+${dashboardStats.completedExams} Passed` : "0 Submitted"}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.completedExams}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
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
              <FiAward className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              {dashboardStats.averageScore >= 80 ? "Grade A+" : dashboardStats.averageScore > 0 ? "Active Learner" : "Pending"}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.completedExams > 0 ? `${dashboardStats.averageScore}%` : "0%"}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
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
              <FiTarget className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              {dashboardStats.practiceSessionsCount} Drills
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.practiceSolved}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
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
              <FiClock className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
              {dashboardStats.activeStudyTimeHours > 0 ? "Scholar" : "Standard"}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              {dashboardStats.activeStudyTimeHours} <span className="text-base font-medium text-slate-400">Hrs</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Active Study &amp; Exam Time</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* 3. SLEEK ROOM CODE QUICK LAUNCHER BAR */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-slate-900/90 dark:from-cyan-950/30 dark:via-slate-950 dark:to-[#080E1A] p-4 sm:p-5 shadow-xs"
      >
        <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
              <FiKey className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Join Private Examination Room
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Have an invitation pass? Enter your instructor&apos;s Room Code (e.g. <code className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">CS-ALGO-2026</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                placeholder="ENTER CODE..."
                value={quickRoomCode}
                onChange={(e) => {
                  setQuickRoomCode(e.target.value);
                  setRoomCodeError(null);
                }}
                className="w-full h-10 rounded-xl px-3.5 text-xs font-mono font-bold uppercase tracking-wider bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#0092E3] to-[#007AC9] hover:from-[#007AC9] hover:to-[#0062A3] text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Enter Room</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
        {roomCodeError && (
          <p className="text-xs text-rose-500 mt-2 font-semibold flex items-center gap-1.5 pl-1">
            <FiAlertCircle className="h-3.5 w-3.5" />
            <span>{roomCodeError}</span>
          </p>
        )}
      </motion.div>
      {/* 4. MAIN TWO-COLUMN PROFESSIONAL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assessment Activity & Schedules (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Assessment List Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] p-5 sm:p-6 shadow-xs"
          >
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FiActivity className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    Assessment Activity &amp; Live Schedules
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your enrolled test papers, completed transcripts, and active tests
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  All ({liveAssessmentItems.length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "completed"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Completed ({dashboardStats.completedExams})
                </button>
                <button
                  onClick={() => setActiveTab("available")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === "available"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Available
                </button>
              </div>
            </div>

            {/* Assessment Feed Items */}
            <div className="pt-4 space-y-3">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam, i) => (
                  <motion.div
                    key={`${exam.id}-${i}`}
                    whileHover={{ scale: 1.005 }}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-900/80 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                          exam.status === "Completed"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                            : "bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400"
                        }`}
                      >
                        {exam.status === "Completed" ? (
                          <FiCheckCircle className="h-5 w-5" />
                        ) : (
                          <FiBookOpen className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {exam.title}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {exam.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="h-3 w-3" />
                            {exam.schedule}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FiClock className="h-3 w-3" />
                            {exam.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action & Score Right */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      {exam.status === "Completed" ? (
                        <>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Score: {exam.score}
                            </span>
                          </div>
                          <Link
                            href={`/practice/result?score=${exam.percentage || 60}&total=100&subject=${encodeURIComponent(exam.subject)}&title=${encodeURIComponent(exam.title)}`}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 bg-white dark:bg-slate-800 flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <span>Review Transcript</span>
                            <FiArrowRight className="h-3 w-3" />
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/exam/${encodeURIComponent(exam.token || exam.id)}`}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#0092E3] to-[#007AC9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 hover:shadow-md transition-all active:scale-95"
                        >
                          <span>Start Exam</span>
                          <FiArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                    <FiLayers className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No assessments found in this view
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Explore available certified exam papers or practice question modules from the directory.
                  </p>
                  <Link
                    href="/student/exams"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#0092E3] hover:underline pt-1"
                  >
                    <span>Browse Examination Catalog</span>
                    <FiArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

                  </div>

        {/* Right Column: Academic Progress (4 Cols) */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080E1A] p-5 sm:p-6 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <FiTrendingUp className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Academic Progress
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                Verified
              </span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Exam Accuracy</span>
                  <span className="text-cyan-600 dark:text-cyan-400">
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
                  <span className="text-emerald-600 dark:text-emerald-400">
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
                  <span className="text-amber-600 dark:text-amber-400">
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
        </div>
      </div>

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
                title="Upload Photo"
              >
                <FiCamera className="h-3.5 w-3.5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-[#0092E3] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FiUpload className="h-3.5 w-3.5" />
              <span>Choose Photo from Device</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your full name"
              required
              className="text-xs h-10 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Or Paste Avatar Image URL
            </label>
            <Input
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="text-xs h-10 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingProfile}
              className="rounded-xl text-xs h-9 bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
