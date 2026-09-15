import { apiClient } from "@/lib/apiClient";

export type ExamAccessType = "FREE" | "SUBSCRIBED" | "PAID" | "free" | "paid" | "subscription_only";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "draft" | "published" | "scheduled" | "completed";

export interface ExamItem {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  category: string;
  subject?: string;
  topic?: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks?: number;
  passPercentage?: number;
  accessType: ExamAccessType;
  price?: number;
  startDateTime?: string;
  endDateTime?: string;
  date?: string;
  joinCode?: string;
  accessToken?: string;
  questions: any[];
  status: ExamStatus;
  isPublished?: boolean;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  createdBy?: string;
  totalEnrolled?: number;
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamSubmission {
  _id: string;
  examId: string;
  userId: string;
  answers: Array<{
    questionId: string;
    submittedAnswer: string;
    isCorrect?: boolean;
    marksObtained?: number;
  }>;
  score: number;
  totalMarks: number;
  passed: boolean;
  submittedAt: string;
}

export const examService = {
  async getPublicExams(): Promise<{ success: boolean; count: number; data: ExamItem[] }> {
    return apiClient.get("/exams/public");
  },

  async getAllExams(): Promise<{ success: boolean; count: number; data: ExamItem[] }> {
    return apiClient.get("/exams");
  },

  async getExamById(id: string): Promise<{ success: boolean; data: ExamItem }> {
    return apiClient.get(`/exams/${id}`);
  },

  async createExam(payload: any): Promise<{ success: boolean; message: string; data: ExamItem }> {
    return apiClient.post("/exams", payload);
  },

  async updateExam(id: string, payload: any): Promise<{ success: boolean; message: string; data: ExamItem }> {
    return apiClient.patch(`/exams/${id}`, payload);
  },

  async deleteExam(id: string): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.delete(`/exams/${id}`);
  },

  async purchaseExam(id: string, paymentDetails?: any): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post(`/exams/${id}/purchase`, paymentDetails || {});
  },

  async startExam(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/exams/${id}/start`);
  },

  async submitExam(
    id: string,
    answers: Array<{ questionId: string; selectedOptionIndex?: number; submittedAnswer?: string }>,
    timeTakenSeconds?: number
  ): Promise<{ success: boolean; message: string; data?: ExamSubmission; result?: any }> {
    return apiClient.post(`/exams/${id}/submit`, { answers, timeTakenSeconds });
  },

  async getMySubmissions(): Promise<{ success: boolean; count: number; data: ExamSubmission[] }> {
    return apiClient.get("/exams/my/submissions");
  },

  async getMyPurchases(): Promise<{ success: boolean; count: number; data: any[] }> {
    return apiClient.get("/exams/my/purchases");
  },
};