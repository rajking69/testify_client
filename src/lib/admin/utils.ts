import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, formatStr: string = "PPP") {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "Invalid date";
  return format(dateObj, formatStr);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "Invalid date";
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date, formatStr: string = "PPp") {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) return "Invalid date";
  return format(dateObj, formatStr);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get status badge color based on status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    deactivated:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    suspended:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    draft:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    scheduled:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    published:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    completed:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    pending:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    failed:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    free: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    pro: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
    institutional:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  };
  return colors[status] || colors.active;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getSortValue(item: any, key: string): any {
  if (!item) return undefined;
  if (key in item) return item[key];
  if (key.includes(".")) {
    return key.split(".").reduce((acc, part) => acc?.[part], item);
  }
  if (key === "schedule" && item.schedule?.startWindow) {
    return item.schedule.startWindow;
  }
  return item[key];
}

/**
 * Sort array by key with support for dates, numbers, booleans, nested keys, and custom rankings
 */
export function sortByKey<T>(
  array: T[],
  key?: string | keyof T,
  order: "asc" | "desc" = "asc",
): T[] {
  if (!key || !array || array.length <= 1) return array || [];

  const keyStr = String(key);

  return [...array].sort((a, b) => {
    const aVal = getSortValue(a, keyStr);
    const bVal = getSortValue(b, keyStr);

    if ((aVal === undefined || aVal === null) && (bVal === undefined || bVal === null)) {
      return 0;
    }
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    // Difficulty ordering (easy < medium < hard)
    if (keyStr === "difficulty") {
      const diffOrder: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
      const aRank = diffOrder[String(aVal).toLowerCase()] ?? 0;
      const bRank = diffOrder[String(bVal).toLowerCase()] ?? 0;
      if (aRank !== bRank) {
        return order === "asc" ? aRank - bRank : bRank - aRank;
      }
    }

    // Tier ordering (free < pro < institutional)
    if (keyStr === "tier") {
      const tierOrder: Record<string, number> = { free: 1, pro: 2, institutional: 3 };
      const aRank = tierOrder[String(aVal).toLowerCase()] ?? 0;
      const bRank = tierOrder[String(bVal).toLowerCase()] ?? 0;
      if (aRank !== bRank) {
        return order === "asc" ? aRank - bRank : bRank - aRank;
      }
    }

    // Numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Booleans
    if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      const aNum = aVal ? 1 : 0;
      const bNum = bVal ? 1 : 0;
      return order === "asc" ? aNum - bNum : bNum - aNum;
    }

    // Strings (with date check)
    if (typeof aVal === "string" && typeof bVal === "string") {
      const isDateKey = /date|created|at|active|window|updated|renewal|start|end/i.test(keyStr);
      if (isDateKey) {
        const aTime = Date.parse(aVal);
        const bTime = Date.parse(bVal);
        if (!isNaN(aTime) && !isNaN(bTime)) {
          return order === "asc" ? aTime - bTime : bTime - aTime;
        }
      }

      const cmp = aVal.localeCompare(bVal, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return order === "asc" ? cmp : -cmp;
    }

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term
 */
export function filterBySearch<T>(
  array: T[],
  searchKeys: (keyof T)[],
  searchTerm: string,
): T[] {
  if (!searchTerm) return array;

  const lowerSearch = searchTerm.toLowerCase();
  return array.filter((item) =>
    searchKeys.some((key) => {
      const value = item[key];
      return value && String(value).toLowerCase().includes(lowerSearch);
    }),
  );
}

/**
 * Paginate array
 */
export function paginate<T>(array: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
}

/**
 * Calculate pagination info
 */
export function getPaginationInfo(
  total: number,
  page: number,
  pageSize: number,
) {
  if (!total || total <= 0 || !pageSize || pageSize <= 0) {
    return {
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const totalPages = Math.ceil(total / pageSize);
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize + 1;
  const endIndex = Math.min(validPage * pageSize, total);

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}

/**
 * Simulate async API call with delay
 */
export async function simulateApiCall<T>(
  data: T,
  delay: number = 500,
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

/**
 * Simulate API error
 */
export async function simulateApiError(
  message: string = "An error occurred",
  delay: number = 500,
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}

/**
 * Export array of objects to CSV file
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          let val = row[fieldName];
          if (val === null || val === undefined) val = "";
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
