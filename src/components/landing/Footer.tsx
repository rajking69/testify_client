"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe,
  Sparkles,
  Layers,
  BookOpen,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  const socialLinks = [
    {
      name: "Facebook",
      href: "#", // Placeholder link
      color: "hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "#", // Placeholder link
      color: "hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/10",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "#", // Placeholder link
      color: "hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/10",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      href: "#", // Placeholder link
      color: "hover:text-slate-900 dark:hover:text-white hover:border-slate-400 hover:bg-slate-500/10",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: "Reddit",
      href: "#", // Placeholder link
      color: "hover:text-[#FF4500] hover:border-[#FF4500]/40 hover:bg-[#FF4500]/10",
      icon: (
        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.02.2.032.404.032.609 0 3.102-3.6 5.617-8.04 5.617-4.44 0-8.04-2.515-8.04-5.617 0-.2.012-.401.03-.601A1.752 1.752 0 0 1 2.92 12.04c0-.968.786-1.754 1.754-1.754.463 0 .88.18 1.185.474 1.184-.848 2.822-1.405 4.63-1.488l.942-4.41 3.255.688c.07-.37.395-.647.784-.647zm-8.877 7.502c-.645 0-1.168.523-1.168 1.168 0 .645.523 1.168 1.168 1.168s1.168-.523 1.168-1.168c0-.645-.523-1.168-1.168-1.168zm7.734 0c-.645 0-1.168.523-1.168 1.168 0 .645.523 1.168 1.168 1.168s1.168-.523 1.168-1.168c0-.645-.523-1.168-1.168-1.168zm-5.71 3.828c-.2.007-.336.195-.297.39.227 1.127 1.22 1.954 2.42 1.954 1.201 0 2.193-.827 2.42-1.954.039-.195-.097-.383-.297-.39-.2-.008-.376.136-.425.33-.153.76-.826 1.314-1.698 1.314-.872 0-1.545-.554-1.698-1.314-.049-.194-.225-.338-.425-.33z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative w-full overflow-hidden bg-[#F0F6FA]/90 dark:bg-[#050914] text-slate-700 dark:text-slate-300 pt-16 pb-12 transition-colors duration-300">
      {/* 4 Heavy Animated Colorful Aurora Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
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
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-cyan-400/35 via-sky-400/30 to-blue-500/30 dark:from-cyan-600/20 dark:via-sky-600/20 dark:to-blue-700/20 rounded-full blur-[90px]"
        />

        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/4 -right-16 w-80 h-80 bg-gradient-to-bl from-rose-400/30 via-pink-400/30 to-amber-300/30 dark:from-rose-600/20 dark:via-pink-600/15 dark:to-amber-600/15 rounded-full blur-[80px]"
        />

        <motion.div
          animate={{
            x: [0, 30, -50, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.2, 0.85, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-10 left-1/3 w-[450px] h-[450px] bg-gradient-to-r from-purple-500/40 via-violet-400/35 to-indigo-500/35 dark:from-purple-600/25 dark:via-violet-600/20 dark:to-indigo-600/20 rounded-full blur-[100px]"
        />

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
          {/* Column 1: Brand Info & Social Media Links */}
          <div className="col-span-2 space-y-4">
            <Logo
              size={36}
              textClassName="text-[#0B2238] dark:text-white font-bold"
            />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              A modern online assessment platform providing strict proctored testing for Students, rich Question Banks &amp; Exam Studio for Teachers, and instant automated evaluation.
            </p>

            {/* Social Media Links Bar */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-all shadow-xs ${social.color}`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Role Portals */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <h4 className="font-display">Role Portals</h4>
            </div>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  About Testify Team
                </Link>
              </li>
              <li>
                <Link
                  href="/public-exams"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Student Exam Room
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/exams"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Teacher Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/question-bank"
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Question Bank Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
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
                  href="#highlights"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Live Webcam Proctoring
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

          {/* Column 4: Support & Trust */}
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
                  Security &amp; Compliance
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Live Status Bar */}
        <div className="pt-8 border-t border-slate-300/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-4">
          <p className="flex items-center gap-1.5 font-medium">
            &copy; {new Date().getFullYear()}{" "}
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
            <span>&bull;</span>
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
