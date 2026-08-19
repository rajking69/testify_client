import React from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

interface FinalCTAProps {
  onGetStarted?: () => void;
}

export default function FinalCTA({ onGetStarted }: FinalCTAProps) {
  return (
    <section className="py-20 lg:py-28 bg-white text-[#152234]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Exam.net Style Dark Navy CTA Card with Animated Glow Orbs */}
        <div className="relative bg-[#152234] rounded-3xl p-8 sm:p-14 lg:p-16 text-center overflow-hidden shadow-2xl space-y-6">
          {/* Animated Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#0092E3]/25 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#5B67F7]/25 rounded-full blur-3xl pointer-events-none animate-float" />

          {/* Heading */}
          <h2 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Ready to Make Assessments Smarter?
          </h2>

          {/* Description */}
          <p className="relative z-10 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Create secure online assessments, evaluate performance faster, and gain meaningful
            insights with Testify.
          </p>

          {/* Badges Strip */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-xs hover:bg-white/20 transition-colors">
              <FiCheckCircle className="w-4 h-4 text-[#0092E3]" />
              <span>Instant Setup</span>
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-xs hover:bg-white/20 transition-colors">
              <FiCheckCircle className="w-4 h-4 text-[#0092E3]" />
              <span>Zero Credit Card Needed</span>
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-xs hover:bg-white/20 transition-colors">
              <FiCheckCircle className="w-4 h-4 text-[#0092E3]" />
              <span>Secure & Protected</span>
            </span>
          </div>

          {/* Primary Button with Pulse Effect */}
          <div className="relative z-10 pt-4">
            <button
              onClick={onGetStarted}
              type="button"
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-[#152234] hover:bg-[#0092E3] hover:text-white font-extrabold text-base sm:text-lg px-9 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span>Get Started</span>
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
