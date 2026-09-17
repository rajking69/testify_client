import { apiClient } from "@/lib/apiClient";

export interface NotificationItem {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS' | 'WARNING';
  readStatus: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  async getUserNotifications(limit = 50): Promise<{ success: boolean; data: NotificationItem[] }> {
    try {
      const response = await apiClient.get(`/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { success: false, data: [] };
    }
  },

  async markAsRead(id: string): Promise<{ success: boolean; data?: NotificationItem }> {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false };
    }
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false };
    }
  }
};
