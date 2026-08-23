"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedBackground({ variant = "default" }: { variant?: "hero" | "features" | "benefits" | "pricing" | "default" }) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        {/* Animated Multi-Color Floating Aurora Spheres (Ultra Colorful in Light Mode & Glowing in Dark Mode) */}
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-20 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-400/50 via-sky-300/40 to-blue-500/35 dark:from-cyan-500/35 dark:via-blue-600/30 dark:to-indigo-600/25 rounded-full blur-[110px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -45, 0],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-amber-400/50 via-rose-400/40 to-orange-300/40 dark:from-purple-600/35 dark:via-pink-500/25 dark:to-violet-600/30 rounded-full blur-[110px]"
        />

        <motion.div
          animate={{
            x: [0, 45, -50, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.35, 0.85, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-20 left-1/4 w-[650px] h-[650px] bg-gradient-to-r from-purple-400/45 via-indigo-300/40 to-cyan-400/45 dark:from-blue-600/30 dark:via-emerald-500/20 dark:to-purple-700/30 rounded-full blur-[120px]"
        />

        {/* 4th Additional Colorful Accent Orb */}
        <motion.div
          animate={{
            x: [0, -35, 35, 0],
            y: [0, 40, -40, 0],
            scale: [0.9, 1.2, 0.9, 0.9],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-gradient-to-tl from-emerald-400/35 via-teal-300/30 to-sky-300/35 dark:from-indigo-600/20 dark:to-cyan-400/20 rounded-full blur-[100px]"
        />

        {/* Subtle Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(var(--color-primary) 1.2px, transparent 1.2px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -45, 50, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-10 left-1/4 w-[520px] h-[520px] bg-gradient-to-tr from-cyan-400/40 via-sky-300/35 to-indigo-400/30 dark:from-indigo-600/30 dark:via-blue-500/25 dark:to-cyan-500/25 rounded-full blur-[110px]"
      />

      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 45, -50, 0],
          scale: [1, 1.3, 0.85, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute bottom-10 right-1/4 w-[550px] h-[550px] bg-gradient-to-bl from-amber-400/40 via-rose-300/35 to-purple-400/35 dark:from-purple-600/30 dark:via-pink-500/25 dark:to-blue-600/25 rounded-full blur-[110px]"
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(var(--color-primary) 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
