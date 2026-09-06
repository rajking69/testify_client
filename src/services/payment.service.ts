const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export interface TeacherPremiumStatusResponse {
  success: boolean;
  data: {
    isPremium: boolean;
    premiumStatus: "none" | "active" | "past_due" | "canceled" | "expired";
    premiumExpiresAt: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    planName: string;
    price: number;
    currency: string;
  };
}

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  url: string;
}

export const paymentService = {
  /**
   * Initializes a Stripe Checkout Session for Teacher Premium ($20/year subscription).
   */
  async createTeacherPremiumCheckout(options?: {
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<CheckoutSessionResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/teacher/premium/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(options || {}),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          return data as CheckoutSessionResponse;
        }
      }
    } catch {}

    // Fallback to internal Next.js Stripe Checkout API route
    const fallbackRes = await fetch("/api/payments/teacher-premium/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options || {}),
    });
    return handleResponse<CheckoutSessionResponse>(fallbackRes);
  },

  /**
   * Fetches the verified Teacher Premium subscription status from the backend.
   */
  async getTeacherPremiumStatus(): Promise<TeacherPremiumStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/payments/teacher/premium/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<TeacherPremiumStatusResponse>(res);
  },
};