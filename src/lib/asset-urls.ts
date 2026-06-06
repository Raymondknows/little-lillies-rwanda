/**
 * Client-safe utility for resolving school asset URLs
 * Handles backward compatibility for old /uploads/ paths
 * No Node.js dependencies - safe to use in client components
 */

export function resolveSchoolAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already an API route, pass through
  if (url.startsWith("/api/admin/school-")) return url;

  // External URLs pass through
  if (/^https?:\/\//.test(url)) return url;

  // Convert old local paths to new API routes
  if (url.startsWith("/uploads/signatures/")) {
    return `/api/admin/school-signature`;
  }
  if (url.startsWith("/uploads/stamps/")) {
    return `/api/admin/school-stamp`;
  }
  if (url.startsWith("/uploads/logos/")) {
    return `/api/admin/school-logo`;
  }

  // Pass through anything else
  return url;
}
