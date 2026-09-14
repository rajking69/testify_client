"use client";

import React from "react";
import PublicExamsSection from "@/components/landing/PublicExamsSection";

export default function PublicExamsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060B14] pt-24 sm:pt-28 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PublicExamsSection />
      </div>
    </div>
  );
}
