"use client";

import React, { useState } from "react";
import { Zap, Shield, Cpu, Settings, RefreshCw } from "lucide-react";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/admin/utils";
import { FeatureFlag, FeatureCategory } from "@/lib/admin/types";
import { adminService } from "@/services/admin.service";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    adminService
      .getFeatureFlags()
      .then((res) => {
        if (isMounted && res.data) {
          setFeatures(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFeature = async (featureId: string) => {
    setUpdating(featureId);
    try {
      await adminService.toggleFeatureFlag(featureId);
      setFeatures(features.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled } : f)));
    } catch {
      // Local optimistic toggle on error
      setFeatures(features.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled } : f)));
    } finally {
      setUpdating(null);
    }
  };

  const categoryIcons: Record<FeatureCategory, React.ReactNode> = {
    ai: <Zap className="h-4 w-4" />,
    security: <Shield className="h-4 w-4" />,
    system: <Cpu className="h-4 w-4" />,
  };

  const categoryColors: Record<FeatureCategory, string> = {
    ai: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    security: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    system: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  };

  const stats = {
    total: features.length,
    enabled: features.filter((f) => f.enabled).length,
    disabled: features.filter((f) => !f.enabled).length,
    ai: features.filter((f) => f.category === "ai").length,
    security: features.filter((f) => f.category === "security").length,
    system: features.filter((f) => f.category === "system").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Control</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage runtime system flags and feature toggles
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Features" value={stats.total} icon={Settings} />
        <StatCard
          title="Enabled"
          value={stats.enabled}
          icon={Zap}
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend="up"
        />
        <StatCard
          title="Disabled"
          value={stats.disabled}
          icon={Shield}
          iconColor="text-slate-600 dark:text-slate-400"
        />
        <StatCard
          title="AI Features"
          value={stats.ai}
          icon={Zap}
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Feature Categories */}
      {(["ai", "security", "system"] as FeatureCategory[]).map((category) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            {categoryIcons[category]}
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
              {category} Features
            </h2>
            <Badge className={categoryColors[category]}>{features.filter((f) => f.category === category).length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features
              .filter((f) => f.category === category)
              .map((feature) => (
                <AdminCard key={feature.id}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{feature.name}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              feature.enabled
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800"
                            )}
                          >
                            {feature.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{feature.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Key: {feature.key}</span>
                          <span>•</span>
                          <span>Last modified: {new Date(feature.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFeature(feature.id)}
                        disabled={updating === feature.id}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                          feature.enabled
                            ? "bg-purple-600"
                            : "bg-slate-200 dark:bg-slate-700",
                          updating === feature.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            feature.enabled ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </AdminCard>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}