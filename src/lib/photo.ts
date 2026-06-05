export function resolvePhotoSrc(photoUrl?: string | null, pupilId?: string) {
  if (!photoUrl) return null;
  
  // External URLs pass through as-is
  if (/^https?:\/\//.test(photoUrl)) return photoUrl;
  
  // Backend uploaded photos (/uploads/photos/{filename})
  // Route through frontend proxy for consistent authentication and caching
  if (photoUrl.startsWith("/uploads/photos/")) {
    return `/api/photos/${encodeURIComponent(pupilId || "unknown")}`;
  }
  
  // Frontend API paths pass through directly
  if (photoUrl.startsWith("/api/photos")) return photoUrl;
  
  // Fallback: if we have a pupil id, use the frontend proxy route
  if (pupilId) return `/api/photos/${encodeURIComponent(pupilId)}`;
  
  return photoUrl;
}

export default resolvePhotoSrc;
