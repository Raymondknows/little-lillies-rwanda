/**
 * Get the backend URL based on environment
 * - Production (Vercel): https://api.schoolbase.live
 * - Development: http://localhost:3006 (or process.env.BACKEND_URL)
 */
export function getBackendUrl(): string {
  // For production (Vercel), use api.schoolbase.live
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.schoolbase.live';
  }
  // For development, use env var or localhost
  return process.env.BACKEND_URL || 'http://localhost:3006';
}
