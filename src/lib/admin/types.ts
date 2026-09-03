// Core type definitions for Admin Dashboard

export type UserRole = "admin" | "teacher" | "student";
export type UserStatus = "active" | "deactivated" | "suspended";
export type ExamStatus = "draft" | "scheduled" | "published" | "completed";
export type PaymentStatus = "success" | "pending" | "failed";
export type SubscriptionTier = "free" | "pro" | "institutional";
export type FeatureCategory = "ai" | "security" | "system";
export type QuestionType = "mcq" | "true_false" | "short_answer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  lastActive?: string;
  department?: string;
  studentId?: string;
  teacherId?: string;
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
  schedule: {
    startWindow: string;
    endWindow: string;
  };
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  enrolledCount: number;
  completedCount: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  subject: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: FeatureCategory;
  lastModified: string;
  modifiedBy: string;
}

export interface PermissionScope {
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}

export interface PermissionMatrix {
  role: string;
  permissions: Record<string, PermissionScope>;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tier: SubscriptionTier;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number;
  currency: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  invoiceUrl?: string;
  createdAt: string;
  processedAt?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  category: "general" | "email" | "security" | "limits";
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AnalyticsData {
  systemHealth: {
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    apiLatency: number;
    activeConnections: number;
  }[];
  examStats: {
    totalExams: number;
    publishedExams: number;
    scheduledExams: number;
    draftExams: number;
    completedExams: number;
    passRate: number;
    averageScore: number;
    completionRate: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    dailyActiveUsers: { date: string; count: number }[];
    retentionRate: number;
    averageSessionDuration: number;
  };
  examPerformance: {
    subject: string;
    passCount: number;
    failCount: number;
    averageScore: number;
  }[];
}

export interface FilterState {
  search: string;
  status?: UserStatus | ExamStatus | PaymentStatus;
  role?: UserRole;
  tier?: SubscriptionTier;
  category?: FeatureCategory;
  type?: string;
  difficulty?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface ActionMenuItem<T = unknown> {
  label?: string;
  icon?: React.ReactNode;
  onClick?: (item: T) => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}
