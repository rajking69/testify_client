"use client";

import { getApiBaseUrl } from "@/lib/api-config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
}

type RequestDedupeKey = string;

class ApiClient {
  private baseUrl: string;
  private pendingRequests: Map<RequestDedupeKey, Promise<ApiResponse<unknown>>> = new Map();
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
  private responseInterceptors: Array<
    (response: ApiResponse<unknown>) => ApiResponse<unknown>
  > = [];

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: ApiResponse<unknown>) => ApiResponse<unknown>
  ) {
    this.responseInterceptors.push(interceptor);
  }

  private getDedupeKey(method: HttpMethod, endpoint: string, body?: unknown): RequestDedupeKey {
    return `${method}:${endpoint}:${body ? JSON.stringify(body) : ""}`;
  }

  private async handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
    let data: ApiResponse<T> = { success: false } as ApiResponse<T>;
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: "Invalid JSON response" } as ApiResponse<T>;
    }

    if (!res.ok || data.success === false) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      (error as any).status = res.status;
      (error as any).code = data.code;
      (error as any).response = data;
      throw error;
    }
    return data;
  }

  private applyRequestInterceptors(config: RequestConfig): RequestConfig {
    return this.requestInterceptors.reduce((cfg, interceptor) => interceptor(cfg), config);
  }

  private applyResponseInterceptors<T>(response: ApiResponse<T>): ApiResponse<T> {
    return this.responseInterceptors.reduce(
      (resp: ApiResponse<unknown>, interceptor: (r: ApiResponse<unknown>) => ApiResponse<unknown>) => interceptor(resp),
      response as ApiResponse<unknown>
    ) as ApiResponse<T>;
  }

  async request<T>(
    endpoint: string,
    options: Partial<RequestConfig> = {},
    deduplicate = true
  ): Promise<ApiResponse<T>> {
    const method = (options.method || "GET").toUpperCase() as HttpMethod;
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestConfig = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: options.credentials ?? "include",
      signal: options.signal,
    };

    const finalConfig = this.applyRequestInterceptors(config);

    // Request deduplication for GET requests
    if (deduplicate && method === "GET") {
      const key = this.getDedupeKey(method, endpoint, options.body);
      const existing = this.pendingRequests.get(key);
      if (existing) {
        return existing as Promise<ApiResponse<T>>;
      }
    }

    const promise = (async () => {
      try {
        const res = await fetch(url, finalConfig as RequestInit);
        let response = await this.handleResponse<T>(res);
        response = this.applyResponseInterceptors(response);
        return response;
      } finally {
        if (deduplicate && method === "GET") {
          const key = this.getDedupeKey(method, endpoint, options.body);
          this.pendingRequests.delete(key);
        }
      }
    })();

    if (deduplicate && method === "GET") {
      const key = this.getDedupeKey(method, endpoint, options.body);
      this.pendingRequests.set(key, promise as Promise<ApiResponse<unknown>>);
    }

    return promise;
  }

  get<T>(endpoint: string, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  clearDedupeCache() {
    this.pendingRequests.clear();
  }
}

export const apiClient = new ApiClient();

// Add default request interceptor for auth headers if needed
apiClient.addRequestInterceptor((config) => {
  // Could add auth token here if not using cookies
  return config;
});

// Add default response interceptor for logging in development
if (process.env.NODE_ENV === "development") {
  apiClient.addResponseInterceptor((response) => {
    console.debug("[API Response]", response);
    return response;
  });
}

export default apiClient;