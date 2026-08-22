"use client";

import React from "react";
import { motion } from "framer-motion";

export function AnimatedBackground({ variant = "default" }: { variant?: "hero" | "features" | "benefits" | "pricing" | "default" }) {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        {/* Animated Vibrant Floating Mesh Spheres */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-sky-400/35 via-cyan-300/30 to-blue-500/25 rounded-full blur-[100px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-gradient-to-bl from-amber-300/35 via-orange-300/25 to-yellow-200/30 rounded-full blur-[100px]"
        />

        <motion.div
          animate={{
            x: [0, 30, -40, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-20 left-1/3 w-[550px] h-[550px] bg-gradient-to-r from-purple-300/30 via-indigo-200/25 to-cyan-300/30 rounded-full blur-[110px]"
        />

        {/* Blueprint Subtle Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#0B2238 1px, transparent 1px)`,
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
          x: [0, 35, -25, 0],
          y: [0, -30, 35, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-gradient-to-tr from-cyan-400/25 via-blue-300/20 to-indigo-400/20 rounded-full blur-[90px]"
      />

      <motion.div
        animate={{
          x: [0, -35, 25, 0],
          y: [0, 30, -35, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-gradient-to-bl from-amber-300/25 via-rose-200/20 to-purple-300/20 rounded-full blur-[90px]"
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#00A3C4 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
