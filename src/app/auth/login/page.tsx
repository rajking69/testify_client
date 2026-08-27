"use client";

import { useState } from "react";
import { signIn, socialSignIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Mail,
  Lock,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            "Login failed. Please check your credentials.",
        );
      } else {
        toast.success("Login successful!");
        router.push("/");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const signInWithGoogle = async () => {
    try {
      await socialSignIn({
        provider: "google",
        callbackURL: process.env.FRONTEND_URL
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const signInWithGitHub = async () => {
    try {
      await socialSignIn({
        provider: "github",
        callbackURL: process.env.FRONTEND_URL
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "GitHub sign-in failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#EFF6FB] to-[#FAF8F5] dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] text-[#0B2238] dark:text-slate-100 p-4 sm:p-6 lg:p-10 flex flex-col justify-between items-center transition-colors duration-300">
      {/* Moving Ambient Glow Canvas */}
      <AnimatedBackground variant="hero" />

      {/* Top Header Navigation */}
      <div className="relative z-10 w-full max-w-7xl flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#00A3C4] dark:hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Home</span>
        </Link>
        {/* Subtle & Premium Secure Portal Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs backdrop-blur-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#00A3C4] dark:text-cyan-400" />
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
                textClassName="text-2xl font-extrabold text-[#0B2238] dark:text-white"
              />
            </div>

            {/* Short, Punchy Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white leading-tight">
                The smarter way to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A3C4] via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
                  create, take &amp; grade exams.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
                Built for students, teachers, and educational institutions.
              </p>
            </div>

            {/* 3 Short, Crisp Bullets */}
            <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100/90 dark:bg-cyan-950/80 text-[#00A3C4] dark:text-cyan-400 border border-cyan-300/60 dark:border-cyan-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span>Anti-cheat lockdown exam environment</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-[#E8922C] dark:text-amber-400 border border-amber-300/60 dark:border-amber-800">
                  <Zap className="h-3.5 w-3.5" />
                </span>
                <span>Instant automated objective grading</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100/90 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-300/60 dark:border-purple-800">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <span>Real-time student progress &amp; telemetry</span>
              </div>
            </div>

            {/* Live Exam Preview Card */}
            <div className="max-w-md p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-md backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Final Term Assessment
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                  <Clock className="h-3 w-3" /> 00:45:20
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{" "}
                  Proctoring: Active &amp; Verified
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  25 of 30 Answered
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE / MOBILE MIDPOINT: Centered Login Card ================= */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center">
            {/* Mobile-Only Testify Brand Icon (Centered above card with Icon ONLY) */}
            <div className="flex lg:hidden justify-center items-center mb-6 text-center w-full">
              <Logo size={52} href="/" showText={false} />
            </div>

            <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-9 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl space-y-5 mx-auto">
              {/* Header */}
              <div className="space-y-1.5 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
                  Sign In
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Sign in to your Testify portal to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
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
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${
                        errors.email
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : "border-slate-300 dark:border-slate-700 focus:border-[#00A3C4] dark:focus:border-cyan-400 focus:ring-[#00A3C4]/20"
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

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-semibold text-[#00A3C4] dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border ${
                        errors.password
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : "border-slate-300 dark:border-slate-700 focus:border-[#00A3C4] dark:focus:border-cyan-400 focus:ring-[#00A3C4]/20"
                      } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                      placeholder="Enter your password"
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
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[#00A3C4] focus:ring-[#00A3C4] cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Remember this device
                    </span>
                  </label>
                </div>

                {/* Primary Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#0B2238] dark:bg-[#00A3C4] hover:bg-[#153450] dark:hover:bg-[#38bdf8] text-white dark:text-[#0B2238] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    <span>
                      {isLoading ? "Signing in..." : "Sign In to Testify"}
                    </span>
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>

              {/* Social Login Options (UI-ready) */}
              <div className="space-y-3 pt-1">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                    <span className="px-3 bg-white/95 dark:bg-slate-900">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={signInWithGitHub}
                    className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 fill-current text-slate-800 dark:text-slate-200"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
              </div>

              {/* Footer Register Link */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="font-bold text-[#00A3C4] dark:text-cyan-400 hover:underline"
                  >
                    Create your account free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Notice */}
      <div className="relative z-10 text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
        <span>
          Protected by enterprise-grade SSL encryption • © 2026 Testify Inc.
        </span>
      </div>
    </div>
  );
}
