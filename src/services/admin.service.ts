import { API_BASE_URL } from "@/lib/api-config";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const adminService = {
  async getDashboardOverview(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: any }>(res);
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

    const res = await fetch(`${API_BASE_URL}/admin/users?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{
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
    }>(res);
  },

  async updateUser(id: string, payload: { role?: string; status?: string }): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async getPayments(): Promise<{ success: boolean; data: { purchases: any[]; subscriptions: any[] } }> {
    const res = await fetch(`${API_BASE_URL}/admin/payments`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: { purchases: any[]; subscriptions: any[] } }>(res);
  },

  async getFeatureFlags(): Promise<{ success: boolean; count: number; data: any[] }> {
    const res = await fetch(`${API_BASE_URL}/admin/features`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: any[] }>(res);
  },

  async toggleFeatureFlag(id: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/admin/features/${id}/toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async getSystemConfigs(): Promise<{ success: boolean; count: number; data: any[] }> {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: any[] }>(res);
  },

  async updateSystemConfig(key: string, value: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/admin/settings/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ value }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },
};