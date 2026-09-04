"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  KeyRound,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  LogOut,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  Target,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [customProfile, setCustomProfile] = useState<{ name?: string; image?: string }>({});
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRolesDropdown, setShowRolesDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoggedIn = !!session;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      try {
        const stored = localStorage.getItem("testify_custom_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!user?.email || !parsed.email || parsed.email === user.email) {
            setCustomProfile(parsed);
            return;
          }
        }
        setCustomProfile({});
      } catch {}
    };
    syncProfile();

    window.addEventListener("testify_profile_updated", syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener("testify_profile_updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [user?.email]);

  const activeName = customProfile.name || user?.name;
  const activeImage = customProfile.image || user?.image;
  const userRole = ((user as { role?: string })?.role) || "student";
  const roleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const getDashboardIcon = () => {
    if (userRole === "teacher") return <UserCheck className="h-4 w-4 text-indigo-500" />;
    if (userRole === "admin") return <ShieldAlert className="h-4 w-4 text-purple-500" />;
    return <GraduationCap className="h-4 w-4 text-cyan-500" />;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-xs"
          : "bg-transparent border-b border-transparent shadow-none"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20 transition-all duration-300">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <Logo
            size={34}
            textClassName="text-[#0B2238] dark:text-white font-bold"
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold text-slate-800 dark:text-slate-200">
            <Link
              href="#features"
              className="hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#why-testify"
              className="hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors"
            >
              Why Testify
            </Link>
            <Link
              href="/practice"
              className="flex items-center gap-1.5 hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors"
            >
              <Target className="h-3.5 w-3.5" />
              Practice
            </Link>
            <Link
              href="#security"
              className="hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors"
            >
              Security
            </Link>

            {/* Role Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRolesDropdown((prev) => !prev)}
                className="flex items-center gap-1 text-slate-800 dark:text-slate-200 hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors font-semibold cursor-pointer"
              >
                <span>Role Portals</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {showRolesDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRolesDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      href="/student/dashboard"
                      onClick={() => setShowRolesDropdown(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Student Portal
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Take exams &amp; view scores
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/teacher/dashboard"
                      onClick={() => setShowRolesDropdown(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Teacher Portal
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Create &amp; evaluate exams
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowRolesDropdown(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Admin Portal
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          System oversight &amp; analytics
                        </p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link
              href="#pricing"
              className="hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors"
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right: Search, Theme Toggle & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Room Code / Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("roomCode") as HTMLInputElement;
              const code = input?.value?.trim();
              if (code) {
                router.push(`/exam/${encodeURIComponent(code.toUpperCase())}`);
              }
            }}
            className="relative flex items-center group"
          >
            <div className="relative flex items-center">
              <KeyRound
                className={`absolute left-3.5 h-3.5 w-3.5 pointer-events-none transition-colors ${
                  isScrolled
                    ? "text-slate-400 group-focus-within:text-[#00A3C4]"
                    : "text-slate-300 group-focus-within:text-cyan-300"
                }`}
              />
              <input
                name="roomCode"
                type="text"
                placeholder="Enter Room Code..."
                className={`w-44 lg:w-48 rounded-full pl-9 pr-8 py-1.5 text-xs font-medium uppercase tracking-wider outline-hidden transition-all duration-300 focus:w-56 ${
                  isScrolled
                    ? "bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 placeholder:normal-case placeholder:tracking-normal focus:border-[#00A3C4] focus:ring-2 focus:ring-[#00A3C4]/20"
                    : "bg-white/15 dark:bg-slate-900/60 border border-white/25 dark:border-slate-700/60 text-white placeholder:text-slate-300 placeholder:normal-case placeholder:tracking-normal focus:border-white focus:bg-white/25 focus:ring-2 focus:ring-white/20 backdrop-blur-xs"
                }`}
              />
              <button
                type="submit"
                title="Join Exam Room"
                className={`absolute right-1.5 p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer ${
                  isScrolled ? "text-slate-500 hover:text-[#00A3C4]" : "text-white/80 hover:text-white"
                }`}
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </form>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Auth State Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isScrolled
                    ? "bg-slate-100/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200/60"
                    : "bg-white/20 dark:bg-slate-900/80 border-white/30 dark:border-slate-800 text-white hover:bg-white/30 backdrop-blur-xs"
                }`}
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={activeName || "User"}
                    className="h-6 w-6 rounded-full object-cover shadow-xs ring-1 ring-white/20"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#00A3C4] to-[#0B2238] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {activeName
                      ? activeName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
                <span className="max-w-[100px] truncate">
                  {activeName || "Account"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 ${isScrolled ? "text-slate-500 dark:text-slate-400" : "text-slate-300"}`}
                />
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                    {/* Header profile info */}
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        {activeImage ? (
                          <img
                            src={activeImage}
                            alt={activeName || "User"}
                            className="h-9 w-9 rounded-full object-cover border border-cyan-500/30"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#00A3C4] to-[#0B2238] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                            {activeName
                              ? activeName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {activeName || "User"}
                            </p>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                              {userRole}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Only Dashboard & Sign Out */}
                    <div className="py-1 space-y-0.5">
                      <Link
                        href={`/${userRole}/dashboard`}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {getDashboardIcon()}
                        <span>{roleDisplay} Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  isScrolled
                    ? "text-slate-800 dark:text-slate-200 hover:text-[#00A3C4] dark:hover:text-white"
                    : "text-white hover:text-cyan-300 drop-shadow-xs"
                }`}
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 rounded-full bg-[#00A3C4] hover:bg-[#38bdf8] text-[#0B2238] text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Create free account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isScrolled
                ? "bg-white/80 dark:bg-slate-900 border-slate-300/80 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:text-blue-600"
                : "bg-white/20 dark:bg-slate-900 border-white/30 dark:border-slate-800 text-white hover:text-cyan-300"
            }`}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl">
          {isLoggedIn && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-2">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={activeName || "User"}
                  className="h-10 w-10 rounded-full object-cover border border-cyan-500/30"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00A3C4] to-[#0B2238] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  {activeName ? activeName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {activeName || "User"}
                  </p>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-800/50">
                    {userRole}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-slate-800 dark:text-slate-300 hover:text-[#00A3C4] dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#why-testify"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-slate-800 dark:text-slate-300 hover:text-[#00A3C4] dark:hover:text-white"
          >
            Why Testify
          </Link>
          <Link
            href="/practice"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-300 hover:text-[#00A3C4] dark:hover:text-white"
          >
            <Target className="h-3.5 w-3.5" />
            Practice Mode
          </Link>
          <Link
            href="#security"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-slate-800 dark:text-slate-300 hover:text-[#00A3C4] dark:hover:text-white"
          >
            Security
          </Link>

          {isLoggedIn ? (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/${userRole}/dashboard`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-full bg-white/70 dark:bg-slate-900"
              >
                {getDashboardIcon()}
                <span>{roleDisplay} Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 rounded-full bg-rose-50/50 dark:bg-rose-950/30 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 text-xs font-bold text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full bg-white/70"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="text-center py-2 rounded-full bg-[#00A3C4] text-[#0B2238] text-xs font-bold shadow-sm"
              >
                Create free account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
