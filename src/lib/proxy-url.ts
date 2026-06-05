/**
 * Constructs the backend URL for proxy routes.
 * Handles both relative and absolute API base URLs.
 */
export function getBackendUrl(
  apiBase: string,
  endpoint: string,
  search: string = ''
): string {
  if (!apiBase) {
    apiBase = '/api';
  }

  // If apiBase is a relative path, use the backend server
  if (apiBase.startsWith('/')) {
    const backendBase = process.env.BACKEND_URL || 'http://localhost:3006';
    return `${backendBase}${endpoint}${search}`;
  }

  // If apiBase is an absolute URL, use it with the endpoint
  return `${apiBase.replace(/\/$/, '')}${endpoint}${search}`;
}
