"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Logo } from "@/components/ui/Logo";

type UserRole = "student" | "teacher" | "admin";

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
        return {
          label: "Very Weak",
          color: "bg-red-500",
          textColor: "text-red-600",
        };
      case 1:
        return {
          label: "Weak",
          color: "bg-orange-500",
          textColor: "text-orange-600",
        };
      case 2:
        return {
          label: "Fair",
          color: "bg-yellow-500",
          textColor: "text-yellow-600",
        };
      case 3:
        return {
          label: "Good",
          color: "bg-blue-500",
          textColor: "text-blue-600",
        };
      case 4:
        return {
          label: "Strong",
          color: "bg-green-500",
          textColor: "text-green-600",
        };
      case 5:
        return {
          label: "Very Strong",
          color: "bg-emerald-500",
          textColor: "text-emerald-600",
        };
      default:
        return {
          label: "Very Weak",
          color: "bg-red-500",
          textColor: "text-red-600",
        };
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
    } else if (getPasswordStrength(formData.password) < 2) {
      newErrors.password = "Password is too weak. Please add more complexity.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
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
          result.error.message || "Registration failed. Please try again.",
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
    // Clear error when user starts typing
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={44} textClassName="text-2xl font-extrabold text-[#0B2238]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B2238] mb-2">
            Create Account
          </h1>
          <p className="text-slate-600">
            Join thousands of learners and educators
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60 p-8 card-hover-effect">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-[#0092E3] focus:ring-[#0092E3]/20"
                } focus:outline-none focus:ring-4 transition-all bg-white text-slate-900 placeholder-slate-400`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-[#0092E3] focus:ring-[#0092E3]/20"
                } focus:outline-none focus:ring-4 transition-all bg-white text-slate-900 placeholder-slate-400`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Account Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoleChange("student")}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    formData.role === "student"
                      ? "border-[#00A3C4] bg-[#EBF7FF] text-[#0B2238] shadow-sm font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold">Student</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Take Exams</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("teacher")}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    formData.role === "teacher"
                      ? "border-[#0B2238] bg-[#E9F0F8] text-[#0B2238] shadow-sm font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold">Teacher</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Conduct Exams</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    formData.role === "admin"
                      ? "border-[#E8922C] bg-[#FFF8EE] text-[#0B2238] shadow-sm font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold">Admin</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Manage System</p>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {formData.role === "student" && "✓ Student: Attend exams and view results. (Cannot create or manage exams)"}
                {formData.role === "teacher" && "✓ Teacher: Create, conduct, and evaluate exams. (Cannot take exams as an examinee)"}
                {formData.role === "admin" && "✓ Admin: Institutional user management and complete system oversight."}
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border pr-12 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-[#0092E3] focus:ring-[#0092E3]/20"
                  } focus:outline-none focus:ring-4 transition-all bg-white text-slate-900 placeholder-slate-400`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${strengthLabel.textColor}`}
                    >
                      {strengthLabel.label}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthLabel.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500">
                      {formData.password.length >= 8 ? "✓" : "○"} At least 8
                      characters
                    </p>
                    <p className="text-xs text-slate-500">
                      {/[a-z]/.test(formData.password) &&
                      /[A-Z]/.test(formData.password)
                        ? "✓"
                        : "○"}{" "}
                      Upper & lowercase letters
                    </p>
                    <p className="text-xs text-slate-500">
                      {/\d/.test(formData.password) ? "✓" : "○"} At least one
                      number
                    </p>
                    <p className="text-xs text-slate-500">
                      {/[^a-zA-Z0-9]/.test(formData.password) ? "✓" : "○"} At
                      least one special character
                    </p>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border pr-12 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-[#0092E3] focus:ring-[#0092E3]/20"
                  } focus:outline-none focus:ring-4 transition-all bg-white text-slate-900 placeholder-slate-400`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0092E3] focus:ring-[#0092E3] focus:ring-offset-0"
              />
              <label className="text-sm text-slate-600">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[#0092E3] hover:text-[#29B6F6]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-[#0092E3] hover:text-[#29B6F6]"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0092E3] to-[#5B67F7] text-white font-semibold shadow-lg shadow-[#0092E3]/30 hover:shadow-xl hover:shadow-[#0092E3]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0092E3] hover:text-[#29B6F6] transition-colors group"
            >
              Sign in instead
              <svg
                className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#0092E3] transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
