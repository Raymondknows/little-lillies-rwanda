/**
 * Backend-only upload helpers.
 *
 * The frontend no longer reads or writes any local files on disk.
 * All file uploads and asset storage are handled by the backend API.
 */

import { cookies as nextCookies } from "next/headers";
import { buildApiUrl } from "./api-client";

/**
 * Upload student photo to backend
 * @param pupilId - Student ID
 * @param file - Photo file to upload
 * @returns Backend photo URL path (e.g., /uploads/photos/filename.jpg)
 */
export async function uploadStudentPhotoToBackend(
  pupilId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const endpoint = `/admin/students/${encodeURIComponent(pupilId)}/photo`;
  const backendUrl = buildApiUrl(endpoint);

  let cookieHeader = "";
  try {
    const ck = await nextCookies();
    const all = typeof ck.getAll === "function" ? ck.getAll() : [];
    cookieHeader = all.map((c: any) => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");
  } catch (err) {
    // Cookies not available in some contexts
  }

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Photo upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.photoUrl;
  } catch (err: any) {
    console.error("[PHOTO_UPLOAD_ERROR]", { pupilId, error: String(err) });
    throw err;
  }
}

/**
 * Upload school asset (logo, signature, stamp) to backend
 * @param file - Asset file to upload
 * @param assetType - Type of asset: "logo", "signature", or "stamp"
 * @returns Backend asset URL path (e.g., /uploads/settings/filename.jpg)
 */
export async function uploadSchoolAssetToBackend(
  file: File,
  assetType: "logo" | "signature" | "stamp"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", assetType);

  const endpoint = `/admin/settings/upload`;
  const backendUrl = buildApiUrl(endpoint);

  let cookieHeader = "";
  try {
    const ck = await nextCookies();
    const all = typeof ck.getAll === "function" ? ck.getAll() : [];
    cookieHeader = all.map((c: any) => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");
  } catch (err) {
    // Cookies not available in some contexts
  }

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      body: formData,
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Asset upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.url;
  } catch (err: any) {
    console.error("[ASSET_UPLOAD_ERROR]", { assetType, error: String(err) });
    throw err;
  }
}

