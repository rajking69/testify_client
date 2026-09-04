"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Home,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/admin/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AdminTopbarProps {
  onOpenMobileSidebar: () => void;
}

export function AdminTopbar({ onOpenMobileSidebar }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const notifications = [
    {
      id: 1,
      title: "New user registration",
      message: "5 new users registered today",
      time: "2h ago",
      unread: true,
    },
    {
      id: 2,
      title: "System alert",
      message: "High CPU usage detected",
      time: "4h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment received",
      message: "New subscription payment from Lisa Anderson",
      time: "6h ago",
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#060B14]/90 backdrop-blur-xl px-4 sm:px-6 transition-colors">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 font-display uppercase tracking-wider">
            <span>Admin Control</span>
            <span>/</span>
            <span className="text-purple-600 dark:text-purple-400">Command Center</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold font-display text-[#0B2238] dark:text-white tracking-tight">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-2xs"
          title="Return to Public Landing Page"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications.some((n) => n.unread) && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-purple-500 rounded-full ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#0B2238] dark:text-white">
                    System Notifications
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {notifications.filter((n) => n.unread).length} New
                  </span>
                </div>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-2.5 rounded-xl border transition-colors",
                        notification.unread
                          ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40"
                          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "Admin"}
                className="h-8 w-8 rounded-xl object-cover border border-purple-300 dark:border-purple-700 shadow-2xs"
              />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#152234] to-[#5B67F7] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-bold text-slate-800 dark:text-slate-200">
              {user?.name || "Admin"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold font-display text-[#0B2238] dark:text-white truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || "admin@testify.com"}
                  </p>
                </div>
                <div className="pt-1">
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
