"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  KeyRound,
  Filter,
  Star,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { examService } from "@/services/exam.service";
import { StudentExamPurchaseModal } from "@/components/student/StudentExamPurchaseModal";

interface MarketplaceExam {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacherName: string;
  duration: number;
  totalMarks: number;
  passMark: number;
  questionsCount: number;
  accessType: "FREE" | "PAID";
  price: number;
  rating: number;
  enrollmentCount: number;
  joinCode?: string;
  accessToken?: string;
  status: string;
}

const defaultMarketplaceExams: MarketplaceExam[] = [];

export default function StudentExamsMarketplacePage() {
  const router = useRouter();
  const [exams, setExams] = useState<MarketplaceExam[]>([]);
  const [purchasedExamIds, setPurchasedExamIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  // Purchase Modal
  const [purchasingExam, setPurchasingExam] = useState<MarketplaceExam | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Purchased Exams & Real Teacher Exams from Backend & Storage
  useEffect(() => {
    async function loadExamsData() {
      try {
        // 1. Load Student Purchases
        const storedPurchases = localStorage.getItem("testify_student_purchases");
        if (storedPurchases) {
          setPurchasedExamIds(JSON.parse(storedPurchases));
        }

        let realList: MarketplaceExam[] = [];

        // 2. Load Real Teacher Published Exams from localStorage
        const teacherExamsRaw = localStorage.getItem("testify_teacher_exams");
        if (teacherExamsRaw) {
          const teacherList = JSON.parse(teacherExamsRaw);
          realList = teacherList
            .filter((t: any) => t.status === "Published" || t.status === "Ready" || t.status === "Scheduled")
            .map((t: any) => ({
              id: String(t.id),
              title: t.title,
              subject: t.subject || "General",
              description: t.description || "Instructor published examination.",
              teacherName: "Your Instructor",
              duration: t.duration || 60,
              totalMarks: t.totalMarks || 50,
              passMark: t.passMark || 20,
              questionsCount: t.questions?.length || 0,
              accessType: (t.accessType === "PAID" || t.accessType === "paid") ? "PAID" : "FREE",
              price: t.price || 0,
              rating: 5.0,
              enrollmentCount: 0,
              joinCode: t.joinCode || "TST123",
              accessToken: t.accessToken || String(t.id),
              status: "Published",
            }));
        }

        // 3. Also fetch live from backend API
        try {
          const res = await examService.getAllExams();
          if (res.data && res.data.length > 0) {
            const apiExams: MarketplaceExam[] = res.data
              .filter((t: any) => t.isPublished !== false && t.status !== "Draft")
              .map((t: any) => ({
                id: String(t._id),
                title: t.title,
                subject: t.subject || t.category || "General",
                description: t.description || "Instructor published examination.",
                teacherName: "Certified Instructor",
                duration: t.durationMinutes || 60,
                totalMarks: t.totalMarks || 50,
                passMark: Math.round((t.totalMarks || 50) * (t.passPercentage || 40) / 100),
                questionsCount: t.questions?.length || 0,
                accessType: (t.accessType === "PAID" || t.accessType === "paid") ? "PAID" : "FREE",
                price: t.price || 0,
                rating: 5.0,
                enrollmentCount: 0,
                joinCode: t.joinCode || "CSE101",
                accessToken: t.accessToken || String(t._id),
                status: "Published",
              }));

            apiExams.forEach((ae) => {
              if (!realList.some((r) => r.id === ae.id)) {
                realList.unshift(ae);
              }
            });
          }
        } catch {}

        // Standard catalog mock exams removed so only teacher-created exams appear
        setExams(realList);
      } catch {
        setExams([]);
      }
    }
    loadExamsData();
  }, []);

  const subjects = ["All", ...Array.from(new Set(exams.map((e) => e.subject)))];

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.subject.toLowerCase().includes(search.toLowerCase()) ||
        exam.teacherName.toLowerCase().includes(search.toLowerCase()) ||
        (exam.joinCode && exam.joinCode.toLowerCase().includes(search.toLowerCase()));

      const matchSubject = selectedSubject === "All" || exam.subject === selectedSubject;
      const matchType = typeFilter === "ALL" || exam.accessType === typeFilter;

      return matchSearch && matchSubject && matchType;
    });
  }, [exams, search, selectedSubject, typeFilter]);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    router.push(`/exam/${roomCodeInput.trim().toUpperCase()}`);
  };

  const handleBuyExam = async () => {
    if (!purchasingExam) return;

    setIsProcessingPayment(true);
    try {
      // 1. Call server-side Stripe Checkout session endpoint
      const res = await fetch("/api/payments/exam/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: purchasingExam.id,
          examTitle: purchasingExam.title,
          examSubject: purchasingExam.subject,
          price: purchasingExam.price,
        }),
      });
      const data = await res.json();

      if (data.success && data.url) {
        // Redirect directly to official Stripe Checkout page
        window.location.href = data.url;
        return;
      }

      // Fallback for development without active live Stripe keys
      const updated = [...purchasedExamIds, purchasingExam.id];
      setPurchasedExamIds(updated);
      localStorage.setItem("testify_student_purchases", JSON.stringify(updated));

      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        const token = purchasingExam.accessToken || purchasingExam.joinCode || purchasingExam.id;
        setPurchasingExam(null);
        router.push(`/exam/${token}`);
      }, 1200);
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Hero Banner with Room Code Quick Join */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Examination Marketplace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Discover & Take Certified Examinations
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Join free classroom assessments via instructor room codes or enroll in premium mock tests.
            </p>
          </div>

          {/* Quick Room Code Entry Box */}
          <form
            onSubmit={handleJoinByCode}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shrink-0 space-y-2 max-w-sm w-full"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <KeyRound className="h-4 w-4 text-cyan-200" />
              <span>Have an Exam Room Code?</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. CSE7K29"
                className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl bg-black/20 border border-white/30 text-white placeholder:text-blue-200 focus:outline-none focus:border-white"
              />
              <Button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shrink-0 px-4"
              >
                Join
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2">
          {(["ALL", "FREE", "PAID"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === type
                  ? "bg-[#0092E3] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {type === "ALL" ? "All Exams" : type === "FREE" ? "Free Classroom" : "Paid Marketplace"}
            </button>
          ))}
        </div>

        {/* Search & Subject Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, subject, code..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs outline-none focus:border-[#0092E3] dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === "All" ? "All Subjects" : sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          No examinations found matching your filter criteria.
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => {
            const isPurchased = purchasedExamIds.includes(exam.id);
            const isPaid = exam.accessType === "PAID";
            const targetToken = exam.accessToken || exam.joinCode || exam.id;

            return (
              <Card
                key={exam.id}
                hoverEffect
                className="flex flex-col justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-400 font-bold">
                      <BookOpen className="h-5 w-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPaid ? (
                        isPurchased ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Purchased
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                            ৳{exam.price}
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0092E3] dark:bg-cyan-950/60 dark:text-cyan-300">
                          Free Entry
                        </span>
                      )}
                    </div>
                  </div>

                  <CardTitle className="mt-3 text-base font-bold font-display text-[#152234] dark:text-white leading-snug line-clamp-1">
                    {exam.title}
                  </CardTitle>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-semibold text-[#0092E3] dark:text-cyan-400">
                      {exam.subject}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400" /> {exam.rating}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col justify-between flex-1 p-5 pt-0 space-y-4">
                  {/* Metadata Stats Box */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-amber-500" /> {exam.duration} mins
                    </span>
                    <span className="flex items-center gap-1.5 justify-end font-medium">
                      <Award className="h-3.5 w-3.5 text-emerald-500" /> {exam.totalMarks} Marks
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="h-3.5 w-3.5 text-[#0092E3]" /> {exam.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1.5 justify-end text-slate-500 font-medium text-[11px]">
                      Pass Mark: {exam.passMark || Math.round(exam.totalMarks * 0.4)}
                    </span>
                  </div>

                  {/* Footer Action Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {isPaid && !isPurchased ? (
                      <Button
                        type="button"
                        onClick={() => setPurchasingExam(exam)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Buy Exam — ৳{exam.price}
                      </Button>
                    ) : (
                      <Link href={`/exam/${targetToken}`} className="block w-full">
                        <Button
                          className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-[#0092E3]/15 flex items-center justify-center gap-1.5"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          {isPaid ? "Start Purchased Exam" : "Take Free Exam"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Student Exam Purchase Modal (Identical payment flow to Teacher Subscription) */}
      {purchasingExam && (
        <StudentExamPurchaseModal
          isOpen={!!purchasingExam}
          onClose={() => setPurchasingExam(null)}
          onSuccess={() => {
            const updated = [...purchasedExamIds, purchasingExam.id];
            setPurchasedExamIds(updated);
            localStorage.setItem("testify_student_purchases", JSON.stringify(updated));
            setToastMessage(`✓ Stripe Payment of ৳${purchasingExam.price} confirmed! Exam Unlocked.`);
            setTimeout(() => {
              setToastMessage(null);
              const token = purchasingExam.accessToken || purchasingExam.joinCode || purchasingExam.id;
              setPurchasingExam(null);
              router.push(`/exam/${token}`);
            }, 1200);
          }}
          exam={purchasingExam}
        />
      )}
    </div>
  );
}
