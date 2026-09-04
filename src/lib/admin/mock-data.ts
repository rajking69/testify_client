import {
  User,
  Exam,
  Question,
  FeatureFlag,
  PermissionMatrix,
  Subscription,
  Payment,
  SystemConfig,
  AnalyticsData,
} from "./types";

// Empty arrays for production / clean live state
export const mockUsers: User[] = [];
export const mockExams: Exam[] = [];
export const mockQuestions: Question[] = [];
export const mockFeatureFlags: FeatureFlag[] = [];
export const mockPermissionMatrix: PermissionMatrix[] = [];
export const mockSubscriptions: Subscription[] = [];
export const mockPayments: Payment[] = [];
export const mockSystemConfig: SystemConfig[] = [];
export const mockAnalyticsData: AnalyticsData = {
  systemHealth: [],
  examStats: {
    totalExams: 0,
    publishedExams: 0,
    scheduledExams: 0,
    draftExams: 0,
    completedExams: 0,
    passRate: 0,
    averageScore: 0,
    completionRate: 0,
  },
  userStats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    dailyActiveUsers: [],
    retentionRate: 0,
    averageSessionDuration: 0,
  },
  examPerformance: [],
};