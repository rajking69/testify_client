"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Plus, Edit, Trash2, Save } from "lucide-react";
import { AdminCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/admin/utils";
import { mockPermissionMatrix } from "@/lib/admin/mock-data";
import { PermissionMatrix, PermissionScope } from "@/lib/admin/types";

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionMatrix[]>(mockPermissionMatrix);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const permissionScopes = ["users", "exams", "questions", "analytics", "settings", "features"];
  const permissionTypes = ["read", "write", "delete", "admin"] as const;

  const togglePermission = (role: string, scope: string, type: keyof PermissionScope) => {
    setPermissions(
      permissions.map((r) =>
        r.role === role
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [scope]: {
                  ...r.permissions[scope],
                  [type]: !r.permissions[scope][type],
                },
              },
            }
          : r
      )
    );
  };

  const addNewRole = () => {
    if (newRoleName.trim()) {
      const newRole: PermissionMatrix = {
        role: newRoleName,
        permissions: permissionScopes.reduce(
          (acc, scope) => ({
            ...acc,
            [scope]: { read: false, write: false, delete: false, admin: false },
          }),
          {}
        ),
      };
      setPermissions([...permissions, newRole]);
      setNewRoleName("");
      setNewRoleModal(false);
    }
  };

  const deleteRole = (role: string) => {
    setPermissions(permissions.filter((r) => r.role !== role));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Permission Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure role-based access control (RBAC) matrix
          </p>
        </div>
        <Button onClick={() => setNewRoleModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Permission Matrix */}
      <div className="space-y-4">
        {permissions.map((roleMatrix) => (
          <AdminCard key={roleMatrix.role}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{roleMatrix.role}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Custom role configuration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingRole === roleMatrix.role ? (
                    <Button size="sm" onClick={() => setEditingRole(null)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditingRole(roleMatrix.role)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRole(roleMatrix.role)}
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Permission Grid */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        Scope
                      </th>
                      {permissionTypes.map((type) => (
                        <th key={type} className="text-center py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          {type}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissionScopes.map((scope) => (
                      <tr key={scope} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-3">
                          <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">{scope}</span>
                        </td>
                        {permissionTypes.map((type) => {
                          const hasPermission = roleMatrix.permissions[scope]?.[type];
                          const isEditable = editingRole === roleMatrix.role;

                          return (
                            <td key={type} className="py-3 px-3 text-center">
                              {isEditable ? (
                                <button
                                  onClick={() => togglePermission(roleMatrix.role, scope, type)}
                                  className={cn(
                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                                    hasPermission ? "bg-purple-600" : "bg-slate-200 dark:bg-slate-700"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                                      hasPermission ? "translate-x-5" : "translate-x-1"
                                    )}
                                  />
                                </button>
                              ) : (
                                <Badge
                                  className={cn(
                                    hasPermission
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                      : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800"
                                  )}
                                >
                                  {hasPermission ? "Granted" : "Denied"}
                                </Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Add Role Modal */}
      <Modal isOpen={newRoleModal} onClose={() => setNewRoleModal(false)} title="Add New Role">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Role Name
            </label>
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g., Content Manager"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setNewRoleModal(false)}>
              Cancel
            </Button>
            <Button onClick={addNewRole}>Create Role</Button>
          </div>
        </div>
      </Modal>

      {/* Legend */}
      <AdminCard>
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Permission Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Read</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">View resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Write</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Create & edit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Delete</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Remove resources</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Admin</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Full control</p>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}