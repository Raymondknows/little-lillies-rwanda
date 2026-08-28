/**
 * Get the backend URL based on environment
 * - Explicit env var: use NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BACKEND_URL
 * - Client-side: detect from window.location.hostname
 * - Server-side: use sensible defaults
 */
function normalizeBackendUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function getBackendUrl(): string {
  // Admin pages use same-origin proxy routes so their HttpOnly session cookie
  // is forwarded to the API even though the custom frontend and API domains differ.
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/admin') || pathname.startsWith('/schoolbase-admin')) {
      return window.location.origin;
    }
  }

  // First, check if explicitly set in environment
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeBackendUrl(process.env.NEXT_PUBLIC_API_URL);
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  }

  // Allow server-side BACKEND_URL fallback if only backend env is defined.
  if (process.env.BACKEND_URL) {
    return normalizeBackendUrl(process.env.BACKEND_URL);
  }

  if (process.env.API_URL) {
    return normalizeBackendUrl(process.env.API_URL);
  }

  if (process.env.BACKEND_API_URL) {
    return normalizeBackendUrl(process.env.BACKEND_API_URL);
  }

  // Client-side: detect from window.location
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return 'http://localhost:3006';
    }

    if (host === 'littlelilliesschool.com' || host === 'www.littlelilliesschool.com' || host.endsWith('.littlelilliesschool.com')) {
      return 'https://custom-api.schoolbase.live';
    }

    if (host.includes('schoolbase.live')) {
      return 'https://api.schoolbase.live';
    }

    if (host.includes('vercel.app')) {
      return 'https://custom-api.schoolbase.live';
    }
  }

  // Server-side or fallback: use the custom app in production unless explicitly overridden
  if (process.env.NODE_ENV === 'production') {
    return 'https://custom-api.schoolbase.live';
  }

  return 'http://localhost:3006';
}
