"use client";

import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/admin/utils";
import { Bell, Check, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotificationCenterPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Notification Center
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Manage your system alerts, updates, and messages. You have <strong className="text-purple-600 dark:text-purple-400">{unreadCount} unread</strong> notifications.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
            className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 cursor-pointer"
            leftIcon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-[#080E1A] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
            <Bell className="h-12 w-12 text-slate-200 dark:text-slate-800 mb-4" />
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => {
                  if (!notification.readStatus) {
                    markAsRead(notification._id);
                  }
                }}
                className={cn(
                  "p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group flex items-start gap-4",
                  !notification.readStatus ? "bg-purple-50/30 dark:bg-purple-900/10" : ""
                )}
              >
                {/* Unread Indicator & Icon */}
                <div className="relative shrink-0 mt-1">
                  {!notification.readStatus && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full border-2 border-white dark:border-[#080E1A]" />
                  )}
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-purple-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <Bell className="h-4 w-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className={cn("text-sm font-bold truncate", !notification.readStatus ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                      {notification.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-400 shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={cn("text-sm leading-relaxed", !notification.readStatus ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400")}>
                    {notification.message}
                  </p>
                </div>

                {/* Action (Mark as Read single) */}
                {!notification.readStatus && (
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
