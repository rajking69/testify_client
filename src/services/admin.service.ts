import { apiClient } from "@/lib/apiClient";
import { AnalyticsData } from "@/lib/admin/types";

export const adminService = {
  async getDashboardOverview(): Promise<{ success: boolean; data: any }> {
    return apiClient.get("/admin/dashboard");
  },

  async getAnalytics(): Promise<{ success: boolean; data: AnalyticsData }> {
    return apiClient.get("/admin/analytics");
  },

  async getUsers(params: {
    role?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number | string;
  } = {}): Promise<{
    success: boolean;
    count: number;
    total: number;
    page: number;
    totalPages: number;
    stats?: {
      total: number;
      active: number;
      suspended: number;
      deactivated: number;
      teachers: number;
      students: number;
      admins: number;
    };
    data: any[];
  }> {
    const query = new URLSearchParams();
    if (params.role && params.role !== "all") query.append("role", params.role);
    if (params.search && params.search.trim()) query.append("search", params.search.trim());
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.page !== undefined) query.append("page", String(params.page));
    if (params.limit !== undefined) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs ? `/admin/users?${qs}` : "/admin/users";
    return apiClient.get(url);
  },

  async updateUser(id: string, payload: { role?: string; status?: string }): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.patch(`/admin/users/${id}`, payload);
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.delete(`/admin/users/${id}`);
  },

  async getPayments(): Promise<{ success: boolean; data: { purchases: any[]; subscriptions: any[] } }> {
    return apiClient.get("/admin/payments");
  },

  async getSystemConfigs(): Promise<{ success: boolean; count: number; data: any[] }> {
    return apiClient.get("/admin/settings");
  },

  async updateSystemConfig(key: string, value: string): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.patch(`/admin/settings/${key}`, { value });
  },

  async getSubscriptionOverviewAdmin(): Promise<{
    success: boolean;
    stats: {
      total: number;
      active: number;
      pro: number;
      free: number;
      institutional: number;
      monthlyRevenue: number;
      activePlansCount: number;
    };
    plans: any[];
    subscriptions: any[];
  }> {
    return apiClient.get("/subscriptions/admin/overview");
  },

  async getAllSubscriptionPlansAdmin(): Promise<{ success: boolean; count: number; data: any[] }> {
    return apiClient.get("/subscriptions/admin/all-plans");
  },

  async createSubscriptionPlan(payload: {
    name: string;
    targetRole: string;
    interval: string;
    price: number;
    durationDays?: number;
    features?: string[];
    isActive?: boolean;
  }): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post("/subscriptions/admin/plans", payload);
  },

  async updateSubscriptionPlan(
    id: string,
    payload: {
      name?: string;
      targetRole?: string;
      interval?: string;
      price?: number;
      durationDays?: number;
      features?: string[];
      isActive?: boolean;
    }
  ): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.put(`/subscriptions/admin/plans/${id}`, payload);
  },

  async deleteSubscriptionPlan(id: string): Promise<{ success: boolean; message: string; data?: any }> {
    return apiClient.delete(`/subscriptions/admin/plans/${id}`);
  },
};