"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isPending || isProcessing) return;

    if (!session || !session.user) {
      // If not logged in yet, retry briefly
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const processOAuthRole = async () => {
      setIsProcessing(true);
      try {
        const pendingRole = typeof window !== "undefined" ? localStorage.getItem("testify_pending_oauth_role") : null;

        let targetRole = session.user.role || "student";

        if (pendingRole && ["student", "teacher", "admin"].includes(pendingRole)) {
          // Sync selected role to backend MongoDB
          try {
            const res = await apiClient.post("/user/sync-role", { role: pendingRole });
            if (res && res.role) {
              targetRole = res.role;
            } else {
              targetRole = pendingRole;
            }
          } catch (syncErr) {
            console.error("Role sync warning:", syncErr);
            targetRole = pendingRole;
          }

          // Clear pending OAuth role
          localStorage.removeItem("testify_pending_oauth_role");
          document.cookie = "testify_oauth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        const roleTitle = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
        toast.success(`Welcome to Testify! Account verified as ${roleTitle}.`);

        // Redirect to appropriate role dashboard
        if (targetRole === "teacher") {
          router.push("/teacher/dashboard");
        } else if (targetRole === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      } catch (err) {
        console.error("OAuth Callback processing error:", err);
        router.push("/student/dashboard");
      }
    };

    processOAuthRole();
  }, [session, isPending, isProcessing, refetch, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FAF8F5] via-[#F1F7FB] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 p-4">
      <div className="p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full text-center space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 w-fit mx-auto animate-pulse">
          <Loader2 className="h-8 w-8 text-[#00A3C4] dark:text-cyan-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold font-display text-[#0B2238] dark:text-white">
          Completing Authentication
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Verifying your account role and preparing your personalized workspace...
        </p>
      </div>
    </div>
  );
}
