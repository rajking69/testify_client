"use client";

import React from "react";
import { cn } from "@/lib/admin/utils";
import { LucideIcon } from "lucide-react";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AdminCard({ children, className, onClick }: AdminCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface AdminCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCardHeader({ children, className }: AdminCardHeaderProps) {
  return (
    <div className={cn("p-6 border-b border-slate-200 dark:border-slate-800", className)}>
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
    <div className={cn("p-6", className)}>
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
    <div className={cn("p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50", className)}>
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
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-purple-600 dark:text-purple-400",
  trend = "neutral",
  className,
}: StatCardProps) {
  const trendColors = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-rose-600 dark:text-rose-400",
    neutral: "text-slate-600 dark:text-slate-400",
  };

  return (
    <AdminCard className={className}>
      <AdminCardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            {change && (
              <p className={cn("text-xs mt-1", trendColors[trend])}>{change}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl bg-slate-100 dark:bg-slate-800", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}