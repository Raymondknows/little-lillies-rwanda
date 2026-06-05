export function resolvePhotoSrc(
  photoUrl?: string | null,
  pupilId?: string
) {
  if (!photoUrl) return null;

  // External URLs pass through as-is
  if (/^https?:\/\//.test(photoUrl)) return photoUrl;

  // If backend already returned a correct uploads path, use it directly
  if (photoUrl.startsWith("/uploads/photos/")) {
    return photoUrl;
  }

  // If backend returned only filename (common case), normalize it
  if (!photoUrl.startsWith("/")) {
    return `/uploads/photos/${photoUrl}`;
  }

  // Legacy support: if still receiving /api/photos routes, convert them
  if (photoUrl.startsWith("/api/photos")) {
    // fallback mapping to uploads (since API route no longer exists)
    return photoUrl.replace("/api/photos", "/uploads/photos");
  }

  // Fallback: if we only have pupilId, assume filename equals pupilId
  if (pupilId) {
    return `/uploads/photos/${encodeURIComponent(pupilId)}`;
  }

  // Final fallback: return original
  return photoUrl;
}

export default resolvePhotoSrc;