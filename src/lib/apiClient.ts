import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse(res: Response) {
  let data: any = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

// Dedupe concurrent GETs to avoid StrictMode / multi-panel storms hitting rate limits
const _inFlight = new Map<string, Promise<any>>();
const _cache = new Map<string, { data: any; ts: number }>();
const GET_CACHE_TTL = 15_000;

function dedupedGet(endpoint: string, fetcher: () => Promise<any>): Promise<any> {
  const key = `GET:${endpoint}`;
  const now = Date.now();
  const cached = _cache.get(key);
  if (cached && now - cached.ts < GET_CACHE_TTL) return Promise.resolve(cached.data);
  const inflight = _inFlight.get(key);
  if (inflight) return inflight;
  const p = fetcher()
    .then((data) => {
      _cache.set(key, { data, ts: Date.now() });
      return data;
    })
    .finally(() => _inFlight.delete(key));
  _inFlight.set(key, p);
  return p;
}

export const apiClient = {
  get: async (endpoint: string) => {
    return dedupedGet(endpoint, async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      return handleResponse(res);
    });
  },
  post: async (endpoint: string, body?: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },
  put: async (endpoint: string, body?: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },
  patch: async (endpoint: string, body?: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res);
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse(res);
  },
};
