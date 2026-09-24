import { API_BASE_URL } from "@/lib/api-config";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export interface PracticeSessionParams {
  category?: string;
  subject?: string;
  topic?: string;
  topics?: string[];
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  difficulties?: string[];
  count?: number;
}

export const practiceService = {
  async startSession(params: PracticeSessionParams): Promise<{ success: boolean; message: string; data: { session: any; questions: any[] } }> {
    const res = await fetch(`${API_BASE_URL}/practice/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params),
    });
    return handleResponse<{ success: boolean; message: string; data: { session: any; questions: any[] } }>(res);
  },

  async submitAnswer(sessionId: string, payload: { questionId: string; selectedOption?: string; selectedOptionIndex?: number; timeSpentSeconds?: number }): Promise<{ success: boolean; message: string; data: { isCorrect: boolean; explanation?: string; correctAnswer?: string } }> {
    const res = await fetch(`${API_BASE_URL}/practice/${sessionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: { isCorrect: boolean; explanation?: string; correctAnswer?: string } }>(res);
  },

  async finishSession(sessionId: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE_URL}/practice/${sessionId}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async getHistory(params: { page?: number; limit?: number } = {}): Promise<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: any[] }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));

    const res = await fetch(`${API_BASE_URL}/practice/history?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: any[] }>(res);
  },

  async getBookmarks(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE_URL}/practice/bookmarks`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: any[] }>(res);
  },

  async addBookmark(questionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/practice/bookmarks/${questionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async removeBookmark(questionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/practice/bookmarks/${questionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },
};