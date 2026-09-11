"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FeatureFlag, FeatureCategory } from "@/lib/admin/types";

interface FeatureFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: FeatureFlag | null;
  onSave: (data: Partial<FeatureFlag>) => Promise<void>;
}

export function FeatureFlagModal({ isOpen, onClose, feature, onSave }: FeatureFlagModalProps) {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeatureCategory>("system");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (feature) {
        setKey(feature.key);
        setName(feature.name);
        setDescription(feature.description);
        setCategory(feature.category || "system");
      } else {
        setKey("");
        setName("");
        setDescription("");
        setCategory("system");
      }
      setError(null);
    }
  }, [isOpen, feature]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key || !name || !description) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSave({ key, name, description, category });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={feature ? "Edit Feature Flag" : "Create Feature Flag"}
      description={feature ? "Update the details of this feature flag." : "Add a new feature flag to the system."}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Feature"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}
        
        <Input
          label="Feature Key"
          placeholder="e.g., enable_ai_grading"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
          disabled={!!feature} // Prevent changing key on edit
          helperText={feature ? "Key cannot be changed after creation." : "Unique identifier used in the codebase."}
        />
        
        <Input
          label="Display Name"
          placeholder="e.g., AI Grading"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Input
          label="Description"
          placeholder="Brief description of what this feature does"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as FeatureCategory)}
          required
          options={[
            { label: "System", value: "system" },
            { label: "AI", value: "ai" },
            { label: "Security", value: "security" },
          ]}
        />
      </form>
    </Modal>
  );
}
