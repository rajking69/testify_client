"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  authClient,
  changePassword,
  linkSocialAccount,
  updateUser,
} from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage({ params }: { params: { role: string } }) {
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const roleDisplay =
    params.role.charAt(0).toUpperCase() + params.role.slice(1);

  // Role-specific styling configuration
  const roleConfig = {
    teacher: {
      primaryColor: "indigo",
      secondaryColor: "blue",
      gradient: "from-indigo-600 to-blue-600",
      initial: "T",
      bgClass: "bg-blue-50 dark:bg-blue-950/60",
      borderClass: "border-blue-200 dark:border-blue-800",
      textClass: "text-blue-700 dark:text-blue-300",
      cardColor:
        "border-blue-200/80 dark:border-blue-500/30 bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900/90 dark:to-blue-950/40",
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800",
      badgeColor:
        "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      btnBg: "bg-[#152234]",
      btnHover: "hover:bg-[#2F327D]",
      focusColor: "focus:border-[#0092E3]",
      focusRing: "focus:ring-[#0092E3]/20",
    },
    admin: {
      primaryColor: "purple",
      secondaryColor: "indigo",
      gradient: "from-purple-600 to-indigo-600",
      initial: "A",
      bgClass: "bg-purple-50 dark:bg-purple-950/60",
      borderClass: "border-purple-200 dark:border-purple-800",
      textClass: "text-purple-700 dark:text-purple-300",
      cardColor:
        "border-purple-200/80 dark:border-purple-500/30 bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900/90 dark:to-purple-950/40",
      iconBg:
        "bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800",
      badgeColor:
        "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      btnBg: "bg-[#8E44AD]",
      btnHover: "hover:bg-[#5B67F7]",
      focusColor: "focus:border-[#8E44AD]",
      focusRing: "focus:ring-[#8E44AD]/20",
    },
    student: {
      primaryColor: "teal",
      secondaryColor: "cyan",
      gradient: "from-cyan-600 to-teal-600",
      initial: "S",
      bgClass: "bg-cyan-50 dark:bg-cyan-950/60",
      borderClass: "border-cyan-200 dark:border-cyan-800",
      textClass: "text-cyan-700 dark:text-cyan-300",
      cardColor:
        "border-cyan-200/80 dark:border-cyan-500/30 bg-gradient-to-b from-white to-cyan-50/40 dark:from-slate-900/90 dark:to-cyan-950/40",
      iconBg:
        "bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200/80 dark:border-cyan-800",
      badgeColor:
        "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      btnBg: "bg-[#00CBB8]",
      btnHover: "hover:bg-[#49BBBD]",
      focusColor: "focus:border-[#00CBB8]",
      focusRing: "focus:ring-[#00CBB8]/20",
    },
  };

  const config =
    roleConfig[params.role as keyof typeof roleConfig] || roleConfig.student;

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      const { error } = await updateUser({
        name: name,
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully!");
        await refetch();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!passwordData.currentPassword) {
      errors.current = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.new = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      errors.confirm = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update password");
        setPasswordErrors({ current: result.error.message });
      } else {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLinkSocialAccount = async (provider: "google" | "github") => {
    try {
      await linkSocialAccount({
        provider,
        callbackURL: `${process.env.FRONTEND_URL}/profile/${params.role}`,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to link ${provider} account`;
      toast.error(errorMessage);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href={`/dashboard/${params.role}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#0092E3] dark:hover:text-cyan-400 transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#152234] dark:text-white tracking-tight">
          {roleDisplay} Profile Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-2xl">
          {params.role === "teacher" &&
            "Manage your account settings and preferences"}
          {params.role === "admin" &&
            "Manage your admin account settings and platform preferences"}
          {params.role === "student" &&
            "Manage your student account settings and learning preferences"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6 }}
          className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${config.cardColor}`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-tr ${config.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : config.initial}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-[#152234] dark:text-white">
                {user.name || roleDisplay}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {user.email}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${config.badgeColor}`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="capitalize">{params.role}</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${config.cardColor}`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border shadow-2xs w-fit">
                <User className={`h-5 w-5 text-[#0092E3] dark:text-cyan-400`} />
              </div>
              <h3 className="text-base font-bold font-display text-[#152234] dark:text-white">
                Account Information
              </h3>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <User className="h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white font-medium focus:outline-none placeholder-slate-400"
                        placeholder="Enter your name"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile || name === user?.name}
                      className={`px-4 py-2.5 rounded-xl ${config.btnBg} ${config.btnHover} text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50`}
                    >
                      <Save className="h-4 w-4" />
                      <span>{isUpdatingProfile ? "Saving..." : "Save"}</span>
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900 dark:text-white font-medium">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Role
                  </label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900 dark:text-white font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Password Settings */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6 }}
            className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${config.cardColor}`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border shadow-2xs w-fit">
                <Lock className={`h-5 w-5 text-[#0092E3] dark:text-cyan-400`} />
              </div>
              <h3 className="text-base font-bold font-display text-[#152234] dark:text-white">
                Password Settings
              </h3>

              <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                        passwordErrors.current
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : `border-slate-300 dark:border-slate-700 ${config.focusColor} dark:focus:border-cyan-400 ${config.focusRing}`
                      } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.current && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                      {passwordErrors.current}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                        passwordErrors.new
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : `border-slate-300 dark:border-slate-700 ${config.focusColor} dark:focus:border-cyan-400 ${config.focusRing}`
                      } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.new && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                      {passwordErrors.new}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                        passwordErrors.confirm
                          ? "border-red-400 dark:border-red-800 focus:ring-red-400/20"
                          : `border-slate-300 dark:border-slate-700 ${config.focusColor} dark:focus:border-cyan-400 ${config.focusRing}`
                      } focus:outline-none focus:ring-4 transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirm && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                      {passwordErrors.confirm}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={isUpdatingPassword}
                  className={`w-full py-2.5 px-4 rounded-xl ${config.btnBg} ${config.btnHover} text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Linked Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -6 }}
            className={`p-6 rounded-2xl border shadow-xs hover:shadow-xl transition-all duration-200 ${config.cardColor}`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border shadow-2xs w-fit">
                <LinkIcon
                  className={`h-5 w-5 text-[#0092E3] dark:text-cyan-400`}
                />
              </div>
              <h3 className="text-base font-bold font-display text-[#152234] dark:text-white">
                Linked Accounts
              </h3>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Google
                    </span>
                  </div>
                  <button
                    onClick={() => handleLinkSocialAccount("google")}
                    className={`text-xs font-bold uppercase tracking-wider ${config.textClass} hover:underline`}
                  >
                    Link Account
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 fill-current text-slate-800 dark:text-slate-200"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      GitHub
                    </span>
                  </div>
                  <button
                    onClick={() => handleLinkSocialAccount("github")}
                    className={`text-xs font-bold uppercase tracking-wider ${config.textClass} hover:underline`}
                  >
                    Link Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
