"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Globe,
  Code2,
  Cpu,
} from "lucide-react";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

interface Developer {
  id: string;
  name: string;
  role: string;
  initials: string;
  image?: string;
  gradient: string;
  badgeBg: string;
  contribution: string;
  socials?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
}

const developers: Developer[] = [
  {
    id: "dev-rajking",
    name: "Sheikh Mohammad Rajking",
    role: "Full-Stack Developer",
    initials: "SR",
    image: "/images/Neon_Rainbow_Gradient_Fun_Creative_LinkedIn_Profile_Picture_optimized_200.png",
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    badgeBg: "bg-cyan-50 text-[#00A3C4] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/80",
    contribution:
      "Worked across frontend and backend development, including dashboards, student-teacher workflows, exam-taking, payment, and revenue-related features.",
    socials: {
      github: "https://github.com/rajking69",
      linkedin: "https://www.linkedin.com/in/rajking39/",
      portfolio: "https://smrajking.vercel.app/",
    },
  },
  {
    id: "dev-hasan",
    name: "Hasan Mahadi",
    role: "Full-Stack Developer",
    initials: "HM",
    gradient: "from-purple-600 via-indigo-500 to-blue-500",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/80",
    contribution:
      "Contributed to full-stack architecture, core assessment workflows, question bank management, and system integrations.",
  },
  {
    id: "dev-mamun",
    name: "Md. Al-Mamun",
    role: "Full-Stack Developer",
    initials: "MA",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/80",
    contribution:
      "Contributed to platform development, user experience optimization, responsive UI layouts, and test suite verification.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F1F7FB] to-[#FAF8F5] dark:from-[#030712] dark:via-[#070E1A] dark:to-[#0B1528] text-slate-900 dark:text-slate-100 font-sans">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#0092E3] dark:text-cyan-400 text-xs font-extrabold uppercase tracking-wider shadow-xs"
        >
          <Sparkles className="h-4 w-4" />
          <span>About Testify Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white max-w-4xl mx-auto leading-tight"
        >
          Empowering Next-Generation{" "}
          <span className="bg-gradient-to-r from-[#0092E3] via-cyan-400 to-amber-500 bg-clip-text text-transparent">
            Online Assessments
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Testify is a high-performance online examination system designed to provide seamless student testing, robust proctored monitoring, dynamic AI question banking, and automated evaluation.
        </motion.p>
      </section>

      {/* Product Pillars & Architecture */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[#0092E3] dark:text-cyan-400 flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
              Instant Auto-Grading
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated evaluation engine calculates scores, percentages, letter grades (A+ to F), and GPA instantly upon submission.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
              Live Proctoring &amp; Monitoring
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time teacher monitoring dashboard tracking candidate progress, webcam telemetry, tab switches, and integrity violations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
              Gekko AI Study Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by Google Gemini 3.8 SDK, providing educational guidance, question explanations, and platform usage support.
            </p>
          </div>
        </div>
      </section>

      {/* MEET THE DEVELOPERS SECTION */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 border-t border-slate-200/80 dark:border-slate-800/80 mt-8">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0092E3] dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Code2 className="h-3.5 w-3.5" />
            <span>Engineering Team</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-[#0B2238] dark:text-white tracking-tight">
            Meet the Developers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Meet the team behind Testify — building a modern, reliable, and user-friendly online examination platform.
          </p>
        </div>

        {/* 3-Column Grid for Developers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {developers.map((dev) => {
            const hasSocials =
              dev.socials &&
              (dev.socials.github || dev.socials.linkedin || dev.socials.portfolio);

            return (
              <motion.div
                key={dev.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 shadow-xl hover:shadow-2xl hover:border-[#0092E3]/40 dark:hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Card Header: Initials Avatar & Role Pill */}
                  <div className="flex items-center justify-between gap-3">
                    {dev.image ? (
                      <img
                        src={dev.image}
                        alt={dev.name}
                        className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className={`h-20 w-20 sm:h-22 sm:w-22 rounded-2xl bg-gradient-to-tr ${dev.gradient} text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl font-display shadow-lg tracking-wider group-hover:scale-105 transition-transform duration-300`}
                      >
                        {dev.initials}
                      </div>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${dev.badgeBg}`}
                    >
                      {dev.role}
                    </span>
                  </div>

                  {/* Name & Title */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-display text-[#0B2238] dark:text-white group-hover:text-[#0092E3] dark:group-hover:text-cyan-400 transition-colors">
                      {dev.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
                      {dev.role}
                    </p>
                  </div>

                  {/* Contribution Statement */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    "{dev.contribution}"
                  </p>
                </div>

                {/* Verified Social Links (Only displayed when provided) */}
                {hasSocials ? (
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-5 flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-display">
                      Connect:
                    </span>
                    <div className="flex items-center gap-2">
                      {dev.socials?.github && (
                        <a
                          href={dev.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${dev.name} GitHub Profile`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 transition-colors shadow-2xs"
                          title="GitHub Profile"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                        </a>
                      )}
                      {dev.socials?.linkedin && (
                        <a
                          href={dev.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${dev.name} LinkedIn Profile`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-[#0A66C2] hover:text-white transition-colors shadow-2xs"
                          title="LinkedIn Profile"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                        </a>
                      )}
                      {dev.socials?.portfolio && (
                        <a
                          href={dev.socials.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${dev.name} Portfolio Website`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-[#0092E3] hover:text-white transition-colors shadow-2xs flex items-center gap-1 text-xs font-semibold"
                          title="Portfolio Website"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-5">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 italic block">
                      Core Development Contributor
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0B2238] via-[#09182A] to-[#0B2238] text-white border border-slate-800 shadow-2xl space-y-5">
          <h3 className="text-xl sm:text-2xl font-bold font-display">
            Ready to experience Testify?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of students and teachers using Testify for reliable online assessments and automated grading.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="px-6 py-2.5 rounded-full bg-[#00A3C4] hover:bg-[#38bdf8] text-[#0B2238] text-xs font-bold shadow-lg transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/public-exams"
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
            >
              Explore Public Exams
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
