"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { AdminTable } from "@/components/admin/shared/AdminTable";
import { AdminCard, StatCard } from "@/components/admin/shared/AdminCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useFilterState } from "@/lib/admin/url-state";
import { getStatusColor, formatRelativeTime, cn } from "@/lib/admin/utils";
import { examService } from "@/services/exam.service";
import {
  Exam,
  ExamStatus,
  TableColumn,
  ActionMenuItem,
} from "@/lib/admin/types";

export default function AdminExamsPage() {
  const {
    filters,
    updateFilter,
    updateFilters,
    updateSearch,
    updatePagination,
  } = useFilterState({
    status: undefined,
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examModal, setExamModal] = useState<{
    type: "create" | "edit";
    exam?: Exam;
  } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    examService
      .getAllExams()
      .then((res) => {
        if (isMounted && res.data) {
          const list: Exam[] = res.data.map((item: any) => ({
            id: String(item._id),
            title: item.title,
            subject: item.subject || item.category || "General",
            status: (item.status || "published").toLowerCase() as ExamStatus,
            durationMinutes: item.durationMinutes || 60,
            totalMarks: item.totalMarks || 50,
            passMark: Math.round((item.totalMarks || 50) * (item.passPercentage || 40) / 100),
            questionCount: item.questions?.length || 0,
            enrolledCount: item.enrolledCount || 0,
            completedCount: item.completedCount || 0,
            schedule: {
              startWindow: item.createdAt || new Date().toISOString(),
              endWindow: item.updatedAt || new Date().toISOString(),
            },
            createdBy: item.createdBy || "Instructor",
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
          }));
          setExams(list);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    if (filters.status && exam.status !== filters.status) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        exam.title.toLowerCase().includes(search) ||
        exam.subject.toLowerCase().includes(search) ||
        exam.createdBy.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Pagination
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedExams = filteredExams.slice(
    startIndex,
    startIndex + filters.pageSize,
  );

  // Stats
  const stats = {
    total: exams.length,
    published: exams.filter((e) => e.status === "published").length,
    scheduled: exams.filter((e) => e.status === "scheduled").length,
    draft: exams.filter((e) => e.status === "draft").length,
  };

  // Table columns
  const columns: TableColumn<Exam>[] = [
    {
      key: "title",
      header: "Exam",
      sortable: true,
      render: (value, exam) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {exam.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {exam.subject}
          </p>
        </div>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">{String(value || "")}</span>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (_, exam) => (
        <div className="text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {new Date(exam.schedule.startWindow).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <Clock className="h-3 w-3" />
            {new Date(exam.schedule.startWindow).toLocaleTimeString()} -{" "}
            {new Date(exam.schedule.endWindow).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: "durationMinutes",
      header: "Duration",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Clock className="h-3 w-3" />
          {String(value || 0)} min
        </div>
      ),
    },
    {
      key: "enrolledCount",
      header: "Enrolled",
      sortable: true,
      render: (_, exam) => (
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Users className="h-3 w-3" />
          {exam.enrolledCount} / {exam.completedCount}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => {
        const str = String(value || "");
        return (
          <Badge className={getStatusColor(str)}>
            {str ? str.charAt(0).toUpperCase() + str.slice(1) : ""}
          </Badge>
        );
      },
    },
  ];

  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDuration, setFormDuration] = useState("60");
  const [formMarks, setFormMarks] = useState("50");
  const [formStatus, setFormStatus] = useState<ExamStatus>("draft");

  const openCreateModal = () => {
    setFormTitle("");
    setFormSubject("General");
    setFormDuration("60");
    setFormMarks("50");
    setFormStatus("draft");
    setExamModal({ type: "create" });
  };

  const openEditModal = (exam: Exam) => {
    setFormTitle(exam.title);
    setFormSubject(exam.subject);
    setFormDuration(String(exam.durationMinutes));
    setFormMarks(String(exam.totalMarks));
    setFormStatus(exam.status);
    setExamModal({ type: "edit", exam });
  };

  const handleSaveExam = () => {
    if (!formTitle.trim()) return;

    const duration = Number(formDuration) || 60;
    const totalMarks = Number(formMarks) || 50;
    const passMark = Math.round((totalMarks * 40) / 100);

    if (examModal?.type === "create") {
      const newExam: Exam = {
        id: `exam_${Date.now()}`,
        title: formTitle,
        subject: formSubject || "General",
        status: formStatus,
        durationMinutes: duration,
        totalMarks: totalMarks,
        passMark: passMark,
        questionCount: 0,
        enrolledCount: 0,
        completedCount: 0,
        schedule: {
          startWindow: new Date().toISOString(),
          endWindow: new Date(Date.now() + 86400000).toISOString(),
        },
        createdBy: "Administrator",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setExams((prev) => [newExam, ...prev]);
    } else if (examModal?.type === "edit" && examModal.exam) {
      const updatedId = examModal.exam.id;
      setExams((prev) =>
        prev.map((e) =>
          e.id === updatedId
            ? {
                ...e,
                title: formTitle,
                subject: formSubject,
                durationMinutes: duration,
                totalMarks: totalMarks,
                passMark: passMark,
                status: formStatus,
                updatedAt: new Date().toISOString(),
              }
            : e
        )
      );
    }
    setExamModal(null);
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Action menu items
  const getActionMenuItems = (exam: Exam): ActionMenuItem<Exam>[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (e) => setSelectedExam(e),
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (e) => openEditModal(e),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (e) => handleDeleteExam(e.id),
      danger: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Exam Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create, schedule, and manage platform examinations
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Exams" value={stats.total} icon={BookOpen} />
        <StatCard
          title="Published"
          value={stats.published}
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Drafts"
          value={stats.draft}
          icon={Clock}
          iconColor="text-slate-600 dark:text-slate-400"
        />
      </div>

      {/* Table */}
      <AdminTable
        data={paginatedExams}
        columns={columns}
        filters={filters}
        onFilterChange={updateFilters}
        total={filteredExams.length}
        actionMenuItems={getActionMenuItems}
        emptyMessage="No exams found"
      />

      {/* Exam Details Modal */}
      {selectedExam && (
        <Modal
          isOpen={!!selectedExam}
          onClose={() => setSelectedExam(null)}
          title="Exam Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedExam.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedExam.subject}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Duration
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedExam.durationMinutes} minutes
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Total Marks
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedExam.totalMarks}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Pass Mark
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedExam.passMark}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Questions
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedExam.questionCount}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedExam(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Exam Modal */}
      {examModal && (
        <Modal
          isOpen={!!examModal}
          onClose={() => setExamModal(null)}
          title={examModal.type === "create" ? "Create New Exam" : "Edit Exam"}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Exam Title
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter exam title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Subject
              </label>
              <Input
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Total Marks
                </label>
                <Input
                  type="number"
                  value={formMarks}
                  onChange={(e) => setFormMarks(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Status
              </label>
              <Select
                value={formStatus}
                onChange={(val: any) => setFormStatus((val?.target?.value || val) as ExamStatus)}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "published", label: "Published" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setExamModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveExam}>
                {examModal.type === "create" ? "Create Exam" : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
