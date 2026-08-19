import React from "react";
import {
  FiCheckSquare,
  FiDatabase,
  FiZap,
  FiBarChart2,
  FiCpu,
  FiCheck,
} from "react-icons/fi";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

const features: Feature[] = [
  {
    id: "online-assessment",
    title: "Online Assessment",
    description:
      "Conduct secure, timed, and highly customizable digital exams with flexible question formats and candidate session controls.",
    icon: <FiCheckSquare className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Custom exam duration & timing",
      "Flexible question configurations",
      "Secure candidate exam sessions",
    ],
  },
  {
    id: "question-bank",
    title: "Question Bank",
    description:
      "Centralized repository to create, categorize, tag, and organize reusable questions across subjects to build balanced test sets.",
    icon: <FiDatabase className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Subject & topic taxonomy",
      "Difficulty level tagging",
      "Reusable question templates",
    ],
  },
  {
    id: "automated-evaluation",
    title: "Automated Evaluation",
    description:
      "Instantly grade objective assessments upon submission, eliminating manual evaluation effort while delivering immediate feedback.",
    icon: <FiZap className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Instant auto-scoring logic",
      "Detailed answer key breakdown",
      "Zero-wait submission processing",
    ],
  },
  {
    id: "performance-analytics",
    title: "Performance Analytics",
    description:
      "Comprehensive reporting tools and interactive charts to analyze class performance distributions, score averages, and growth metrics.",
    icon: <FiBarChart2 className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Comparative class performance charts",
      "Score distribution metrics",
      "Historical progress tracking",
    ],
  },
  {
    id: "ai-insights",
    title: "AI-powered Insights",
    description:
      "Smart learning analytics powered by intelligent algorithms to pinpoint candidate knowledge gaps, question difficulty trends, and focus areas.",
    icon: <FiCpu className="w-6 h-6 text-[#0092E3]" />,
    highlights: [
      "Automated skill gap analysis",
      "Question difficulty calibration",
      "Personalized learning feedback",
    ],
  },
];

export default function Features() {
  return (
    <section className="py-24 lg:py-32 bg-[#F8FAFC] text-[#152234] border-y border-slate-200/80 relative overflow-hidden">
      {/* Animated Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#0092E3]/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#5B67F7]/10 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0092E3] bg-[#EBF7FF] px-3.5 py-1.5 rounded-full border border-blue-100 shadow-xs inline-block animate-float">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#152234] tracking-tight">
            Everything You Need to Create and Conduct Secure Online Exams
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Testify delivers robust evaluation tools designed for schools, universities, and organizations
            to streamline the entire assessment lifecycle.
          </p>
        </div>

        {/* Clean Grid Layout with Card Hover Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature) => (
            <div
              key={feature.id}
              className="group card-hover-effect bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 flex flex-col justify-between"
            >
              <div>
                {/* Icon Container with Spring Hover Rotation */}
                <div className="w-13 h-13 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-[#152234] mb-2.5 group-hover:text-[#0092E3] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <ul className="space-y-2">
                  {feature.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-xs font-semibold text-slate-700 gap-2.5"
                    >
                      <FiCheck className="w-4 h-4 text-[#0092E3] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Remaining 2 Cards Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.slice(3, 5).map((feature) => (
            <div
              key={feature.id}
              className="group card-hover-effect bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 flex flex-col justify-between"
            >
              <div>
                {/* Icon Container with Spring Hover Rotation */}
                <div className="w-13 h-13 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-[#152234] mb-2.5 group-hover:text-[#0092E3] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              {/* Highlights List */}
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <ul className="space-y-2">
                  {feature.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-xs font-semibold text-slate-700 gap-2.5"
                    >
                      <FiCheck className="w-4 h-4 text-[#0092E3] shrink-0" />
                      <span>{item}</span>
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
