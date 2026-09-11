"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Clock,
  Server,
  Database,
  Key,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { AdminCard, AdminCardContent } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useTabState } from "@/lib/admin/url-state";
import { cn } from "@/lib/admin/utils";
import { SystemConfig } from "@/lib/admin/types";
import { adminService } from "@/services/admin.service";

// Custom Animated Switch Component
function CustomSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1220]",
        checked ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

const TABS = [
  { id: "general", label: "General", icon: Globe, description: "Core platform settings and global defaults" },
  { id: "email", label: "Email", icon: Mail, description: "SMTP and transactional email configurations" },
  { id: "security", label: "Security", icon: Shield, description: "Authentication policies and access controls" },
  { id: "limits", label: "Limits", icon: Clock, description: "Rate limits and system quotas" },
];

const DEFAULT_CONFIGS: SystemConfig[] = [
  // General
  { id: "gen-1", key: "NEXT_PUBLIC_APP_NAME", value: "Testify", type: "string", category: "general", description: "The public name of the application", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "gen-2", key: "MAINTENANCE_MODE", value: "false", type: "boolean", category: "general", description: "Enable or disable maintenance mode", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "gen-3", key: "SUPPORT_URL", value: "https://support.testify.com", type: "string", category: "general", description: "URL for the support portal", updatedAt: new Date().toISOString(), updatedBy: "System" },
  
  // Email
  { id: "em-1", key: "SMTP_HOST", value: "smtp.example.com", type: "string", category: "email", description: "SMTP server hostname", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "em-2", key: "SMTP_PORT", value: "587", type: "number", category: "email", description: "SMTP server port", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "em-3", key: "ENABLE_EMAIL_NOTIFICATIONS", value: "true", type: "boolean", category: "email", description: "Toggle all outgoing email notifications", updatedAt: new Date().toISOString(), updatedBy: "System" },

  // Security
  { id: "sec-1", key: "REQUIRE_MFA_ADMINS", value: "false", type: "boolean", category: "security", description: "Require Multi-Factor Authentication for all admin accounts", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "sec-2", key: "SESSION_TIMEOUT_MINUTES", value: "120", type: "number", category: "security", description: "Idle timeout in minutes before forcing re-login", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "sec-3", key: "ALLOWED_CORS_ORIGINS", value: "[\"https://testify.com\"]", type: "json", category: "security", description: "JSON array of allowed origins for CORS", updatedAt: new Date().toISOString(), updatedBy: "System" },

  // Limits
  { id: "lim-1", key: "MAX_EXAM_DURATION_MINUTES", value: "180", type: "number", category: "limits", description: "Maximum allowed duration for an exam", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "lim-2", key: "MAX_QUESTIONS_PER_EXAM", value: "200", type: "number", category: "limits", description: "Maximum number of questions per exam", updatedAt: new Date().toISOString(), updatedBy: "System" },
  { id: "lim-3", key: "MAX_FILE_UPLOAD_MB", value: "10", type: "number", category: "limits", description: "Maximum file upload size in megabytes", updatedAt: new Date().toISOString(), updatedBy: "System" },
];

export default function AdminSettingsPage() {
  const { activeTab, setTab } = useTabState("general");
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [originalConfigs, setOriginalConfigs] = useState<SystemConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getSystemConfigs();
      let serverConfigs = res.data || [];
      
      // Merge with defaults
      const mergedConfigs = DEFAULT_CONFIGS.map(def => {
        const found = serverConfigs.find((sc: any) => sc.key === def.key);
        return found ? { ...def, ...found } : def;
      });
      // Append any extra from server not in defaults
      serverConfigs.forEach((sc: any) => {
        if (!DEFAULT_CONFIGS.some(def => def.key === sc.key)) {
          mergedConfigs.push(sc);
        }
      });

      setConfigs(mergedConfigs);
      setOriginalConfigs(JSON.parse(JSON.stringify(mergedConfigs))); // Deep copy for reset
    } catch (error) {
      toast.error("Failed to load system configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchConfigs().then(() => {
      if (!mounted) return;
    });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const savePromise = async () => {
      // Find changed configs to optimize saving
      const changedConfigs = configs.filter(
        (c) => c.value !== originalConfigs.find((oc) => oc.id === c.id)?.value
      );
      
      if (changedConfigs.length === 0) {
        return "No changes to save.";
      }

      for (const config of changedConfigs) {
        await adminService.updateSystemConfig(config.key, config.value);
      }
      setOriginalConfigs(JSON.parse(JSON.stringify(configs)));
      return `Successfully saved ${changedConfigs.length} configuration(s).`;
    };

    toast.promise(savePromise(), {
      loading: "Saving configurations...",
      success: (msg) => msg,
      error: "Failed to save configurations. Please try again.",
      finally: () => setSaving(false),
    });
  };

  const handleReset = () => {
    setConfigs(JSON.parse(JSON.stringify(originalConfigs)));
    toast.success("Configurations reset to last saved state.");
  };

  const updateConfig = (id: string, value: string) => {
    setConfigs(
      configs.map((config) =>
        config.id === id ? { ...config, value } : config
      )
    );
  };

  const getConfigByCategory = (category: string) => {
    return configs.filter((config) => config.category === category);
  };

  const renderConfigField = (config: SystemConfig) => {
    switch (config.type) {
      case "boolean":
        return (
          <div className="flex items-center h-10">
            <CustomSwitch
              checked={config.value === "true"}
              onChange={(checked) => updateConfig(config.id, checked ? "true" : "false")}
            />
            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {config.value === "true" ? "Enabled" : "Disabled"}
            </span>
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            value={config.value}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            className="max-w-md font-mono"
            leftIcon={<Zap className="h-4 w-4 text-slate-400" />}
          />
        );
      case "json":
        return (
          <Textarea
            value={config.value}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            rows={5}
            placeholder="Enter JSON configuration"
            className="font-mono text-sm max-w-2xl"
          />
        );
      case "string":
      default:
        // Use different icons based on key hint
        let Icon = Server;
        if (config.key.toLowerCase().includes("key") || config.key.toLowerCase().includes("secret")) Icon = Key;
        if (config.key.toLowerCase().includes("url")) Icon = Globe;

        return (
          <Input
            value={config.value}
            onChange={(e) => updateConfig(config.id, e.target.value)}
            placeholder={config.description}
            className={cn("max-w-md", config.key.toLowerCase().includes("key") && "font-mono")}
            type={config.key.toLowerCase().includes("secret") ? "password" : "text"}
            leftIcon={<Icon className="h-4 w-4 text-slate-400" />}
          />
        );
    }
  };

  const activeTabInfo = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              System Configuration
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              <Settings className="h-3 w-3" />
              <span>Admin Control</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs sm:text-sm">
            Manage global platform variables, secrets, and operational limits.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading || saving}
            className="rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold px-4 cursor-pointer"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Reset Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || saving}
            className="rounded-full bg-[#152234] hover:bg-[#0B2238] dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-xs font-semibold px-6 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            leftIcon={<Save className={cn("h-4 w-4", saving && "animate-spin")} />}
          >
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800/80">
        <nav className="flex gap-6 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={cn(
                  "relative pb-4 flex items-center gap-2 text-sm font-semibold transition-colors whitespace-nowrap",
                  isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-cyan-500" : "text-slate-400")} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-t-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Description */}
      {activeTabInfo && (
        <motion.div
          key={`desc-${activeTab}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60"
        >
          <Info className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeTabInfo.description}
          </p>
        </motion.div>
      )}

      {/* Content Area */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map((i) => (
              <AdminCard key={i} className="animate-pulse">
                <AdminCardContent>
                  <div className="flex items-start justify-between">
                    <div className="w-2/3 space-y-3">
                      <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded-md" />
                      <div className="h-10 w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-md mt-4" />
                    </div>
                  </div>
                </AdminCardContent>
              </AdminCard>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 mt-2"
            >
              {getConfigByCategory(activeTab).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <Database className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No configurations found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    There are no variables registered for the <strong>{activeTab}</strong> category in the database.
                  </p>
                </div>
              ) : (
                getConfigByCategory(activeTab).map((config) => (
                  <AdminCard key={config.id}>
                    <AdminCardContent>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="font-semibold font-mono text-sm text-slate-900 dark:text-white mb-1">
                            {config.key}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {config.description}
                          </p>
                          <div className="w-full">
                            {renderConfigField(config)}
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 w-full md:w-auto min-w-[220px]">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Type</span>
                            <span className="font-mono text-[10px] uppercase bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                              {config.type}
                            </span>
                          </div>
                          <div className="w-full h-px bg-slate-200 dark:bg-slate-800/60 my-1" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Updated</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(config.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-medium">By</span>
                            <span className="truncate max-w-[120px] font-medium text-slate-700 dark:text-slate-300">{config.updatedBy}</span>
                          </div>
                        </div>
                      </div>
                    </AdminCardContent>
                  </AdminCard>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
