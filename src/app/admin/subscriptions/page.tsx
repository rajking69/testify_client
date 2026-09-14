"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Check,
  RefreshCw,
  Search,
  Eye,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  X,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface SubscriptionPlan {
  _id: string;
  name: string;
  targetRole: "teacher" | "student";
  interval: "monthly" | "yearly";
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
}

interface UserSub {
  _id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  role: string;
  planName: string;
  interval: string;
  pricePaid: number;
  startDate: string;
  endDate: string;
  status: string;
  paymentId?: string;
}

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pro: 0,
    free: 0,
    institutional: 0,
    monthlyRevenue: 0,
    activePlansCount: 0,
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSub[]>([]);
  const [search, setSearch] = useState("");

  // Inline price editing state: map plan ID to input string or number
  const [inlinePrices, setInlinePrices] = useState<Record<string, number>>({});
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  // Modals state
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedSub, setSelectedSub] = useState<UserSub | null>(null);

  // Form states for creating/editing plan
  const [planForm, setPlanForm] = useState({
    name: "",
    targetRole: "teacher",
    interval: "monthly",
    price: 19.99,
    durationDays: 30,
    features: "Create & Host Unlimited Exams, Access to Question Bank, Detailed Student Analytics",
    isActive: true,
  });

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSubscriptionOverviewAdmin();
      if (res.success) {
        if (res.stats) setStats(res.stats);
        if (res.plans) {
          setPlans(res.plans);
          // Initialize inline price map
          const priceMap: Record<string, number> = {};
          res.plans.forEach((p: SubscriptionPlan) => {
            priceMap[p._id] = p.price;
          });
          setInlinePrices(priceMap);
        }
        if (res.subscriptions) setSubscriptions(res.subscriptions);
      }
    } catch (err) {
      console.error("Failed to load subscription data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: "",
      targetRole: "teacher",
      interval: "monthly",
      price: 19.99,
      durationDays: 30,
      features: "Unlimited Exams, Priority Teacher Support, Advanced Analytics",
      isActive: true,
    });
    setIsAddPlanOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      targetRole: plan.targetRole,
      interval: plan.interval,
      price: plan.price,
      durationDays: plan.durationDays || 30,
      features: plan.features ? plan.features.join(", ") : "",
      isActive: plan.isActive,
    });
    setIsAddPlanOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featureArr = planForm.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingPlan) {
        await adminService.updateSubscriptionPlan(editingPlan._id, {
          name: planForm.name,
          targetRole: planForm.targetRole,
          interval: planForm.interval,
          price: Number(planForm.price),
          durationDays: Number(planForm.durationDays),
          features: featureArr,
          isActive: planForm.isActive,
        });
      } else {
        await adminService.createSubscriptionPlan({
          name: planForm.name,
          targetRole: planForm.targetRole,
          interval: planForm.interval,
          price: Number(planForm.price),
          durationDays: Number(planForm.durationDays),
          features: featureArr,
          isActive: planForm.isActive,
        });
      }

      setIsAddPlanOpen(false);
      fetchOverview();
    } catch (err) {
      console.error("Failed to save plan:", err);
      alert("Error saving subscription plan");
    }
  };

  const handleAdjustPrice = (planId: string, currentPrice: number, delta: number) => {
    const newPrice = Math.max(0, Number((currentPrice + delta).toFixed(2)));
    setInlinePrices((prev) => ({ ...prev, [planId]: newPrice }));
  };

  const handleSaveInlinePrice = async (plan: SubscriptionPlan) => {
    const newPrice = inlinePrices[plan._id];
    if (newPrice === undefined || isNaN(newPrice) || newPrice === plan.price) return;

    setSavingPlanId(plan._id);
    try {
      await adminService.updateSubscriptionPlan(plan._id, { price: Number(newPrice) });
      fetchOverview();
    } catch (err) {
      console.error("Failed to save price:", err);
      alert("Failed to update plan price.");
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      try {
        await adminService.deleteSubscriptionPlan(id);
        fetchOverview();
      } catch (err) {
        console.error("Failed to delete plan:", err);
      }
    }
  };

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      s.userName?.toLowerCase().includes(search.toLowerCase()) ||
      s.planName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCalc = stats.total || 1;

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#0B2238] dark:text-white">
              Subscription Plan & Pricing Manager
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="h-3 w-3" /> Testify Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Increase or decrease plan pricing in USD ($), create new tiers, and sync instantly to Landing Page
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchOverview}
            disabled={loading}
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 font-bold text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleOpenAddModal}
            size="sm"
            className="rounded-xl gap-2 bg-[#5B67F7] hover:bg-[#4b56e2] text-white font-bold text-xs shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subscription</span>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Subscribers"
          value={stats.total}
          change="Registered Accounts"
          icon={Users}
          badge="Platform Total"
        />
        <StatCard
          title="Active Paid Plans"
          value={stats.active}
          change="85% active rate"
          icon={TrendingUp}
          trend="up"
          badge="Verified Active"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Active Configured Plans"
          value={stats.activePlansCount || plans.length}
          change="Platform Tiers"
          icon={CreditCard}
          badge="Live Plans"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="Monthly Subscription Rev."
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          change="Recurring Payments"
          icon={DollarSign}
          trend="up"
          badge="Monthly Total"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Tier Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-[#0B2238] dark:text-white text-sm">
                Student Access Plans
              </h3>
              <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                {plans.filter((p) => p.targetRole === "student").length} Tiers
              </Badge>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (plans.filter((p) => p.targetRole === "student").length / Math.max(1, plans.length)) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Live on Landing Page & Candidate portal
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-[#0B2238] dark:text-white text-sm">
                Teacher Pro Tiers
              </h3>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {stats.pro} Active Instructors
              </Badge>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.pro / totalCalc) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {((stats.pro / totalCalc) * 100).toFixed(1)}% of total subscribers
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-[#0B2238] dark:text-white text-sm">
                Institutional / Elite Tiers
              </h3>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                {stats.institutional} Institutional
              </Badge>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.institutional / totalCalc) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              High tier licensing plans
            </p>
          </div>
        </AdminCard>
      </div>

      {/* --- DYNAMIC SUBSCRIPTION PLANS MANAGER --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
              Testify Subscription Plans Manager
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Increase/decrease pricing or add new plans. Any change here updates live on the Landing Page!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const currentEditPrice = inlinePrices[plan._id] ?? plan.price;
            const isModified = currentEditPrice !== plan.price;
            const stepDelta = plan.interval === "yearly" ? 10 : 2;

            return (
              <AdminCard key={plan._id}>
                <div className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge
                        className={`capitalize ${
                          plan.targetRole === "teacher"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                            : "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300"
                        }`}
                      >
                        {plan.targetRole} • {plan.interval}
                      </Badge>

                      <Badge className={plan.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-50 text-rose-700"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold font-display text-[#0B2238] dark:text-white">
                        {plan.name}
                      </h3>
                      
                      {/* Price Display & Direct Editable Input */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-2xl font-extrabold font-display text-[#5B67F7] dark:text-purple-400">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentEditPrice}
                          onChange={(e) =>
                            setInlinePrices((prev) => ({
                              ...prev,
                              [plan._id]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-24 text-2xl font-extrabold font-display text-[#5B67F7] dark:text-purple-400 bg-transparent border-b border-dashed border-[#5B67F7]/40 focus:border-[#5B67F7] focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-medium">/{plan.interval}</span>

                        {isModified && (
                          <button
                            onClick={() => handleSaveInlinePrice(plan)}
                            disabled={savingPlanId === plan._id}
                            className="ml-auto p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            title="Save New Price to DB"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Save</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Smart Price Adjust Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">Adjust Price:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustPrice(plan._id, currentEditPrice, -stepDelta)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
                          title={`Decrease $${stepDelta}`}
                        >
                          - ${stepDelta}
                        </button>
                        <button
                          onClick={() => handleAdjustPrice(plan._id, currentEditPrice, stepDelta)}
                          className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 text-xs font-bold transition-colors"
                          title={`Increase $${stepDelta}`}
                        >
                          + ${stepDelta}
                        </button>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5 pt-2">
                      {plan.features?.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Button
                      onClick={() => handleOpenEditModal(plan)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs font-bold"
                    >
                      <Edit className="h-3.5 w-3.5 text-[#5B67F7]" />
                      <span>Edit Tier</span>
                    </Button>

                    <Button
                      onClick={() => handleDeletePlan(plan._id)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      </div>

      {/* --- ACTIVE USER SUBSCRIPTIONS TABLE --- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-[#0B2238] dark:text-white">
              Active User Subscriptions Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time records of active subscriber accounts in MongoDB
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscriber email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Subscriber</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      No matching subscriptions found
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0B2238] dark:text-white">
                            {sub.userName || "User"}
                          </span>
                          <span className="text-[11px] text-slate-400">{sub.userEmail}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="capitalize bg-slate-100 text-slate-700">{sub.role}</Badge>
                      </td>
                      <td className="p-4 font-bold text-[#5B67F7]">{sub.planName}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ${sub.pricePaid}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize">
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => setSelectedSub(sub)}
                          variant="outline"
                          size="sm"
                          className="rounded-lg p-1.5"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>

      {/* --- ADD / EDIT PLAN MODAL --- */}
      {isAddPlanOpen && (
        <Modal
          isOpen={isAddPlanOpen}
          onClose={() => setIsAddPlanOpen(false)}
          title={editingPlan ? "Edit Subscription Plan" : "Add New Subscription Plan"}
        >
          <form onSubmit={handleSavePlan} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Plan Name</label>
              <input
                type="text"
                required
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                placeholder="e.g. Teacher Pro Monthly"
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Role</label>
                <select
                  value={planForm.targetRole}
                  onChange={(e) => setPlanForm({ ...planForm, targetRole: e.target.value as any })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="teacher">Teacher / Instructor</option>
                  
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Billing Interval</label>
                <select
                  value={planForm.interval}
                  onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value as any })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                >
                  <option value="monthly">Monthly (30 Days)</option>
                  <option value="yearly">Yearly (365 Days)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (Days)</label>
                <input
                  type="number"
                  required
                  value={planForm.durationDays}
                  onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Features (Comma separated)</label>
              <textarea
                rows={3}
                value={planForm.features}
                onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                placeholder="Create Unlimited Exams, Access Question Bank, Detailed Analytics"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={planForm.isActive}
                onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded accent-[#5B67F7]"
              />
              <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Active & Live on Landing Page
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAddPlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#5B67F7] text-white">
                Save Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- SUB DETAILS MODAL --- */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title="Subscriber Audit Details"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-[#5B67F7] text-white flex items-center justify-center font-bold text-sm">
                {selectedSub.userName ? selectedSub.userName.charAt(0) : "U"}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B2238] dark:text-white">
                  {selectedSub.userName || "Subscriber"}
                </h4>
                <p className="text-slate-400">{selectedSub.userEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-semibold">Plan Name</span>
                <p className="font-bold text-[#5B67F7]">{selectedSub.planName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Price Paid</span>
                <p className="font-bold text-emerald-600">${selectedSub.pricePaid}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Start Date</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(selectedSub.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Expiry Date</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(selectedSub.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedSub(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
