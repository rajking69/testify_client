/**
 * Centralized API and Auth URL Configuration for Testify.
 * Ensures consistent endpoint paths across both Local and Production environments.
 * Prevents issues like `/api/api/exams` or missing `/api/exams`.
 */

/**
 * Resolves the backend base API URL dynamically from environment variables.
 * Ensures the resulting URL always ends in `/api` without duplicating slashes or `/api/api`.
 */
export function getApiBaseUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000/api";

  url = url.trim().replace(/\/+$/, "");

  // If the URL already ends with /api, preserve it; otherwise append /api
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

/**
 * Resolves the Better Auth base server URL dynamically.
 * Strips any trailing `/api` or slashes to ensure it points to the server root domain.
 * Does NOT hardcode any production domain as fallback.
 */
export function getAuthBaseUrl(): string {
  const directAuthUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (directAuthUrl && directAuthUrl.trim()) {
    return directAuthUrl.trim().replace(/\/+$/, "");
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl.trim()) {
    return backendUrl.trim().replace(/\/+$/, "");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl.trim()) {
    return apiUrl.trim().replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }

  // Safe development fallback
  return "http://localhost:5000";
}

export const API_BASE_URL = getApiBaseUrl();
