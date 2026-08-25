"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  BarChart3,
  Activity,
  FileCheck2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
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

const teacherNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Question Bank",
    href: "/teacher/question-bank",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    label: "Exams",
    href: "/teacher/exams",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: "Students",
    href: "/teacher/students",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    label: "Monitoring",
    href: "/teacher/monitoring",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: "Evaluation",
    href: "/teacher/evaluation",
    icon: <FileCheck2 className="h-5 w-5" />,
  },
  {
    label: "Results",
    href: "/teacher/results",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
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
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Testify
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Teacher Portal
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
            <span className="text-xs font-medium text-slate-500">Workspace</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <GraduationCap className="h-3 w-3" /> Teacher
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {teacherNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  }`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-900">
          {!isCollapsed && user && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user.name || "Teacher"}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors ${
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
