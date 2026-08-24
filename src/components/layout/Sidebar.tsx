"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ShieldAlert,
  Trophy,
  Clock,
  Users,
  Settings,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { TestifyLogoIcon } from "@/components/ui/Logo";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

// Role-specific navigation items
const roleNavItems: Record<string, NavItem[]> = {
  teacher: [
    {
      label: "Dashboard",
      href: "/dashboard/teacher",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Question Bank",
      href: "/dashboard/teacher/question-bank",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      label: "Exams",
      href: "/dashboard/teacher/exams",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Results",
      href: "/dashboard/teacher/results",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ],
  admin: [
    {
      label: "Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "User Management",
      href: "/dashboard/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "System Health",
      href: "/dashboard/admin/health",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/dashboard/student",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Available Exams",
      href: "/dashboard/student/exams",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "My Results",
      href: "/dashboard/student/results",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      label: "Study Progress",
      href: "/dashboard/student/progress",
      icon: <Clock className="h-5 w-5" />,
    },
  ],
};

// Role-specific color configuration
const roleConfig = {
  teacher: {
    accent: "indigo",
    gradient: "from-indigo-600 to-blue-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    darkBgColor: "dark:bg-indigo-950/60",
    darkTextColor: "dark:text-indigo-300",
    badgeText: "Teacher",
    badgeIcon: <GraduationCap className="h-3 w-3" />,
  },
  admin: {
    accent: "purple",
    gradient: "from-purple-600 to-indigo-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    darkBgColor: "dark:bg-purple-950/60",
    darkTextColor: "dark:text-purple-300",
    badgeText: "Admin",
    badgeIcon: <ShieldAlert className="h-3 w-3" />,
  },
  student: {
    accent: "cyan",
    gradient: "from-cyan-600 to-teal-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    darkBgColor: "dark:bg-cyan-950/60",
    darkTextColor: "dark:text-cyan-300",
    badgeText: "Student",
    badgeIcon: <GraduationCap className="h-3 w-3" />,
  },
};

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const userRole = user?.role || "teacher";
  const config =
    roleConfig[userRole as keyof typeof roleConfig] || roleConfig.teacher;
  const navItems = roleNavItems[userRole] || roleNavItems.teacher;

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? "w-20" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-900">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <TestifyLogoIcon size={34} />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold font-display tracking-tight text-[#152234] dark:text-white">
                  Testify
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {config.badgeText} Portal
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Role Badge Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-display">
              Workspace
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md ${config.bgColor} ${config.textColor} ${config.darkBgColor} ${config.darkTextColor} px-2 py-1 text-xs font-bold uppercase tracking-wider`}
            >
              {config.badgeIcon} {config.badgeText}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? `bg-${config.accent}-600 text-white shadow-md shadow-${config.accent}-500/20`
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-white"
                      : `text-slate-500 dark:text-slate-400 group-hover:text-${config.accent}-600 dark:group-hover:text-${config.accent}-400`
                  }`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate flex-1 font-display">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-900">
          {!isCollapsed && user && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-full bg-gradient-to-tr ${config.gradient} text-white flex items-center justify-center text-xs font-bold shrink-0`}
              >
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : config.badgeText.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold font-display text-[#152234] dark:text-white truncate">
                  {user.name || config.badgeText}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
