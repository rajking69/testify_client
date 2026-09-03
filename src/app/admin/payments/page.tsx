"use client";

import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { AdminTable } from "@/components/admin/shared/AdminTable";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useFilterState } from "@/lib/admin/url-state";
import {
  getStatusColor,
  formatCurrency,
  formatRelativeTime,
  cn,
} from "@/lib/admin/utils";
import { mockPayments } from "@/lib/admin/mock-data";
import {
  Payment,
  PaymentStatus,
  TableColumn,
  ActionMenuItem,
} from "@/lib/admin/types";

export default function AdminPaymentsPage() {
  const {
    filters,
    updateFilter,
    updateFilters,
    updateSearch,
    updatePagination,
  } = useFilterState({
    status: undefined,
  });

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Filter payments
  const filteredPayments = mockPayments.filter((payment) => {
    if (filters.status && payment.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        payment.userName.toLowerCase().includes(search) ||
        (payment.userEmail || "").toLowerCase().includes(search) ||
        payment.transactionId.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Pagination
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedPayments = filteredPayments.slice(
    startIndex,
    startIndex + filters.pageSize,
  );

  // Stats
  const stats = {
    total: mockPayments.length,
    success: mockPayments.filter((p) => p.status === "success").length,
    pending: mockPayments.filter((p) => p.status === "pending").length,
    failed: mockPayments.filter((p) => p.status === "failed").length,
    totalRevenue: mockPayments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingRevenue: mockPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  // Table columns
  const columns: TableColumn<Payment>[] = [
    {
      key: "transactionId",
      header: "Transaction ID",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
          {String(value || "")}
        </span>
      ),
    },
    {
      key: "userName",
      header: "Customer",
      sortable: true,
      render: (_, payment) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {payment.userName}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {payment.userEmail || ""}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (value, payment) => (
        <span className="text-slate-900 dark:text-white font-medium">
          {formatCurrency(Number(value || 0), payment.currency)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => {
        const str = String(value || "");
        return (
          <div className="flex items-center gap-2">
            {str === "success" && (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            )}
            {str === "pending" && <Clock className="h-4 w-4 text-amber-600" />}
            {str === "failed" && <XCircle className="h-4 w-4 text-rose-600" />}
            <Badge className={getStatusColor(str)}>
              {str ? str.charAt(0).toUpperCase() + str.slice(1) : ""}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">{String(value || "")}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">
          {value ? formatRelativeTime(String(value)) : "—"}
        </span>
      ),
    },
  ];

  // Action menu items
  const getActionMenuItems = (payment: Payment): ActionMenuItem<Payment>[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (p) => setSelectedPayment(p),
    },
    ...(payment.invoiceUrl
      ? [
          {
            label: "Download Invoice",
            icon: <Download className="h-4 w-4" />,
            onClick: (p: Payment) => console.log("Download invoice", p.invoiceUrl),
          },
        ]
      : []),
    ...(payment.status === "pending"
      ? [
          {
            label: "Retry Payment",
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: (p: Payment) => console.log("Retry payment", p.id),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Payment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor transactions and payment history
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
        <StatCard
          title="Successful"
          value={stats.success}
          change="90% success rate"
          icon={CheckCircle}
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          change="Requires attention"
          icon={Clock}
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          icon={XCircle}
          iconColor="text-rose-600 dark:text-rose-400"
          trend="down"
        />
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminCard>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Revenue Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Collected Revenue
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Pending Revenue
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(stats.pendingRevenue)}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Total Potential
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue + stats.pendingRevenue)}
                </span>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Payment Methods
            </h3>
            <div className="space-y-3">
              {["Credit Card", "Bank Transfer", "PayPal"].map((method) => {
                const count = mockPayments.filter(
                  (p) => p.paymentMethod === method,
                ).length;
                const percentage = (count / mockPayments.length) * 100;
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {method}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Table */}
      <AdminTable
        data={paginatedPayments}
        columns={columns}
        filters={filters}
        onFilterChange={updateFilters}
        total={filteredPayments.length}
        actionMenuItems={getActionMenuItems}
        emptyMessage="No payments found"
      />

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="Payment Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Transaction ID
                </p>
                <p className="text-sm font-mono text-slate-900 dark:text-white">
                  {selectedPayment.transactionId}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Status
                </p>
                <Badge className={getStatusColor(selectedPayment.status)}>
                  {selectedPayment.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Amount
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatCurrency(
                    selectedPayment.amount,
                    selectedPayment.currency,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Payment Method
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedPayment.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Customer
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedPayment.userName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedPayment.userEmail}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Created
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatRelativeTime(selectedPayment.createdAt)}
                </p>
              </div>
            </div>

            {selectedPayment.processedAt && (
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Processed
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatRelativeTime(selectedPayment.processedAt)}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              {selectedPayment.invoiceUrl && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
