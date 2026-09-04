import { useState, useEffect, useCallback } from "react";
import { paymentService } from "@/services/payment.service";
import { subscriptionService } from "@/services/subscription.service";

export interface SubscriptionState {
  hasPremium: boolean;
  daysRemaining: number;
  expiryDateFormatted: string;
  isLoaded: boolean;
}

export function activateTeacherPremium(durationDays = 365, userEmail?: string) {
  if (typeof window === "undefined") return;

  const expDate = new Date();
  expDate.setDate(expDate.getDate() + durationDays);

  const subData = {
    email: userEmail || "",
    hasActiveSubscription: true,
    isPremium: true,
    role: "teacher",
    plan: "Teacher Premium Annual",
    price: 20,
    currency: "USD",
    status: "active",
    startDate: new Date().toISOString(),
    expiryDate: expDate.toISOString(),
  };

  if (userEmail) {
    localStorage.setItem(`testify_teacher_subscription_${userEmail}`, JSON.stringify(subData));
    localStorage.setItem(`testify_teacher_premium_${userEmail}`, "true");
  }

  // Clean legacy un-scoped keys
  localStorage.removeItem("testify_teacher_subscription");
  localStorage.removeItem("testify_teacher_premium");

  window.dispatchEvent(new CustomEvent("testify_subscription_updated", { detail: subData }));
}

export function useTeacherSubscription(userSession?: any): SubscriptionState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<SubscriptionState>({
    hasPremium: false,
    daysRemaining: 0,
    expiryDateFormatted: "",
    isLoaded: false,
  });

  const checkSubscription = useCallback(async () => {
    let isSubActive = false;
    let expiryStr: string | null = null;
    const currentEmail = userSession?.user?.email;

    // 1. Check LocalStorage strictly for the currently logged in user email
    if (typeof window !== "undefined" && currentEmail) {
      try {
        const userSpecific = localStorage.getItem(`testify_teacher_subscription_${currentEmail}`);
        const userFlag = localStorage.getItem(`testify_teacher_premium_${currentEmail}`);

        if (userSpecific) {
          const parsed = JSON.parse(userSpecific);
          if (
            parsed.email === currentEmail &&
            (parsed.hasActiveSubscription || parsed.status === "active" || parsed.isPremium)
          ) {
            isSubActive = true;
            expiryStr = parsed.expiryDate || parsed.currentPeriodEnd;
          }
        } else if (userFlag === "true") {
          isSubActive = true;
        }

        // Clean up any legacy un-scoped test keys from the browser
        localStorage.removeItem("testify_teacher_subscription");
        localStorage.removeItem("testify_teacher_premium");
      } catch {}
    }

    // 2. Check Session User Object
    if (userSession?.user) {
      const u = userSession.user as any;
      if (u.isPremium || u.hasActiveSubscription || u.premiumStatus === "active") {
        isSubActive = true;
        if (u.premiumExpiresAt || u.subscriptionExpiry) {
          expiryStr = u.premiumExpiresAt || u.subscriptionExpiry;
        }
      }
    }

    // 3. Check Backend APIs in parallel
    try {
      const res = await paymentService.getTeacherPremiumStatus();
      if (res.success && res.data) {
        if (res.data.isPremium || res.data.premiumStatus === "active") {
          isSubActive = true;
          if (res.data.premiumExpiresAt) {
            expiryStr = res.data.premiumExpiresAt;
          }
        }
      }
    } catch {
      try {
        const subRes = await subscriptionService.getMyStatus();
        if (subRes.data && subRes.data.hasActiveSubscription) {
          isSubActive = true;
          if (subRes.data.subscription?.currentPeriodEnd) {
            expiryStr = subRes.data.subscription.currentPeriodEnd;
          }
        }
      } catch {}
    }

    // Calculate Days Remaining
    let days = 365;
    let formattedDate = "";

    if (isSubActive) {
      if (expiryStr) {
        const expDate = new Date(expiryStr);
        const now = new Date();
        const diffMs = expDate.getTime() - now.getTime();
        const remaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        days = remaining > 0 ? remaining : 365;
        formattedDate = expDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else {
        days = 365;
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        formattedDate = nextYear.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    setState({
      hasPremium: isSubActive,
      daysRemaining: isSubActive ? days : 0,
      expiryDateFormatted: formattedDate,
      isLoaded: true,
    });
  }, [userSession]);

  useEffect(() => {
    checkSubscription();

    const handleUpdate = () => {
      checkSubscription();
    };

    window.addEventListener("testify_subscription_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("testify_subscription_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [checkSubscription]);

  return { ...state, refresh: checkSubscription };
}
