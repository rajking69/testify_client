"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { authClient } from '@/lib/auth-client';
import { NotificationItem, notificationService } from '@/services/notification.service';
import { showSuccessToast, showInfoToast, showWarningToast, showErrorToast } from '@/lib/admin/toast';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Using environment variable for socket URL or default to current host
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { data: session } = authClient.useSession();

  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    const res = await notificationService.getUserNotifications();
    if (res.success) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.readStatus).length);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (session?.user?.id) {
      // Connect to Socket.io
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        newSocket.emit('join_user_room', session.user.id);
      });

      newSocket.on('new_notification', (notification: NotificationItem) => {
        // Show Toast
        const title = notification.title;
        const msg = notification.message;
        
        switch (notification.type) {
          case 'SUCCESS':
            showSuccessToast(title, msg);
            break;
          case 'WARNING':
            showWarningToast(title, msg);
            break;
          case 'ALERT':
            showErrorToast(title, msg);
            break;
          case 'INFO':
          default:
            showInfoToast(title, msg);
            break;
        }

        // Update state
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [session?.user?.id]);

  const markAsRead = async (id: string) => {
    const res = await notificationService.markAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readStatus: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const res = await notificationService.markAllAsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
