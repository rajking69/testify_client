export interface ExamPurchaseRecord {
  id: string; // Invoice Number (e.g. INV-20260905-001)
  transactionId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  examId: string;
  examTitle: string;
  teacherId: string;
  teacherName?: string;
  teacherEmail?: string;
  originalExamPrice: number;
  paidAmount: number;
  amount: number; // Backward compatibility with previous amount
  currency: string;
  paymentProvider: "SSLCOMMERZ" | "BKASH" | "STRIPE" | "SIMULATED" | "CARD";
  paymentMethod?: string;
  paymentTransactionId?: string;
  paymentStatus: "SUCCESS" | "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED";
  purchasedAt: string;
  purchaseDate?: string;
  createdAt?: string;
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

export interface ExamwiseRevenue {
  examId: string;
  examTitle: string;
  subject?: string;
  unitPrice: number;
  soldCount: number;
  grossRevenue: number;
  platformFee: number;
  netEarnings: number;
  status: string;
}

export interface TeacherEarningsSummary {
  paidExamsCount: number;
  totalSalesCount: number;
  grossRevenue: number;
  platformFeePercentage: number;
  platformFees: number;
  teacherEarnings: number;
  todayGrossRevenue: number;
  todayNetEarnings: number;
  monthGrossRevenue: number;
  monthNetEarnings: number;
  pendingBalance: number;
  paidBalance: number;
  examBreakdown: ExamwiseRevenue[];
  recentTransactions: ExamPurchaseRecord[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const purchaseService = {
  // 1. Get All Stored Purchases
  getPurchasedExams(): ExamPurchaseRecord[] {
    try {
      const stored = localStorage.getItem("testify_purchased_records");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // 1.1 Get Student Specific Purchases
  getStudentPurchases(studentEmail?: string, studentId?: string): ExamPurchaseRecord[] {
    try {
      const all = this.getPurchasedExams();
      if (!studentEmail && !studentId) return [];
      const queryEmail = (studentEmail || "").trim().toLowerCase();
      return all.filter((p) => {
        const pEmail = (p.studentEmail || "").trim().toLowerCase();
        const pId = p.studentId;
        const matchEmail = Boolean(queryEmail && pEmail && pEmail === queryEmail);
        const matchId = Boolean(studentId && pId && pId === studentId);
        return matchEmail || matchId;
      });
    } catch {
      return [];
    }
  },

  // 2. Record New Purchase (Idempotent: Local cache + Backend REST API persistence)
  async recordPurchase(purchase: ExamPurchaseRecord): Promise<void> {
    try {
      const existing = this.getPurchasedExams();
      
      // Ensure paidAmount and amount are aligned and preserved
      const finalPaidAmount = Number(purchase.paidAmount ?? purchase.amount ?? 0);
      const normalizedPurchase: ExamPurchaseRecord = {
        ...purchase,
        amount: finalPaidAmount,
        paidAmount: finalPaidAmount,
        originalExamPrice: purchase.originalExamPrice ?? finalPaidAmount,
        purchaseDate: purchase.purchaseDate || purchase.purchasedAt || new Date().toISOString(),
        purchasedAt: purchase.purchasedAt || purchase.purchaseDate || new Date().toISOString(),
        createdAt: purchase.createdAt || new Date().toISOString(),
        paymentStatus: purchase.paymentStatus === "PAID" ? "SUCCESS" : purchase.paymentStatus,
        paymentTransactionId: purchase.paymentTransactionId || purchase.transactionId,
        paymentMethod: purchase.paymentMethod || purchase.paymentProvider,
      };

      // Idempotency check: match by ID or Transaction ID or (studentEmail + examId + SUCCESS)
      const existingIndex = existing.findIndex(
        (p) =>
          (purchase.id && p.id === purchase.id) ||
          (purchase.transactionId && p.transactionId === purchase.transactionId) ||
          (p.studentEmail &&
            purchase.studentEmail &&
            p.studentEmail.trim().toLowerCase() === purchase.studentEmail.trim().toLowerCase() &&
            String(p.examId) === String(purchase.examId) &&
            p.paymentStatus === "SUCCESS")
      );

      let updated: ExamPurchaseRecord[];
      if (existingIndex >= 0) {
        // Update existing transaction while preserving historical paidAmount
        const currentRec = existing[existingIndex];
        updated = [...existing];
        updated[existingIndex] = {
          ...normalizedPurchase,
          id: currentRec.id || normalizedPurchase.id,
          paidAmount: currentRec.paidAmount ?? normalizedPurchase.paidAmount,
          amount: currentRec.amount ?? normalizedPurchase.amount,
        };
      } else {
        // Insert new purchase ledger record at the top
        updated = [normalizedPurchase, ...existing];
      }

      localStorage.setItem("testify_purchased_records", JSON.stringify(updated));

      // Also maintain ID array for fast lookups
      const storedIds = localStorage.getItem("testify_student_purchases");
      let ids: string[] = storedIds ? JSON.parse(storedIds) : [];
      if (!ids.includes(String(purchase.examId))) {
        ids.push(String(purchase.examId));
      }
      localStorage.setItem("testify_student_purchases", JSON.stringify(ids));

      // Dispatch global sync event for real-time reactive UI update
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("testify_exam_submitted"));
      }

      // Sync to Backend REST API server database
      try {
        await fetch(`${API_BASE_URL}/exams/${purchase.examId}/purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            studentId: normalizedPurchase.studentId,
            studentName: normalizedPurchase.studentName,
            studentEmail: normalizedPurchase.studentEmail,
            examId: normalizedPurchase.examId,
            examTitle: normalizedPurchase.examTitle,
            teacherId: normalizedPurchase.teacherId,
            teacherName: normalizedPurchase.teacherName,
            teacherEmail: normalizedPurchase.teacherEmail,
            originalExamPrice: normalizedPurchase.originalExamPrice,
            paidAmount: normalizedPurchase.paidAmount,
            amount: normalizedPurchase.paidAmount,
            currency: normalizedPurchase.currency || "USD",
            paymentProvider: normalizedPurchase.paymentProvider || "STRIPE",
            paymentMethod: normalizedPurchase.paymentMethod || "STRIPE",
            transactionId: normalizedPurchase.transactionId,
            paymentTransactionId: normalizedPurchase.paymentTransactionId,
            paymentStatus: normalizedPurchase.paymentStatus || "SUCCESS",
            purchasedAt: normalizedPurchase.purchasedAt,
            purchaseDate: normalizedPurchase.purchaseDate,
          }),
        });
      } catch (backendErr) {
        console.warn("Backend API sync warning (saved locally):", backendErr);
      }
    } catch (err) {
      console.error("Error storing purchase:", err);
    }
  },

  // 3. Verify Exam Access strictly against verified successful Stripe purchases
  hasAccess(examId: string, accessType: "FREE" | "PAID", studentEmail?: string, studentId?: string): boolean {
    if (accessType === "FREE") return true;
    try {
      const purchases = this.getPurchasedExams();
      return purchases.some((p) => {
        const isSuccess = p.paymentStatus === "SUCCESS" || (p.paymentStatus as string) === "PAID";
        const isExamMatch =
          String(p.examId) === String(examId) ||
          (p.transactionId && p.transactionId.startsWith("cs_") && String(p.examId) === String(examId));
        if (!isSuccess || !isExamMatch) return false;

        if (studentEmail || studentId) {
          const pEmail = (p.studentEmail || "").trim().toLowerCase();
          const qEmail = (studentEmail || "").trim().toLowerCase();
          const matchEmail = Boolean(qEmail && pEmail && pEmail === qEmail);
          const matchId = Boolean(studentId && p.studentId && p.studentId === studentId);
          return matchEmail || matchId;
        }
        return true;
      });
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

  // 6. Calculate Teacher Earnings strictly isolated by Teacher Identity
  getTeacherEarnings(teacherEmailOrId?: string, teacherExams: any[] = []): TeacherEarningsSummary {
    try {
      let purchases = this.getPurchasedExams().filter(
        (p) => p.paymentStatus === "SUCCESS" || (p.paymentStatus as string) === "PAID"
      );

      // Strictly isolate by teacher identity if provided
      if (teacherEmailOrId) {
        const queryLower = teacherEmailOrId.trim().toLowerCase();
        purchases = purchases.filter((p) => {
          const pTeacherId = (p.teacherId || "").trim().toLowerCase();
          const pTeacherEmail = (p.teacherEmail || "").trim().toLowerCase();
          const matchesDirect =
            (pTeacherId && (pTeacherId === queryLower || pTeacherId.includes(queryLower))) ||
            (pTeacherEmail && pTeacherEmail === queryLower);
          const matchesExam = teacherExams.some(
            (e) =>
              String(e.id || e._id || e.code) === String(p.examId) ||
              (e.title && p.examTitle && e.title.trim().toLowerCase() === p.examTitle.trim().toLowerCase())
          );
          return matchesDirect || matchesExam;
        });
      }

      // Deduplicate by transaction ID or ID to prevent double-counting
      const seen = new Set<string>();
      const dedupedPurchases: ExamPurchaseRecord[] = [];
      purchases.forEach((p) => {
        const key = p.transactionId || p.id;
        if (key && !seen.has(key)) {
          seen.add(key);
          const paid = Number(p.paidAmount ?? p.amount ?? 0);
          dedupedPurchases.push({
            ...p,
            paidAmount: paid,
            amount: paid,
          });
        }
      });
      purchases = dedupedPurchases;

      // Revenue calculations based strictly on immutable paidAmount of verified purchases
      const grossRevenue = purchases.reduce((sum, p) => sum + (p.paidAmount || p.amount || 0), 0);
      const platformFeePercentage = 40; // 40% Platform Fee
      const platformFees = (grossRevenue * platformFeePercentage) / 100;
      const teacherEarnings = grossRevenue - platformFees;

      // Time calculations
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      const todayPurchases = purchases.filter(
        (p) => new Date(p.purchaseDate || p.purchasedAt || Date.now()).getTime() >= startOfToday
      );
      const monthPurchases = purchases.filter(
        (p) => new Date(p.purchaseDate || p.purchasedAt || Date.now()).getTime() >= startOfMonth
      );

      const todayGrossRevenue = todayPurchases.reduce((sum, p) => sum + (p.paidAmount || p.amount || 0), 0);
      const todayNetEarnings = todayGrossRevenue * (1 - platformFeePercentage / 100);

      const monthGrossRevenue = monthPurchases.reduce((sum, p) => sum + (p.paidAmount || p.amount || 0), 0);
      const monthNetEarnings = monthGrossRevenue * (1 - platformFeePercentage / 100);

      // Exam-wise Revenue Breakdown
      const examMap = new Map<
        string,
        { examTitle: string; unitPrice: number; count: number; gross: number }
      >();

      // First populate from purchases
      purchases.forEach((p) => {
        const eId = String(p.examId);
        const itemPaid = p.paidAmount || p.amount || 0;
        const existing = examMap.get(eId);
        if (existing) {
          existing.count += 1;
          existing.gross += itemPaid;
        } else {
          examMap.set(eId, {
            examTitle: p.examTitle || "Certified Paid Exam",
            unitPrice: p.originalExamPrice || itemPaid,
            count: 1,
            gross: itemPaid,
          });
        }
      });

      // Also include active paid exams created by teacher even if 0 sales yet
      teacherExams.forEach((e) => {
        const eId = String(e.id || e._id || e.code);
        if (!examMap.has(eId) && (Number(e.price) > 0 || e.accessType === "PAID")) {
          examMap.set(eId, {
            examTitle: e.title || "Monetized Assessment",
            unitPrice: Number(e.price) || 0,
            count: 0,
            gross: 0,
          });
        }
      });

      const examBreakdown: ExamwiseRevenue[] = Array.from(examMap.entries()).map(([examId, item]) => {
        const pFee = (item.gross * platformFeePercentage) / 100;
        return {
          examId,
          examTitle: item.examTitle,
          unitPrice: item.unitPrice,
          soldCount: item.count,
          grossRevenue: item.gross,
          platformFee: pFee,
          netEarnings: item.gross - pFee,
          status: item.count > 0 ? "ACTIVE SALES" : "MONETIZED",
        };
      });

      return {
        paidExamsCount: Array.from(examMap.keys()).length,
        totalSalesCount: purchases.length,
        grossRevenue,
        platformFeePercentage,
        platformFees,
        teacherEarnings,
        todayGrossRevenue,
        todayNetEarnings,
        monthGrossRevenue,
        monthNetEarnings,
        pendingBalance: teacherEarnings,
        paidBalance: 0,
        examBreakdown,
        recentTransactions: purchases,
      };
    } catch {
      return {
        paidExamsCount: 0,
        totalSalesCount: 0,
        grossRevenue: 0,
        platformFeePercentage: 40,
        platformFees: 0,
        teacherEarnings: 0,
        todayGrossRevenue: 0,
        todayNetEarnings: 0,
        monthGrossRevenue: 0,
        monthNetEarnings: 0,
        pendingBalance: 0,
        paidBalance: 0,
        examBreakdown: [],
        recentTransactions: [],
      };
    }
  },
};
