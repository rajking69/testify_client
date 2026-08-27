"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    switch (strength) {
      case 0:
        return {
          label: "Weak",
          color: "bg-red-500",
          textColor: "text-red-500",
        };
      case 1:
        return {
          label: "Weak",
          color: "bg-orange-500",
          textColor: "text-orange-500",
        };
      case 2:
        return {
          label: "Fair",
          color: "bg-yellow-500",
          textColor: "text-yellow-500",
        };
      case 3:
        return {
          label: "Good",
          color: "bg-[#0092E3]",
          textColor: "text-[#0092E3]",
        };
      case 4:
      case 5:
        return {
          label: "Strong",
          color: "bg-[#00CBB8]",
          textColor: "text-[#00CBB8]",
        };
      default:
        return {
          label: "Weak",
          color: "bg-red-500",
          textColor: "text-red-500",
        };
    }
  };

  const validateEmailForm = () => {
    const newErrors: { email?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpForm = () => {
    const newErrors: { otp?: string } = {};
    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit OTP";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!newPassword) {
      newErrors.password = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: email,
      });

      if (error) {
        toast.error(error.message || "Failed to send OTP. Please try again.");
      } else {
        toast.success("OTP sent to your email!");
        setStep("otp");
        // Start countdown for resend (60 seconds)
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOtpForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await authClient.emailOtp.checkVerificationOtp({
        email: email,
        type: "forget-password",
        otp: otp,
      });

      if (error) {
        toast.error(error.message || "Invalid OTP. Please try again.");
      } else if (data?.success) {
        toast.success("OTP verified successfully!");
        setStep("reset");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "OTP verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: email,
        otp: otp,
        password: newPassword,
      });

      if (error) {
        toast.error(
          error.message || "Password reset failed. Please try again.",
        );
      } else {
        toast.success("Password reset successfully!");
        router.push("/auth/login");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Password reset failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: email,
      });

      if (error) {
        toast.error(error.message || "Failed to resend OTP. Please try again.");
      } else {
        toast.success("New OTP sent to your email!");
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#EFF6FB] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#152234] dark:text-slate-100 p-4 sm:p-6 lg:p-10 flex flex-col justify-between items-center transition-colors duration-300">
      {/* Moving Ambient Glow Canvas */}
      <AnimatedBackground variant="hero" />

      {/* Top Header Navigation */}
      <div className="relative z-10 w-full max-w-7xl flex items-center justify-between">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0092E3] dark:hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </Link>
        {/* Subtle & Premium Secure Portal Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs backdrop-blur-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0092E3] dark:text-cyan-400" />
          <span>Secure Portal</span>
        </div>
      </div>

      {/* Main Container - Centered Vertically & Horizontally */}
      <div className="relative z-10 w-full max-w-7xl my-auto py-6 sm:py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center justify-center">
          {/* ================= LEFT SIDE: Non-Responsive / Desktop View ================= */}
          <div className="hidden lg:flex lg:flex-col lg:col-span-6 xl:col-span-7 space-y-7 justify-center">
            {/* Desktop Brand Logo */}
            <div>
              <Logo
                size={46}
                href="/"
                textClassName="text-2xl font-extrabold text-[#152234] dark:text-white"
              />
            </div>

            {/* Short, Punchy Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white leading-tight">
                Reset your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0092E3] via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
                  password securely.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
                We&apos;ll send you a secure OTP code to verify your identity
                before allowing you to reset your password.
              </p>
            </div>

            {/* 3 Short, Crisp Bullets */}
            <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100/90 dark:bg-cyan-950/80 text-[#0092E3] dark:text-cyan-400 border border-cyan-300/60 dark:border-cyan-800">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span>Enter your registered email address</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-[#E8922C] dark:text-amber-400 border border-amber-300/60 dark:border-amber-800">
                  <KeyRound className="h-3.5 w-3.5" />
                </span>
                <span>Verify with the 6-digit OTP sent to your email</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100/90 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-300/60 dark:border-purple-800">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <span>Set a new secure password and continue</span>
              </div>
            </div>

            {/* Security Info Card */}
            <div className="max-w-md p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-md backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00CBB8]" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Security Features
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span>OTP expires in 10 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span>Maximum 3 verification attempts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <span>End-to-end encrypted process</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE / MOBILE MIDPOINT: Centered Forgot Password Card ================= */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center">
            {/* Mobile-Only Testify Brand Icon (Centered above card with Icon ONLY) */}
            <div className="flex lg:hidden justify-center items-center mb-6 text-center w-full">
              <Logo size={52} href="/" showText={false} />
            </div>

            <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl space-y-5 mx-auto">
              {/* Header */}
              <div className="space-y-1.5 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#152234] dark:text-white">
                  {step === "email" && "Forgot Password"}
                  {step === "otp" && "Verify OTP"}
                  {step === "reset" && "Reset Password"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {step === "email" &&
                    "Enter your email to receive a password reset code."}
                  {step === "otp" &&
                    "Enter the 6-digit code sent to your email."}
                  {step === "reset" &&
                    "Create a new secure password for your account."}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    step === "email"
                      ? "bg-[#0092E3] dark:bg-cyan-400 text-white dark:text-[#152234]"
                      : step === "otp" || step === "reset"
                        ? "bg-[#00CBB8] text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step === "otp" || step === "reset" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#00CBB8]" />
                  ) : (
                    "1"
                  )}
                </div>
                <div
                  className={`h-0.5 w-6 sm:w-8 transition-all ${
                    step === "otp" || step === "reset"
                      ? "bg-[#00CBB8]"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    step === "otp"
                      ? "bg-[#0092E3] dark:bg-cyan-400 text-white dark:text-[#152234]"
                      : step === "reset"
                        ? "bg-[#00CBB8] text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step === "reset" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#00CBB8]" />
                  ) : (
                    "2"
                  )}
                </div>
                <div
                  className={`h-0.5 w-6 sm:w-8 transition-all ${
                    step === "reset"
                      ? "bg-[#00CBB8]"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    step === "reset"
                      ? "bg-[#0092E3] dark:bg-cyan-400 text-white dark:text-[#152234]"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  3
                </div>
              </div>

              {/* Step 1: Email Form */}
              {step === "email" && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${
                          errors.email
                            ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                            : "border-slate-300 dark:border-slate-700 focus:border-[#0092E3] dark:focus:border-cyan-400 focus:ring-[#0092E3]/20"
                        } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                        placeholder="name@school.edu"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 text-left">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#152234] dark:bg-[#0092E3] hover:bg-[#1a2d42] dark:hover:bg-[#38bdf8] text-white dark:text-[#152234] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      <span>
                        {isLoading ? "Sending OTP..." : "Send Reset Code"}
                      </span>
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Form */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="otp"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                    >
                      One-Time Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border text-center tracking-widest font-mono ${
                          errors.otp
                            ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                            : "border-slate-300 dark:border-slate-700 focus:border-[#0092E3] dark:focus:border-cyan-400 focus:ring-[#0092E3]/20"
                        } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                        placeholder="123456"
                      />
                    </div>
                    {errors.otp && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 text-left">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#152234] dark:bg-[#0092E3] hover:bg-[#1a2d42] dark:hover:bg-[#38bdf8] text-white dark:text-[#152234] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      <span>{isLoading ? "Verifying..." : "Verify Code"}</span>
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading || countdown > 0}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${countdown > 0 ? "animate-spin" : ""}`}
                      />
                      <span>
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend Code"}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Reset Password Form */}
              {step === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border ${
                          errors.password
                            ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                            : "border-slate-300 dark:border-slate-700 focus:border-[#0092E3] dark:focus:border-cyan-400 focus:ring-[#0092E3]/20"
                        } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                        placeholder="8+ characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 text-left">
                        {errors.password}
                      </p>
                    )}
                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                            Password Strength
                          </span>
                          <span
                            className={`text-[10px] font-bold ${getPasswordStrengthLabel(getPasswordStrength(newPassword)).textColor}`}
                          >
                            {
                              getPasswordStrengthLabel(
                                getPasswordStrength(newPassword),
                              ).label
                            }
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                getPasswordStrength(newPassword) >= level
                                  ? getPasswordStrengthLabel(
                                      getPasswordStrength(newPassword),
                                    ).color
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1 w-1 rounded-full ${
                                newPassword.length >= 8
                                  ? "bg-[#00CBB8]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1 w-1 rounded-full ${
                                /[a-z]/.test(newPassword) &&
                                /[A-Z]/.test(newPassword)
                                  ? "bg-[#00CBB8]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <span>Uppercase & lowercase letters</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1 w-1 rounded-full ${
                                /\d/.test(newPassword)
                                  ? "bg-[#00CBB8]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <span>At least one number</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-1 w-1 rounded-full ${
                                /[^a-zA-Z0-9]/.test(newPassword)
                                  ? "bg-[#00CBB8]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                            <span>At least one special character</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border ${
                          errors.confirmPassword
                            ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                            : "border-slate-300 dark:border-slate-700 focus:border-[#0092E3] dark:focus:border-cyan-400 focus:ring-[#0092E3]/20"
                        } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 text-left">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-[#152234] dark:bg-[#0092E3] hover:bg-[#1a2d42] dark:hover:bg-[#38bdf8] text-white dark:text-[#152234] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      <span>
                        {isLoading ? "Resetting..." : "Reset Password"}
                      </span>
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </form>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Remember your password?{" "}
                  <Link
                    href="/auth/login"
                    className="font-bold text-[#0092E3] dark:text-cyan-400 hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Notice */}
      <div className="relative z-10 text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
        <p>&copy; 2025 Testify. All rights reserved.</p>
      </div>
    </div>
  );
}
