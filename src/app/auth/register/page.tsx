"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
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
  User,
  Mail,
  Lock,
  GraduationCap,
  School,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import type { UserRole } from "@/lib/user-schema";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

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
        return { label: "Weak", color: "bg-red-500", textColor: "text-red-500" };
      case 1:
        return { label: "Weak", color: "bg-orange-500", textColor: "text-orange-500" };
      case 2:
        return { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500" };
      case 3:
        return { label: "Good", color: "bg-blue-500", textColor: "text-blue-500" };
      case 4:
      case 5:
        return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
      default:
        return { label: "Weak", color: "bg-red-500", textColor: "text-red-500" };
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const result = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/",
        fetchOptions: {
          body: {
            role: formData.role,
          },
        },
      });

      if (result.error) {
        toast.error(
          result.error.message || "Registration failed. Please try again."
        );
      } else {
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
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

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabel = getPasswordStrengthLabel(passwordStrength);

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

      {/* Main Responsive Body */}
      <div className="relative z-10 w-full max-w-7xl my-auto py-4 sm:py-6 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center justify-center">
          {/* ================= LEFT SIDE: Desktop Brand Story & Role Capabilities ================= */}
          <div className="hidden lg:flex lg:flex-col lg:col-span-6 xl:col-span-6 space-y-7 justify-center">
            {/* Desktop Brand Logo */}
            <div>
              <Logo size={46} href="/" textClassName="text-2xl font-extrabold text-[#0B2238] dark:text-white" />
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white leading-tight">
                Transform how your institution{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A3C4] via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400">
                  evaluates excellence.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
                Start creating interactive assessments, dynamic question banks, and automated grading workflows in minutes.
              </p>
            </div>

            {/* 3 Short, Crisp Bullets */}
            <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100/90 dark:bg-cyan-950/80 text-[#00A3C4] dark:text-cyan-400 border border-cyan-300/60 dark:border-cyan-800">
                  <Zap className="h-3.5 w-3.5" />
                </span>
                <span>Instant classroom setup with 1-click exam publishing</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-[#E8922C] dark:text-amber-400 border border-amber-300/60 dark:border-amber-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span>Automated anti-cheat lockdown &amp; real-time integrity monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100/90 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-300/60 dark:border-purple-800">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <span>Comprehensive student analytics with topic mastery tracking</span>
              </div>
            </div>

            {/* Question Bank & Assessment Preview Card */}
            <div className="max-w-md p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-md backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Question Bank: Physics 101</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                  50 Questions Ready
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Auto-Grading: Active
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">32 Students Enrolled</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE / MOBILE MIDPOINT: Minimal Register Card ================= */}
          <div className="w-full lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-end justify-center">
            {/* Mobile-Only Testify Brand Icon */}
            <div className="flex lg:hidden justify-center items-center mb-5 text-center w-full">
              <Logo size={50} href="/" showText={false} />
            </div>

            {/* Minimal & Clean Register Card */}
            <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl space-y-4 mx-auto">
              {/* Header */}
              <div className="space-y-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
                  Create Account
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Join Testify to start creating or taking exams.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border ${
                        errors.name
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : "border-slate-300 dark:border-slate-700 focus:border-[#00A3C4] dark:focus:border-cyan-400 focus:ring-[#00A3C4]/20"
                      } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                      placeholder="Jane Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[10px] text-red-600 dark:text-red-400 text-left">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border ${
                        errors.email
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : "border-slate-300 dark:border-slate-700 focus:border-[#00A3C4] dark:focus:border-cyan-400 focus:ring-[#00A3C4]/20"
                      } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                      placeholder="name@school.edu"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-600 dark:text-red-400 text-left">{errors.email}</p>
                  )}
                </div>

                {/* Compact Minimal Role Selector */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left">
                    Role
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleRoleChange("student")}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold ${
                        formData.role === "student"
                          ? "bg-white dark:bg-slate-800 text-[#00A3C4] dark:text-cyan-400 shadow-2xs font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span>Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange("teacher")}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold ${
                        formData.role === "teacher"
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <School className="h-3.5 w-3.5 shrink-0" />
                      <span>Teacher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange("admin")}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold ${
                        formData.role === "admin"
                          ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                {/* Password & Confirm in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Password */}
                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-8 py-2 text-xs rounded-xl border ${
                          errors.password
                            ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                            : "border-slate-300 dark:border-slate-700 focus:border-[#00A3C4] dark:focus:border-cyan-400 focus:ring-[#00A3C4]/20"
                        } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                        placeholder="8+ chars"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-left"
                    >
                      Confirm
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-8 py-2 text-xs rounded-xl border ${
                          errors.confirmPassword
                            ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                            : "border-slate-300 dark:border-slate-700 focus:border-[#00A3C4] dark:focus:border-cyan-400 focus:ring-[#00A3C4]/20"
                        } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                        placeholder="Re-enter"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">Strength:</span>
                      <span className={`font-bold ${strengthLabel.textColor}`}>
                        {strengthLabel.label}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthLabel.color} transition-all duration-300`}
                        style={{
                          width: `${((passwordStrength + 1) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {(errors.password || errors.confirmPassword) && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 text-left">
                    {errors.password || errors.confirmPassword}
                  </p>
                )}

                {/* Terms Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[#00A3C4] focus:ring-[#00A3C4] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    I agree to the{" "}
                    <Link href="/terms" className="font-semibold text-[#00A3C4] dark:text-cyan-400 hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold text-[#00A3C4] dark:text-cyan-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Primary Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0B2238] dark:bg-[#00A3C4] hover:bg-[#153450] dark:hover:bg-[#38bdf8] text-white dark:text-[#0B2238] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    <span>{isLoading ? "Creating account..." : "Create Account"}</span>
                    {!isLoading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>

              {/* Social Login Options */}
              <div className="space-y-2.5 pt-0.5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                    <span className="px-3 bg-white/95 dark:bg-slate-900">or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info("Google registration integration coming soon")}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
                    onClick={() => toast.info("GitHub registration integration coming soon")}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="h-3.5 w-3.5 shrink-0 fill-current text-slate-800 dark:text-slate-200" viewBox="0 0 24 24">
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

              {/* Footer Sign In Link */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-bold text-[#00A3C4] dark:text-cyan-400 hover:underline"
                  >
                    Sign in to your account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Notice */}
      <div className="relative z-10 text-center text-xs text-slate-500 dark:text-slate-400 pb-2">
        <span>Protected by enterprise-grade SSL encryption • © 2026 Testify Inc.</span>
      </div>
    </div>
  );
}
