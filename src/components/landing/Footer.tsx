"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  ShieldCheck,
  Sparkles,
  Layers,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#F0F6FA]/90 dark:bg-[#050914] text-slate-700 dark:text-slate-300 pt-16 pb-12 transition-colors duration-300">
      {/* 4 Heavy Animated Colorful Aurora Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        {/* 1. Cyber Cyan & Sky Blue Blob */}
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-tr from-cyan-400/40 via-sky-400/35 to-blue-500/30 dark:from-cyan-500/25 dark:via-blue-600/20 dark:to-indigo-600/20 rounded-full blur-[90px]"
        />

        {/* 2. Warm Golden Amber & Rose Pink Blob */}
        <motion.div
          animate={{
            x: [0, -45, 35, 0],
            y: [0, 40, -35, 0],
            scale: [1, 1.3, 0.85, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/40 via-rose-400/35 to-orange-400/30 dark:from-amber-500/25 dark:via-rose-600/20 dark:to-orange-500/20 rounded-full blur-[90px]"
        />

        {/* 3. Vivid Electric Violet & Purple Blob */}
        <motion.div
          animate={{
            x: [0, 40, -45, 0],
            y: [0, -35, 45, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-10 left-1/3 w-[450px] h-[450px] bg-gradient-to-r from-purple-500/40 via-violet-400/35 to-indigo-500/35 dark:from-purple-600/25 dark:via-violet-600/20 dark:to-indigo-600/20 rounded-full blur-[100px]"
        />

        {/* 4. Luminous Emerald & Teal Blob */}
        <motion.div
          animate={{
            x: [0, -35, 40, 0],
            y: [0, 35, -40, 0],
            scale: [0.9, 1.25, 0.9, 0.9],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute -bottom-10 right-10 w-96 h-96 bg-gradient-to-tl from-emerald-400/35 via-teal-400/30 to-cyan-300/30 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 rounded-full blur-[90px]"
        />
      </div>

      {/* Top Colorful Animated Rainbow Neon Border */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-purple-500 via-rose-400 via-amber-400 to-emerald-400 opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 z-10">
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">
          {/* Column 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <Logo
              size={36}
              textClassName="text-[#0B2238] dark:text-white font-bold"
            />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              An AI-powered assessment operating system providing
              distraction-free testing for Students, rich question banks for
              Teachers, and campus-wide oversight for Administrators.
            </p>
          </div>

          {/* Column 2: Role Portals (Electric Violet & Purple Accents) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <h4 className="font-display">Role Portals</h4>
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <li>
                <Link
                  href="/student/dashboard"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Student Exam Room
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/dashboard"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Teacher Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Admin Oversight
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/question-bank"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Question Bank
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features (Warm Golden Amber & Rose Pink Accents) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="h-3.5 w-3.5" />
              <h4 className="font-display">Platform</h4>
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <li>
                <Link
                  href="#features"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  All Features
                </Link>
              </li>
              <li>
                <Link
                  href="#security"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  AI Proctoring &amp; Lockdown
                </Link>
              </li>
              <li>
                <Link
                  href="#why-testify"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Auto-Grading Engine
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Support (Luminous Emerald & Teal Accents) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <h4 className="font-display">Support &amp; Trust</h4>
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <li>
                <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Help Documentation
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Accessibility Statement
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Live Status Bar */}
        <div className="pt-8 border-t border-slate-300/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-4">
          <p className="flex items-center gap-1.5 font-medium">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-[#0B2238] dark:text-white">
              Testify Inc.
            </span>{" "}
            Built with assessment intelligence.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer font-medium">
              <Globe className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />{" "}
              English (US)
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 px-3 py-1 rounded-full shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
