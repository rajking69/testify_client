---
trigger: always_on
---

# Testify — UI/UX Design System & Style Ruleset

This ruleset defines the official UI/UX design tokens, typography, component layout rules, color palette, animations, and responsiveness standards for the **Testify** platform.

All future frontend code and components written for Testify MUST strictly adhere to these rules.

---

## 1. Color Palette & Design Tokens

### Primary & Brand Colors
- **Header / Title Navy**: `#152234` or `#2F327D` (Deep, authoritative navy for all H1, H2, H3 headings).
- **Primary Brand Blue**: `#0092E3` (Primary interactive accents, active states, key highlight text).
- **Mint / Teal Accent**: `#00CBB8` / `#49BBBD` (Success indicators, CTA buttons, active state badges).
- **Secondary Accents**:
  - Indigo / Purple: `#5B67F7` / `#8E44AD`
  - Sky Cyan: `#29B6F6`
  - Coral / Pink: `#FF5B82`

### Backgrounds & Containers
- **Section Alternating Backgrounds**: Pure White (`#FFFFFF`) and Light Slate (`#F8FAFC`).
- **Icon Container Background**: Soft Blue Tint Box (`#EBF7FF` / `#E0F2FE` with `border border-blue-100`).
- **Body & Subtitle Copy**: Slate Gray (`#696984` or `#475569` for optimal contrast).

---

## 2. Typography Rules

- **Headings & Display Font**: **Outfit** (`var(--font-outfit)`), sans-serif (Font weights: `700`, `800`).
- **Body & Interactive Controls**: **Plus Jakarta Sans** (`var(--font-plus-jakarta)`), sans-serif (Font weights: `400`, `500`, `600`).
- **Step / Numerical Markers**: Monospace font (`01`, `02`, `03`, `04`) with high visual contrast.

---

## 3. Card & Component Composition

### Standard Card Architecture
- **Border Radius**: Large rounded corners (`rounded-2xl` or `rounded-[28px]`).
- **Borders & Shadows**: `border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-[#0092E3]/15 hover:border-[#0092E3]/60`.
- **Icon Styling**: Line icons from `react-icons/fi` contained within `w-12 h-12 rounded-xl bg-[#EBF7FF] border border-blue-100 flex items-center justify-center`.
- **Pill Badges**: `rounded-full text-xs font-bold uppercase tracking-wider px-3.5 py-1.5`.

---

## 4. Animation & Micro-Interactions

- **Card Elevation**: `.card-hover-effect` (`transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Icon Spring Animation**: `group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300`.
- **Arrow Slide Effect**: `group-hover:translate-x-2 transition-all duration-300`.
- **Ambient Lighting**: `animate-pulse-glow` and `animate-float` blur orbs for depth.

---

## 5. Responsive Grid Standards

- **Mobile (<640px)**: Single-column vertical stack (`grid-cols-1`).
- **Tablet (640px–1024px)**: 2-column responsive layout (`md:grid-cols-2`).
- **Desktop (>1024px)**: 3-column / 4-column balanced grid (`lg:grid-cols-3` or `lg:grid-cols-4`).
