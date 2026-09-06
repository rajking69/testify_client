export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "FILL_IN_THE_BLANK";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionStatus = "DRAFT" | "READY" | "ARCHIVED";

export interface QuestionItem {
  _id: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  correctOptionIndex?: number;
  explanation?: string;
  category: string;
  subject?: string;
  topic?: string;
  difficulty: QuestionDifficulty;
  marks: number;
  tags: string[];
  status: QuestionStatus;
  version?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetQuestionsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  questionType?: string;
  status?: string;
  sort?: string;
}

export interface GetQuestionsResponse {
  success: boolean;
  message?: string;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: QuestionItem[];
}

export interface QuestionPayload {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  correctOptionIndex?: number;
  explanation?: string;
  category?: string;
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  marks?: number;
  tags?: string[];
  status?: QuestionStatus;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const questionService = {
  async getQuestions(params: GetQuestionsParams = {}): Promise<GetQuestionsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.subject) query.append("subject", params.subject);
    if (params.topic) query.append("topic", params.topic);
    if (params.difficulty) query.append("difficulty", params.difficulty);
    if (params.questionType) query.append("questionType", params.questionType);
    if (params.status) query.append("status", params.status);
    if (params.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE_URL}/questions?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    return handleResponse<GetQuestionsResponse>(res);
  },

  async getQuestionById(id: string): Promise<{ success: boolean; data: QuestionItem }> {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; data: QuestionItem }>(res);
  },

  async createQuestion(payload: QuestionPayload): Promise<{ success: boolean; message: string; data: QuestionItem }> {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: QuestionItem }>(res);
  },

  async updateQuestion(id: string, payload: Partial<QuestionPayload>): Promise<{ success: boolean; message: string; data: QuestionItem }> {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: QuestionItem }>(res);
  },

  async toggleArchiveQuestion(id: string): Promise<{ success: boolean; message: string; data: QuestionItem }> {
    const res = await fetch(`${API_BASE_URL}/questions/${id}/archive`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string; data: QuestionItem }>(res);
  },

  async deleteQuestion(id: string): Promise<{ success: boolean; message: string; data: { id: string } }> {
    const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse<{ success: boolean; message: string; data: { id: string } }>(res);
  },

  async selectQuestionsForExam(payload: {
    mode: "manual" | "random";
    questionIds?: string[];
    count?: number;
    category?: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
    questionType?: string;
  }): Promise<{ success: boolean; message: string; data: QuestionItem[] }> {
    const res = await fetch(`${API_BASE_URL}/questions/select-for-exam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: QuestionItem[] }>(res);
  },
};
