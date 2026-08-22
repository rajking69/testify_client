import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({ children, className = "", hoverEffect = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 ${
        hoverEffect ? "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div
      className={`p-6 border-b border-slate-100 dark:border-slate-800/60 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3
      className={`text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: CardProps) {
  return (
    <p
      className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${className}`}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div
      className={`p-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}
