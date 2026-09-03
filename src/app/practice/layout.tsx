"use client";

import React from "react";
import { PracticeProvider } from "@/lib/practice/practice-context";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PracticeProvider>{children}</PracticeProvider>;
}