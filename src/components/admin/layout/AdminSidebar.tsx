"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  CreditCard,
  BarChart3,
  Settings,
  ShieldAlert,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Zap,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/admin/utils";
import { authClient } from "@/lib/auth-client";
import { TestifyLogoIcon } from "@/components/ui/Logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Exams",
    href: "/admin/exams",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: "Questions",
    href: "/admin/questions",
    icon: <HelpCircle className="h-5 w-5" />,
  },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "System Config",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: "Feature Flags",
    href: "/admin/features",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    label: "Permissions",
    href: "/admin/permissions",
    icon: <Lock className="h-5 w-5" />,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white/95 dark:bg-[#060B14]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ease-in-out lg:static",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-900/80">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <TestifyLogoIcon size={34} />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold font-display tracking-tight text-[#0B2238] dark:text-white group-hover:text-[#5B67F7] transition-colors">
                  Testify
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                  Admin Command
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Workspace Badge */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900/80 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
              Management
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800">
              <ShieldAlert className="h-3 w-3" /> Admin
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 group relative",
                  isActive
                    ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-sm dark:bg-[#5B67F7]/15 dark:text-purple-300 dark:border-purple-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={cn(
                    "transition-transform duration-200 group-hover:scale-110",
                    isActive
                      ? "text-[#5B67F7] dark:text-purple-300"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-[#5B67F7] dark:group-hover:text-purple-400"
                  )}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate flex-1 font-display">{item.label}</span>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B67F7] dark:bg-purple-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-900/80 bg-slate-50/40 dark:bg-slate-950/40">
          {!isCollapsed && user && (
            <div className="mb-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#152234] to-[#5B67F7] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold font-display text-[#0B2238] dark:text-white truncate">
                  {user.name || "Admin"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer",
              isCollapsed && "justify-center px-0"
            )}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}