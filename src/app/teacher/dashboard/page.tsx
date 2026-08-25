"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
            Teacher Workspace
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Teacher Dashboard
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Manage admission, monitor live exams, evaluate submissions, and publish student results from one workspace.
          </p>
          <div className="pt-2">
            <Link href="/teacher/students">
              <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Admit students
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Using Reusable UI System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverEffect>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-2">
              <HelpCircle className="h-5 w-5" />
            </div>
              <CardTitle>Student admission</CardTitle>
              <CardDescription>Review requests and approve exam access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assign students to the right exam and track pending requests.
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-2">
              <BookOpen className="h-5 w-5" />
            </div>
              <CardTitle>Exam operations</CardTitle>
              <CardDescription>Monitor sessions and evaluate submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 leading-relaxed">
              Follow live activity, review answers, and publish final results.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
