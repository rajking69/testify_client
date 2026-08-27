"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  UserCheck,
  GraduationCap,
  ShieldAlert,
  Ban,
  RotateCcw,
  Trash2,
  Eye,
} from "lucide-react";
import { AdminTable } from "@/components/admin/shared/AdminTable";
import { StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useFilterState, useTabState } from "@/lib/admin/url-state";
import {
  getStatusColor,
  getInitials,
  formatRelativeTime,
  cn,
} from "@/lib/admin/utils";
import {
  showSuccessToast,
  showErrorToast,
  withPromiseToast,
} from "@/lib/admin/toast";
import { mockUsers } from "@/lib/admin/mock-data";
import { User, TableColumn, ActionMenuItem } from "@/lib/admin/types";

export default function AdminUsersPage() {
  const { activeTab, setTab } = useTabState("all");
  const { filters, updateFilters } = useFilterState({
    status: undefined,
    role: undefined,
  });

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: "activate" | "deactivate" | "suspend" | "restore" | "delete";
    user: User;
  } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  // Filter users based on tab and filters
  const filteredUsers = users.filter((user) => {
    // Tab filtering
    if (activeTab === "teachers" && user.role !== "teacher") return false;
    if (activeTab === "students" && user.role !== "student") return false;
    if (activeTab === "admins" && user.role !== "admin") return false;

    // Status filtering
    if (filters.status && user.status !== filters.status) return false;

    // Role filtering
    if (filters.role && user.role !== filters.role) return false;

    // Search filtering
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.department && user.department.toLowerCase().includes(search))
      );
    }

    return true;
  });

  // Pagination
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + filters.pageSize,
  );

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    deactivated: users.filter((u) => u.status === "deactivated").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "student").length,
  };

  // Table columns
  const columns: TableColumn<User>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (value) => (
        <Badge
          className={cn(
            value === "admin" &&
              "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
            value === "teacher" &&
              "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
            value === "student" &&
              "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800",
          )}
        >
          {value === "admin" && <ShieldAlert className="h-3 w-3 mr-1" />}
          {value === "teacher" && <UserCheck className="h-3 w-3 mr-1" />}
          {value === "student" && <GraduationCap className="h-3 w-3 mr-1" />}
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
      key: "department",
      header: "Department",
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">
          {formatRelativeTime(value)}
        </span>
      ),
    },
    {
      key: "lastActive",
      header: "Last Active",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">
          {value ? formatRelativeTime(value) : "Never"}
        </span>
      ),
    },
  ];

  // Action menu items
  const getActionMenuItems = (user: User): ActionMenuItem<User>[] => {
    const items: ActionMenuItem<User>[] = [
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (u) => setSelectedUser(u),
      },
      { divider: true },
    ];

    if (user.status === "active") {
      items.push({
        label: "Deactivate",
        icon: <Ban className="h-4 w-4" />,
        onClick: (u) => setActionModal({ type: "deactivate", user: u }),
        danger: true,
      });
      items.push({
        label: "Suspend",
        icon: <ShieldAlert className="h-4 w-4" />,
        onClick: (u) => setActionModal({ type: "suspend", user: u }),
        danger: true,
      });
    } else if (user.status === "suspended") {
      items.push({
        label: "Restore",
        icon: <RotateCcw className="h-4 w-4" />,
        onClick: (u) => setActionModal({ type: "restore", user: u }),
      });
    } else if (user.status === "deactivated") {
      items.push({
        label: "Activate",
        icon: <UserCheck className="h-4 w-4" />,
        onClick: (u) => setActionModal({ type: "activate", user: u }),
      });
    }

    items.push({ divider: true });
    items.push({
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (u) => setActionModal({ type: "delete", user: u }),
      danger: true,
    });

    return items;
  };

  const handleActionConfirm = async () => {
    if (!actionModal) return;

    const action = actionModal.type;
    const user = actionModal.user;

    // Optimistic UI update
    const previousUsers = [...users];
    setUsers(
      users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              status:
                action === "activate"
                  ? "active"
                  : action === "deactivate"
                    ? "deactivated"
                    : action === "suspend"
                      ? "suspended"
                      : action === "delete"
                        ? "deactivated"
                        : u.status,
            }
          : u,
      ),
    );

    try {
      // Simulate API call
      await withPromiseToast(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: `${action.charAt(0).toUpperCase() + action.slice(1)}ing user...`,
          success: `Successfully ${action}d ${user.name}`,
          error: `Failed to ${action} user`,
        },
      );

      showSuccessToast(
        `User ${action}d successfully`,
        `${user.name} is now ${action === "activate" ? "active" : action === "deactivate" ? "deactivated" : action === "suspend" ? "suspended" : "deleted"}`,
      );
    } catch {
      // Revert optimistic update on error
      setUsers(previousUsers);
      showErrorToast("Failed to update user status");
    }

    // Reset modal
    setActionModal(null);
    setSuspensionReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage users, teachers, and administrators
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          change="+12% from last month"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value={stats.active}
          change="+8% from last week"
          icon={UserCheck}
          trend="up"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Suspended"
          value={stats.suspended}
          change="2 require attention"
          icon={ShieldAlert}
          trend="down"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Teachers"
          value={stats.teachers}
          change="+3 new this month"
          icon={GraduationCap}
          trend="up"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-4">
          {[
            { id: "all", label: "All Users", count: stats.total },
            { id: "teachers", label: "Teachers", count: stats.teachers },
            { id: "students", label: "Students", count: stats.students },
            {
              id: "admins",
              label: "Admins",
              count: users.filter((u) => u.role === "admin").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <AdminTable<User>
        data={paginatedUsers}
        columns={columns}
        filters={filters}
        onFilterChange={updateFilters}
        total={filteredUsers.length}
        actionMenuItems={getActionMenuItems}
        emptyMessage="No users found matching your criteria"
      />

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="User Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                {selectedUser.avatarUrl ? (
                  <Image
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  getInitials(selectedUser.name)
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedUser.email}
                </p>
                <Badge
                  className={`${getStatusColor(selectedUser.status)} mt-2`}
                >
                  {selectedUser.status.charAt(0).toUpperCase() +
                    selectedUser.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Role
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedUser.role}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Department
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedUser.department || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  User ID
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedUser.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Created
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatRelativeTime(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button>Edit User</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <Modal
          isOpen={!!actionModal}
          onClose={() => {
            setActionModal(null);
            setSuspensionReason("");
          }}
          title={`${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} User`}
        >
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to {actionModal.type}{" "}
              <strong>{actionModal.user.name}</strong>?
            </p>

            {actionModal.type === "suspend" && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Reason for suspension
                </label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setActionModal(null);
                  setSuspensionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant={
                  actionModal.type === "delete" ||
                  actionModal.type === "suspend"
                    ? "danger"
                    : "primary"
                }
                onClick={handleActionConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
