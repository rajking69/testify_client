"use client";

import React, { useState } from "react";
import { Zap, Shield, Cpu, Settings, RefreshCw, Plus, Search, Edit2, Trash2 } from "lucide-react";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/admin/utils";
import { FeatureFlag, FeatureCategory } from "@/lib/admin/types";
import { adminService } from "@/services/admin.service";
import { FeatureFlagModal } from "@/components/admin/features/FeatureFlagModal";
import { toast } from "sonner";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchFeatures = async () => {
    try {
      const res = await adminService.getFeatureFlags();
      if (res.data) setFeatures(res.data);
    } catch (err) {
      toast.error("Failed to fetch features");
    }
  };

  React.useEffect(() => {
    fetchFeatures();
  }, []);

  const toggleFeature = async (featureId: string) => {
    setUpdating(featureId);
    try {
      await adminService.toggleFeatureFlag(featureId);
      setFeatures(features.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled } : f)));
      toast.success("Feature status updated");
    } catch {
      // Local optimistic toggle on error
      setFeatures(features.map((f) => (f.id === featureId ? { ...f, enabled: !f.enabled } : f)));
      toast.error("Failed to update feature status");
    } finally {
      setUpdating(null);
    }
  };

  const handleSave = async (data: Partial<FeatureFlag>) => {
    try {
      if (selectedFeature) {
        await adminService.updateFeatureFlag(selectedFeature.id, data);
        toast.success("Feature updated successfully");
      } else {
        await adminService.createFeatureFlag(data as any);
        toast.success("Feature created successfully");
      }
      await fetchFeatures();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this feature flag?")) return;
    setIsDeleting(id);
    try {
      await adminService.deleteFeatureFlag(id);
      toast.success("Feature deleted successfully");
      await fetchFeatures();
    } catch {
      toast.error("Failed to delete feature");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feature Control</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage runtime system flags and feature toggles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="outline" onClick={fetchFeatures}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setSelectedFeature(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Feature
          </Button>
        </div>
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
      {features.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <Settings className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Feature Flags Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Feature flags allow you to safely toggle functionality on and off without deploying new code.
          </p>
          <Button onClick={() => { setSelectedFeature(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Feature
          </Button>
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          No features match your search "{searchQuery}".
        </div>
      ) : (
        (["ai", "security", "system"] as FeatureCategory[]).map((category) => {
          const categoryFeatures = filteredFeatures.filter((f) => (f.category || "system") === category);
          
          if (categoryFeatures.length === 0) return null;
          
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                {categoryIcons[category]}
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                  {category} Features
                </h2>
                <Badge className={categoryColors[category]}>{categoryFeatures.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFeatures.map((feature) => (
                  <AdminCard key={feature.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{feature.name}</h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs shrink-0",
                                feature.enabled
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800"
                              )}
                            >
                              {feature.enabled ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{feature.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="truncate max-w-[150px]">Key: {feature.key}</span>
                            <span>•</span>
                            <span>Last modified: {feature.lastModified ? new Date(feature.lastModified).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelectedFeature(feature); setIsModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                              title="Edit Feature"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(feature.id)}
                              disabled={isDeleting === feature.id}
                              className={cn(
                                "p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-lg transition-colors",
                                isDeleting === feature.id && "opacity-50 cursor-not-allowed"
                              )}
                              title="Delete Feature"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                ))}
              </div>
            </div>
          );
        })
      )}

      <FeatureFlagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feature={selectedFeature}
        onSave={handleSave}
      />
    </div>
  );
}