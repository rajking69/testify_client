# Testify — GitHub Project & Branch Management Guidelines

This document outlines the strict team Git workflow for the Testify project.

---

## 1. Branch Structure
- `main` → Final, stable, and tested production code only.
- `dev` → Shared development, integration, and testing branch.
- Member branches → Individual development (`rajking`, `mamun`, `tirtho`, `mahadi`).

---

## 2. Core Rules & Workflow

1. **Never develop or commit directly on `main` or `dev`.**
2. **Always work on your assigned branch** (e.g., `rajking`).
3. **Pull latest `dev` before starting work**:
   ```bash
   git switch rajking
   git pull origin dev
   ```
4. **Push completed work to your own branch**:
   ```bash
   git add .
   git commit -m "feat: Describe your change"
   git push origin rajking
   ```
5. **Create a Pull Request (PR) to `dev`**:
   - `rajking` → PR → `dev`
   - PR reviewed and merged into `dev` by repository owner / reviewer.
6. **Final Release**:
   - `dev` → PR → `main` (Only tested and stable code moves to `main`).

---

## 3. Quick Command Reference
```bash
# Update local work branch from dev
git switch rajking
git pull origin dev

# Save and push local work
git add .
git commit -m "feat: <message>"
git push origin rajking
```
