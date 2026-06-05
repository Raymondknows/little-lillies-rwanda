/**
 * SchoolBase API Client
 * Calls external backend API instead of local routes
 * 
 * Usage:
 * import { apiCall, apiUpload } from '@/lib/api'
 * 
 * const data = await apiCall('/paystack/init', { method: 'POST', body: { ... } })
 * const result = await apiUpload('/photos/upload', formData)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://schoolbase.live/api';

export class APIError extends Error {
  constructor(
    public status: number,
    public data: any,
    message?: string
  ) {
    super(message || `API Error: ${status}`);
    this.name = 'APIError';
  }
}

/**
 * Make API call to backend
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as any),
    },
    credentials: 'include', // Include cookies for auth
  };

  // Convert body object to JSON string
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new APIError(response.status, data, data.error || response.statusText);
    }

    // Some endpoints return empty responses
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error(`API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload files (FormData) to backend
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestInit, 'body'> = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method: 'POST',
    ...options,
    // Don't set Content-Type - browser will set it with boundary
    credentials: 'include',
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new APIError(response.status, data, data.error || response.statusText);
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error(`File upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * GET request shorthand
 */
export function apiGet<T = any>(endpoint: string, options: RequestInit = {}) {
  return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request shorthand
 */
export function apiPost<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
  return apiCall<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request shorthand
 */
export function apiPut<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
  return apiCall<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * PATCH request shorthand
 */
export function apiPatch<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
  return apiCall<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * DELETE request shorthand
 */
export function apiDelete<T = any>(endpoint: string, options: RequestInit = {}) {
  return apiCall<T>(endpoint, { ...options, method: 'DELETE' });
}
