import React from "react";
import {
  FiFilePlus,
  FiClock,
  FiSend,
  FiAward,
  FiArrowRight,
} from "react-icons/fi";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  stepTag: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Create / Choose Assessment",
    description:
      "Select a prebuilt template from the question bank or customize a new exam with tailored rules, durations, and passing thresholds.",
    icon: <FiFilePlus className="w-6 h-6 text-[#0092E3]" />,
    stepTag: "Step 01",
  },
  {
    number: "02",
    title: "Take Assessment",
    description:
      "Candidates log into their secure examination session, answering questions in a focused, distraction-free environment with real-time timer tracking.",
    icon: <FiClock className="w-6 h-6 text-[#0092E3]" />,
    stepTag: "Step 02",
  },
  {
    number: "03",
    title: "Submit",
    description:
      "Review answered, unattempted, and flagged questions on the summary screen before locking in final exam submission.",
    icon: <FiSend className="w-6 h-6 text-[#0092E3]" />,
    stepTag: "Step 03",
  },
  {
    number: "04",
    title: "Get Result",
    description:
      "Instantly receive automated grades, detailed question explanations, and performance metrics right after submission.",
    icon: <FiAward className="w-6 h-6 text-[#0092E3]" />,
    stepTag: "Step 04",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-white text-[#152234] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 right-5 w-80 h-80 bg-[#0092E3]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0092E3] bg-[#EBF7FF] px-3.5 py-1.5 rounded-full border border-blue-100 shadow-xs inline-block animate-float">
            Workflow Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#152234] tracking-tight">
            How Testify Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A simple 4-step assessment process designed to make test creation, delivery,
            and evaluation seamless for instructors and candidates.
          </p>
        </div>

        {/* 4 Step Process Cards with Hover & Arrow Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group card-hover-effect bg-[#F8FAFC] border border-slate-200 rounded-2xl p-8 hover:bg-white hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 flex flex-col justify-between"
            >
              <div>
                {/* Header: Monospace Step Number + Icon Container */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold text-slate-300 font-mono group-hover:text-[#0092E3] group-hover:scale-110 transition-all duration-300">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Step Tag */}
                <div className="mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0092E3] bg-white border border-blue-100 px-2.5 py-1 rounded-md shadow-2xs">
                    {step.stepTag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#152234] mb-2.5 group-hover:text-[#0092E3] transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Desktop Arrow Indicator with Slide Effect */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex justify-end pt-4 border-t border-slate-200/80 mt-6">
                  <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-2 group-hover:text-[#0092E3] transition-all duration-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
