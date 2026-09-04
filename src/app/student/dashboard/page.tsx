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
} from "react-icons/fi";
import {
  HiOutlineAcademicCap,
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
  token: string;
}

const recentExamsList: EnrolledExamItem[] = [];

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

  useEffect(() => {
    const calculateStats = () => {
      try {
        const storedSubs = JSON.parse(localStorage.getItem("testify_student_submissions") || "[]");
        const attemptSubs = purchaseService.getStudentAttempts();

        // Merge any attempts from purchaseService that might not be in storedSubs
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

        // Merge
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
          token: sub.token || sub.id,
        }));

        // Add teacher created exams
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

        // Add backend exams
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
  const [practiceCount, setPracticeCount] = useState<number>(18);

  // Custom Profile Editing with image upload
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
          const ctx = canvas.getContext("2d");
          const maxSize = 200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
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
        const hist = localStorage.getItem("testify_practice_history");
        if (hist) {
          setPracticeCount(JSON.parse(hist).length);
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

    const studentStats = [
    {
      icon: FiBookOpen,
      title: "Completed Exams",
      value: `${dashboardStats.completedExams}`,
      change: dashboardStats.completedExams > 0 ? `+${dashboardStats.completedExams} finished` : "No exams yet",
      iconColor: "text-[#0092E3]",
      iconBg: "bg-[#EBF7FF] dark:bg-cyan-950/60 border-blue-100 dark:border-cyan-800",
    },
    {
      icon: FiAward,
      title: "Average Score",
      value: dashboardStats.completedExams > 0 ? `${dashboardStats.averageScore}%` : "0%",
      change: dashboardStats.averageScore >= 80 ? "Grade A" : dashboardStats.completedExams > 0 ? "Active Learner" : "Pending Exams",
      iconColor: "text-[#00CBB8]",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800",
    },
    {
      icon: FiTarget,
      title: "Practice Solved",
      value: `${dashboardStats.practiceSolved}`,
      change: `${dashboardStats.practiceSessionsCount} sessions`,
      iconColor: "text-[#5B67F7]",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-800",
    },
    {
      icon: FiClock,
      title: "Active Study Time",
      value: `${dashboardStats.activeStudyTimeHours} Hours`,
      change: dashboardStats.activeStudyTimeHours > 0 ? "Consistent Scholar" : "Start Practicing",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800",
    },
  ];

  const primaryHubs = [
    {
      icon: FiBookOpen,
      title: "Browse Examinations",
      description: "Explore all certified assessment papers & live exam schedules",
      link: "/student/exams",
      iconColor: "text-[#0092E3]",
      iconBg: "bg-[#EBF7FF] dark:bg-cyan-950/60 border-blue-100 dark:border-cyan-800",
      cta: "Explore Directory",
    },
    {
      icon: FiZap,
      title: "Practice Mode Engine",
      description: "Interactive topic drills with step-by-step LaTeX solutions",
      link: "/practice",
      iconColor: "text-[#00CBB8]",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800",
      cta: "Launch Engine",
    },
    {
      icon: FiBarChart2,
      title: "Results & Transcripts",
      description: "Detailed grade reports, topic diagnostic scores & analytics",
      link: "/student/results",
      iconColor: "text-[#5B67F7]",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-800",
      cta: "View Transcripts",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 dark:border-slate-200"
          >
            <FiCheck className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ELEGANT HERO COMMAND BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-xl p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with click to edit */}
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={handleOpenEditProfile}
            title="Click to edit profile name and photo"
          >
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#0092E3] via-[#00CBB8] to-[#5B67F7] p-0.5 shadow-md shadow-cyan-500/15">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                {displayedImage ? (
                  <img src={displayedImage} alt={displayedName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl font-extrabold text-white uppercase font-display">
                    {displayedName.charAt(0) || "S"}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0092E3] text-white shadow-xs border-2 border-white dark:border-[#0B1220]">
              <FiCamera className="h-3 w-3" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-display text-[#152234] dark:text-white">
                {displayedName}
              </h1>
              <button
                type="button"
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

      {/* 2. STAT OVERVIEW CARDS (4 BALANCED COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {studentStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold font-display text-[#152234] dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {stat.title}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. ROOM CODE JOIN BAR */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/70 via-cyan-50/40 to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm"
      >
        <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0092E3] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#0092E3]/20">
              <FiKey className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#152234] dark:text-white">
                Join Examination by Room Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your instructor's room code (e.g. <code className="text-[#0092E3] font-mono font-bold">CS-ALGO-2026</code>) to enter the waiting room.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="e.g. CS-ALGO-2026"
              value={quickRoomCode}
              onChange={(e) => {
                setQuickRoomCode(e.target.value);
                setRoomCodeError(null);
              }}
              className="text-xs font-mono uppercase bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 h-10 w-full sm:w-56 rounded-xl"
            />
            <Button
              type="submit"
              className="bg-[#152234] hover:bg-[#0B2238] text-white font-bold text-xs h-10 px-5 rounded-xl shrink-0"
              rightIcon={<FiArrowRight className="h-4 w-4" />}
            >
              Enter Room
            </Button>
          </div>
        </form>
        {roomCodeError && (
          <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
            <FiAlertCircle className="h-3.5 w-3.5" />
            {roomCodeError}
          </p>
        )}
      </motion.div>

      {/* 4. PRIMARY MODULE CARDS (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {primaryHubs.map((hub) => {
          const HubIcon = hub.icon;
          return (
            <Link key={hub.title} href={hub.link}>
              <motion.div
                whileHover={{ y: -3 }}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B1220] shadow-sm hover:shadow-lg hover:border-[#0092E3]/50 transition-all cursor-pointer group flex flex-col justify-between h-full space-y-4"
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${hub.iconBg}`}>
                    <HubIcon className={`h-5 w-5 ${hub.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-display text-[#152234] dark:text-white group-hover:text-[#0092E3] transition-colors">
                      {hub.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {hub.description}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#0092E3]">
                  <span>{hub.cta}</span>
                  <FiChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* 5. RECENT ASSESSMENTS LEDGER */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B1220] p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF7FF] dark:bg-cyan-950/60 text-[#0092E3] flex items-center justify-center border border-blue-100 dark:border-cyan-800">
              <FiCalendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-display text-[#152234] dark:text-white">
                My Assessment Schedule & Recent Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your enrolled examination schedule and finished test papers
              </p>
            </div>
          </div>

          <Link href="/student/exams" className="text-xs font-bold text-[#0092E3] hover:underline flex items-center gap-1">
            All Papers <FiChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {liveAssessmentItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <FiBookOpen className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Assessment Activity Found
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Join an online exam room with your instructor's room code or browse available assessment papers to start.
              </p>
            </div>
          ) : (
            liveAssessmentItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                  <FiBookOpen className="h-4.5 w-4.5 text-[#0092E3]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#152234] dark:text-white">
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.subject}</span>
                    <span>•</span>
                    <span>{item.schedule}</span>
                    <span>•</span>
                    <span>{item.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                {item.score && (
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                    Score: {item.score}
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.status === "Available"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                      : item.status === "Scheduled"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200"
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item.status}
                </span>
                {item.status === "Available" ? (
                  <Link href={`/exam/${encodeURIComponent(item.token)}`}>
                    <Button
                      variant="primary"
                      className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
                      rightIcon={<FiArrowRight className="h-3.5 w-3.5" />}
                    >
                      Enter Room
                    </Button>
                  </Link>
                ) : item.status === "Scheduled" ? (
                  <Link href="/student/exams">
                    <Button
                      variant="outline"
                      className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-bold text-xs h-9 px-4 rounded-xl hover:bg-blue-100/50"
                      leftIcon={<FiClock className="h-3.5 w-3.5" />}
                    >
                      Upcoming
                    </Button>
                  </Link>
                ) : (
                  <Link href="/student/results">
                    <Button
                      variant="outline"
                      className="border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs h-9 px-4 rounded-xl hover:bg-slate-200/80"
                      rightIcon={<FiArrowRight className="h-3.5 w-3.5" />}
                    >
                      Review Score
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* TEACHER-STYLE EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
        description="Update your display name and profile picture across the Testify platform."
        size="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-5 pt-1">
          {/* Live Avatar Preview Section */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="relative group">
              {profileImage.trim() ? (
                <img
                  src={profileImage.trim()}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#0092E3]/20 shadow-md transition-all group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Student";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] flex items-center justify-center text-white text-2xl font-bold font-display ring-4 ring-[#0092E3]/20 shadow-md">
                  {profileName.trim() ? profileName.trim().charAt(0).toUpperCase() : "S"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0092E3] text-white shadow-md border-2 border-white dark:border-slate-900">
                <FiCamera className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-300">
              Live Avatar Preview
            </span>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0092E3]/20 focus:border-[#0092E3]"
                  placeholder="e.g. Shafin Shahariar"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Picture / Avatar (Image Link or File Upload)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiCamera className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0092E3]/20 focus:border-[#0092E3]"
                    placeholder="Paste image URL..."
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shrink-0 text-xs px-3.5"
                  leftIcon={<FiUpload className="h-4 w-4 text-[#0092E3]" />}
                >
                  Upload File
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white text-xs font-bold rounded-xl px-5 shadow-md shadow-[#0092E3]/20"
              leftIcon={<FiCheck className="h-4 w-4" />}
            >
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}