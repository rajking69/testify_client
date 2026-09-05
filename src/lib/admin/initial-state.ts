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

// Clean initial empty state for live API data
export const initialUsers: User[] = [];
export const initialExams: Exam[] = [];
export const initialQuestions: Question[] = [];
export const initialFeatureFlags: FeatureFlag[] = [];
export const initialPermissionMatrix: PermissionMatrix[] = [];
export const initialSubscriptions: Subscription[] = [];
export const initialPayments: Payment[] = [];
export const initialSystemConfig: SystemConfig[] = [];
export const initialAnalyticsData: AnalyticsData = {
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

// Aliases for backward compatibility during transition
export const mockUsers = initialUsers;
export const mockExams = initialExams;
export const mockQuestions = initialQuestions;
export const mockFeatureFlags = initialFeatureFlags;
export const mockPermissionMatrix = initialPermissionMatrix;
export const mockSubscriptions = initialSubscriptions;
export const mockPayments = initialPayments;
export const mockSystemConfig = initialSystemConfig;
export const mockAnalyticsData = initialAnalyticsData;
