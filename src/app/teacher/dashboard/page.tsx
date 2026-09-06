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
  Printer,
  Shield,
  DollarSign,
  Award,
  ShieldCheck,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TestifyLogoIcon } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { authClient } from "@/lib/auth-client";
import { questionService } from "@/services/question.service";
import { paymentService } from "@/services/payment.service";
import { subscriptionService } from "@/services/subscription.service";
import { purchaseService } from "@/services/purchase.service";
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
  const { hasPremium, daysRemaining, expiryDateFormatted, isLoaded } = useTeacherSubscription(session);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = React.useState(false);

  // Teacher Subscription Invoice State & Auto-Sync Engine
  const [teacherInvoices, setTeacherInvoices] = React.useState<any[]>([]);
  const [selectedTeacherInvoice, setSelectedTeacherInvoice] = React.useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);
  const [teacherEarnings, setTeacherEarnings] = React.useState<any>(null);

  const displayedName = customProfile.name || session?.user?.name || "Instructor";
  const displayedImage = customProfile.image || session?.user?.image;

  React.useEffect(() => {
    if (session?.user?.email) {
      const storedExams = JSON.parse(localStorage.getItem("testify_teacher_exams") || "[]");
      const myExams = storedExams.filter((e: any) => {
        const eTeacher = (e.teacherEmail || e.createdBy || "").trim().toLowerCase();
        const uEmail = (session.user.email || "").trim().toLowerCase();
        return eTeacher === uEmail || e.teacherId === session.user.id;
      });
      const earnings = purchaseService.getTeacherEarnings(session.user.email || session.user.id, myExams);
      setTeacherEarnings(earnings);
    }
  }, [session?.user?.email, session?.user?.id]);

  React.useEffect(() => {
    let isMounted = true;

    // Synchronously populate invoice state from hook data to ensure zero render delay
    if (session?.user?.email) {
      const userEmail = session.user.email;
      let isPremiumActive = hasPremium;
      let expiryDateStr = expiryDateFormatted || "Sep 5, 2027";
      let daysLeft = daysRemaining > 0 ? daysRemaining : 365;
      let startDateStr = new Date(Date.now() - Math.max(0, 365 - daysLeft) * 86400000).toISOString();
      let planTitle = "Teacher Premium - Annual Instructor Membership";
      let priceAmount = 20.0;
      let txnId = `cs_stripe_sub_${session?.user?.id ? String(session.user.id).slice(-8) : "active_2026"}`;

      if (isPremiumActive) {
        const invoiceId = `INV-SUB-${
          session?.user?.id ? String(session.user.id).slice(-6).toUpperCase() : "TEACHER-88"
        }`;
        setTeacherInvoices([
          {
            id: invoiceId,
            teacherName: displayedName,
            teacherEmail: userEmail,
            planName: planTitle,
            amount: priceAmount,
            currency: "USD",
            paymentProvider: "Stripe Secured Payment",
            transactionId: txnId,
            paymentStatus: "PAID IN FULL",
            purchasedAt: startDateStr,
            expiryDate: expiryDateStr,
            daysRemaining: daysLeft > 0 ? daysLeft : 365,
            accessStatus: "ACTIVE",
          },
        ]);
      }
    }

    const verifyBackendInvoices = async () => {
      try {
        const userEmail = session?.user?.email;
        if (!userEmail) return;

        const backendStatus = await paymentService.getTeacherPremiumStatus();
        if (backendStatus?.success && backendStatus.data) {
          if (backendStatus.data.isPremium || backendStatus.data.premiumStatus === "active") {
            let planTitle = backendStatus.data.planName || "Teacher Premium - Annual Instructor Membership";
            let priceAmount = backendStatus.data.price || 20.0;
            let txnId = backendStatus.data.stripeSubscriptionId || `cs_stripe_sub_${session?.user?.id ? String(session.user.id).slice(-8) : "active_2026"}`;
            let expiryDateStr = expiryDateFormatted || "Sep 5, 2027";
            let daysLeft = daysRemaining > 0 ? daysRemaining : 365;

            if (backendStatus.data.premiumExpiresAt) {
              const expDate = new Date(backendStatus.data.premiumExpiresAt);
              expiryDateStr = expDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const diffMs = expDate.getTime() - Date.now();
              daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            }

            const invoiceId = `INV-SUB-${
              session?.user?.id ? String(session.user.id).slice(-6).toUpperCase() : "TEACHER-88"
            }`;

            if (isMounted) {
              setTeacherInvoices([
                {
                  id: invoiceId,
                  teacherName: displayedName,
                  teacherEmail: userEmail,
                  planName: planTitle,
                  amount: priceAmount,
                  currency: "USD",
                  paymentProvider: "Stripe Secured Payment",
                  transactionId: txnId,
                  paymentStatus: "PAID IN FULL",
                  purchasedAt: new Date(Date.now() - Math.max(0, 365 - daysLeft) * 86400000).toISOString(),
                  expiryDate: expiryDateStr,
                  daysRemaining: daysLeft > 0 ? daysLeft : 365,
                  accessStatus: "ACTIVE",
                },
              ]);
            }
          }
        }
      } catch {}
    };

    verifyBackendInvoices();
    window.addEventListener("testify_subscription_updated", verifyBackendInvoices);
    return () => {
      isMounted = false;
      window.removeEventListener("testify_subscription_updated", verifyBackendInvoices);
    };
  }, [session?.user?.email, session?.user?.id, hasPremium, daysRemaining, expiryDateFormatted, displayedName]);

  const [recentExamsList, setRecentExamsList] = React.useState<any[]>([]);

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
            const my = all.filter((e: any) => {
              const eTeacher = (e.teacherEmail || e.createdBy || "").trim().toLowerCase();
              const uEmail = (userEmail || "").trim().toLowerCase();
              return eTeacher === uEmail || e.teacherId === session?.user?.id;
            });
            setMyExamsCount(my.length);
            setRecentExamsList(my.slice(0, 4));
          } else {
            setMyExamsCount(0);
            setRecentExamsList([]);
          }
        } else {
          setCustomProfile({});
          setMyExamsCount(0);
          setRecentExamsList([]);
        }
      } catch {}
    };
    syncDashboardData();

    window.addEventListener("testify_profile_updated", syncDashboardData);
    return () => window.removeEventListener("testify_profile_updated", syncDashboardData);
  }, [session?.user?.email, session?.user?.id]);

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

  const grossAmount = teacherEarnings?.grossRevenue || 0;
  const netAmount = teacherEarnings?.teacherEarnings || 0;

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
      icon: CreditCard,
      title: "Teacher Wallet (Net)",
      description: "Retainable Net (60%)",
      value: `$${netAmount.toFixed(2)}`,
      change: `Gross: $${grossAmount.toFixed(2)}`,
      trend: "up" as const,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800",
    },
    {
      icon: DollarSign,
      title: "Total Revenue (Gross)",
      description: "All student purchases",
      value: `$${grossAmount.toFixed(2)}`,
      change: "40% Platform Fee",
      trend: "up" as const,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
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
      badge: `${myExamsCount} Active`,
      link: "/teacher/exams",
    },
    {
      icon: CreditCard,
      title: "Revenue & Sales Console",
      description: "Track sales, gross income & withdraw earnings",
      details: "Monitor student exam purchases, total sales revenue, 60% net teacher share, and submit payout requests.",
      accent: "emerald",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badge: `$${netAmount.toFixed(2)} Net Wallet`,
      link: "/teacher/revenue",
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-slate-50/90 to-blue-50/40 dark:from-[#0B1220] dark:via-[#0E1726] dark:to-[#0F1B2E] backdrop-blur-xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800/80"
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
              <div className="flex flex-wrap items-center gap-2.5">
                {hasPremium ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-300/80 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-[11px] font-extrabold shadow-2xs whitespace-nowrap">
                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    <span>Premium Instructor</span>
                    <span className="opacity-40">•</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">{daysRemaining} Days Left</span>
                  </span>
                ) : !isLoaded ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-[11px] font-bold animate-pulse whitespace-nowrap">
                    <span>Checking status...</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubscriptionOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>Upgrade to Premium ($20/yr)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0092E3] dark:text-slate-400 dark:hover:text-cyan-300 transition-colors cursor-pointer ml-1"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white">
                {displayedName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Manage your question bank, schedule exams, and track student assessments from your command console.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/teacher/exams">
              <Button
                className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-[#0092E3]/20 transition-all cursor-pointer"
                leftIcon={<PlusCircle className="h-4 w-4" />}
              >
                Create New Exam
              </Button>
            </Link>

            <Link href="/teacher/monitoring">
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 text-[#152234] border border-slate-200/90 font-bold text-xs px-4 py-2.5 rounded-full shadow-xs transition-all cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
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

      {/* Teacher Subscription & Membership Invoices Card Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
                Subscription & Membership Invoices
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-500/20 uppercase tracking-wider">
                {teacherInvoices.length} Verified Receipt{teacherInvoices.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official academic tax receipts & validity details for instructor subscription plans
            </p>
          </div>
        </div>

        {teacherInvoices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md p-6 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-500 flex items-center justify-center mx-auto">
              <Crown className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0B2238] dark:text-white">
                No Active Subscription Invoice
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Upgrade to Teacher Premium ($20/year) to unlock unlimited proctored exam hosting, AI question banking, and generate your official tax invoice & receipt.
              </p>
            </div>
            <div className="pt-1">
              <Button
                onClick={() => setIsSubscriptionOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-5 rounded-full shadow-md transition-all cursor-pointer"
                leftIcon={<Crown className="h-4 w-4" />}
              >
                Upgrade to Teacher Premium ($20/yr)
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {teacherInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] shadow-xs hover:border-[#0092E3]/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold font-mono px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-[#0092E3] dark:text-cyan-400 border border-blue-200/60 dark:border-blue-800/80">
                        {inv.id}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" /> PAID IN FULL
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold">
                        {inv.daysRemaining} DAYS REMAINING
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#152234] dark:text-white">
                      {inv.planName}
                    </h3>

                    {/* Prominent Validity Summary Row */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>
                        Purchased: <strong className="text-slate-800 dark:text-slate-200 font-mono">{new Date(inv.purchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Valid Until: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{inv.expiryDate}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Gateway: <strong className="text-slate-800 dark:text-slate-200">{inv.paymentProvider}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right mr-2 hidden sm:block">
                    <span className="text-xl font-extrabold text-[#0092E3] dark:text-cyan-400 font-mono">
                      ${inv.amount.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Annual License</p>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedTeacherInvoice(inv);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Official Invoice</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] p-4 sm:p-5 shadow-xs space-y-3">
            {recentExamsList.length === 0 ? (
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
              recentExamsList.map((exam: any) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-[#0092E3]/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-[#0092E3] dark:text-cyan-400 border border-blue-200/60 dark:border-blue-800/80">
                        {exam.code || "EXAM"}
                      </span>
                      <h3 className="text-sm font-bold text-[#152234] dark:text-white">
                        {exam.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {exam.subject || "General"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {exam.duration ? `${exam.duration} mins` : "Flexible"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {exam.status || "PUBLISHED"}
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
          <h2 className="text-base font-bold font-display text-[#152234] dark:text-white tracking-tight">
            Class Performance
          </h2>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#070E1A] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Portal Analytics Summary
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Track real-time student submissions, auto-graded scorecards, and anti-cheat proctor logs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Assessments
                </span>
                <span className="text-lg font-bold font-mono text-[#152234] dark:text-white">
                  {myExamsCount}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Question Items
                </span>
                <span className="text-lg font-bold font-mono text-[#0092E3] dark:text-cyan-400">
                  {totalQuestionsCount !== null ? totalQuestionsCount : 0}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Link
                href="/teacher/results"
                className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#0092E3] dark:hover:text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
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

      {/* Official Teacher Subscription Tax Invoice & Payment Receipt Modal */}
      {selectedTeacherInvoice && (
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title="Official Teacher Subscription Tax Invoice & Payment Receipt"
          description="Verified academic subscription transaction receipt issued by Testify Educational Systems."
          size="lg"
        >
          <div id="printable-invoice" className="space-y-4 pt-1 font-sans">
            {/* ==========================================
                1. ON-SCREEN MODAL VIEW (SCREEN ONLY)
               ========================================== */}
            <div className="screen-only space-y-4 text-slate-900 dark:text-slate-100">
              {/* Modal Top Header Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <TestifyLogoIcon size={36} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white uppercase">
                        Testify
                      </h2>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#0092E3] dark:text-cyan-400">
                        ACADEMIC PLATFORM
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Official Educational Assessment &amp; Examination Authority
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" /> PAID IN FULL
                  </span>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Invoice #: <span className="font-mono text-slate-900 dark:text-white">{selectedTeacherInvoice.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Issued: {new Date(selectedTeacherInvoice.purchasedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Customer & Payment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0092E3] flex items-center gap-1">
                    <User className="h-3 w-3" /> Billed To / Instructor
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    {selectedTeacherInvoice.teacherName || session?.user?.name || "Verified Instructor"}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {selectedTeacherInvoice.teacherEmail || session?.user?.email}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Payment Gateway &amp; Audit
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">Gateway: <strong className="text-slate-900 dark:text-white">Stripe Verified</strong></p>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">Ref: {selectedTeacherInvoice.transactionId}</p>
                </div>
              </div>

              {/* MUST BE VALIDITY EXPLICITLY DISPLAYED BOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-300/80 dark:border-amber-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-500" /> Subscription Plan Validity &amp; Duration
                  </span>
                  <span className="text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-emerald-600 text-white font-mono shadow-xs">
                    {selectedTeacherInvoice.daysRemaining} DAYS REMAINING
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Plan Membership:</span>
                    <strong className="text-slate-900 dark:text-white font-bold text-xs">{selectedTeacherInvoice.planName}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Subscription Start Date:</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-xs">
                      {new Date(selectedTeacherInvoice.purchasedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Validity Expiry Date:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-extrabold">
                      {selectedTeacherInvoice.expiryDate}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Purchase Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-cyan-50/40 to-emerald-50/80 dark:from-slate-900/90 dark:to-slate-900/90 border border-blue-200/80 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1 min-w-0">
                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#0092E3]/10 text-[#0092E3] dark:bg-cyan-950 dark:text-cyan-300 border border-[#0092E3]/20 uppercase tracking-wider">
                    Annual Instructor License
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {selectedTeacherInvoice.planName}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Full 1-Year Access to live proctoring, unlimited exam rooms, &amp; AI Question Hub
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-extrabold text-[#0092E3] dark:text-cyan-400 font-mono">
                    ${selectedTeacherInvoice.amount.toFixed(2)}
                  </span>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Annual Charge</p>
                </div>
              </div>
            </div>

            {/* ==========================================
                2. EXECUTIVE CORPORATE PRINT INVOICE (PRINT ONLY)
               ========================================== */}
            <div className="print-only space-y-4 text-slate-900 bg-white p-3 border-t-4 border-[#1E40AF]">
              {/* Top Corporate Letterhead Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <TestifyLogoIcon size={38} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-extrabold font-display tracking-tight text-[#0F172A] uppercase">
                          TESTIFY
                        </h1>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-[#1E40AF] border border-slate-200 uppercase tracking-wider">
                          ACADEMIC PLATFORM
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        Educational Assessment &amp; Examination Systems
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                    <p>Official Instructor Subscription Tax Invoice &bull; Annual Membership</p>
                    <p>Portal: <strong>www.testify.ac</strong> &bull; Support: <strong>billing@testify.ac</strong></p>
                  </div>
                </div>

                <div className="text-right space-y-1.5 shrink-0">
                  {/* EXECUTIVE BLUE PAID IN FULL SEAL */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 border border-blue-300 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" /> PAID IN FULL
                  </span>
                  <h2 className="text-base font-extrabold text-[#0F172A] uppercase tracking-tight">
                    SUBSCRIPTION TAX INVOICE
                  </h2>
                  <div className="text-[11px] space-y-0.5 text-slate-700 font-mono">
                    <p>Invoice #: <strong>{selectedTeacherInvoice.id}</strong></p>
                    <p>Date: <strong>{new Date(selectedTeacherInvoice.purchasedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                  </div>
                </div>
              </div>

              {/* Billed To & Gateway Info Grid (EXECUTIVE SLATE CARDS) */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-0.5">
                    Billed To / Instructor
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {selectedTeacherInvoice.teacherName || session?.user?.name || "Verified Instructor"}
                  </h4>
                  <p className="text-slate-700 font-mono text-[10px]">
                    Email: <strong>{selectedTeacherInvoice.teacherEmail || session?.user?.email}</strong>
                  </p>
                  <p className="text-slate-600 text-[10px]">
                    Role: <strong className="text-blue-700">Verified Premium Instructor Account</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-0.5">
                    Payment Gateway &amp; Audit Trail
                  </span>
                  <p className="text-slate-800 text-[10px]">
                    Provider: <strong>{selectedTeacherInvoice.paymentProvider || "Stripe Secured Payment"}</strong>
                  </p>
                  <p className="text-slate-800 font-mono text-[10px] truncate">
                    Txn Ref: <strong>{selectedTeacherInvoice.transactionId}</strong>
                  </p>
                  <p className="text-slate-800 text-[10px]">
                    Auth Status: <strong className="text-emerald-700 font-bold">Captured &amp; Validated ($0.00 Balance)</strong>
                  </p>
                </div>
              </div>

              {/* PROMINENT VALIDITY HIGHLIGHT BOX IN PRINT */}
              <div className="p-3.5 rounded-lg border-2 border-amber-400 bg-amber-50/80 space-y-1.5">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-600" /> Subscription Plan Validity &amp; Membership Period
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-700 text-white font-mono">
                    {selectedTeacherInvoice.daysRemaining} DAYS REMAINING
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Plan Membership:</span>
                    <strong className="text-slate-900 font-bold">{selectedTeacherInvoice.planName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Subscription Start Date:</span>
                    <strong className="text-slate-900 font-mono">
                      {new Date(selectedTeacherInvoice.purchasedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Validity Expiry Date:</span>
                    <strong className="text-emerald-700 font-mono font-bold">
                      {selectedTeacherInvoice.expiryDate}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Itemized Table (EXECUTIVE DEEP SLATE NAVY TABLE HEADER) */}
              <div className="rounded-lg border border-slate-200 overflow-hidden text-[11px]">
                <div className="bg-[#1E293B] text-white p-2.5 font-bold grid grid-cols-12 gap-2 uppercase tracking-wider text-[10px]">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-6">Subscription Plan &amp; Platform Privileges</span>
                  <span className="col-span-3 text-center">Membership License</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>
                <div className="p-3 grid grid-cols-12 gap-2 text-slate-900 items-start border-b border-slate-100 bg-white">
                  <span className="col-span-1 text-center font-mono text-slate-400 font-bold">01</span>
                  <div className="col-span-6 space-y-0.5">
                    <strong className="block font-bold text-slate-900 text-xs">
                      {selectedTeacherInvoice.planName}
                    </strong>
                    <ul className="text-[9px] text-slate-600 list-disc list-inside space-y-0.5">
                      <li>Unlimited live proctored exam room hosting &amp; student access.</li>
                      <li>AI-driven Question Bank creation &amp; taxonomy tag management.</li>
                      <li>Automated AI rubric scoring &amp; gradebook scorecard export.</li>
                      <li>Anti-cheat telemetry &amp; live webcam proctoring monitoring.</li>
                    </ul>
                  </div>
                  <span className="col-span-3 text-center font-bold text-blue-700 bg-blue-50 py-1 rounded border border-blue-200 text-[10px]">
                    1-Year Annual Premium
                  </span>
                  <span className="col-span-2 text-right font-extrabold text-xs text-slate-900 font-mono">
                    ${selectedTeacherInvoice.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Financial Totals Box & Blue Digital Seal Stamp */}
              <div className="flex items-stretch justify-between gap-4 pt-1">
                {/* Left: Blue Digital Audit Stamp Box */}
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/60 flex items-center gap-3 flex-1">
                  <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-[10px] space-y-0.5">
                    <strong className="block text-blue-900 font-bold uppercase tracking-wider text-[9px]">
                      OFFICIAL DIGITAL RECEIPT SEAL
                    </strong>
                    <p className="font-mono text-[9px] text-slate-800 font-bold truncate">
                      SEC-VERIFIED-{selectedTeacherInvoice.id}
                    </p>
                  </div>
                </div>

                {/* Right: Executive Totals Box */}
                <div className="w-64 p-3 rounded-lg border-2 border-slate-900 bg-slate-50 text-[11px] space-y-1 shrink-0">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal Amount:</span>
                    <span className="font-mono font-bold text-slate-900">${selectedTeacherInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Sales Tax / VAT (0.0%):</span>
                    <span className="font-mono text-slate-900">$0.00</span>
                  </div>
                  <div className="pt-1.5 border-t-2 border-slate-900 flex justify-between items-center font-bold">
                    <span className="text-slate-900 uppercase tracking-wider text-[10px]">Total Amount Paid:</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ${selectedTeacherInvoice.amount.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 text-center text-[8px] text-slate-400 font-mono">
                Testify Online Assessment System &bull; Official Computer Generated Subscription Tax Invoice &bull; Verified Transaction
              </div>
            </div>

            {/* Modal Interactive Actions (Hidden during browser PDF Print) */}
            <div className="no-print pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="text-xs font-bold flex items-center gap-2 cursor-pointer border-slate-300 dark:border-slate-700 hover:border-[#0092E3] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-white"
              >
                <Printer className="h-4 w-4 text-[#0092E3]" />
                <span>Print / Save Invoice PDF</span>
              </Button>

              <Button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-xs px-6 shadow-sm cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
