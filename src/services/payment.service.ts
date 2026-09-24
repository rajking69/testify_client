import { API_BASE_URL } from "@/lib/api-config";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || (data as any).success === false) {
    const message = (data as any).message || `Request failed with status ${res.status}`;
    const err: any = new Error(message);
    err.status = res.status;
    // Preserve backend message for rate-limit detection
    err.isRateLimit = res.status === 429 || /too many.*requests/i.test(message);
    throw err;
  }
  return data as T;
}

// Simple in-memory dedupe/cache to avoid concurrent rate-limit storms.
// Key -> { promise, timestamp, data }
const _cache = new Map<string, { promise?: Promise<any>; data?: any; timestamp: number }>();
const CACHE_TTL_MS = 30_000;

function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = _cache.get(key);
  if (cached) {
    // If a request is in-flight, reuse it
    if (cached.promise) return cached.promise as Promise<T>;
    // If we have fresh data, return it without hitting backend
    if (cached.data && now - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve(cached.data as T);
    }
  }
  const promise = fetcher()
    .then((data) => {
      _cache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .catch((err) => {
      // On rate-limit, keep stale cache if available instead of clearing
      if (err?.isRateLimit || err?.status === 429) {
        const stale = _cache.get(key);
        if (stale?.data) {
          return stale.data as T;
        }
      }
      _cache.delete(key);
      throw err;
    });
  _cache.set(key, { promise, timestamp: now });
  return promise;
}

function isRateLimitError(err: any): boolean {
  return Boolean(err?.isRateLimit || err?.status === 429 || /too many.*requests/i.test(err?.message || ""));
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
   * Fetches verified checkout session details from backend.
   */
  async getSessionDetails(sessionId: string): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE_URL}/payments/session/${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

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
    return dedupedFetch("teacherPremiumStatus", async () => {
      const res = await fetch(`${API_BASE_URL}/payments/teacher/premium/status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return handleResponse<TeacherPremiumStatusResponse>(res);
    });
  },

  /**
    * Fetches verified teacher revenue and sales statistics from the backend.
    */
  async getTeacherRevenue(): Promise<{ success: boolean; data: any }> {
    return dedupedFetch("teacherRevenue", async () => {
      const res = await fetch(`${API_BASE_URL}/payments/teacher/revenue`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return handleResponse<{ success: boolean; data: any }>(res);
    });
  },

  /** Helper for callers to detect rate-limit without string matching */
  isRateLimitError,
};