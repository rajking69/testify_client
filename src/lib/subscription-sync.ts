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

function getInitialSyncState(userSession?: any): SubscriptionState {
  if (typeof window === "undefined") {
    return { hasPremium: false, daysRemaining: 0, expiryDateFormatted: "", isLoaded: false };
  }

  const currentEmail = userSession?.user?.email;
  let isSubActive = false;
  let expiryStr: string | null = null;

  try {
    if (currentEmail) {
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
    } else {
      // Fallback search across localStorage keys if session is loading
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("testify_teacher_subscription_") || key.startsWith("testify_teacher_premium_"))) {
          const val = localStorage.getItem(key);
          if (val === "true") {
            isSubActive = true;
            break;
          } else if (val && val.startsWith("{")) {
            try {
              const parsed = JSON.parse(val);
              if (parsed.hasActiveSubscription || parsed.status === "active" || parsed.isPremium) {
                isSubActive = true;
                expiryStr = parsed.expiryDate || parsed.currentPeriodEnd;
                break;
              }
            } catch {}
          }
        }
      }
    }
  } catch {}

  if (!isSubActive && userSession?.user) {
    const u = userSession.user as any;
    if (u.isPremium || u.hasActiveSubscription || u.premiumStatus === "active") {
      isSubActive = true;
      if (u.premiumExpiresAt || u.subscriptionExpiry) {
        expiryStr = u.premiumExpiresAt || u.subscriptionExpiry;
      }
    }
  }

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

  return {
    hasPremium: isSubActive,
    daysRemaining: isSubActive ? days : 0,
    expiryDateFormatted: formattedDate,
    isLoaded: isSubActive,
  };
}

export function useTeacherSubscription(userSession?: any): SubscriptionState & { refresh: () => Promise<void> } {
  const userEmail = (userSession?.user?.email || "").trim().toLowerCase();
  const userId = userSession?.user?.id || "";

  const [state, setState] = useState<SubscriptionState>(() => getInitialSyncState(userSession));

  const checkSubscription = useCallback(async () => {
    // 1. Calculate current local sync state synchronously
    const syncState = getInitialSyncState(userSession);
    let isSubActive = syncState.hasPremium;
    let expiryStr: string | null = syncState.expiryDateFormatted;

    // 2. Perform backend API verification in background safely
    try {
      const res = await paymentService.getTeacherPremiumStatus();
      if (res && res.success && res.data) {
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
        if (subRes && subRes.data && subRes.data.hasActiveSubscription) {
          isSubActive = true;
          if (subRes.data.subscription?.currentPeriodEnd) {
            expiryStr = subRes.data.subscription.currentPeriodEnd;
          }
        }
      } catch {}
    }

    let days = 365;
    let formattedDate = "";

    if (isSubActive) {
      if (expiryStr) {
        const expDate = new Date(expiryStr);
        const now = new Date();
        const diffMs = expDate.getTime() - now.getTime();
        const remaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        days = remaining > 0 ? remaining : 365;
        formattedDate = !isNaN(expDate.getTime())
          ? expDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";
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

    const newState: SubscriptionState = {
      hasPremium: isSubActive,
      daysRemaining: isSubActive ? days : 0,
      expiryDateFormatted: formattedDate,
      isLoaded: true,
    };

    // Update state ONLY if values actually changed to prevent infinite re-render loops
    setState((prev) => {
      if (
        prev.hasPremium === newState.hasPremium &&
        prev.daysRemaining === newState.daysRemaining &&
        prev.expiryDateFormatted === newState.expiryDateFormatted &&
        prev.isLoaded === newState.isLoaded
      ) {
        return prev;
      }
      return newState;
    });
  }, [userEmail, userId]);

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
