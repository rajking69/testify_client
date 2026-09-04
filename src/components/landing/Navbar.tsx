"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Search,
  KeyRound,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  User,
  Target,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
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

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
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

            {/* 3 Roles Dropdown Menu (Student, Teacher, Admin) */}
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
            className="relative flex items-center"
          >
            <KeyRound
              className={`absolute left-3 h-3.5 w-3.5 pointer-events-none ${isScrolled ? "text-slate-400 dark:text-slate-400" : "text-slate-300"}`}
            />
            <input
              name="roomCode"
              type="text"
              placeholder="Enter Room Code..."
              className={`h-8 w-36 lg:w-44 rounded-full border pl-8 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00A3C4] transition-all shadow-2xs ${
                isScrolled
                  ? "bg-white/80 dark:bg-slate-900/80 border-slate-300/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                  : "bg-white/20 dark:bg-slate-900/80 border-white/30 dark:border-slate-800 text-white placeholder-slate-300 backdrop-blur-xs"
              }`}
            />
            <button
              type="submit"
              className={`absolute right-2 p-0.5 rounded-full hover:scale-110 transition-all cursor-pointer ${
                isScrolled ? "text-[#00A3C4] hover:text-[#008BB0]" : "text-cyan-300 hover:text-white"
              }`}
              title="Join Exam Room"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Animated Theme Toggle */}
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                  isScrolled
                    ? "bg-white/80 dark:bg-slate-900/80 border-slate-300/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                    : "bg-white/20 dark:bg-slate-900/80 border-white/30 dark:border-slate-800 text-white hover:bg-white/30 backdrop-blur-xs"
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#00A3C4] to-[#0B2238] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {session.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <span className="max-w-[100px] truncate">
                  {session.user?.name || "Account"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 ${isScrolled ? "text-slate-500 dark:text-slate-400" : "text-slate-300"}`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{session.user?.name}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {((session.user as { role?: string })?.role) || "User"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <Link
                    href={`/${((session.user as { role?: string })?.role) || "student"}/dashboard`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-[#00A3C4]" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
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

          {/* Role Portals Mobile */}
          <div className="pt-2 pb-1 border-y border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Role Portals
            </span>
            <Link
              href="/student/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <GraduationCap className="h-3.5 w-3.5 text-[#00A3C4]" /> Student
              Portal
            </Link>
            <Link
              href="/teacher/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />{" "}
              Teacher Portal
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />{" "}
              Admin Portal
            </Link>
          </div>

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
        </div>
      )}
    </header>
  );
}
