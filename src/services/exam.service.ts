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
  questions: any[];
  status: ExamStatus;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
    try {
      const res = await fetch(`${API_BASE_URL}/exams/public`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return await handleResponse<{ success: boolean; count: number; data: ExamItem[] }>(res);
    } catch {
      return { success: true, count: 0, data: [] };
    }
  },

  async getAllExams(): Promise<{ success: boolean; count: number; data: ExamItem[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return await handleResponse<{ success: boolean; count: number; data: ExamItem[] }>(res);
    } catch {
      return { success: true, count: 0, data: [] };
    }
  },

  async getExamById(id: string): Promise<{ success: boolean; data: ExamItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return await handleResponse<{ success: boolean; data: ExamItem }>(res);
    } catch {
      return { success: false, data: null as any };
    }
  },

  async createExam(payload: Partial<ExamItem>): Promise<{ success: boolean; message: string; data: ExamItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      return await handleResponse<{ success: boolean; message: string; data: ExamItem }>(res);
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to save exam to backend", data: null as any };
    }
  },

  async updateExam(id: string, payload: Partial<ExamItem>): Promise<{ success: boolean; message: string; data: ExamItem }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      return await handleResponse<{ success: boolean; message: string; data: ExamItem }>(res);
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to update exam on backend", data: null as any };
    }
  },

  async deleteExam(id: string): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return await handleResponse<{ success: boolean; message: string; data: any }>(res);
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to delete exam on backend", data: null };
    }
  },

  async purchaseExam(id: string, paymentDetails?: any): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/exams/${id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(paymentDetails || {}),
      });
      return await handleResponse<{ success: boolean; message: string; data: any }>(res);
    } catch (err: any) {
      return { success: false, message: err.message || "Exam purchase processed locally", data: null };
    }
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
    try {
      const res = await fetch(`${API_BASE_URL}/exams/my/submissions`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return await handleResponse<{ success: boolean; count: number; data: ExamSubmission[] }>(res);
    } catch {
      return { success: true, count: 0, data: [] };
    }
  },
};