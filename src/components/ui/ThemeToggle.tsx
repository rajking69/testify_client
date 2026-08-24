"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

interface ThemeToggleProps {
  variant?: "icon" | "pill";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  className = "",
}) => {
  const { theme, resolvedTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  if (variant === "pill") {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-sm cursor-pointer ${className}`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25, ease: "backOut" }}
                className="text-amber-400"
              >
                <Moon className="w-4 h-4 fill-amber-400/20 text-amber-400" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
                transition={{ duration: 0.25, ease: "backOut" }}
                className="text-amber-500"
              >
                <Sun className="w-4 h-4 fill-amber-500/20 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span>{isDark ? "Dark" : "Light"}</span>
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label="Toggle dark theme"
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-800/70 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/40 dark:hover:border-blue-500/40 shadow-sm transition-colors duration-200 cursor-pointer overflow-hidden group ${className}`}
    >
      {/* Background glow animation */}
      <motion.span
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDark
            ? "bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-amber-500/10"
            : "bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-blue-500/10"
        }`}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark-icon"
            initial={{ rotate: -180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10 text-amber-300"
          >
            <Moon className="w-5 h-5 fill-amber-400/20 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          </motion.div>
        ) : (
          <motion.div
            key="light-icon"
            initial={{ rotate: 180, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -180, scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10 text-amber-500"
          >
            <Sun className="w-5 h-5 fill-amber-500/20 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
