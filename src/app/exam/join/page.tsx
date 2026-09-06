"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, ArrowRight, Sparkles, KeyRound } from "lucide-react";
import Link from "next/link";

export default function JoinExamCodePage() {
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsJoining(true);
    setTimeout(() => {
      router.push(`/exam/${cleanCode}`);
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBackground variant="hero" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-md w-full rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-slate-800 shadow-2xl p-8 space-y-6 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-cyan-950/60 text-[#0092E3] dark:text-cyan-400 flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white">
            Join Examination Room
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            Enter the 6–8 character Room Code provided by your instructor or institution.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CSE7K29"
              className="text-center font-mono text-xl sm:text-2xl font-black uppercase tracking-widest py-3.5"
              maxLength={12}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={!code.trim() || isJoining}
            className="w-full bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#0092E3]/20"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {isJoining ? "Connecting..." : "Enter Room"}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-[#0092E3] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
