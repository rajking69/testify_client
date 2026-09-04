"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  Layers,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { examService } from "@/services/exam.service";
import { authClient } from "@/lib/auth-client";

export interface PublicExamCard {
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
  joinCode?: string;
  accessToken: string;
  status: string;
}

const defaultPublishedExams: PublicExamCard[] = [
  {
    id: "cs-midterm-101",
    title: "Computer Science Mid Term Exam",
    subject: "Computer Science",
    description: "Live assessment covering core CS concepts, data structures, algorithms, and logic.",
    teacherName: "Prof. Alan Turing",
    duration: 30,
    totalMarks: 25,
    passMark: 10,
    questionsCount: 10,
    accessType: "FREE",
    price: 0,
    joinCode: "COMPZPN",
    accessToken: "cs_midterm_101",
    status: "Published",
  },
  {
    id: "js-mastery-mock",
    title: "Advanced JavaScript & Web Mock Test",
    subject: "Computer Science",
    description: "Premium certification test covering asynchronous JS, event loop, closures, and React architecture.",
    teacherName: "Dr. Dan Abramov",
    duration: 45,
    totalMarks: 50,
    passMark: 25,
    questionsCount: 15,
    accessType: "PAID",
    price: 50,
    joinCode: "JSPREM50",
    accessToken: "js_mastery_mock",
    status: "Published",
  },
  {
    id: "math-calculus-202",
    title: "Calculus & Linear Algebra Assessment",
    subject: "Mathematics",
    description: "Comprehensive mathematics paper on differentiation, integration, matrices, and vectors.",
    teacherName: "Prof. Carl Gauss",
    duration: 60,
    totalMarks: 50,
    passMark: 20,
    questionsCount: 12,
    accessType: "FREE",
    price: 0,
    joinCode: "MATH7K9",
    accessToken: "math_calculus_202",
    status: "Published",
  },
  {
    id: "physics-quantum-301",
    title: "Quantum Mechanics & Optics Mock",
    subject: "Physics",
    description: "Premium assessment covering wave-particle duality, photonics, and quantum states.",
    teacherName: "Dr. Richard Feynman",
    duration: 45,
    totalMarks: 40,
    passMark: 20,
    questionsCount: 10,
    accessType: "PAID",
    price: 75,
    joinCode: "PHYQNT75",
    accessToken: "physics_quantum_301",
    status: "Published",
  },
];

export default function PublicExamsSection() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [exams, setExams] = useState<PublicExamCard[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [roomCode, setRoomCode] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadPublicExams() {
      let list: PublicExamCard[] = [];

      // 1. Load from Teacher LocalStorage Exams
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("testify_teacher_exams");
          if (stored) {
            const parsed = JSON.parse(stored);
            list = parsed
              .filter((e: any) => e.status === "Published" || e.status === "Scheduled" || e.status === "Ready")
              .map((e: any) => ({
                id: String(e.id),
                title: e.title,
                subject: e.subject || "General",
                description: e.description || "Official assessment hosted on Testify platform.",
                teacherName: "Certified Instructor",
                duration: e.duration || 60,
                totalMarks: e.totalMarks || 50,
                passMark: e.passMark || 20,
                questionsCount: e.questions?.length || 10,
                accessType: e.accessType === "PAID" ? "PAID" : "FREE",
                price: e.price || 0,
                joinCode: e.joinCode || "CSE101",
                accessToken: e.accessToken || String(e.id),
                status: e.status || "Published",
              }));
          }
        } catch {}
      }

      // 2. Fetch from Backend API
      try {
        const res = await examService.getAllExams();
        if (res.data && res.data.length > 0) {
          const apiList: PublicExamCard[] = res.data
            .filter((e: any) => e.status === "PUBLISHED" || e.status === "Published")
            .map((e: any) => ({
              id: String(e._id),
              title: e.title,
              subject: e.subject || e.category || "General",
              description: e.description || "Official examination hosted on Testify.",
              teacherName: "Certified Instructor",
              duration: e.durationMinutes || 60,
              totalMarks: e.totalMarks || 50,
              passMark: Math.round((e.totalMarks || 50) * (e.passPercentage || 40) / 100),
              questionsCount: e.questions?.length || 10,
              accessType: e.accessType === "PAID" ? "PAID" : "FREE",
              price: e.price || 0,
              joinCode: e.joinCode || "TST101",
              accessToken: e.accessToken || String(e._id),
              status: "Published",
            }));

          apiList.forEach((item) => {
            if (!list.some((l) => l.id === item.id)) {
              list.unshift(item);
            }
          });
        }
      } catch {}

      // 3. If no custom exams created yet, load standard platform exams
      if (list.length === 0) {
        list = defaultPublishedExams;
      }

      setExams(list);
      setIsLoaded(true);
    }
    loadPublicExams();
  }, []);

  const subjects = ["All", ...Array.from(new Set(exams.map((e) => e.subject)))];

  const filtered = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.subject.toLowerCase().includes(search.toLowerCase()) ||
        (exam.joinCode && exam.joinCode.toLowerCase().includes(search.toLowerCase()));

      const matchSubject = selectedSubject === "All" || exam.subject === selectedSubject;
      const matchType = typeFilter === "ALL" || exam.accessType === typeFilter;

      return matchSearch && matchSubject && matchType;
    });
  }, [exams, search, selectedSubject, typeFilter]);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    router.push(`/exam/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <section id="explore-exams" className="relative w-full py-16 lg:py-24 bg-gradient-to-b from-[#EFF6FB]/60 via-white to-[#EFF6FB]/40 dark:from-[#080E1A] dark:via-[#0B1220] dark:to-[#080E1A] border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 z-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/80 dark:bg-cyan-950/60 border border-blue-200 dark:border-cyan-800 text-[#0092E3] dark:text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Public Assessment Hub</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white">
            Explore Published Examinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover free classroom tests, certified mock assessments, and instructor-published examination rooms.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedSubject === subj
                    ? "bg-[#0092E3] text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  typeFilter === "ALL" ? "bg-[#0092E3] text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("FREE")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  typeFilter === "FREE" ? "bg-emerald-600 text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setTypeFilter("PAID")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  typeFilter === "PAID" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Paid
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assessments..."
                className="pl-8 text-xs h-9 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 max-w-md mx-auto space-y-3">
            <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Examinations Matching Criteria
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or subject filters to find available assessments.
            </p>
            {session?.user?.role === "teacher" ? (
              <Link href="/teacher/exams">
                <Button size="sm" className="bg-[#0092E3] text-white text-xs font-bold mt-2">
                  Create an Examination
                </Button>
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSelectedSubject("All");
                    setTypeFilter("ALL");
                  }}
                  className="text-xs font-bold"
                >
                  Reset Filters
                </Button>
                <Link href="/practice">
                  <Button size="sm" className="bg-[#0092E3] text-white text-xs font-bold">
                    Go to Practice Zone
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((exam) => (
              <motion.div
                key={exam.id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Badge Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0092E3] dark:text-cyan-300 border border-blue-100 dark:border-blue-900">
                      {exam.subject}
                    </span>

                    {exam.accessType === "PAID" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        👑 Premium Exam • ৳{exam.price || 50}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0092E3] dark:bg-slate-800 dark:text-cyan-300 border border-blue-200 dark:border-slate-700">
                        <KeyRound className="h-3 w-3 text-[#0092E3]" />
                        Free Classroom • Key Required
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold font-display text-[#152234] dark:text-white line-clamp-1">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>{exam.duration} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{exam.totalMarks} Marks (Pass: {exam.passMark})</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      Instructor Verified
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {exam.accessType === "PAID" ? "Stripe Paywall" : "Passcode Protected"}
                    </span>
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/exam/${exam.accessToken || exam.joinCode || exam.id}`} className="block w-full">
                    <Button
                      className={`w-full text-xs font-extrabold py-2.5 rounded-xl transition-all cursor-pointer ${
                        exam.accessType === "PAID"
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20"
                          : "bg-[#0092E3] hover:bg-[#007AC9] text-white shadow-sm hover:shadow-md shadow-[#0092E3]/20"
                      }`}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      {exam.accessType === "PAID"
                        ? `👑 Pay ৳${exam.price || 50} & Unlock Exam`
                        : "🔑 Enter with Teacher Key"}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
