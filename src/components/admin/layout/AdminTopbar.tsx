"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  ChevronDown,
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
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const notifications = [
    { id: 1, title: "New user registration", message: "5 new users registered today", time: "2h ago", unread: true },
    { id: 2, title: "System alert", message: "High CPU usage detected", time: "4h ago", unread: true },
    { id: 3, title: "Payment received", message: "New subscription payment from Lisa Anderson", time: "6h ago", unread: false },
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenMobileSidebar}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, exams, questions..."
            className="w-80 pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onFocus={() => setShowSearch(true)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {notifications.some((n) => n.unread) && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full" />
            )}
          </Button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-4 z-20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                  <Badge variant="secondary" className="text-xs">
                    {notifications.filter((n) => n.unread).length} new
                  </Badge>
                </div>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        notification.unread
                          ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {notification.unread && (
                          <span className="h-2 w-2 bg-purple-500 rounded-full mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-20">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to profile
                    }}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to settings
                    }}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    System Settings
                  </button>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
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