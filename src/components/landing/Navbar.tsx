"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Search, Menu, X, ChevronDown, LogOut, Shield, GraduationCap, UserCheck, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRolesDropdown, setShowRolesDropdown] = useState(false);
  const isLoggedIn = !!session;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B2238] text-white border-b border-[#183652] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <Logo size={34} textClassName="text-white" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-slate-200">
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#why-testify" className="hover:text-white transition-colors">
              Why Testify
            </Link>
            <Link href="#security" className="hover:text-white transition-colors">
              Security
            </Link>

            {/* 3 Roles Dropdown Menu (Student, Teacher, Admin) */}
            <div className="relative">
              <button
                onClick={() => setShowRolesDropdown((prev) => !prev)}
                className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors font-medium"
              >
                <span>Role Portals</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showRolesDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRolesDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      href="/auth/login"
                      onClick={() => setShowRolesDropdown(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Student Portal</p>
                        <p className="text-[11px] text-slate-500">Take exams &amp; view scores</p>
                      </div>
                    </Link>

                    <Link
                      href="/teacher/dashboard"
                      onClick={() => setShowRolesDropdown(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Teacher Portal</p>
                        <p className="text-[11px] text-slate-500">Create &amp; evaluate exams</p>
                      </div>
                    </Link>

                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowRolesDropdown(false)}
                      className="flex items-start gap-2.5 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <ShieldAlert className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Admin Portal</p>
                        <p className="text-[11px] text-slate-500">System oversight &amp; analytics</p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right: Search & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search platform..."
              className="h-8 w-36 lg:w-48 rounded-full bg-[#13304A] border border-[#1E4366] pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00A3C4] transition-all"
            />
          </div>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-full bg-[#13304A] border border-[#1E4366] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1E4366] transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-[#00A3C4] text-[#0B2238] flex items-center justify-center text-xs font-bold">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="max-w-[100px] truncate">{session.user?.name || "Account"}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{session.user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/teacher/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Shield className="h-4 w-4 text-[#00A3C4]" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 rounded-full bg-[#163654] hover:bg-[#1E4870] border border-[#27537D] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                Create free account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl bg-[#13304A] text-slate-300 hover:text-white"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-[#183652] bg-[#0B2238] px-4 py-4 space-y-3">
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#why-testify"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white"
          >
            Why Testify
          </Link>
          <Link
            href="#security"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white"
          >
            Security
          </Link>

          {/* Role Portals Mobile */}
          <div className="pt-2 pb-1 border-y border-[#183652] space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role Portals</span>
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-200"
            >
              <GraduationCap className="h-3.5 w-3.5 text-[#00A3C4]" /> Student Portal
            </Link>
            <Link
              href="/teacher/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-200"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#00A3C4]" /> Teacher Portal
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-200"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-[#00A3C4]" /> Admin Portal
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="text-center py-2 text-xs font-semibold text-slate-300 border border-[#1E4366] rounded-full"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="text-center py-2 rounded-full bg-[#00A3C4] text-[#0B2238] text-xs font-bold"
            >
              Create free account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
