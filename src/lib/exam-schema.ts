export const examStatuses = [
  "draft",
  "scheduled",
  "published",
] as const;

export type ExamStatus = (typeof examStatuses)[number];

export const examAccessTypes = [
  "free",
  "paid",
  "subscription_only",
] as const;

export type ExamAccessType = (typeof examAccessTypes)[number];

export interface ExamSchedule {
  startWindow?: Date;
  endWindow?: Date;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
  correctAnswer?: string;
  marks: number;
  explanation?: string;
}

export interface Exam {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  accessType: ExamAccessType;
  status: ExamStatus;
  price: number;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  questions: Question[];
  isPublished: boolean;
  totalEnrolled: number;
  completedCount: number;
  joinCode?: string;
  accessToken?: string;
  schedule?: ExamSchedule;
  startDateTime?: string;
  endDateTime?: string;
  date?: string;
  requireCamera?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ExamInput = Partial<
  Omit<Exam, "id" | "_id" | "createdAt" | "updatedAt" | "totalEnrolled" | "completedCount">
>;

export type ExamUpdateInput = Partial<
  Omit<Exam, "id" | "_id" | "teacherId" | "createdAt" | "updatedAt">
>;

export function isExamStatus(value: unknown): value is ExamStatus {
  return (
    typeof value === "string" &&
    examStatuses.includes(value as ExamStatus)
  );
}

export function isExamAccessType(value: unknown): value is ExamAccessType {
  return (
    typeof value === "string" &&
    examAccessTypes.includes(value as ExamAccessType)
  );
}

export function isExam(value: unknown): value is Exam {
  if (!value || typeof value !== "object") {
    return false;
  }

  const exam = value as Partial<Exam>;

  return (
    isNonEmptyString(exam.title) &&
    isNonEmptyString(exam.category) &&
    isNonEmptyString(exam.teacherId) &&
    isNonEmptyString(exam.teacherName) &&
    isNonEmptyString(exam.teacherEmail) &&
    isPositiveInteger(exam.durationMinutes) &&
    isNonNegativeNumber(exam.totalMarks) &&
    isNonNegativeNumber(exam.passMarks) &&
    exam.passMarks <= exam.totalMarks &&
    isExamStatus(exam.status) &&
    isExamAccessType(exam.accessType) &&
    exam.createdAt instanceof Date &&
    !Number.isNaN(exam.createdAt.getTime()) &&
    exam.updatedAt instanceof Date &&
    !Number.isNaN(exam.updatedAt.getTime()) &&
    isNonNegativeInteger(exam.totalEnrolled) &&
    isNonNegativeInteger(exam.completedCount) &&
    exam.completedCount <= exam.totalEnrolled
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