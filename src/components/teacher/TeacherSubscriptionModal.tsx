"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, ShieldAlert, LogIn, Loader2, Crown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { paymentService } from "@/services/payment.service";
import { useTeacherSubscription } from "@/lib/subscription-sync";
import { apiClient } from "@/lib/apiClient";

export interface SubscriptionPlanInfo {
  _id?: string;
  name: string;
  targetRole: string;
  interval: "monthly" | "yearly";
  price: number;
  durationDays?: number;
  features?: string[];
}

interface TeacherSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMessage?: string;
  selectedPlan?: SubscriptionPlanInfo | null;
}

export function TeacherSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  initialMessage,
  selectedPlan,
}: TeacherSubscriptionModalProps) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const userRole = user?.role;

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { hasPremium: syncHasPremium, daysRemaining: syncDays, expiryDateFormatted: syncExp } = useTeacherSubscription(sessionData);

  // Active Subscription State fetched from backend
  const [isBackendActive, setIsBackendActive] = useState(false);
  const [backendDays, setBackendDays] = useState<number | null>(null);
  const [backendExp, setBackendExp] = useState<string | null>(null);

  const isAlreadyActive = syncHasPremium || isBackendActive;
  const daysRemaining = syncDays || backendDays || 365;
  const expiryDateFormatted = syncExp || backendExp || "";

  // Available plans from MongoDB
  const [allTeacherPlans, setAllTeacherPlans] = useState<any[]>([]);
  const [activeInterval, setActiveInterval] = useState<"monthly" | "yearly">(
    selectedPlan?.interval === "monthly" ? "monthly" : "yearly"
  );

  // Dynamic plan pricing state
  const [planId, setPlanId] = useState<string | undefined>(selectedPlan?._id);
  const [planPrice, setPlanPrice] = useState<number>(selectedPlan?.price ?? 199.99);
  const [planInterval, setPlanInterval] = useState<string>(
    selectedPlan?.interval === "monthly" ? "month" : "year"
  );
  const [planName, setPlanName] = useState<string>(selectedPlan?.name || "Teacher Premium");

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch live subscription status from backend
      paymentService
        .getTeacherPremiumStatus()
        .then((res) => {
          if (res && res.success && res.data) {
            const active = Boolean(res.data.isPremium || res.data.premiumStatus === "active");
            setIsBackendActive(active);

            if (res.data.premiumExpiresAt) {
              const expDate = new Date(res.data.premiumExpiresAt);
              const remaining = Math.max(0, Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              setBackendDays(remaining);
              setBackendExp(expDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
            }
          }
        })
        .catch(() => {});

      // 2. Fetch available plans from MongoDB
      apiClient
        .get("/subscriptions/plans")
        .then((res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            const teacherPlans = res.data.filter(
              (p: any) => p.targetRole === "teacher" && p.isActive !== false
            );
            setAllTeacherPlans(teacherPlans);

            if (selectedPlan && selectedPlan.price !== undefined) {
              setPlanId(selectedPlan._id);
              setPlanPrice(selectedPlan.price);
              const isMon = selectedPlan.interval === "monthly";
              setActiveInterval(isMon ? "monthly" : "yearly");
              setPlanInterval(isMon ? "month" : "year");
              if (selectedPlan.name) setPlanName(selectedPlan.name);
            } else {
              const matched =
                teacherPlans.find((p: any) => p.interval === activeInterval) ||
                teacherPlans[0];

              if (matched) {
                setPlanId(matched._id);
                setPlanPrice(matched.price);
                const isMon = matched.interval === "monthly";
                setActiveInterval(isMon ? "monthly" : "yearly");
                setPlanInterval(isMon ? "month" : "year");
                setPlanName(matched.name);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, selectedPlan]);

  const handleSelectInterval = (interval: "monthly" | "yearly") => {
    setActiveInterval(interval);
    const matched = allTeacherPlans.find((p) => p.interval === interval);
    if (matched) {
      setPlanId(matched._id);
      setPlanPrice(matched.price);
      setPlanInterval(interval === "yearly" ? "year" : "month");
      setPlanName(matched.name);
    } else {
      setPlanInterval(interval === "yearly" ? "year" : "month");
      setPlanPrice(interval === "yearly" ? 199.99 : 19.99);
      setPlanName(interval === "yearly" ? "Teacher Yearly Elite" : "Teacher Monthly Pro");
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = "/auth/login?redirect=/teacher/dashboard";
      return;
    }

    if (userRole === "student") {
      setErrorMessage("Student accounts cannot subscribe to Teacher plans. Please switch to a Teacher account.");
      return;
    }

    // STRICT CHECK: Block purchase if subscription is already active
    if (isAlreadyActive) {
      setErrorMessage(`Your subscription is already active until ${expiryDateFormatted || "the end of your billing cycle"}. Additional payments are disabled while active.`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response: any = await apiClient.post("/payments/teacher/premium/checkout", {
        planId,
        interval: activeInterval,
        billingInterval: activeInterval,
        priceAmount: planPrice,
        planName: planName,
        redirectUrl: window.location.origin + "/teacher/exams",
      });

      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error(response.message || "Failed to initialize payment checkout session");
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || "Subscription payment failed or active subscription restriction triggered.");
    }
  };

  const premiumFeatures = [
    "Conduct unlimited online exams with auto-grading",
    "Access to full question bank & custom category creation",
    "Live proctoring with tab-switch detection & strict timer",
    "Instant student result publication & analytics export",
    "Priority 24/7 Teacher Support",
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Teacher Premium" size="lg">
      <div className="space-y-6 p-1">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isAlreadyActive ? (
          <div className="p-6 rounded-3xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
                  Premium Membership Currently Active
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {daysRemaining} days remaining • Valid until {expiryDateFormatted || "Active Period"}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-emerald-200/60 dark:border-emerald-800/60 pt-3">
              You already have full access to all teacher privileges including unlimited exam hosting, question banking, and live proctoring. Additional subscription purchases are strictly locked until your plan expires.
            </p>
            <div className="pt-2 flex justify-end">
              <Button type="button" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md">
                Close Window
              </Button>
            </div>
          </div>) : (
          <>
            {user && userRole === "student" && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Teacher Account Required</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  You are currently logged in as a <strong>Student ({user.email})</strong>. Teacher Premium can only be purchased and activated on a verified Teacher account.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link href="/auth/login" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs font-bold bg-white dark:bg-slate-900">
                      Switch to Teacher Login
                    </Button>
                  </Link>
                  <Link href="/auth/register?role=teacher" className="flex-1">
                    <Button size="sm" className="w-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white">
                      Register as Teacher
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!user && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <LogIn className="h-4 w-4 text-[#0092E3] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Not Logged In: </span>
                  <span>Make sure to log in or register with your Teacher account so your access is linked directly to your profile.</span>
                </div>
              </div>
            )}

            {initialMessage && !errorMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Crown className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{initialMessage}</span>
              </div>
            )}

            {/* Monthly vs Yearly Plan Selector Toggle */}
            <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSelectInterval("monthly")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer",
                  activeInterval === "monthly"
                    ? "bg-[#0092E3] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Monthly ($19.99/mo)
              </button>

              <button
                type="button"
                onClick={() => handleSelectInterval("yearly")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
                  activeInterval === "yearly"
                    ? "bg-[#0092E3] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span>Yearly ($199.99/yr)</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full font-extrabold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Dynamic Pricing Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/80 dark:from-slate-900 dark:to-slate-950 border border-blue-200/80 dark:border-cyan-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0092E3] dark:text-cyan-400">
                    Instructor Platform Plan
                  </span>
                  <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-white mt-0.5">
                    {planName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold font-display text-[#0092E3] dark:text-cyan-400">
                    ${planPrice}
                  </span>
                  <span className="text-xs text-slate-500 font-medium"> / {planInterval}</span>
                  <p className="text-[10px] text-emerald-600 font-bold">Full Access</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                Conduct official academic tests, create paid entry exams, and grade papers effortlessly.
              </p>
            </div>
          </>
        )}

        {/* Feature List */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Everything included in premium
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {premiumFeatures.map((feat: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs font-bold">
            {isAlreadyActive ? "Close" : "Cancel"}
          </Button>

          {isAlreadyActive ? (
            <Button
              type="button"
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 cursor-not-allowed opacity-90"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Membership Active ✓
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isProcessing || (user && userRole === "student")}
              onClick={handlePurchase}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-extrabold text-xs px-5 shadow-md shadow-[#0092E3]/20"
              leftIcon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            >
              {isProcessing ? "Redirecting..." : `Upgrade with Stripe • $${planPrice}`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
