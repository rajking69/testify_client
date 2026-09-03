"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/admin/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function AdminCard({
  children,
  className,
  onClick,
  hoverEffect = true,
}: AdminCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2, ease: "easeOut" } } : undefined}
      className={cn(
        "rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface AdminCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCardHeader({ children, className }: AdminCardHeaderProps) {
  return (
    <div className={cn("p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80", className)}>
      {children}
    </div>
  );
}

interface AdminCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCardContent({ children, className }: AdminCardContentProps) {
  return (
    <div className={cn("p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

interface AdminCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCardFooter({ children, className }: AdminCardFooterProps) {
  return (
    <div className={cn("p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40", className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  badge?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-cyan-500 dark:text-cyan-400",
  trend = "neutral",
  badge,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1220]/90 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden group",
        className
      )}
    >
      {/* Background soft ambient highlight on hover */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-cyan-500/10 to-teal-500/0 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B2238] dark:text-white tracking-tight">{value}</p>
        </div>

        <div className={cn("p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs group-hover:scale-110 transition-transform duration-300", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(change || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs relative z-10">
          {change && (
            <div className="flex items-center gap-1.5 font-medium">
              {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
              {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
              <span className={cn(
                trend === "up" && "text-emerald-600 dark:text-emerald-400 font-semibold",
                trend === "down" && "text-rose-600 dark:text-rose-400 font-semibold",
                trend === "neutral" && "text-slate-500 dark:text-slate-400"
              )}>
                {change}
              </span>
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-[#00A3C4] dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              {badge}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}