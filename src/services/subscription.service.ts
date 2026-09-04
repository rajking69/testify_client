export interface SubscriptionPlan {
  _id: string;
  name: string;
  targetRole: "teacher" | "student";
  interval: "monthly" | "yearly";
  price: number;
  features: string[];
  stripePriceId?: string;
}

export interface UserSubscriptionStatus {
  hasActiveSubscription: boolean;
  role: string;
  subscription?: {
    _id: string;
    planId: any;
    status: "active" | "cancelled" | "expired";
    currentPeriodEnd: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const subscriptionService = {
  async getPlans(): Promise<{ success: boolean; count: number; data: SubscriptionPlan[] }> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/plans`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: SubscriptionPlan[] }>(res);
  },

  async getMyStatus(): Promise<{ success: boolean; data: UserSubscriptionStatus }> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/my-status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: UserSubscriptionStatus }>(res);
  },

  async subscribe(planId: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/subscriptions/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planId }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },
};