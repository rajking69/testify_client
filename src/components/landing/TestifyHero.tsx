"use client";

import React, { useEffect, useState } from "react";
import { Check, Clock, Flag, ShieldCheck, ArrowRight, Circle } from "lucide-react";

const tokens = {
  ink: "#12182B",
  graphite: "#5B6472",
  paper: "#EEF0F4",
  card: "#FFFFFF",
  hairline: "#D9DEE6",
  blue: "#2E4DF0",
  blueDark: "#1F35B8",
  green: "#17875A",
  amber: "#B9700F",
};

function useCountdown(startSeconds: number): string {
  const [seconds, setSeconds] = useState(startSeconds);
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

const options = [
  { letter: "A", text: "Linked list", correct: false },
  { letter: "B", text: "Hash table", correct: true },
  { letter: "C", text: "Binary search tree", correct: false },
  { letter: "D", text: "Sorted array", correct: false },
];

export default function TestifyHero() {
  const time = useCountdown(18 * 60 + 42);
  const [graded, setGraded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGraded(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{ backgroundColor: tokens.paper, color: tokens.ink }}
      className="w-full min-h-screen flex items-center"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600&display=swap');
        .ts-display { font-family: 'Space Grotesk', sans-serif; }
        .ts-mono { font-family: 'IBM Plex Mono', monospace; }
        .ts-body { font-family: 'Inter', sans-serif; }
        .ts-fade-up { animation: tsFadeUp 0.7s ease both; }
        .ts-fade-up-1 { animation-delay: 0.05s; }
        .ts-fade-up-2 { animation-delay: 0.15s; }
        .ts-fade-up-3 { animation-delay: 0.25s; }
        .ts-card-in { animation: tsCardIn 0.8s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.2s; }
        @keyframes tsFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tsCardIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .ts-check { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease; }
        @media (prefers-reduced-motion: reduce) {
          .ts-fade-up, .ts-card-in, .ts-check { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left: copy */}
        <div>
          <div
            className="ts-fade-up ts-fade-up-1 ts-mono inline-flex items-center gap-2 text-xs tracking-widest uppercase px-3 py-1.5 rounded-full border"
            style={{ borderColor: tokens.hairline, color: tokens.graphite }}
          >
            <Circle size={8} fill={tokens.blue} stroke="none" />
            Secure Online Exams
          </div>

          <h1
            className="ts-display ts-fade-up ts-fade-up-2 mt-6 font-semibold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
          >
            Grade the moment
            <br />
            they submit.
          </h1>

          <p
            className="ts-body ts-fade-up ts-fade-up-2 mt-6 text-lg leading-relaxed max-w-md"
            style={{ color: tokens.graphite }}
          >
            Testify runs secure, timed exams for schools and institutions —
            auto-graded the instant a candidate hits submit, with zero manual
            scoring.
          </p>

          <div className="ts-fade-up ts-fade-up-3 mt-9 flex flex-wrap items-center gap-4">
            <button
              className="ts-body inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: tokens.blue }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = tokens.blueDark)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = tokens.blue)}
            >
              Get started
              <ArrowRight size={16} />
            </button>
            <button
              className="ts-body inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ borderColor: tokens.hairline, color: tokens.ink }}
            >
              See how it works
            </button>
          </div>

          <div
            className="ts-fade-up ts-fade-up-3 ts-mono mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-wide"
            style={{ color: tokens.graphite }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} color={tokens.green} /> Instant setup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} color={tokens.green} /> Zero credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} color={tokens.green} /> Secure &amp; protected
            </span>
          </div>
        </div>

        {/* Right: live exam session card on an answer-sheet dot grid */}
        <div
          className="relative flex justify-center py-8"
          style={{
            backgroundImage: `radial-gradient(circle, ${tokens.hairline} 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
        >
          <div
            className="ts-card-in relative w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
            style={{ backgroundColor: tokens.card, border: `1px solid ${tokens.hairline}` }}
          >
            {/* top bar */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: tokens.hairline }}
            >
              <div>
                <p className="ts-body text-sm font-medium">Data Structures — Midterm</p>
                <p className="ts-mono text-[11px] mt-0.5" style={{ color: tokens.graphite }}>
                  Question 7 of 20
                </p>
              </div>
              <div
                className="ts-mono flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium"
                style={{ backgroundColor: tokens.paper, color: tokens.ink }}
              >
                <Clock size={14} />
                {time}
              </div>
            </div>

            {/* question */}
            <div className="px-5 py-5">
              <p className="ts-body text-sm leading-relaxed">
                Which structure offers average O(1) lookup time?
              </p>

              <div className="mt-4 space-y-2.5">
                {options.map((opt) => {
                  const isChosen = opt.correct;
                  return (
                    <div
                      key={opt.letter}
                      className="ts-body flex items-center gap-3 rounded-lg px-3 py-2.5 border text-sm"
                      style={{
                        borderColor: isChosen ? tokens.green : tokens.hairline,
                        backgroundColor: isChosen ? "#F0FAF5" : "transparent",
                      }}
                    >
                      <span
                        className="ts-check w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                        style={{
                          borderColor: isChosen ? tokens.green : tokens.hairline,
                          backgroundColor: isChosen && graded ? tokens.green : "transparent",
                          transform: isChosen && graded ? "scale(1)" : "scale(0.9)",
                        }}
                      >
                        {isChosen && graded && <Check size={12} color="#fff" />}
                      </span>
                      <span className="ts-mono text-xs" style={{ color: tokens.graphite }}>
                        {opt.letter}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* status row */}
            <div
              className="ts-mono flex items-center justify-between px-5 py-3.5 border-t text-[11px] uppercase tracking-wide"
              style={{ borderColor: tokens.hairline, color: tokens.graphite }}
            >
              <span>12 Answered</span>
              <span className="inline-flex items-center gap-1">
                <Flag size={11} color={tokens.amber} /> 3 Flagged
              </span>
              <span>5 Remaining</span>
            </div>
          </div>

          {/* auto-graded badge */}
          <div
            className="ts-card-in ts-mono absolute -top-3 right-4 lg:right-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white shadow-md"
            style={{ backgroundColor: tokens.ink }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#4ADE80" }}
            />
            Auto-graded
          </div>
        </div>
      </div>
    </section>
  );
}