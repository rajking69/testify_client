"use client";

import React, { useState } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Clock,
} from "lucide-react";
import { AdminCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useTabState } from "@/lib/admin/url-state";
import { cn } from "@/lib/admin/utils";
import { mockSystemConfig } from "@/lib/admin/mock-data";
import { SystemConfig } from "@/lib/admin/types";

export default function AdminSettingsPage() {
  const { activeTab, setTab } = useTabState("general");
  const [configs, setConfigs] = useState<SystemConfig[]>(mockSystemConfig);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success notification
  };

  const handleReset = () => {
    setConfigs(mockSystemConfig);
  };

  const updateConfig = (id: string, value: string) => {
    setConfigs(
      configs.map((config) =>
        config.id === id ? { ...config, value } : config,
      ),
    );
  };

  const getConfigByCategory = (category: string) => {
    return configs.filter((config) => config.category === category);
  };

  const renderConfigField = (config: SystemConfig) => {
    switch (config.type) {
      case "boolean":
        return (
          <Select
            value={config.value}
            options={[
              { value: "true", label: "Enabled" },
              { value: "false", label: "Disabled" },
            ]}
            onChange={(value) => updateConfig(config.id, value)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={config.value}
            onChange={(e) => updateConfig(config.id, e.target.value)}
          />
        );
      case "json":
        return (
          <Textarea
            value={config.value}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            rows={4}
            placeholder="Enter JSON configuration"
          />
        );
      default:
        return (
          <Input
            value={config.value}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            placeholder={config.description}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            System Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage platform settings and global variables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-4">
          {[
            {
              id: "general",
              label: "General",
              icon: <Globe className="h-4 w-4" />,
            },
            { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
            {
              id: "security",
              label: "Security",
              icon: <Shield className="h-4 w-4" />,
            },
            {
              id: "limits",
              label: "Limits",
              icon: <Clock className="h-4 w-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === "general" && (
          <div className="space-y-4">
            {getConfigByCategory("general").map((config) => (
              <AdminCard key={config.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {config.key}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {config.description}
                      </p>
                      <div className="max-w-md">
                        {renderConfigField(config)}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-slate-500">
                      <p>
                        Last updated:{" "}
                        {new Date(config.updatedAt).toLocaleDateString()}
                      </p>
                      <p>By: {config.updatedBy}</p>
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-4">
            {getConfigByCategory("email").map((config) => (
              <AdminCard key={config.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {config.key}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {config.description}
                      </p>
                      <div className="max-w-md">
                        {renderConfigField(config)}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-slate-500">
                      <p>
                        Last updated:{" "}
                        {new Date(config.updatedAt).toLocaleDateString()}
                      </p>
                      <p>By: {config.updatedBy}</p>
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            {getConfigByCategory("security").map((config) => (
              <AdminCard key={config.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {config.key}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {config.description}
                      </p>
                      <div className="max-w-md">
                        {renderConfigField(config)}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-slate-500">
                      <p>
                        Last updated:{" "}
                        {new Date(config.updatedAt).toLocaleDateString()}
                      </p>
                      <p>By: {config.updatedBy}</p>
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}

        {activeTab === "limits" && (
          <div className="space-y-4">
            {getConfigByCategory("limits").map((config) => (
              <AdminCard key={config.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {config.key}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {config.description}
                      </p>
                      <div className="max-w-md">
                        {renderConfigField(config)}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-slate-500">
                      <p>
                        Last updated:{" "}
                        {new Date(config.updatedAt).toLocaleDateString()}
                      </p>
                      <p>By: {config.updatedBy}</p>
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
