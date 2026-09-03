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
import { mockExams } from "@/lib/admin/mock-data";
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

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examModal, setExamModal] = useState<{
    type: "create" | "edit";
    exam?: Exam;
  } | null>(null);

  // Filter exams
  const filteredExams = mockExams.filter((exam) => {
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
    total: mockExams.length,
    published: mockExams.filter((e) => e.status === "published").length,
    scheduled: mockExams.filter((e) => e.status === "scheduled").length,
    draft: mockExams.filter((e) => e.status === "draft").length,
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
      onClick: (e) => setExamModal({ type: "edit", exam: e }),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (e) => console.log("Delete exam", e.id),
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
        <Button onClick={() => setExamModal({ type: "create" })}>
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
                defaultValue={examModal.exam?.title}
                placeholder="Enter exam title"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Subject
              </label>
              <Input
                defaultValue={examModal.exam?.subject}
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
                  defaultValue={examModal.exam?.durationMinutes}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Total Marks
                </label>
                <Input
                  type="number"
                  defaultValue={examModal.exam?.totalMarks}
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Status
              </label>
              <Select
                defaultValue={examModal.exam?.status || "draft"}
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
              <Button>
                {examModal.type === "create" ? "Create Exam" : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
