"use client";

import React, { useState, useEffect } from "react";
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
  Search,
  Target,
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

  const [customProfile, setCustomProfile] = useState<{ name?: string; image?: string }>({});

  useEffect(() => {
    const syncProfile = () => {
      try {
        const userEmail = user?.email;
        if (userEmail) {
          const userSpecific = localStorage.getItem(`testify_custom_profile_${userEmail}`);
          if (userSpecific) {
            setCustomProfile(JSON.parse(userSpecific));
            return;
          }
        }
        setCustomProfile({});
      } catch {}
    };
    syncProfile();

    window.addEventListener("testify_profile_updated", syncProfile);
    return () => window.removeEventListener("testify_profile_updated", syncProfile);
  }, [user?.email]);

  const activeName = customProfile.name || user?.name;
  const activeImage = customProfile.image || user?.image;

  const userRole = user?.role || "teacher";
  const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const roleMeta = {
    teacher: {
      gradient: "from-[#0B2238] to-[#00A3C4]",
      accent: "#00A3C4",
    },
    admin: {
      gradient: "from-[#152234] to-[#5B67F7]",
      accent: "#5B67F7",
    },
    student: {
      gradient: "from-[#0B2238] to-[#00CBB8]",
      accent: "#00CBB8",
    },
  };

  const config = roleMeta[userRole as keyof typeof roleMeta] || roleMeta.teacher;

  const getPageTitle = () => {
    if (!pathname) return `${roleDisplay} Dashboard`;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return `${roleDisplay} Dashboard`;
    const lastSegment =
      segments[segments.length - 1].charAt(0).toUpperCase() +
      segments[segments.length - 1].slice(1).toLowerCase();
    return `${lastSegment.replace(/-/g, " ")}`;
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/75 dark:bg-[#060B14]/75 backdrop-blur-2xl px-4 sm:px-6 transition-colors">
      {/* Left: Mobile Sidebar Trigger & Breadcrumb Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 font-display uppercase tracking-wider">
            <span>{roleDisplay}</span>
            <span>/</span>
            <span className="text-[#00A3C4] dark:text-cyan-400">
              {getPageTitle()}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Landing Link, Practice Link, Theme Toggle & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors shadow-2xs"
          title="Return to Public Landing Page"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <Link
          href="/practice"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title="Go to Practice Mode"
        >
          <Target className="h-3.5 w-3.5" />
          <span>Practice</span>
        </Link>

        {/* Animated Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {activeImage ? (
              <img
                src={activeImage}
                alt={activeName || "User"}
                className="h-8 w-8 rounded-xl object-cover border border-blue-300 dark:border-blue-700 shadow-2xs"
              />
            ) : (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr ${config.gradient} text-xs font-bold text-white shadow-sm`}
              >
                {activeName
                  ? activeName.charAt(0).toUpperCase()
                  : roleDisplay.charAt(0)}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeName || roleDisplay}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold font-display text-[#0B2238] dark:text-white truncate">
                    {user?.name || `${roleDisplay} Profile`}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || `${userRole}@testify.com`}
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href={`/${userRole}/dashboard`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/practice"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Target className="h-4 w-4 text-slate-400" />
                    Practice Mode
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
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
