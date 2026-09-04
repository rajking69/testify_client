"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  BookOpen,
  HelpCircle,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  TrendingUp,
  FileText,
  UserCheck,
  PlusCircle,
  Activity,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  Edit3,
  User,
  Save,
  Camera,
  Upload,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { authClient } from "@/lib/auth-client";
import { questionService } from "@/services/question.service";
import { paymentService } from "@/services/payment.service";
import { subscriptionService } from "@/services/subscription.service";
import { TeacherSubscriptionModal } from "@/components/teacher/TeacherSubscriptionModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

import { useTeacherSubscription } from "@/lib/subscription-sync";

// Framer motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export default function TeacherDashboardPage() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [totalQuestionsCount, setTotalQuestionsCount] = React.useState<number | null>(null);
  const [myExamsCount, setMyExamsCount] = React.useState<number>(0);

  const [customProfile, setCustomProfile] = React.useState<{ name?: string; image?: string }>({});
  const { hasPremium, daysRemaining, expiryDateFormatted } = useTeacherSubscription(session);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = React.useState(false);

  React.useEffect(() => {
    const syncDashboardData = () => {
      try {
        const userEmail = session?.user?.email;
        if (userEmail) {
          const userSpecific = localStorage.getItem(`testify_custom_profile_${userEmail}`);
          if (userSpecific) {
            setCustomProfile(JSON.parse(userSpecific));
          } else {
            setCustomProfile({});
          }

          const storedExams = localStorage.getItem("testify_teacher_exams");
          if (storedExams) {
            const all: any[] = JSON.parse(storedExams);
            const my = all.filter((e) => e.teacherEmail === userEmail || e.createdBy === userEmail);
            setMyExamsCount(my.length);
          } else {
            setMyExamsCount(0);
          }
        } else {
          setCustomProfile({});
          setMyExamsCount(0);
        }
      } catch {}
    };
    syncDashboardData();

    window.addEventListener("testify_profile_updated", syncDashboardData);
    return () => window.removeEventListener("testify_profile_updated", syncDashboardData);
  }, [session?.user?.email]);

  const displayedName = customProfile.name || session?.user?.name || "Instructor";
  const displayedImage = customProfile.image || session?.user?.image;

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [profileName, setProfileName] = React.useState("");
  const [profileImage, setProfileImage] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compress image file to lightweight 200x200 JPEG
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
      } catch (err) {
        showToast("Failed to process image file.");
      }
    }
  };

  const handleOpenEditProfile = () => {
    let savedLocalImage = "";
    try {
      const stored = localStorage.getItem("testify_custom_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        savedLocalImage = parsed.image || "";
      }
    } catch {}

    setProfileName(session?.user?.name || "");
    setProfileImage(savedLocalImage || session?.user?.image || "");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = profileName.trim();
    const finalImage = profileImage.trim();

    if (!finalName) return;

    setIsSavingProfile(true);
    try {
      // 1. Save to LocalStorage keyed by active user email
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

      // 2. Dispatch global event for instant topbar/sidebar re-render
      window.dispatchEvent(
        new CustomEvent("testify_profile_updated", {
          detail: { name: finalName, image: finalImage, email: userEmail },
        })
      );

      // 3. Update authClient
      await authClient.updateUser({
        name: finalName,
        image: finalImage,
      });

      showToast("Profile name & picture updated successfully!");
      await refetch();
      setIsEditModalOpen(false);
    } catch {
      showToast("Profile saved locally & synced across portal!");
      setIsEditModalOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Fetch live question count from backend
  React.useEffect(() => {
    let isMounted = true;
    questionService
      .getQuestions({ limit: 1 })
      .then((res) => {
        if (isMounted && res.total !== undefined) {
          setTotalQuestionsCount(res.total);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#00A3C4] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Loading your teacher workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00A3C4] flex items-center justify-center mx-auto border border-cyan-100 dark:border-cyan-800">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Please sign in to access your teacher assessments, question banks, and grading console.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2238] hover:bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-md shadow-[#0B2238]/20 transition-all cursor-pointer"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (session.user.role !== "teacher" && session.user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#0B1220] p-8 shadow-2xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-800">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
            Teacher Workspace Only
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You are signed in as a{" "}
            <strong className="text-[#00A3C4] capitalize">{session.user.role}</strong>. You cannot access the Instructor console.
          </p>
          <div className="pt-2">
            <Link
              href={`/${session.user.role}/dashboard`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2238] hover:bg-[#152234] text-white font-bold text-xs px-6 py-2.5 shadow-md transition-all cursor-pointer"
            >
              Go to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const teacherStats = [
    {
      icon: BookOpen,
      title: "Active Exams",
      description: "Live & scheduled",
      value: String(myExamsCount),
      change: `${myExamsCount} in your portal`,
      trend: "neutral" as const,
      iconColor: "text-[#00A3C4] dark:text-cyan-400",
      iconBg: "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
    },
    {
      icon: Users,
      title: "Enrolled Students",
      description: "Across all courses",
      value: "0",
      change: "0 new learners",
      trend: "neutral" as const,
      iconColor: "text-[#5B67F7] dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800",
    },
    {
      icon: BarChart3,
      title: "Class Average",
      description: "Term performance",
      value: "0%",
      change: "0% increase",
      trend: "neutral" as const,
      iconColor: "text-[#00CBB8] dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
    },
    {
      icon: HelpCircle,
      title: "Question Bank",
      description: "Ready items",
      value: totalQuestionsCount !== null ? String(totalQuestionsCount) : "0",
      change: "5 Subject Categories",
      trend: "neutral" as const,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800",
    },
  ];

  const teacherActions = [
    {
      icon: BookOpen,
      title: "Question Bank Hub",
      description: "Manage & AI-generate question repositories",
      details: "Curate multi-choice, true/false, and LaTeX formula questions with taxonomy tagging.",
      accent: "cyan",
      iconColor: "text-[#00A3C4] dark:text-cyan-400",
      badge: `${totalQuestionsCount !== null ? totalQuestionsCount : 0} Questions`,
      link: "/teacher/question-bank",
    },
    {
      icon: Calendar,
      title: "Exam Management",
      description: "Design, schedule & lock examination rooms",
      details: "Set strict timers, randomize question orders, and configure continuous anti-cheat proctoring.",
      accent: "indigo",
      iconColor: "text-[#5B67F7] dark:text-indigo-400",
      badge: "0 Scheduled",
      link: "/teacher/exams",
    },
    {
      icon: Users,
      title: "Student Admissions",
      description: "Approve enrollment & track candidates",
      details: "Review student test requests, verify identities, and distribute locked room entrance tokens.",
      accent: "purple",
      iconColor: "text-purple-600 dark:text-purple-400",
      badge: "0 Pending",
      link: "/teacher/students",
    },
    {
      icon: BarChart3,
      title: "Grading & Analytics",
      description: "Auto-scoring and class insights",
      details: "Analyze student performance histograms, export scorecards, and publish verified certificates.",
      accent: "teal",
      iconColor: "text-[#00CBB8] dark:text-emerald-400",
      badge: "Instant AI Rubrics",
      link: "/teacher/results",
    },
  ];

  const recentExams: any[] = [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-sm font-semibold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Dynamic Executive Banner - Clean Glassmorphic Aesthetic */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10 shadow-sm border border-white/90 dark:border-slate-800/80"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Clickable Profile Avatar with sleek hover state */}
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="relative shrink-0 group cursor-pointer focus:outline-none"
              title="Click to change profile & photo"
            >
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt={displayedName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#0092E3] ring-4 ring-[#0092E3]/20 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:ring-[#0092E3]/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] text-white flex items-center justify-center text-3xl font-bold font-display ring-4 ring-[#0092E3]/20 shadow-md transition-transform duration-300 group-hover:scale-105">
                  {displayedName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
                <Camera className="h-5 w-5" />
              </div>
            </button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-[11px] font-bold uppercase tracking-wider text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800 whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Instructor Command Console</span>
                </div>

                {hasPremium ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-extrabold shadow-xs whitespace-nowrap">
                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                    ⭐ Premium Instructor • {daysRemaining} Days Left
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubscriptionOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Crown className="h-3 w-3" />
                    Upgrade to Premium ($20/yr)
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0092E3] dark:text-slate-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white flex items-center gap-2">
                <span>{displayedName}</span>
                {hasPremium && (
                  <span title="⭐ Verified Premium Instructor" className="inline-flex items-center">
                    <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-amber-500 fill-amber-400 drop-shadow-sm shrink-0" />
                  </span>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Your examination portal is fully active. Manage your question bank, schedule exams, and track student assessments from your command console.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/teacher/exams">
              <Button
                className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-[#0092E3]/20 transition-all cursor-pointer"
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Create New Exam
              </Button>
            </Link>

            <Link href="/teacher/monitoring">
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 text-[#152234] border border-slate-200/90 font-bold text-xs px-5 py-2.5 rounded-full shadow-xs transition-all cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
                leftIcon={<Activity className="h-4 w-4 text-[#0092E3] dark:text-cyan-400" />}
              >
                Live Proctoring
              </Button>
            </Link>

            <ThemeToggle className="shrink-0" />
          </div>
        </div>
      </motion.div>

      {/* Ultra-Professional Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Instructor Profile"
        description="Update your display name, personal bio, and profile picture across the Testify platform."
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
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0092E3] to-[#00CBB8] flex items-center justify-center text-white text-2xl font-bold font-display ring-4 ring-[#0092E3]/20 shadow-md">
                  {profileName.trim()
                    ? profileName.trim().charAt(0).toUpperCase()
                    : "T"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0092E3] text-white shadow-md border-2 border-white dark:border-slate-900">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100/80 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-300 border border-blue-200/60 dark:border-cyan-800">
                Live Avatar Preview
              </span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0092E3]/20 focus:border-[#0092E3] transition-all"
                  placeholder="e.g. Dr. Sarah Mitchell"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Picture / Avatar (Image Link or File Upload)
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Camera className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0092E3]/20 focus:border-[#0092E3] transition-all"
                    placeholder="Paste image URL..."
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shrink-0"
                  leftIcon={<Upload className="h-4 w-4 text-[#0092E3]" />}
                >
                  Upload File
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Upload an image file from your computer/device, paste a link, or select a preset below:
              </p>
            </div>

            {/* Quick Avatar Presets Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Quick Avatar Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
                ].map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfileImage(presetUrl)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      profileImage === presetUrl
                        ? "border-[#0092E3] ring-2 ring-[#0092E3]/30 scale-110"
                        : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img
                      src={presetUrl}
                      alt={`Preset ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSavingProfile}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSavingProfile || !profileName.trim()}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold px-5"
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSavingProfile ? "Saving Profile..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* KPI Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {teacherStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238] dark:text-white tracking-tight">
                  {stat.value}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${stat.iconBg} ${stat.iconColor} shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {stat.change}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {stat.description}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Core Workflow Hub Cards */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
              Assessment Workflows
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to assessment creation, administration, and evaluation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {teacherActions.map((action) => (
            <Link key={action.title} href={action.link} className="group">
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {action.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-[#0B2238] dark:text-white group-hover:text-[#00A3C4] dark:group-hover:text-cyan-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {action.description}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    {action.details}
                  </p>
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-[#00A3C4] dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Workspace</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* 2-Column Section: Recent Activity & Class Performance */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Exam & Assessment Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
              Recent Examinations & Status
            </h2>
            <Link
              href="/teacher/exams"
              className="text-xs font-bold text-[#00A3C4] dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              View All Exams
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-3">
            {recentExams.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto opacity-60" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  No active examinations scheduled yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Create an exam to launch your first assessment.
                </p>
              </div>
            ) : (
              recentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exam.code}
                      </span>
                      <h3 className="text-sm font-bold text-[#0B2238] dark:text-white">
                        {exam.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {exam.students}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {exam.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${exam.statusColor}`}>
                      {exam.status}
                    </span>
                    <Link
                      href={`/teacher/results`}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Performance Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
            Class Overview
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Average Completion Rate
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                0%
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-[#00CBB8] h-2 rounded-full w-0" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Top Grade Bracket (90-100%)</span>
                <span className="font-bold text-[#0B2238] dark:text-white">0% of class</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#00A3C4] h-1.5 rounded-full w-0" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Passing Bracket (60-89%)</span>
                <span className="font-bold text-[#0B2238] dark:text-white">0% of class</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#5B67F7] h-1.5 rounded-full w-0" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">At-Risk Bracket (&lt;60%)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">0% of class</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full w-0" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Link
                href="/teacher/results"
                className="w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#00A3C4] dark:hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Analytics Report</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Teacher Subscription Modal */}
      <TeacherSubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        onSuccess={() => {
          showToast("⭐ Teacher Premium Membership activated!");
        }}
        initialMessage="Unlock unlimited examination hosting, live proctoring, and question banking on Testify."
      />
    </motion.div>
  );
}
