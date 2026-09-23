# Testify Full-Stack Application — Functional Audit Report

**Generated:** 2026-09-23  
**Scope:** Complete functional audit of frontend (Next.js 16) + backend (Express/TypeScript) + MongoDB

---

## Executive Summary

This audit identified **47 functional bugs and business-logic issues** across the Testify platform. The application has a sophisticated feature set (exams, practice, payments, proctoring, subscriptions) but suffers from **critical data synchronization problems**, **stale state issues**, **inconsistent revenue calculations**, and **broken cross-role data flows**.

**Overall Functional Health: CONCERNING** — Core features work in isolation but break when integrated across roles, dashboards, and data sources.

---

## 1. Role-Based Functional Audit

### ADMIN
| Capability | Implementation | Issues |
|------------|---------------|--------|
| View all users | ✅ `adminService.getAllUsers` | Stats show hardcoded values (180 faculty, 4250 candidates) instead of real DB counts |
| Manage exams | ✅ `/admin/exams` page | No real delete cascade - deleted exams may remain in student views |
| Revenue analytics | ✅ `/admin/revenue` | Platform fee calculation uses **15%** but teacher revenue uses **40%** |
| System analytics | ✅ `/admin/analytics` | System health metrics are **simulated** (sin/cos variance), not real |
| User management | ✅ CRUD operations | Deleting user doesn't cascade delete exams/submissions/purchases |

### TEACHER
| Capability | Implementation | Issues |
|------------|---------------|--------|
| Create exams | ✅ Modal + API | **Subscription check bypassed in dev** (`NODE_ENV !== 'production'`) |
| Question bank | ✅ CRUD + bulk import | Questions embedded in exam (16MB limit), no cross-exam reuse |
| Live monitoring | ✅ Socket.io | **No auth on socket handshake** - studentId spoofable |
| Revenue dashboard | ✅ `/teacher/revenue` | **40% platform fee** but admin shows **15%** |
| Exam management | ✅ List + filters | Deleted exams persist in localStorage, reappear on reload |

### STUDENT
| Capability | Implementation | Issues |
|------------|---------------|--------|
| Browse exams | ✅ `/student/exams` | **Three data sources merged** (localStorage, teacher localStorage, backend) with different schemas |
| Take exams | ✅ `/exam/[token]` | Draft restore from localStorage conflicts with server `ExamAttempt` |
| View results | ✅ `/student/results` | Reads from `purchaseService` (localStorage) not backend |
| Purchase exams | ✅ Stripe checkout | Payment success doesn't invalidate exam cache everywhere |

**Cross-Role Permission Gaps:**
- Frontend checks `session.user.role` but backend uses `req.user.role` — mismatch possible during role changes
- Teacher dashboard shows `hasPremium` from `useTeacherSubscription` (localStorage + backend) — can be stale
- Admin can delete teacher but teacher's exams remain accessible to students

---

## 2. Exam Lifecycle Audit

### Flow: Teacher Creates → Student Takes → Results Generated

| Stage | Expected | Actual Behavior | Bug |
|-------|----------|----------------|-----|
| **Create** | Exam saved to DB, appears in teacher dashboard | Saved to DB + localStorage (`testify_teacher_exams`), teacher dashboard reads merged localStorage+API | **Dual write** - localStorage is source of truth for teacher dashboard |
| **Publish** | `isPublished=true`, appears on public/student pages | Teacher sets status="Published", but public page filters `isPublished !== false` | **Inconsistent field names** - `status` vs `isPublished` |
| **Student Browse** | Sees all published exams | Student exams page merges: 1) backend API 2) teacher localStorage 3) mock data | **Triple data source** with different field mappings |
| **Student Start** | Creates `ExamAttempt` with server timer | Also creates localStorage draft (`testify_exam_draft_{id}`) | **Dual attempt tracking** - can diverge |
| **Submit** | Backend grades, creates `ExamSubmission` | Frontend also saves to localStorage (`testify_student_submissions`, `testify_practice_history`) | **Triple submission storage** |
| **Results** | Teacher sees in `/teacher/results` | Teacher results reads from `AdmissionPanel` (localStorage + socket) | **Different data source** than student results |

### Deleted Exam Consistency

| Location | Deleted Exam Remains? | Evidence |
|----------|----------------------|----------|
| Teacher Dashboard | ❌ Removed | `updateExamsState` filters by ID |
| Student Exams | ✅ **YES** | Merges teacher localStorage - deleted exam may be in other teacher's localStorage |
| Public Exams | ✅ **YES** | `PublicExamsSection` merges localStorage `testify_teacher_exams` |
| Admin Exams | ❌ Removed | Direct DB query |
| Search Results | ✅ **YES** | localStorage not purged globally |
| Student Results | ✅ **YES** | Submission references deleted exam ID |
| Socket Monitoring | ✅ **YES** | `activeCandidates` in-memory map not cleared |

---

## 3. Admin ↔ Teacher ↔ Student Data Flow Audit

### Teacher Creates Exam → Student Should See It

| Step | Teacher Side | Student Side | Gap |
|------|--------------|--------------|-----|
| 1. Create | POST `/api/exams` + localStorage | — | — |
| 2. Publish | `isPublished=true` | GET `/api/exams/public` filters `isPublished !== false` | ✅ Works |
| 3. Student Browse | — | Merges API + teacher localStorage | **Stale if teacher localStorage outdated** |
| 4. Real-time | `dispatchEvent("testify_public_exams_updated")` | Listens for event, reloads | **Only works in same browser tab** |

### Teacher Deletes Exam → Student Should Not See It

| Step | Teacher Side | Student Side | Gap |
|------|--------------|--------------|-----|
| 1. Delete | DELETE `/api/exams/:id` + localStorage filter | — | — |
| 2. Student Reload | — | Merges API (exam gone) + localStorage (may have copy from other teacher) | **Ghost exam appears** |

### Student Purchases → Teacher Revenue Updates

| Step | Student Side | Teacher Side | Gap |
|------|--------------|--------------|-----|
| 1. Purchase | Stripe checkout → webhook → `ExamPurchase` created | — | — |
| 2. Teacher Dashboard | — | Calls `paymentService.getTeacherRevenue()` (backend) | ✅ Backend accurate |
| 3. Teacher Local Cache | — | `teacherEarnings` from `useTeacherSubscription` (localStorage) | **Stale - 40% fee vs admin 15%** |

### Admin Changes Teacher Subscription → Teacher Dashboard Updates

| Step | Admin Side | Teacher Side | Gap |
|------|------------|--------------|-----|
| 1. Update | `PATCH /api/admin/users/:id` | — | — |
| 2. Teacher Reload | — | `useTeacherSubscription` checks localStorage + backend | **May show old status for minutes** |

---

## 4. Revenue / Payment / Business Logic Audit

### Critical: Platform Fee Discrepancy

| Location | Platform Fee | Calculation |
|----------|--------------|-------------|
| **Admin Dashboard** (`admin.controller.ts:37`) | **15%** | `purchaseRevenue * 0.15` |
| **Teacher Revenue** (`payment.controller.ts:503`) | **40%** | `grossRevenue * 0.40` |
| **Teacher Frontend** (`purchase.service.ts:312`) | **40%** | `grossRevenue * 0.40` |
| **Admin Analytics** (`admin.controller.ts:37`) | **15%** | Different from teacher! |

**Impact:** Admin sees 15% platform fee, Teacher sees 40% — **$25,000 discrepancy per $100k revenue**

### Revenue Calculation Duplication

| Location | Calculation | Source |
|----------|-------------|--------|
| Backend `getTeacherRevenue` | Gross, fees, net, monthly, daily | DB `ExamPurchase` |
| Frontend `purchaseService.getTeacherEarnings` | Gross, fees, net, monthly, daily | localStorage `testify_purchased_records` |
| Teacher Dashboard | Shows `teacherEarnings` from `paymentService.getTeacherRevenue` | Backend API |
| Admin Dashboard | Shows `platformFeeFromPurchases` (15%) | Backend API |

**Bug:** Frontend duplicates backend logic — if backend changes, frontend shows wrong numbers until rebuild.

### Payment Flow Issues

| Issue | Location | Impact |
|-------|----------|--------|
| **No idempotency key on student purchase** | `examService.purchaseExam` | Double-charge possible on retry |
| **Webhook processes `checkout.session.completed` but not `payment_intent.succeeded`** | `payment.controller.ts:263` | Subscription may activate without purchase record |
| **Teacher subscription webhook creates `UserSubscription` but student purchases don't** | `payment.controller.ts:326` | Student purchases not in subscription analytics |
| **Frontend `recordPurchase` calls backend AFTER localStorage save** | `purchase.service.ts:172` | If backend fails, local has record but server doesn't |

### Subscription Logic Bugs

| Bug | Location | Evidence |
|-----|----------|----------|
| **Dev bypass allows exam creation without subscription** | `subscription.middleware.ts:67` | `const isDev = process.env.NODE_ENV !== 'production'` |
| **Teacher subscription status checked in 3 places with different logic** | `useTeacherSubscription`, `paymentService.getTeacherPremiumStatus`, `subscriptionService.getMyStatus` | Each returns different `isPremium` |
| **Subscription expiry not enforced in real-time** | Socket monitoring doesn't check subscription | Expired teacher can still monitor |

---

## 5. Real-Time / Data Synchronization Audit

### Socket.io Authentication (CRITICAL)

| Issue | Location | Risk |
|-------|----------|------|
| **No authentication on socket handshake** | `server.ts:18-25` | Anyone can connect, spoof `student:join` with any `studentId` |
| **Student identity from payload** | `monitoring.socket.ts:53` | `candidateKey = data.studentId \|\| data.email \|\| socket.id` |
| **Teacher actions trust client data** | `monitoring.socket.ts:189, 210` | `teacher:send_warning` uses `data.studentId` from client |

### Data Sync Mechanisms

| Mechanism | Scope | Problems |
|-----------|-------|----------|
| **localStorage** | All roles | Primary data store for teacher exams, student submissions, purchases |
| **Custom Events** | `dispatchEvent("testify_*")` | Same-tab only; fails across tabs/windows |
| **Socket.io** | Monitoring only | No auth; teacher sees all candidates |
| **API Refetch** | Manual `refetch()` calls | Inconsistent - some pages auto-refresh, others don't |
| **Backend → Frontend** | Webhook + API | No push for exam updates, deletions |

### Stale State Scenarios

| Scenario | Stale Data Visible Where | Duration |
|----------|-------------------------|----------|
| Teacher creates exam | Student exams page (other tabs) | Until manual refresh |
| Teacher deletes exam | Public exams, student exams (other teachers' localStorage) | Indefinite |
| Student submits exam | Teacher monitoring (other browser) | Until socket event |
| Admin deletes teacher | Teacher dashboard (other tabs) | Until reload |
| Payment succeeds | Student exam access (other pages) | Until cache clear |

---

## 6. Delete / Update Consistency Audit

| Entity | Delete Backend | Delete Frontend | Delete localStorage | Orphaned References |
|--------|----------------|-----------------|---------------------|---------------------|
| **Exam** | ✅ `Exam.findByIdAndDelete` | ✅ `updateExamsState` filter | ❌ Other teachers' localStorage | Student submissions, attempts, purchases |
| **Question** | ✅ `Question.findByIdAndDelete` | ✅ Modal + list filter | ❌ Not in localStorage | Exams embedding question |
| **User (Admin)** | ✅ `User.findByIdAndDelete` + sessions | — | — | Teacher exams, submissions, purchases |
| **Submission** | ❌ No delete API | ❌ No UI | localStorage only | Teacher results, analytics |
| **Purchase** | ❌ No delete API | ❌ No UI | localStorage + DB | Teacher revenue, student invoices |
| **Subscription** | Webhook `deleted` → `cancelled` | localStorage | localStorage | User `isPremium` flag |
| **Practice Session** | ❌ No delete | ✅ `resetPracticeSession` | localStorage | History, bookmarks |

### Soft vs Hard Delete
- **Exams:** Hard delete in DB, but localStorage copies persist
- **Submissions:** Never deleted (audit trail)
- **Users:** Hard delete + session cleanup
- **Purchases:** Never deleted (financial record)

---

## 7. Dashboard Consistency Audit

### Metric Comparison Across Dashboards

| Metric | Admin Dashboard | Teacher Dashboard | Student Dashboard | Source |
|--------|-----------------|-------------------|-------------------|--------|
| **Total Exams** | `Exam.countDocuments()` | `myExamsCount` from revenue API | `exams.length` (merged) | **3 different sources** |
| **Completed Exams** | `ExamSubmission.countDocuments()` | `completedCount` from exam | `dashboardStats.completedExams` (backend) | **3 different queries** |
| **Average Score** | `ExamSubmission.aggregate(avg %)` | Not shown | `averageScore` from backend | **Different calculations** |
| **Revenue (Gross)** | `purchaseRevenue + subRevenue` (15% fee) | `grossRevenue` from `getTeacherRevenue` (40% fee) | Not shown | **Fee mismatch** |
| **Revenue (Net)** | Not shown | `teacherEarnings` (60% of gross) | Not shown | — |

### Calculation Inconsistencies

| Metric | Admin Formula | Teacher Formula | Student Formula |
|--------|---------------|-----------------|-----------------|
| **Pass Rate** | `passedSubmissions / totalSubmissions` | Not shown | `passedExams / totalExamsTaken` |
| **Avg Score** | `avg(percentage)` | Not shown | `avg(score/totalMarks * 100)` |

---

## 8. Frontend ↔ Backend Contract Audit

### Missing Refetches After Mutations

| Mutation | Pages Needing Refresh | Actual Behavior |
|----------|----------------------|-----------------|
| Teacher creates exam | Student exams, Public exams, Admin exams | `dispatchEvent("testify_public_exams_updated")` - same tab only |
| Teacher deletes exam | Student exams, Public exams, Admin exams | Same tab only |
| Student purchases exam | Student exams (show "Purchased"), Teacher revenue | Student: localStorage update only; Teacher: no refresh |
| Student submits exam | Student results, Teacher results, Admin analytics | Student: localStorage event; Teacher: socket; Admin: no refresh |
| Admin deletes user | Admin users, Teacher exams (if teacher), Student exams | No cross-page refresh |

---

## 9. Key Functional Bugs Summary

### CONFIRMED (Code path clearly demonstrates)

| ID | Bug | Severity | Evidence |
|----|-----|----------|----------|
| **FB-001/FB-012** | **Platform fee mismatch: Admin 15% vs Teacher 40%** | **CRITICAL** | `admin.controller.ts:37` vs `payment.controller.ts:503` |
| **FB-002** | **Socket.io no authentication** | **CRITICAL** | `server.ts:18-25`, `monitoring.socket.ts:42` |
| **FB-003** | **Teacher subscription dev bypass** | **CRITICAL** | `subscription.middleware.ts:67` |
| **FB-004** | **Deleted exams reappear via other teachers' localStorage** | **HIGH** | `PublicExamsSection.tsx:197-229` |
| **FB-005** | **Revenue calculation duplicated with different fees** | **HIGH** | `admin.controller.ts:37` vs `purchase.service.ts:312` |
| **FB-006** | **Three grading implementations differ** | **HIGH** | `exam.controller.ts:901-913`, `practice-context.tsx:223-243` |
| **FB-007** | **Socket.io student identity spoofable** | **HIGH** | `monitoring.socket.ts:53` |
| **FB-008** | **Teacher dashboard uses localStorage for exam list** | **HIGH** | `TeacherExamsPage.tsx:374-380` |
| **FB-009** | **Student exams merges 3 incompatible data sources** | **HIGH** | `StudentExamsMarketplace.tsx:276-342` |
| **FB-010** | **Exam submission stored in 3 places** | **HIGH** | localStorage, DB, practice history |
| **FB-011** | **Deleted exam persists in other teachers' localStorage** | **HIGH** | `TeacherExamsPage.tsx:458-467` |
| **FB-013** | **Practice mode entirely localStorage, no backend sync** | **HIGH** | `practice-context.tsx` |
| **FB-014** | **Exam draft restore conflicts with server attempt** | **HIGH** | `PracticeSessionContent.tsx:588-615` |
| **FB-015** | **Cross-tab sync fails** | **MEDIUM** | Custom events don't cross tabs |

### LIKELY (Strong evidence)

| ID | Bug | Severity |
|----|-----|----------|
| FB-016 | Teacher revenue stale after student purchase | MEDIUM |
| FB-017 | Student exam access check differs FE/BE | MEDIUM |
| FB-018 | Admin analytics system health simulated | MEDIUM |
| FB-019 | Teacher subscription status stale | MEDIUM |
| FB-020 | Exam timing status calculated client-side only | MEDIUM |
| FB-021 | Practice mode never calls backend | MEDIUM |
| FB-022 | Monitoring socket no role check on connect | HIGH |

---

## Recommended Testing Checklist

### Critical Path Tests (Must Pass)
- [ ] Teacher creates exam → Student sees it on `/student/exams` and `/public-exams`
- [ ] Teacher deletes exam → Student no longer sees it anywhere
- [ ] Student purchases paid exam → Teacher revenue updates correctly (same fee %)
- [ ] Student submits exam → Teacher sees result in monitoring + results
- [ ] Admin changes teacher role → Teacher dashboard updates on reload
- [ ] Socket connection requires valid Better Auth session
- [ ] Student cannot spoof another student's identity in monitoring

### Data Consistency Tests
- [ ] Delete exam → Check student submissions, teacher revenue, admin analytics
- [ ] Delete teacher → Check exams, submissions, purchases, revenue
- [ ] Expire subscription → Teacher cannot create exams, monitoring blocked
- [ ] Cross-tab: Teacher creates exam in Tab A → Tab B student sees it
- [ ] Cross-tab: Student submits in Tab A → Tab B teacher monitoring updates

### Revenue/Business Logic Tests
- [ ] Platform fee consistent across Admin (15%) and Teacher (40%) → **WILL FAIL**
- [ ] Teacher net earnings = Gross * 60% (not 85%)
- [ ] Monthly/daily revenue calculations match between FE and BE

### Security/Authorization Tests
- [ ] Socket connection without cookie rejected
- [ ] Student `student:join` with another's ID rejected
- [ ] Teacher `teacher:send_warning` for non-student rejected
- [ ] Dev bypass blocked in production (`NODE_ENV=production`)

### Edge Case Tests
- [ ] Browser reload during exam → Draft restores, server timer continues
- [ ] Multiple tabs same exam → State syncs or warns
- [ ] Failed payment → No access granted, no purchase record
- [ ] Expired session mid-exam → Auto-submit or graceful handling
- [ ] Deleted exam with submissions → Submissions accessible, exam gone