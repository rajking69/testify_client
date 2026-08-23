# Testify — Comprehensive UI/UX Design System & Development Ruleset

This document serves as the single source of truth for all UI/UX design tokens, component architecture, typography, theming standards, animation patterns, and responsive layout guidelines for the **Testify** client application.

All future frontend code, pages, and components created for Testify MUST strictly follow these rules.

---

## 1. Color Palette & Semantic Design Tokens

### 1.1 Core Brand Colors
- **Header & Title Navy**: `#0B2238` (Light mode headings, authoritative branding text)
- **Primary Brand Cyan / Blue**: `#00A3C4` (Interactive buttons, links, gradient stops, active focus rings)
- **Vibrant Accent Blue**: `#0092E3` / `#0066FF` / `#0052EA` (Testify logo ribbon marks, interactive highlights)
- **Amber / Accent Warning**: `#E8922C` / `#F59E0B` (Admin badges, urgency markers)
- **Emerald / Success**: `#10B981` (Live indicator pulsing dots, active proctoring badges, strong password bars)
- **Purple / Telemetry Accent**: `#9333EA` / `#6366F1` (Analytics, student progress metrics)

### 1.2 Surface & Background Gradients
- **Light Theme Page Canvas**:
  ```css
  bg-gradient-to-b from-[#FAF8F5] via-[#EFF6FB] to-[#FAF8F5] text-[#0B2238]
  ```
- **Dark Theme Page Canvas**:
  ```css
  dark:from-[#030712] dark:via-[#090d16] dark:to-[#0f172a] dark:text-slate-100
  ```
- **Card Surfaces**:
  ```css
  bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 backdrop-blur-xl
  ```

---

## 2. Typography Hierarchy & Font Standards

- **Headings & Display Font**: **Outfit** (`var(--font-outfit)`, `.font-display`), weights `700`, `800`.
- **Body & Form Controls**: **Plus Jakarta Sans** (`var(--font-plus-jakarta)`, `.font-sans`), weights `400`, `500`, `600`, `700`.
- **Monospace Time / Telemetry Indicators**: `font-mono` with high contrast badges (`00:45:20`).

### Standard Typography Scale:
- **Hero Title**: `text-3xl sm:text-4xl xl:text-5xl font-extrabold font-display tracking-tight leading-tight`
- **Section Heading**: `text-2xl sm:text-3xl font-extrabold font-display tracking-tight`
- **Card Title**: `text-2xl font-extrabold font-display tracking-tight`
- **Input Labels**: `block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300`
- **Body / Subtitles**: `text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed`
- **Pill Badges & Captions**: `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider`

---

## 3. Official Testify Brand Logo Architecture

The official Testify Logo consists of a layered 3D blue gradient ribbon 'T' checkmark SVG icon paired with bold **Outfit** typography.

- **Component Path**: `src/components/ui/Logo.tsx`
- **Props**:
  - `size?: number` (Default: `36`, Mobile Auth: `50`–`52`, Desktop: `44`–`46`)
  - `showText?: boolean` (Set `false` for mobile auth headers)
  - `textClassName?: string` (Default: `text-[#0B2238] dark:text-white`)
  - `href?: string` (Default: `"/"`)

### Logo SVG Specification:
- **Defs Gradients**:
  - `globalTopRibbonGrad` (`#00A2FF` → `#0072FF` → `#0052EA`)
  - `globalTopFoldGrad` (`#005BDB` → `#003FA8`)
  - `globalStemGrad` (`#0066FF` → `#004AD6`)
  - `globalBlueCheckGrad` (`#0052EA` → `#007CFF` → `#00AFFF`)
- **Front Checkmark**: Pure White (`#FFFFFF`).

---

## 4. Theming & Dark Mode Architecture

- **Tailwind CSS v4 Standard**:
  ```css
  @custom-variant dark (.dark &, [data-theme="dark"] &);
  ```
- **Single Global Theme Provider**:
  - Located in `src/components/providers/ThemeProvider.tsx`, wrapping `src/app/layout.tsx`.
  - Persists theme choice seamlessly across all routes via `localStorage` and `html.dark` class / `data-theme`.
  - **No redundant Theme Toggle icons on auth pages** (theme remains globally synced from landing navbar).

---

## 5. Authentication Architecture (Dual-Mode Responsive Design)

Both **Login** (`/auth/login`) and **Register** (`/auth/register`) pages follow the unified Dual-Mode Responsive Architecture:

### 5.1 Desktop View (`lg+` screens)
- **Two-Column Split Layout**: Container `max-w-7xl w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center`.
- **Left Column (`col-span-6 / col-span-7`)**:
  - Full Testify Logo (Icon + Text).
  - High-impact headline with gradient highlight text.
  - Short, human subtitle.
  - 3 crisp bullet points with soft-tinted colored icon badges.
  - **Interactive Preview Widget Card** (e.g. Live Exam Countdown for Login, Question Bank Creator for Register).
- **Right Column (`col-span-6 / col-span-5`)**:
  - Glassmorphic card (`max-w-md` or `max-w-lg`) with smooth borders, shadows, and subtle blur.

### 5.2 Mobile / Responsive View (`< lg` screens)
- **Midpoint Dead-Center Layout**:
  - Left promotional column is hidden (`hidden lg:flex`).
  - Entire auth stage is centered horizontally and vertically at the screen midpoint (`my-auto flex flex-col items-center justify-center`).
  - **Icon-Only Logo**: High-fidelity Testify blue 'T' icon (`<Logo size={52} showText={false} />`) centered directly above the card.
  - Form card is centered without awkward vertical or horizontal offsets.

### 5.3 Card Form Components & UI Rules
- **Header**: High-emphasis action title (`Sign In` or `Create Account`) + short subtitle.
- **Input Fields**:
  - Icons positioned on left (`Mail`, `Lock`, `User`).
  - Font size `text-xs`, padding `pl-10 pr-4 py-2.5`, border `rounded-xl`.
  - Focus state: `focus:border-[#00A3C4] focus:ring-4 focus:ring-[#00A3C4]/20`.
  - Inline error text below input with `text-[11px] text-red-600 dark:text-red-400`.
- **Password Fields**:
  - Right-aligned eye toggle button (`Eye`, `EyeOff`).
  - Dynamic 5-stage strength meter bar on registration.
- **Role Selector**:
  - Segmented compact toggle (`Student` | `Teacher` | `Admin`).
- **Primary CTA Button**:
  - High-contrast button: `bg-[#0B2238] dark:bg-[#00A3C4] hover:bg-[#153450] dark:hover:bg-[#38bdf8] text-white dark:text-[#0B2238] font-bold text-xs rounded-xl py-3 active:scale-[0.99]`.
- **Social OAuth UI**:
  - Divider `or continue with` / `or sign up with`.
  - Side-by-side Google & GitHub buttons with official SVGs.
- **Top Header & Footer Security**:
  - Top: `Return to Home` arrow link (left) + `Secure Portal` badge (right).
  - Bottom: *"Protected by enterprise-grade SSL encryption • © 2026 Testify Inc."*

---

## 6. Landing Page & Marketing Layout Standards

- **Hero Section (`TestifyHero.tsx`)**:
  - Multi-layer moving ambient lighting canvas (`AnimatedBackground.tsx`).
  - Gradient typography headlines.
  - Interactive assessment preview mockup widget with active time indicator.
- **Navbar (`Navbar.tsx`)**:
  - Dynamic scroll contrast: White text over dark hero graphic, transitioning to high-contrast slate text when scrolled.
  - Global theme toggle and CTA links.
- **Footer (`Footer.tsx`)**:
  - Clean institutional links, copyright, and platform telemetry.
  - No bloated or unverified regulatory compliance badges (e.g., FERPA/GDPR badge removed).

---

## 7. Animation, Performance & Interaction Guidelines

- **Micro-Interactions**:
  - Buttons: `active:scale-[0.98]` or `active:scale-[0.99]`.
  - Card Hover: `.card-hover-effect` with subtle lift (`translateY(-4px)` to `translateY(-6px)`).
  - Icons: Soft scale or rotation on parent hover (`group-hover:scale-105`).
- **Keyframe Utilities**:
  - `.animate-float` (4s smooth float).
  - `.animate-pulse-glow` (3s soft atmospheric glow).
  - `.animate-shimmer` (gradient sweep).
- **DOM Nesting Integrity**:
  - Never nest interactive elements (e.g., avoid `<Link><Logo href="/" /></Link>`).

---

## 8. TypeScript & Code Quality Rules

- **Zero Type Errors**: All files must strictly pass `npx tsc --noEmit`.
- **No Direct Any**: Use typed interfaces or explicit type unions for state and handlers.
- **Standardized Next.js 16 / React 19 Client Directives**: Ensure `"use client"` is placed at top of files utilizing React hooks (`useState`, `useRouter`).
- **Git Commit Standard**: Logical, lowercase, descriptive commit messages matching standard conventional commits (`feat(auth): ...`, `fix(theme): ...`).
