"use client";

import React, { useState } from "react";
import { CreditCard, Users, TrendingUp, DollarSign, Calendar, RefreshCw, Eye, Edit } from "lucide-react";
import { AdminTable } from "@/components/admin/shared/AdminTable";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFilterState } from "@/lib/admin/url-state";
import { getStatusColor, formatCurrency, formatRelativeTime, cn } from "@/lib/admin/utils";
import { mockSubscriptions } from "@/lib/admin/mock-data";
import { Subscription, SubscriptionTier, TableColumn, ActionMenuItem } from "@/lib/admin/types";

export default function AdminSubscriptionsPage() {
  const { filters, updateFilter, updateFilters, updateSearch, updatePagination } = useFilterState({
    tier: undefined,
    status: undefined,
  });

  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Filter subscriptions
  const filteredSubscriptions = mockSubscriptions.filter((sub) => {
    if (filters.tier && sub.tier !== filters.tier) return false;
    if (filters.status && sub.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        sub.userName.toLowerCase().includes(search) ||
        sub.userEmail.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Pagination
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, startIndex + filters.pageSize);

  // Stats
  const stats = {
    total: mockSubscriptions.length,
    active: mockSubscriptions.filter((s) => s.status === "active").length,
    free: mockSubscriptions.filter((s) => s.tier === "free").length,
    pro: mockSubscriptions.filter((s) => s.tier === "pro").length,
    institutional: mockSubscriptions.filter((s) => s.tier === "institutional").length,
    monthlyRevenue: mockSubscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.amount, 0),
  };

  // Table columns
  const columns: TableColumn<Subscription>[] = [
    {
      key: "userName",
      header: "Subscriber",
      sortable: true,
      render: (value, sub) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{sub.userName}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{sub.userEmail}</p>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Plan",
      sortable: true,
      render: (value) => (
        <Badge
          className={cn(
            value === "free" && "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
            value === "pro" && "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
            value === "institutional" && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
          )}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => (
        <Badge className={getStatusColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (value, sub) => (
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {formatCurrency(value, sub.currency)}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Calendar className="h-3 w-3" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "endDate",
      header: "Renewal",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Calendar className="h-3 w-3" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "autoRenew",
      header: "Auto-Renew",
      render: (value) => (
        <Badge className={value ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800"}>
          {value ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
  ];

  // Action menu items
  const getActionMenuItems = (subscription: Subscription): ActionMenuItem[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (s) => setSelectedSubscription(s),
    },
    {
      label: "Edit Subscription",
      icon: <Edit className="h-4 w-4" />,
      onClick: (s) => console.log("Edit subscription", s.id),
    },
    {
      label: subscription.autoRenew ? "Disable Auto-Renew" : "Enable Auto-Renew",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: (s) => console.log("Toggle auto-renew", s.id),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage user subscriptions and plans
          </p>
        </div>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Subscribers" value={stats.total} icon={Users} />
        <StatCard
          title="Active Plans"
          value={stats.active}
          change="85% active rate"
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
        <StatCard
          title="Pro Plans"
          value={stats.pro}
          icon={CreditCard}
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
      </div>

      {/* Tier Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Free Plan</h3>
              <Badge className="bg-slate-50 text-slate-700 border-slate-200">{stats.free}</Badge>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400"
                style={{ width: `${(stats.free / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {((stats.free / stats.total) * 100).toFixed(1)}% of total
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Pro Plan</h3>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">{stats.pro}</Badge>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${(stats.pro / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {((stats.pro / stats.total) * 100).toFixed(1)}% of total
            </p>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Institutional</h3>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">{stats.institutional}</Badge>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${(stats.institutional / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {((stats.institutional / stats.total) * 100).toFixed(1)}% of total
            </p>
          </div>
        </AdminCard>
      </div>

      {/* Table */}
      <AdminTable
        data={paginatedSubscriptions}
        columns={columns}
        filters={filters}
        onFilterChange={updateFilters}
        total={filteredSubscriptions.length}
        actionMenuItems={getActionMenuItems}
        emptyMessage="No subscriptions found"
      />

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <Modal
          isOpen={!!selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          title="Subscription Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                {selectedSubscription.userName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedSubscription.userName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{selectedSubscription.userEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Plan</p>
                <p className="text-sm text-slate-900 dark:text-white">{selectedSubscription.tier}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</p>
                <Badge className={getStatusColor(selectedSubscription.status)}>
                  {selectedSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Amount</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatCurrency(selectedSubscription.amount, selectedSubscription.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Auto-Renew</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedSubscription.autoRenew ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Start Date</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {new Date(selectedSubscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">End Date</p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {new Date(selectedSubscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedSubscription(null)}>
                Close
              </Button>
              <Button>Edit Subscription</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}