"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QuestionItem, questionService } from "@/services/question.service";
import { examService } from "@/services/exam.service";
import { ExamHeaderSummary } from "@/components/teacher/exam-setup/ExamHeaderSummary";
import { ExamQuestionsTable } from "@/components/teacher/exam-setup/ExamQuestionsTable";
import { CreateQuestionModal } from "@/components/teacher/exam-setup/CreateQuestionModal";
import { BulkImportModal } from "@/components/teacher/exam-setup/BulkImportModal";
import { QuestionBankSelectorModal } from "@/components/teacher/exam-setup/QuestionBankSelectorModal";
import { PublishValidationModal } from "@/components/teacher/exam-setup/PublishValidationModal";
import { ExamShareModal } from "@/components/teacher/exam-setup/ExamShareModal";
import { generateJoinCode, generateAccessToken } from "@/lib/exam-access";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

interface ExamRecord {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  duration: number;
  totalMarks: number;
  passMark: number;
  studentsCount: number;
  status: "Published" | "Scheduled" | "Draft" | "Ready";
  joinCode?: string;
  accessToken?: string;
  questions?: QuestionItem[];
}

export default function ExamQuestionSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const router = useRouter();

  const [exam, setExam] = useState<ExamRecord | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Exam Record from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("testify_teacher_exams");
      if (stored) {
        const list: ExamRecord[] = JSON.parse(stored);
        const target = list.find((item) => String(item.id) === String(examId));
        if (target) {
          setExam(target);
          setQuestions(target.questions || []);
        } else {
          // If not in storage, create a default draft fallback
          const fallbackExam: ExamRecord = {
            id: examId,
            title: "Examination Paper",
            subject: "Computer Science",
            description: "Comprehensive mid-term evaluation assessment.",
            date: "Today, 3:00 PM",
            duration: 60,
            totalMarks: 50,
            passMark: 20,
            studentsCount: 0,
            status: "Draft",
            questions: [],
          };
          setExam(fallbackExam);
          setQuestions([]);
        }
      }
    } catch (err) {
      console.error("Error reading exam data:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [examId]);

  // Sync updated exam and questions back to localStorage
  const syncExamData = (updatedExam: ExamRecord, updatedQuestions: QuestionItem[]) => {
    setExam(updatedExam);
    setQuestions(updatedQuestions);

    try {
      const stored = localStorage.getItem("testify_teacher_exams");
      let list: ExamRecord[] = stored ? JSON.parse(stored) : [];

      const exists = list.some((item) => String(item.id) === String(updatedExam.id));
      if (exists) {
        list = list.map((item) =>
          String(item.id) === String(updatedExam.id)
            ? { ...updatedExam, questions: updatedQuestions }
            : item
        );
      } else {
        list.push({ ...updatedExam, questions: updatedQuestions });
      }

      localStorage.setItem("testify_teacher_exams", JSON.stringify(list));

      // Also sync to backend database if online
      try {
        examService.updateExam(updatedExam.id, {
          title: updatedExam.title,
          description: updatedExam.description,
          durationMinutes: updatedExam.duration,
          totalMarks: updatedExam.totalMarks,
          status: updatedExam.status === "Published" ? "PUBLISHED" : "DRAFT",
          questions: updatedQuestions,
        });
      } catch {}
    } catch (err) {
      console.error("Error saving exam state:", err);
    }
  };

  // 1. Single Question Save Handler
  const handleSaveSingleQuestion = async (savedQuestion: QuestionItem) => {
    if (!exam) return;

    let updatedQuestions: QuestionItem[];
    const isExisting = questions.some((q) => q._id === savedQuestion._id);

    if (isExisting) {
      updatedQuestions = questions.map((q) =>
        q._id === savedQuestion._id ? savedQuestion : q
      );
      showToast("Question updated successfully!");
    } else {
      updatedQuestions = [savedQuestion, ...questions];
      showToast("Question added to exam paper!");
    }

    const updatedExam: ExamRecord = {
      ...exam,
      questions: updatedQuestions,
    };

    syncExamData(updatedExam, updatedQuestions);

    // Also persist to backend repository if possible
    try {
      await questionService.createQuestion({
        questionText: savedQuestion.questionText,
        questionType: savedQuestion.questionType,
        options: savedQuestion.options,
        correctAnswer: savedQuestion.correctAnswer,
        explanation: savedQuestion.explanation,
        subject: exam.subject,
        topic: savedQuestion.topic,
        difficulty: savedQuestion.difficulty,
        marks: savedQuestion.marks,
        tags: savedQuestion.tags,
        status: "READY",
      });
    } catch {
      // Handled silently
    }
  };

  // 2. Bulk Questions Import Handler
  const handleBulkImportQuestions = (newQuestions: QuestionItem[]) => {
    if (!exam) return;

    const updatedQuestions = [...questions, ...newQuestions];
    const updatedExam: ExamRecord = {
      ...exam,
      questions: updatedQuestions,
    };

    syncExamData(updatedExam, updatedQuestions);
    showToast(`Successfully imported ${newQuestions.length} questions to exam!`);

    // Persist all to questionService
    newQuestions.forEach(async (q) => {
      try {
        await questionService.createQuestion({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          subject: exam.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          marks: q.marks,
          tags: q.tags,
          status: "READY",
        });
      } catch {}
    });
  };

  // 3. Question Bank Add Handler
  const handleAddFromQuestionBank = (selectedQuestions: QuestionItem[]) => {
    if (!exam) return;

    // Filter out duplicates
    const newItems = selectedQuestions.filter(
      (sq) => !questions.some((q) => q._id === sq._id)
    );

    const updatedQuestions = [...questions, ...newItems];
    const updatedExam: ExamRecord = {
      ...exam,
      questions: updatedQuestions,
    };

    syncExamData(updatedExam, updatedQuestions);
    showToast(`Added ${newItems.length} questions from Question Bank repository!`);
  };

  // 4. Remove Question Handler
  const handleRemoveQuestion = (questionId: string) => {
    if (!exam) return;

    const updatedQuestions = questions.filter((q) => q._id !== questionId);
    const updatedExam: ExamRecord = {
      ...exam,
      questions: updatedQuestions,
    };

    syncExamData(updatedExam, updatedQuestions);
    showToast("Question unlinked from exam paper.");
  };

  // 5. Update Exam Status Handler (Publishing)
  const handleUpdateStatus = (newStatus: "Published" | "Scheduled" | "Draft" | "Ready") => {
    if (!exam) return;

    const joinCode = exam.joinCode || generateJoinCode(exam.subject);
    const accessToken = exam.accessToken || generateAccessToken();

    const updatedExam: ExamRecord = {
      ...exam,
      status: newStatus,
      joinCode,
      accessToken,
      questions,
    };

    syncExamData(updatedExam, questions);
    showToast(`Exam status updated to "${newStatus}"!`);

    // If publishing or setting ready, open the Share & Access Modal immediately
    if (newStatus === "Published" || newStatus === "Ready" || newStatus === "Scheduled") {
      setIsShareOpen(true);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-slate-400 text-xs font-semibold animate-pulse">
          Loading exam question setup console...
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">
          Examination Not Found
        </h3>
        <p className="text-xs text-slate-500">
          The requested exam record could not be loaded.
        </p>
        <Link href="/teacher/exams">
          <Button className="bg-[#0092E3] text-white text-xs font-bold px-5">
            Return to Examinations List
          </Button>
        </Link>
      </div>
    );
  }

  const currentMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-16"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl bg-emerald-600 text-white text-xs font-bold border border-emerald-500 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Header Summary Card */}
      <ExamHeaderSummary
        exam={exam}
        totalQuestions={questions.length}
        currentMarks={currentMarks}
        onOpenPublishModal={() => setIsPublishOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
      />

      {/* Main Questions Management Table */}
      <ExamQuestionsTable
        questions={questions}
        onOpenCreateModal={() => {
          setEditingQuestion(null);
          setIsCreateOpen(true);
        }}
        onOpenBulkImportModal={() => setIsBulkImportOpen(true)}
        onOpenQuestionBankModal={() => setIsQuestionBankOpen(true)}
        onEditQuestion={(q) => {
          setEditingQuestion(q);
          setIsCreateOpen(true);
        }}
        onRemoveQuestion={handleRemoveQuestion}
        onReorderQuestions={(reordered) => {
          if (!exam) return;
          syncExamData({ ...exam, questions: reordered }, reordered);
        }}
      />

      {/* Modal 1: Create / Edit Single Question */}
      <CreateQuestionModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingQuestion(null);
        }}
        examSubject={exam.subject}
        editingQuestion={editingQuestion}
        onSaveQuestion={handleSaveSingleQuestion}
      />

      {/* Modal 2: Bulk Import Questions */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        examSubject={exam.subject}
        onImportQuestions={handleBulkImportQuestions}
      />

      {/* Modal 3: Select from Question Bank */}
      <QuestionBankSelectorModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        examSubject={exam.subject}
        alreadyAddedQuestionIds={questions.map((q) => q._id)}
        onAddSelectedQuestions={handleAddFromQuestionBank}
      />

      {/* Modal 4: Review & Publish Validation */}
      <PublishValidationModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        exam={exam}
        questions={questions}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Modal 5: Share & Room Code Modal */}
      <ExamShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        exam={exam}
      />
    </motion.div>
  );
}
