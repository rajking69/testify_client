import React, { ReactNode } from "react";

export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "primary",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-semibold rounded-full transition-colors";

  const variants = {
    primary:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60",
    secondary:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60",
    danger:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60",
    info:
      "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/60",
    outline:
      "bg-transparent text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
