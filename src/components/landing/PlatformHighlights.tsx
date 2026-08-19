import React from "react";
import {
  FiCheckSquare,
  FiZap,
  FiBarChart2,
  FiCpu,
  FiCheck,
} from "react-icons/fi";

interface HighlightItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const highlights: HighlightItem[] = [
  {
    id: "assessment-focused",
    title: "Assessment-focused Platform",
    description:
      "Purpose-built evaluation tools tailored specifically for academic exams, certification tests, and organizational assessments.",
    icon: <FiCheckSquare className="w-6 h-6 text-[#0092E3]" />,
    features: [
      "Specialized exam workflows",
      "Custom test duration & rules",
      "Multi-format question support",
    ],
  },
  {
    id: "automated-evaluation",
    title: "Automated Evaluation",
    description:
      "Instant auto-scoring logic that eliminates manual grading overhead and delivers immediate result breakdowns.",
    icon: <FiZap className="w-6 h-6 text-[#0092E3]" />,
    features: [
      "Zero-wait answer grading",
      "Instant score calculations",
      "Automated feedback reports",
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Comprehensive performance dashboards, score distributions, and historical growth metrics to monitor progress.",
    icon: <FiBarChart2 className="w-6 h-6 text-[#0092E3]" />,
    features: [
      "Interactive class graphs",
      "Score distribution tracking",
      "Historical trend reporting",
    ],
  },
  {
    id: "ai-assistance",
    title: "AI Assistance",
    description:
      "Intelligent AI algorithms detecting knowledge gaps, question difficulty trends, and personalized recommendations.",
    icon: <FiCpu className="w-6 h-6 text-[#0092E3]" />,
    features: [
      "Automated skill gap detection",
      "Question calibration metrics",
      "Personalized learning suggestions",
    ],
  },
];

export default function PlatformHighlights() {
  return (
    <section className="py-24 lg:py-32 bg-white text-[#152234] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0092E3]/5 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0092E3] bg-[#EBF7FF] px-3.5 py-1.5 rounded-full border border-blue-100 shadow-xs inline-block animate-float">
            Platform Highlights
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#152234] tracking-tight">
            Key Highlights of Testify
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Discover the core capabilities that set Testify apart as a premier digital assessment solution.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="group card-hover-effect bg-[#F8FAFC] border border-slate-200 rounded-2xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold text-[#152234] mb-2.5 group-hover:text-[#0092E3] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-slate-200/80 pt-4 mt-auto">
                <ul className="space-y-2">
                  {item.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-xs font-semibold text-slate-700 gap-2.5"
                    >
                      <FiCheck className="w-4 h-4 text-[#0092E3] shrink-0" />
                      <span>{feat}</span>
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
