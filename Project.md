# Testify Full-Stack Application — Audit Report

**Generated:** 2026-09-23  
**Scope:** Frontend (Next.js 16) + Backend (Express/TypeScript) + MongoDB Atlas

---

## 1. Executive Summary

Testify is a **production-ready** online assessment platform with three user roles (Student, Teacher, Admin), real-time proctoring, Stripe payments, and a comprehensive practice mode. The architecture follows modern patterns: Next.js 16 App Router + React 19 on the frontend, Express.js + TypeScript + MongoDB/Mongoose on the backend, unified by Better Auth and Socket.io.

**Overall Health: GOOD** — Well-structured, feature-complete for core flows, deployable.  
**Key Strengths:** Consistent design system, robust RBAC, real-time proctoring, idempotent Stripe webhooks, comprehensive exam/practice features.  
**Main Risks:** Development secrets committed in `.env`, missing health endpoint for Render, practice mode entirely client-side, N+1 query patterns.

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend Framework** | Next.js (App Router) | 16.3.1 |
| **Frontend Language** | TypeScript | 5.x |
| **React** | React | 19.2.8 |
| **Styling** | Tailwind CSS + DaisyUI | 4.3.3 / 5.7.19 |
| **Animations** | Framer Motion | 13.1.1 |
| **State Management** | React Context + localStorage | — |
| **Auth Client** | Better Auth React | 1.7.1 |
| **Payments** | Stripe JS / Stripe Node | 22.6.1 |
| **Real-time** | Socket.io Client | 4.8.3 |
| **Charts** | Recharts | 3.10.1 |
| **Backend Framework** | Express.js | 4.19.2 |
| **Backend Language** | TypeScript | 5.4.5 |
| **Database** | MongoDB Atlas + Mongoose | 8.3.1 |
| **Auth Server** | Better Auth (Mongo adapter) | 1.7.1 |
| **Email** | Resend | 6.25.0 |
| **AI** | Google GenAI (Gemini) | 2.22.0 |
| **Real-time Server** | Socket.io | 4.8.3 |
| **Deployment (FE)** | Vercel | — |
| **Deployment (BE)** | Render (primary) / Vercel (alt) | — |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ Public Pages│  │ Student     │  │ Teacher     │  │ Admin     │  │
│  │ (Landing,   │  │ Portal      │  │ Portal      │  │ Portal    │  │
│  │  Auth,      │  │ (Dashboard, │  │ (Exams,     │  │ (Users,   │  │
│  │  Practice)  │  │  Exams,     │  │  Questions, │  │  Analytics,│
│  │             │  │  Results,   │  │  Monitoring)│  │  Settings) │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │
│         │                │                │               │        │
│         └────────────────┼────────────────┼───────────────┘        │
│                          ▼                ▼                        │
│              ┌───────────────────────┐  ┌─────────────────┐       │
│              │  API Client (fetch)   │  │ Socket.io Client│       │
│              │  + Better Auth Client │  │ (Proctoring,    │       │
│              │  (credentials:include)│  │  Notifications) │       │
│              └───────────┬───────────┘  └────────┬────────┘       │
└──────────────────────────┼────────────────────────┼────────────────┘
                           │                        │
         HTTPS + WS        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER (Express + TS)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ REST API    │  │ Socket.io   │  │ Better Auth │  │ Stripe    │  │
│  │ (/api/*)    │  │ (Monitoring,│  │ (/api/auth/*)│ │ Webhooks  │  │
│  │             │  │  Notifs)    │  │             │  │           │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │
│         │                │                │               │        │
│         └────────────────┼────────────────┼───────────────┘        │
│                          ▼                ▼                        │
│              ┌─────────────────────────────────────────┐           │
│              │         MongoDB Atlas (Mongoose)        │           │
│              │  Users, Exams, Questions, Submissions,  │           │
│              │  PracticeSessions, Subscriptions,       │           │
│              │  Payments, Notifications, FeatureFlags  │           │
│              └─────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- Route groups: `(public)` for landing/auth, role-based layouts for portals
- Auth: Better Auth handles sessions via HTTP-only cookies; `credentials: 'include'` on all fetch
- Authorization: Middleware chain `requireAuth → requireRole → requireTeacherSubscription/requireExamAccess`
- Real-time: Dual Socket.io namespaces — monitoring (proctoring) + notifications
- Payments: Stripe Checkout Sessions + idempotent webhook processing with `PaymentEvent` deduplication
- Practice Mode: Client-only state (Context API + localStorage) — **not persisted to backend**

---

## 4. Frontend Issues

| Issue | Severity | Location |
|-------|----------|----------|
| Practice mode entirely client-side — no backend sync, no cross-device resume | HIGH | `src/lib/practice/practice-context.tsx` |
| Heavy reliance on localStorage for critical state (drafts, submissions, bookmarks) | MEDIUM | Multiple pages |
| `PracticeContext` provides 20+ values — all consumers re-render on any change | MEDIUM | `src/lib/practice/practice-context.tsx` |
| Modal component not portaled — renders in-place, z-index issues | LOW | `src/components/ui/Modal.tsx` |
| Mixed icon libraries (`lucide-react` + `react-icons`) — inconsistent sizing | LOW | `Navbar.tsx`, `StudentDashboard.tsx` |
| No React Query/SWR for caching — redundant API calls | MEDIUM | All service calls |
| Some raw `<img>` tags instead of `next/image` | LOW | Multiple components |
| No dynamic imports for heavy modals (e.g., `QuestionFormModal`) | LOW | Teacher pages |

---

## 5. Backend Issues

| Issue | Severity | Location |
|-------|----------|----------|
| **Per-request DB connection** — `connectDB()` middleware runs on every request | HIGH | `src/app.ts:56-63` |
| **God controllers** — `exam.controller.ts` (1378 lines), `admin.controller.ts` (688), `payment.controller.ts` (662) | MEDIUM | Controller files |
| **N+1 queries** in `getLiveMonitoringData` and `getTeacherExamsSubmissions` | MEDIUM | `exam.controller.ts:1215-1283, 1337-1378` |
| No rate limiting on auth endpoints | MEDIUM | `src/app.ts:76` |
| No structured logging — only `console.*` | LOW | All controllers |
| No request validation middleware (Zod/Valibot) — manual validation in controllers | LOW | All controllers |
| Webhook fallback accepts unsigned events in dev | MEDIUM | `src/lib/stripe.ts:193-197` |
| DEV bypass in `requireTeacherSubscription` — allows exam creation without sub if `NODE_ENV !== 'production'` | HIGH | `src/middlewares/subscription.middleware.ts:67-68` |
| No TTL index on `ExamAttempt` — abandoned attempts accumulate | LOW | `src/models/exam-attempt.model.ts` |
| Socket.io in-memory state — doesn't scale horizontally | MEDIUM | `src/sockets/monitoring.socket.ts:27` |

---

## 6. Frontend-Backend Integration Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Practice mode FE uses localStorage; BE has `/api/practice/*` endpoints unused | HIGH | Two parallel systems |
| Exam draft restore from localStorage may conflict with server `ExamAttempt` | MEDIUM | Dual state management |
| Socket.io connection has no authentication — `student:join` payload trusted | HIGH | Spoofable proctoring data |
| Teacher Revenue computed locally from purchases instead of calling `/api/payments/teacher/revenue` | LOW | Frontend doesn't use backend endpoint |
| Completed exam check logic duplicated in 3 places (FE localStorage, BE DB, practice session) | MEDIUM | Divergent implementations |

---

## 7. Security Issues

| Issue | Severity | Location | Evidence |
|-------|----------|----------|----------|
| **Secrets committed to git** — MongoDB URI, Stripe keys, OAuth secrets, Better Auth secret, Resend API key, Gemini key | **CRITICAL** | `testify_client/.env`, `Testify_Server/.env` | All production credentials in repo history |
| **Frontend exposes `STRIPE_SECRET_KEY`** | **CRITICAL** | `testify_client/.env:6` | Server secret in client bundle |
| **Missing health endpoint** — Render `healthCheckPath: /api/health` returns 404 | **CRITICAL** | `src/routes/index.ts` | Deployment fails health checks |
| **Socket.io no auth on connect** — `io.on('connection')` accepts any client | **HIGH** | `monitoring.socket.ts:42` | Proctoring spoofing, impersonation |
| **DEV bypass in production middleware** — subscription check skipped if `NODE_ENV !== 'production'` | **HIGH** | `subscription.middleware.ts:67-68` | Revenue loss if misconfigured |
| **ReDoS risk in regex filters** — `new RegExp(`^${category}$`, 'i')` from user input | **HIGH** | `exam.controller.ts:43-46, 50, 154-157` | Catastrophic backtracking possible |
| No rate limiting on auth endpoints | MEDIUM | `app.ts:76` | Brute force, credential stuffing |
| Webhook graceful fallback accepts unsigned events | MEDIUM | `stripe.ts:193-197` | Dev works without secret; prod misconfig silent |

---

## 8. Database Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Embedded exam questions — 16MB doc limit, duplication | MEDIUM | `Exam.questions` subdocument |
| No TTL index on `ExamAttempt.expiresAt` | LOW | Abandoned attempts accumulate |
| Missing indexes: `ExamAttempt.status+examId`, `Notification.userId+read` | LOW | Query performance |
| Referential integrity application-level only — no cascade deletes | MEDIUM | Orphan submissions possible |
| `PracticeSession.questions` populate() — N+1 risk if not careful | MEDIUM | `practice.controller.ts` |

---

## 9. API Issues

| Issue | Severity | Details |
|-------|----------|---------|
| **No health endpoint** — `/api/health` returns 404 | **CRITICAL** | Render deployment fails |
| Inconsistent response envelope — some `{success, data}`, others `{success, count, total, page, totalPages, data}` | MEDIUM | Multiple controllers |
| No API versioning — only `/api/` prefix | LOW | Future breaking changes |
| Webhook fallback accepts unsigned events in dev | MEDIUM | `constructStripeEvent` falls back to `JSON.parse` |

---

## 10. Performance Issues

| Area | Issue | Severity |
|------|-------|----------|
| Frontend | `PracticeContext` re-renders all consumers on any change | MEDIUM |
| Frontend | No caching layer (React Query/SWR) | MEDIUM |
| Frontend | No dynamic imports for heavy modals | LOW |
| Backend | Per-request `connectDB()` — connection churn | HIGH |
| Backend | N+1 queries in monitoring & teacher submissions | MEDIUM |
| Backend | No Redis/memory cache for frequent reads (subjects, plans) | LOW |
| Backend | Socket.io single-process — in-memory `activeCandidates` Map | MEDIUM |

---

## 11. Code Quality Issues

| Issue | Severity | Location |
|-------|----------|----------|
| God controllers (1378, 688, 662 lines) | HIGH | `exam.controller.ts`, `admin.controller.ts`, `payment.controller.ts` |
| Duplicate "completed exam" logic in 3 places | MEDIUM | FE localStorage, BE DB, practice session |
| Duplicate profile sync logic in Navbar, StudentDashboard, PracticeSession | MEDIUM | Multiple components |
| TypeScript `any` in socket handlers, controller callbacks | LOW | `monitoring.socket.ts`, `exam.controller.ts` |
| Mixed icon libraries | LOW | `lucide-react` + `react-icons` |
| `stripe` package in frontend dependencies | LOW | `testify_client/package.json:28` |
| `daisyui` duplicated in deps and devDeps | LOW | `testify_client/package.json:15,37` |
| `typescript` in backend production dependencies | LOW | `Testify_Server/package.json:28` |

---

## 12. Deployment Issues

| Issue | Severity | Details |
|-------|----------|---------|
| Render health check fails — `/api/health` missing | **CRITICAL** | `render.yaml:10` |
| Backend `vercel.json` points to non-existent `api/index.ts` | HIGH | `Testify_Server/vercel.json` |
| Free tier Render spins down — cold starts + DB reconnect latency | MEDIUM | Render free plan |
| Socket.io won't scale horizontally on Render without Redis adapter | MEDIUM | In-memory state |
| No `.env.production` / `.env.staging` templates | LOW | Single `.env` for all environments |

---

## 13. Issues by Priority

### 🔴 CRITICAL (4)

| # | Issue | File/Path | Fix |
|---|-------|-----------|-----|
| 1 | Secrets committed to git | `testify_client/.env`, `Testify_Server/.env` | Rotate ALL secrets; purge git history; add pre-commit hook |
| 2 | Frontend exposes `STRIPE_SECRET_KEY` | `testify_client/.env:6` | Remove from frontend env |
| 3 | Missing health endpoint | `src/routes/index.ts` | Add `GET /api/health` |
| 4 | Socket.io no authentication | `monitoring.socket.ts:42` | Verify Better Auth cookie on handshake |

### 🟠 HIGH (4)

| # | Issue | File/Path | Fix |
|---|-------|-----------|-----|
| 5 | DEV bypass in subscription middleware | `subscription.middleware.ts:67-68` | Remove dev bypass |
| 6 | Per-request DB connection | `app.ts:56-63` | Singleton connection pool |
| 7 | Practice mode entirely client-side | `practice-context.tsx` | Wire to backend `/api/practice/*` |
| 8 | ReDoS risk in regex filters | `exam.controller.ts:43-46` | Escape user input / use `$eq` |

### 🟡 MEDIUM (7)

| # | Issue | File/Path | Fix |
|---|-------|-----------|-----|
| 9 | N+1 in live monitoring | `exam.controller.ts:1215-1283` | Use `$lookup` aggregation |
| 10 | N+1 in teacher submissions | `exam.controller.ts:1337-1378` | Build exam map first |
| 11 | No rate limiting on auth | `app.ts:76` | Add express-rate-limit |
| 12 | Webhook fallback accepts unsigned | `stripe.ts:193-197` | Throw if secret missing in prod |
| 13 | Socket.io single-process scaling | `monitoring.socket.ts:27` | Add Redis adapter |
| 14 | Embedded exam questions limit | `exam.model.ts:48-59` | Reference Question collection |
| 15 | God controllers | Multiple files | Split by domain |

### 🟢 LOW (8)

| # | Issue | File/Path | Fix |
|---|-------|-----------|-----|
| 16 | No TTL on ExamAttempt | `exam-attempt.model.ts` | Add TTL index |
| 17 | Duplicate `daisyui` in deps | `package.json:15,37` | Remove from devDeps |
| 18 | `stripe` in frontend deps | `package.json:28` | Move to devDeps/remove |
| 19 | `typescript` in backend deps | `package.json:28` | Move to devDeps |
| 20 | Mixed icon libraries | Multiple files | Standardize on `lucide-react` |
| 21 | Modal not portaled | `Modal.tsx` | Use `createPortal` |
| 22 | No request validation middleware | Controllers | Add Zod schemas |
| 23 | No structured logging | All controllers | Add pino |

---

## 14. Recommended Fix Roadmap

### Phase 1 — Critical Fixes (Week 1)
- [ ] Rotate ALL exposed secrets (MongoDB, Stripe, OAuth, Better Auth, Resend, Gemini)
- [ ] Purge secrets from git history (`git filter-repo` or BFG)
- [ ] Add `GET /api/health` endpoint for Render
- [ ] Remove `STRIPE_SECRET_KEY` from frontend `.env`
- [ ] Add pre-commit hook (`husky` + `lint-staged` + `git-secrets`)

### Phase 2 — Security Fixes (Week 2)
- [ ] Add Socket.io authentication (verify Better Auth cookie on handshake)
- [ ] Remove dev bypass in `requireTeacherSubscription`
- [ ] Fix ReDoS in regex filters
- [ ] Add rate limiting to auth endpoints
- [ ] Fix webhook fallback to reject unsigned events in production

### Phase 3 — Backend/API Fixes (Week 3-4)
- [ ] Fix per-request DB connection (singleton pool)
- [ ] Resolve N+1 queries in monitoring & teacher submissions
- [ ] Split god controllers (`exam`, `admin`, `payment`)
- [ ] Add Zod validation schemas + middleware
- [ ] Add structured logging (pino)
- [ ] Add TTL index on `ExamAttempt.expiresAt`

### Phase 4 — Frontend Fixes (Week 4-5)
- [ ] Wire Practice Mode to backend endpoints (`/api/practice/*`)
- [ ] Replace localStorage draft/submission sync with API calls
- [ ] Add React Query/SWR for caching & deduping
- [ ] Optimize `PracticeContext` (split into multiple contexts)
- [ ] Standardize icons (remove `react-icons`, use `lucide-react`)
- [ ] Add `next/image` for all images
- [ ] Dynamic imports for heavy modals

### Phase 5 — Performance Improvements (Week 5-6)
- [ ] Add Redis adapter for Socket.io horizontal scaling
- [ ] Add indexes: `ExamAttempt.status+examId`, `Notification.userId+read`
- [ ] Migrate embedded exam questions → Question references (breaking)
- [ ] Implement API response caching (Redis) for subjects, plans
- [ ] Bundle analysis & optimization

### Phase 6 — Code Quality/Refactoring (Week 6-8)
- [ ] Extract shared validation schemas (FE/BE)
- [ ] Consolidate duplicate "completed exam" logic
- [ ] Consolidate profile sync logic
- [ ] Add integration tests (API contracts)
- [ ] Add E2E tests (Cypress/Playwright) for critical flows

### Phase 7 — Deployment/Production Hardening (Week 8+)
- [ ] Create `.env.production` / `.env.staging` templates
- [ ] Configure Render production env vars (not in repo)
- [ ] Set up Vercel preview deployments
- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Configure Sentry/LogRocket for error tracking
- [ ] Load test Socket.io proctoring (k6/artillery)
- [ ] Document API (OpenAPI/Swagger)

---

**End of Report**