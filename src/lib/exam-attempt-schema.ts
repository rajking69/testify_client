export const examAttemptStatuses = [
  "in-progress",
  "submitted",
  "auto-submitted",
  "abandoned",
] as const;

export type ExamAttemptStatus = (typeof examAttemptStatuses)[number];

export type AttemptAnswerValue = string | string[] | number | boolean | null;

export interface ExamAttemptAnswer {
  questionId: string;
  answer: AttemptAnswerValue;
  isMarkedForReview: boolean;
  answeredAt?: Date | null;
  pointsAwarded?: number | null;
  maxPoints: number;
  teacherFeedback?: string | null;
}

export const examViolationTypes = [
  "tab-switch",
  "fullscreen-exit",
  "copy-attempt",
  "paste-attempt",
  "window-blur",
] as const;

export type ExamViolationType = (typeof examViolationTypes)[number];

export interface ExamAttemptViolation {
  type: ExamViolationType;
  occurredAt: Date;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ExamAttemptRecord {
  id: string;
  examId: string;
  studentId: string;
  attemptNumber: number;
  status: ExamAttemptStatus;
  answers: ExamAttemptAnswer[];
  violations: ExamAttemptViolation[];
  startedAt: Date;
  lastSavedAt: Date;
  expiresAt?: Date | null;
  submittedAt?: Date | null;
  gradedAt?: Date | null;
  score?: number | null;
  totalPoints: number;
  percentage?: number | null;
  createdAt: Date;
  updatedAt: Date;
}