import { apiClient } from "@/lib/apiClient";

export const studentService = {
  getDashboardStats: async () => {
    return apiClient.get("/student/dashboard-stats");
  },
};
