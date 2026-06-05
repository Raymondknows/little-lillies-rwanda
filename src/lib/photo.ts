export function resolvePhotoSrc(photoUrl?: string | null, pupilId?: string) {
  if (!photoUrl) return null;
  if (/^https?:\/\//.test(photoUrl)) return photoUrl;
  // If already a same-origin API path, use it directly (proxy route will fetch from backend)
  if (photoUrl.startsWith("/api/photos")) return photoUrl;
  // If an absolute path on the server, prefer backend API host
  if (photoUrl.startsWith("/")) {
    const backend = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");
    return `${backend}${photoUrl}`;
  }
  // Fallback: if we have a pupil id, use the frontend proxy route
  if (pupilId) return `/api/photos/${encodeURIComponent(pupilId)}`;
  return photoUrl;
}

export default resolvePhotoSrc;
