import React from "react";
import {
  FiCheckSquare,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiCheck,
} from "react-icons/fi";

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

const benefits: Benefit[] = [
  {
    id: "easy-organized",
    title: "Easy & Organized Assessment",
    description:
      "Simplify test creation with intuitive question categorization, subject tagging, and reusable assessment templates.",
    icon: <FiCheckSquare className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Intuitive exam configuration",
      "Subject & topic taxonomy",
      "Reusable test item templates",
    ],
  },
  {
    id: "fast-evaluation",
    title: "Fast Evaluation",
    description:
      "Eliminate manual grading delays with zero-wait automated scoring logic that delivers immediate results upon candidate submission.",
    icon: <FiZap className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Zero-latency auto-grading",
      "Detailed answer key breakdown",
      "Instant feedback delivery",
    ],
  },
  {
    id: "performance-tracking",
    title: "Performance Tracking",
    description:
      "Track individual candidate growth, view class-wide distributions, and extract actionable performance metrics effortlessly.",
    icon: <FiTrendingUp className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Comparative class metrics",
      "Score distribution charts",
      "Historical progress tracking",
    ],
  },
  {
    id: "secure-experience",
    title: "Secure Examination Experience",
    description:
      "Conduct protected assessment sessions with strict time controls, candidate focus locks, and anti-cheating mechanisms.",
    icon: <FiShield className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Strict candidate session locks",
      "Custom timer controls",
      "Proctored exam environment",
    ],
  },
];

export default function Benefits() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8FAFC] text-[#152234] border-y border-slate-200/80 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0092E3]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0092E3] bg-[#EBF7FF] px-3.5 py-1.5 rounded-full border border-blue-100 shadow-xs inline-block animate-float">
            Why Testify
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#152234] tracking-tight">
            Why Choose Testify?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Testify empowers institutions and educators with key benefits built to streamline
            evaluation, ensure integrity, and enhance learning outcomes.
          </p>
        </div>

        {/* 4 Benefits in 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="group card-hover-effect bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {benefit.icon}
                </div>

                <h3 className="text-2xl font-bold text-[#152234] mb-3 group-hover:text-[#0092E3] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {benefit.description}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-5 mt-auto">
                <ul className="space-y-2.5">
                  {benefit.highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-xs font-semibold text-slate-700 gap-2.5"
                    >
                      <FiCheck className="w-4 h-4 text-[#0092E3] shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
