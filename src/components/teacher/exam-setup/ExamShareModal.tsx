"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Mail,
  Sparkles,
  QrCode,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { getShareableExamUrl } from "@/lib/exam-access";

interface ExamShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: {
    id: string;
    title: string;
    subject: string;
    duration: number;
    totalMarks: number;
    passMark: number;
    status: string;
    joinCode?: string;
    accessToken?: string;
  };
}

export function ExamShareModal({
  isOpen,
  onClose,
  exam,
}: ExamShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const shareToken = exam.accessToken || exam.joinCode || exam.id;
  const shareUrl = getShareableExamUrl(shareToken);
  const joinCode = exam.joinCode || "CSE7K29";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const shareMessage = `Join my exam "${exam.title}" on Testify!\nSubject: ${exam.subject}\nJoin Code: ${joinCode}\nDirect Link: ${shareUrl}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const handleShareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`Testify Exam: ${exam.title}`)}&body=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share & Access Examination"
      description={`Share this live examination paper for ${exam.subject} with your enrolled students.`}
      size="md"
    >
      <div className="space-y-5 pt-1">
        {/* Success Header Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Examination Room Active
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">
                {exam.status}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-0.5">
              Unique room identity and secure tokens are generated for this exam.
            </p>
          </div>
        </div>

        {/* 1. Human-Friendly Unique Join Code */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Unique Room / Join Code
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-[#0092E3] dark:text-cyan-400 selection:bg-[#0092E3] selection:text-white">
              {joinCode}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="font-bold text-xs"
              leftIcon={copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copiedCode ? "Copied!" : "Copy Code"}
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Students can enter this code in the <strong>Join Exam</strong> portal to enter directly.
          </p>
        </div>

        {/* 2. Direct Shareable Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Direct Shareable Exam Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none select-all"
            />
            <Button
              type="button"
              onClick={handleCopyLink}
              className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold text-xs shrink-0"
              leftIcon={copiedLink ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copiedLink ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>

        {/* 3. One-Click Social & Classroom Distribution */}
        <div className="space-y-2 pt-1">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Share Channels
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleShareWhatsApp}
              className="bg-white hover:bg-emerald-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400"
              leftIcon={<MessageCircle className="h-4 w-4 text-emerald-600" />}
            >
              WhatsApp
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleShareEmail}
              className="bg-white hover:bg-blue-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-700 dark:text-blue-400"
              leftIcon={<Mail className="h-4 w-4 text-blue-600" />}
            >
              Email Invite
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(shareUrl, "_blank")}
              className="bg-white hover:bg-purple-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold text-purple-700 dark:text-purple-400 sm:col-span-1 col-span-2"
              leftIcon={<ExternalLink className="h-4 w-4 text-purple-600" />}
            >
              Preview Exam Room
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose} className="font-bold text-xs">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
