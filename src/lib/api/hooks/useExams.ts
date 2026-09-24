"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

/**
 * Exam Types (shared with backend)
 */
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
  accessType: "FREE" | "PAID" | "SUBSCRIPTION_ONLY" | "free" | "paid" | "subscription_only";
  price?: number;
  startDateTime?: string;
  endDateTime?: string;
  date?: string;
  joinCode?: string;
  accessToken?: string;
  questions: any[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "draft" | "published" | "scheduled" | "completed";
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

export interface GetExamsParams {
  category?: string;
  subject?: string;
  accessType?: string;
  teacherId?: string;
  teacherEmail?: string;
  mine?: boolean;
  isPublished?: boolean;
  search?: string;
}

/**
 * Exam Queries
 */
export function usePublicExams(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ["exams", "public", params],
    queryFn: () => apiClient.get<{ success: boolean; count: number; data: ExamItem[] }>("/exams/public", {
      // Note: params would need to be passed as query string
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllExams(params?: GetExamsParams) {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.subject) queryParams.append("subject", params.subject);
  if (params?.accessType) queryParams.append("accessType", params.accessType);
  if (params?.teacherId) queryParams.append("teacherId", params.teacherId);
  if (params?.teacherEmail) queryParams.append("teacherEmail", params.teacherEmail);
  if (params?.mine) queryParams.append("mine", "true");
  if (params?.isPublished !== undefined) queryParams.append("isPublished", String(params.isPublished));
  if (params?.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/exams?${queryString}` : "/exams";

  return useQuery({
    queryKey: ["exams", "all", params],
    queryFn: () => apiClient.get<{ success: boolean; count: number; data: ExamItem[] }>(endpoint),
    staleTime: 2 * 60 * 1000,
  });
}

export function useExamById(id: string) {
  return useQuery({
    queryKey: ["exams", "detail", id],
    queryFn: () => apiClient.get<{ success: boolean; data: ExamItem }>(`/exams/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: ["exams", "my-submissions"],
    queryFn: () => apiClient.get<{ success: boolean; count: number; data: ExamSubmission[] }>("/exams/my/submissions"),
    staleTime: 1 * 60 * 1000,
  });
}

export function useMyPurchases() {
  return useQuery({
    queryKey: ["exams", "my-purchases"],
    queryFn: () => apiClient.get<{ success: boolean; count: number; data: any[] }>("/exams/my/purchases"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeacherSubmissions() {
  return useQuery({
    queryKey: ["exams", "teacher-submissions"],
    queryFn: () => apiClient.get<{ success: boolean; count: number; data: any[] }>("/teacher/submissions/all"),
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Exam Mutations
 */
export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => apiClient.post<{ success: boolean; message: string; data: ExamItem }>("/exams", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams", "all"] });
      queryClient.invalidateQueries({ queryKey: ["exams", "public"] });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; payload: any }>({
    mutationFn: ({ id, payload }) => 
      apiClient.patch<{ success: boolean; message: string; data: ExamItem }>(`/exams/${id}`, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["exams", "all"] });
      queryClient.invalidateQueries({ queryKey: ["exams", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["exams", "public"] });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ success: boolean; message: string; data: any }>(`/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams", "all"] });
      queryClient.invalidateQueries({ queryKey: ["exams", "public"] });
    },
  });
}

export function usePurchaseExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentDetails }: { id: string; paymentDetails?: any }) => 
      apiClient.post<{ success: boolean; message: string; data: any }>(`/exams/${id}/purchase`, paymentDetails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams", "my-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["exams", "all"] });
    },
  });
}

export function useSubmitExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, 
      answers, 
      timeTakenSeconds 
    }: { 
      id: string; 
      answers: Array<{ questionId: string; selectedOptionIndex?: number; submittedAnswer?: string }>;
      timeTakenSeconds?: number;
    }) => apiClient.post<{ success: boolean; message: string; data?: ExamSubmission; result?: any }>(
      `/exams/${id}/submit`, 
      { answers, timeTakenSeconds }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams", "my-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["exams", "teacher-submissions"] });
    },
  });
}

export function useStartExamAttempt() {
  return useMutation({
    mutationFn: (id: string) => apiClient.post<{ success: boolean; message: string }>(`/exams/${id}/start`),
  });
}

export function useExamHeartbeat() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiClient.post<{ success: boolean; remainingSeconds: number; isExpired: boolean }>(`/exams/${id}/heartbeat`, data),
  });
}

/**
 * Live Monitoring Query
 */
export function useLiveMonitoring(examId: string) {
  return useQuery({
    queryKey: ["exams", "live-monitoring", examId],
    queryFn: () => apiClient.get<{ success: boolean; data: any }>(`/teacher/exams/${examId}/live-monitoring`),
    enabled: !!examId,
    refetchInterval: 5000, // Poll every 5 seconds for live data
    staleTime: 0,
  });
}

export function useSubmissionTranscript(submissionId: string) {
  return useQuery({
    queryKey: ["exams", "transcript", submissionId],
    queryFn: () => apiClient.get<{ success: boolean; data: any }>(`/submissions/${submissionId}/transcript`),
    enabled: !!submissionId,
  });
}