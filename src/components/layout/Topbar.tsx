"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Home,
  LogOut,
  ChevronDown,
  Bell,
  User,
  Shield,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [showDropdown, setShowDropdown] = useState(false);

  const userRole = user?.role || "teacher";
  const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  // Role-specific color configuration
  const roleConfig = {
    teacher: {
      gradient: "from-indigo-600 to-blue-600",
      accent: "indigo",
    },
    admin: {
      gradient: "from-purple-600 to-indigo-600",
      accent: "purple",
    },
    student: {
      gradient: "from-cyan-600 to-teal-600",
      accent: "cyan",
    },
  };

  const config =
    roleConfig[userRole as keyof typeof roleConfig] || roleConfig.teacher;

  const getPageTitle = () => {
    if (!pathname) return `${roleDisplay} Dashboard`;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return `${roleDisplay} Dashboard`;
    const lastSegment =
      segments[segments.length - 1].charAt(0).toUpperCase() +
      segments[segments.length - 1].slice(1).toLowerCase();
    return `${lastSegment} Dashboard`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile Sidebar Trigger & Breadcrumb Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-display">
            <span>{roleDisplay}</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {getPageTitle()}
            </span>
          </div>
          <h1 className="text-lg font-bold font-display text-[#152234] dark:text-white tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Landing Link, Theme Toggle & User Dropdown */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title="Return to Public Landing Page"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Landing Page</span>
        </Link>

        {/* Animated Theme Toggle */}
        <ThemeToggle />

        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#0092E3] ring-2 ring-white dark:ring-slate-950"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${config.gradient} text-xs font-bold text-white shadow-sm`}
            >
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : roleDisplay.charAt(0)}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {user?.name || roleDisplay}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-xl border border-slate-100 dark:border-slate-800 card-hover-effect">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold font-display text-[#152234] dark:text-white truncate">
                    {user?.name || `${roleDisplay} Profile`}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || `${userRole}@testify.com`}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href={`/profile/${userRole}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Profile Settings
                  </Link>
                  <Link
                    href={`/${userRole}/dashboard`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Home className="h-4 w-4 text-slate-400" />
                    Public Landing Page
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      authClient.signOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
