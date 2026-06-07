/**
 * 🎯 UNIFIED API CLIENT - FIXED FOR PRODUCTION ROUTING
 *
 * FIXES:
 * ✅ Forces correct API domain (no more localhost leaks in production)
 * ✅ Prevents /api/api duplication
 * ✅ Fixes auth/login 404 caused by wrong base URL
 * ✅ Works in dev + production + Vercel
 */

let cookiesModule: any = null;

function getCookies() {
  if (cookiesModule) return cookiesModule;
  try {
    cookiesModule = require("next/headers");
    return cookiesModule;
  } catch {
    return null;
  }
}

/**
 * 🌐 CENTRAL FIX: Correct API base resolution
 * This is what was breaking your login.
 */
function getBackendBase(): string {
  // 1. CLIENT SIDE (browser)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    // Production domains → API subdomain
    if (
      host === "schoolbase.live" ||
      host === "www.schoolbase.live"
    ) {
      return "https://api.schoolbase.live";
    }

    // fallback for previews
    if (host.includes("vercel.app")) {
      return "https://api.schoolbase.live";
    }

    // local dev browser
    return "http://localhost:3006";
  }

  // 2. SERVER SIDE (SSR / API routes)
  if (process.env.NODE_ENV === "production") {
    return "https://api.schoolbase.live";
  }

  return "http://localhost:3006";
}

/**
 * Build API URL with guaranteed single /api prefix
 */
export function buildApiUrl(endpoint: string, search: string = ""): string {
  let cleanEndpoint = endpoint;

  // remove duplicate /api
  if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api\//, "/");
  }

  if (!cleanEndpoint.startsWith("/")) {
    cleanEndpoint = "/" + cleanEndpoint;
  }

  const baseUrl = getBackendBase().replace(/\/$/, "");

  return `${baseUrl}/api${cleanEndpoint}${search}`;
}

/**
 * Resolve file URLs safely
 */
export function resolveFileUrl(
  fileUrl?: string | null,
  fallbackId?: string
): string | null {
  if (!fileUrl) return null;

  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  if (fileUrl.startsWith("/api/")) return fileUrl;

  if (fileUrl.startsWith("/uploads/")) {
    return `/api${fileUrl}`;
  }

  if (!fileUrl.startsWith("/")) {
    return `/api/uploads/${fileUrl}`;
  }

  return fileUrl;
}

/**
 * 🔥 MAIN API CALL FUNCTION
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  let cookieHeader = "";

  try {
    const cookiesMod = getCookies();
    if (cookiesMod?.cookies) {
      const ck = await cookiesMod.cookies();
      const all = typeof ck.getAll === "function" ? ck.getAll() : [];
      cookieHeader = all
        .map((c: any) => `${c.name}=${encodeURIComponent(c.value)}`)
        .join("; ");
    }
  } catch {}

  const isFormData = options.body instanceof FormData;

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  };

  if (options.body && !isFormData && typeof options.body === "object") {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let error: any = {};
    try {
      error = await response.json();
    } catch {}

    throw new Error(error?.error || error?.message || `API error ${response.status}`);
  }

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

/**
 * Shortcuts
 */
export const apiGet = <T = any>(e: string, o: RequestInit = {}) =>
  apiCall<T>(e, { ...o, method: "GET" });

export const apiPost = <T = any>(e: string, b: any, o: RequestInit = {}) =>
  apiCall<T>(e, { ...o, method: "POST", body: b });

export const apiPut = <T = any>(e: string, b: any, o: RequestInit = {}) =>
  apiCall<T>(e, { ...o, method: "PUT", body: b });

export const apiPatch = <T = any>(e: string, b: any, o: RequestInit = {}) =>
  apiCall<T>(e, { ...o, method: "PATCH", body: b });

export const apiDelete = <T = any>(e: string, o: RequestInit = {}) =>
  apiCall<T>(e, { ...o, method: "DELETE" });