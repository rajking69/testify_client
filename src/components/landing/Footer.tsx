"use client";

import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B2238] text-slate-300 border-t border-[#183652] pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <Logo size={32} textClassName="text-white" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An AI-powered assessment operating system providing distraction-free testing for Students, rich question banks for Teachers, and campus-wide oversight for Administrators.
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              <span>Secure, modern assessment platform for schools, universities, and educators.</span>
            </div>
          </div>

          {/* Column 2: Role Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Role Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Student Exam Room</Link></li>
              <li><Link href="/teacher/dashboard" className="hover:text-white transition-colors">Teacher Workspace</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Oversight</Link></li>
              <li><Link href="/teacher/question-bank" className="hover:text-white transition-colors">Question Bank</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#features" className="hover:text-white transition-colors">All Features</Link></li>
              <li><Link href="#security" className="hover:text-white transition-colors">AI Proctoring &amp; Lockdown</Link></li>
              <li><Link href="#why-testify" className="hover:text-white transition-colors">Auto-Grading Engine</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing &amp; Plans</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Support &amp; Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Help Documentation</span></li>
              <li><span className="text-slate-400">Privacy Policy</span></li>
              <li><span className="text-slate-400">Terms of Service</span></li>
              <li><span className="text-slate-400">Accessibility Statement</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-[#183652] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Testify Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-slate-400" /> English (US)
            </span>
            <span>•</span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
