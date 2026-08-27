export const examStatuses = [
  "draft",
  "scheduled",
  "published",
  "completed",
] as const;

export type ExamStatus = (typeof examStatuses)[number];

export interface ExamSchedule {
  startWindow: Date;
  endWindow: Date;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  createdBy: string;
  durationMinutes: number;
  totalMarks: number;
  passMark: number;
  status: ExamStatus;
  schedule: ExamSchedule;
  createdAt: Date;
  updatedAt: Date;
  questionCount: number;
  enrolledCount: number;
  completedCount: number;
}

export type ExamInput = Omit<
  Exam,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "questionCount"
  | "enrolledCount"
  | "completedCount"
>;

export type ExamUpdateInput = Partial<
  Omit<Exam, "id" | "createdBy" | "createdAt" | "updatedAt">
>;

export function isExamStatus(value: unknown): value is ExamStatus {
  return (
    typeof value === "string" &&
    examStatuses.includes(value as ExamStatus)
  );
}

export function isExam(value: unknown): value is Exam {
  if (!value || typeof value !== "object") {
    return false;
  }

  const exam = value as Partial<Exam>;
  const schedule = exam.schedule;

  return (
    isNonEmptyString(exam.id) &&
    isNonEmptyString(exam.title) &&
    isNonEmptyString(exam.subject) &&
    isNonEmptyString(exam.createdBy) &&
    isPositiveInteger(exam.durationMinutes) &&
    isNonNegativeNumber(exam.totalMarks) &&
    isNonNegativeNumber(exam.passMark) &&
    exam.passMark <= exam.totalMarks &&
    isExamStatus(exam.status) &&
    !!schedule &&
    schedule.startWindow instanceof Date &&
    !Number.isNaN(schedule.startWindow.getTime()) &&
    schedule.endWindow instanceof Date &&
    !Number.isNaN(schedule.endWindow.getTime()) &&
    schedule.startWindow < schedule.endWindow &&
    exam.createdAt instanceof Date &&
    !Number.isNaN(exam.createdAt.getTime()) &&
    exam.updatedAt instanceof Date &&
    !Number.isNaN(exam.updatedAt.getTime()) &&
    isNonNegativeInteger(exam.questionCount) &&
    isNonNegativeInteger(exam.enrolledCount) &&
    isNonNegativeInteger(exam.completedCount) &&
    exam.completedCount <= exam.enrolledCount
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return isNonNegativeNumber(value) && Number.isInteger(value);
}