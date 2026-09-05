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
  ShieldAlert,
  Trophy,
  Clock,
  Users,
  Settings,
  Shield,
  Sparkles,
  Target,
  DollarSign,
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
      href: "/teacher/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Revenue & Sales",
      href: "/teacher/revenue",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: "Practice Mode",
      href: "/practice",
      icon: <Target className="h-5 w-5" />,
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
  ],
  admin: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Practice Mode",
      href: "/practice",
      icon: <Target className="h-5 w-5" />,
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Exams",
      href: "/admin/exams",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/student/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Practice Mode",
      href: "/practice",
      icon: <Target className="h-5 w-5" />,
    },
    {
      label: "Available Exams",
      href: "/student/exams",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "My Results",
      href: "/student/results",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      label: "Study Progress",
      href: "/student/progress",
      icon: <Clock className="h-5 w-5" />,
    },
  ],
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

  const [customProfile, setCustomProfile] = React.useState<{ name?: string; image?: string }>({});

  React.useEffect(() => {
    const syncProfile = () => {
      try {
        const stored = localStorage.getItem("testify_custom_profile");
        if (stored) {
          setCustomProfile(JSON.parse(stored));
        }
      } catch {}
    };
    syncProfile();

    window.addEventListener("testify_profile_updated", syncProfile);
    return () => window.removeEventListener("testify_profile_updated", syncProfile);
  }, []);

  const activeName = customProfile.name || user?.name;
  const activeImage = customProfile.image || user?.image;

  const userRole = user?.role || "teacher";
  const navItems = roleNavItems[userRole] || roleNavItems.teacher;

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const roleMeta = {
    teacher: {
      badgeBg: "bg-cyan-50 text-[#00A3C4] dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      avatarGrad: "from-[#0B2238] to-[#00A3C4]",
      label: "Teacher",
      icon: <GraduationCap className="h-3 w-3" />,
    },
    admin: {
      badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      avatarGrad: "from-[#152234] to-[#5B67F7]",
      label: "Admin",
      icon: <ShieldAlert className="h-3 w-3" />,
    },
    student: {
      badgeBg: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
      avatarGrad: "from-[#0B2238] to-[#00CBB8]",
      label: "Student",
      icon: <Sparkles className="h-3 w-3" />,
    },
  };

  const currentRole = roleMeta[userRole as keyof typeof roleMeta] || roleMeta.teacher;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white/75 dark:bg-[#060B14]/75 backdrop-blur-2xl border-r border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? "w-20" : "w-64"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-900/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <TestifyLogoIcon size={34} />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold font-display tracking-tight text-[#0B2238] dark:text-white group-hover:text-[#00A3C4] transition-colors">
                  Testify
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  {currentRole.label} Portal
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

        {/* Role Badge Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-900/80 bg-slate-50/60 dark:bg-slate-900/30 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
              Workspace
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${currentRole.badgeBg}`}
            >
              {currentRole.icon} {currentRole.label}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 group relative ${
                  isActive
                    ? "bg-cyan-50 text-[#00A3C4] border border-cyan-200 shadow-sm dark:bg-[#00A3C4]/15 dark:text-cyan-300 dark:border-cyan-500/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-[#00A3C4] dark:text-cyan-300"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-[#00A3C4] dark:group-hover:text-cyan-400"
                  }`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate flex-1 font-display">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A3C4] dark:bg-cyan-300 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-900/80 bg-slate-50/40 dark:bg-slate-950/40">
          {!isCollapsed && user && (
            <div className="mb-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2.5">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={activeName || "User"}
                  className="h-8 w-8 rounded-xl object-cover border border-blue-300 dark:border-blue-700 shadow-2xs shrink-0"
                />
              ) : (
                <div
                  className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${currentRole.avatarGrad} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
                >
                  {activeName
                    ? activeName.charAt(0).toUpperCase()
                    : currentRole.label.charAt(0)}
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold font-display text-[#0B2238] dark:text-white truncate">
                  {activeName || currentRole.label}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
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
