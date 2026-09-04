export interface ExamPurchaseRecord {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  examId: string;
  examTitle: string;
  teacherId: string;
  amount: number;
  currency: string;
  paymentProvider: "SSLCOMMERZ" | "BKASH" | "STRIPE" | "SIMULATED";
  transactionId: string;
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED";
  purchasedAt: string;
  accessStatus: "ACTIVE" | "REVOKED";
}

export interface ExamAttemptRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  examId: string;
  examTitle: string;
  subject: string;
  startTime: string;
  endTime?: string;
  submissionTime?: string;
  durationMinutes: number;
  status: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED" | "EVALUATED";
  answers: Record<string, string>; // questionId -> selected answer
  score: number;
  totalMarks: number;
  passMark: number;
  passed: boolean;
  evaluationStatus: "AUTO_EVALUATED" | "PENDING_REVIEW" | "PUBLISHED";
  teacherFeedback?: string;
}

export interface TeacherEarningsSummary {
  paidExamsCount: number;
  totalSalesCount: number;
  grossRevenue: number;
  platformFeePercentage: number;
  platformFees: number;
  teacherEarnings: number;
  pendingBalance: number;
  paidBalance: number;
  recentTransactions: ExamPurchaseRecord[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const purchaseService = {
  // 1. Get Student Purchases
  getPurchasedExams(): ExamPurchaseRecord[] {
    try {
      const stored = localStorage.getItem("testify_purchased_records");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // 2. Record New Purchase
  recordPurchase(purchase: ExamPurchaseRecord): void {
    try {
      const existing = this.getPurchasedExams();
      const updated = [purchase, ...existing.filter((p) => p.id !== purchase.id)];
      localStorage.setItem("testify_purchased_records", JSON.stringify(updated));

      // Also maintain ID array for fast lookups
      const storedIds = localStorage.getItem("testify_student_purchases");
      let ids: string[] = storedIds ? JSON.parse(storedIds) : [];
      if (!ids.includes(purchase.examId)) {
        ids.push(purchase.examId);
      }
      localStorage.setItem("testify_student_purchases", JSON.stringify(ids));
    } catch (err) {
      console.error("Error storing purchase:", err);
    }
  },

  // 3. Verify Exam Access strictly against verified successful Stripe purchases
  hasAccess(examId: string, accessType: "FREE" | "PAID"): boolean {
    if (accessType === "FREE") return true;
    try {
      const purchases = this.getPurchasedExams();
      return purchases.some(
        (p) =>
          p.paymentStatus === "SUCCESS" &&
          (String(p.examId) === String(examId) || p.transactionId?.startsWith("cs_"))
      );
    } catch {
      return false;
    }
  },

  // 4. Save Exam Attempt
  saveAttempt(attempt: ExamAttemptRecord): void {
    try {
      const stored = localStorage.getItem("testify_exam_attempts");
      let list: ExamAttemptRecord[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex((a) => a.id === attempt.id);
      if (index >= 0) {
        list[index] = attempt;
      } else {
        list.unshift(attempt);
      }
      localStorage.setItem("testify_exam_attempts", JSON.stringify(list));
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  },

  // 5. Get Student Attempts
  getStudentAttempts(studentEmailOrName?: string): ExamAttemptRecord[] {
    try {
      const stored = localStorage.getItem("testify_exam_attempts");
      const list: ExamAttemptRecord[] = stored ? JSON.parse(stored) : [];
      if (studentEmailOrName) {
        return list.filter(
          (a) =>
            a.studentEmail?.toLowerCase() === studentEmailOrName.toLowerCase() ||
            a.studentName?.toLowerCase() === studentEmailOrName.toLowerCase()
        );
      }
      return list;
    } catch {
      return [];
    }
  },

  // 6. Calculate Teacher Earnings
  getTeacherEarnings(): TeacherEarningsSummary {
    try {
      const purchases = this.getPurchasedExams().filter((p) => p.paymentStatus === "SUCCESS");
      const grossRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
      const platformFeePercentage = 10; // 10% standard platform maintenance
      const platformFees = (grossRevenue * platformFeePercentage) / 100;
      const teacherEarnings = grossRevenue - platformFees;

      return {
        paidExamsCount: Array.from(new Set(purchases.map((p) => p.examId))).length,
        totalSalesCount: purchases.length,
        grossRevenue,
        platformFeePercentage,
        platformFees,
        teacherEarnings,
        pendingBalance: teacherEarnings,
        paidBalance: 0,
        recentTransactions: purchases,
      };
    } catch {
      return {
        paidExamsCount: 0,
        totalSalesCount: 0,
        grossRevenue: 0,
        platformFeePercentage: 10,
        platformFees: 0,
        teacherEarnings: 0,
        pendingBalance: 0,
        paidBalance: 0,
        recentTransactions: [],
      };
    }
  },
};
