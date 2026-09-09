export type ExamAccessType = "FREE" | "SUBSCRIBED" | "PAID";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ExamItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  subject?: string;
  topic?: string;
  durationMinutes: number;
  totalMarks: number;
  passPercentage: number;
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
  createdBy: string;
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

import { API_BASE_URL } from "@/lib/api-config";

async function handleResponse<T>(res: Response): Promise<T> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok || (data && data.success === false)) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const examService = {
  async getPublicExams(): Promise<{ success: boolean; count: number; data: ExamItem[] }> {
    const res = await fetch(`${API_BASE_URL}/exams/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: ExamItem[] }>(res);
  },

  async getAllExams(): Promise<{ success: boolean; count: number; data: ExamItem[] }> {
    const res = await fetch(`${API_BASE_URL}/exams`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: ExamItem[] }>(res);
  },

  async getExamById(id: string): Promise<{ success: boolean; data: ExamItem }> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: ExamItem }>(res);
  },

  async createExam(payload: Partial<ExamItem>): Promise<{ success: boolean; message: string; data: ExamItem }> {
    const res = await fetch(`${API_BASE_URL}/exams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: ExamItem }>(res);
  },

  async updateExam(id: string, payload: Partial<ExamItem>): Promise<{ success: boolean; message: string; data: ExamItem }> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: ExamItem }>(res);
  },

  async deleteExam(id: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async purchaseExam(id: string, paymentDetails?: any): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(paymentDetails || {}),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async startExam(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.status === 403) {
      throw new Error("Access Denied: Teacher accounts are strictly forbidden from attempting examinations.");
    }
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async submitExam(id: string, answers: Array<{ questionId: string; submittedAnswer: string }>): Promise<{ success: boolean; message: string; data: ExamSubmission }> {
    const res = await fetch(`${API_BASE_URL}/exams/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ answers }),
    });
    if (res.status === 403) {
      throw new Error("Access Denied: Teacher accounts are strictly forbidden from submitting examination responses.");
    }
    return handleResponse<{ success: boolean; message: string; data: ExamSubmission }>(res);
  },

  async getMySubmissions(): Promise<{ success: boolean; count: number; data: ExamSubmission[] }> {
    const res = await fetch(`${API_BASE_URL}/exams/my/submissions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: ExamSubmission[] }>(res);
  },

  async getMyPurchases(): Promise<{ success: boolean; count: number; data: any[] }> {
    const res = await fetch(`${API_BASE_URL}/exams/my/purchases`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; data: any[] }>(res);
  },
};