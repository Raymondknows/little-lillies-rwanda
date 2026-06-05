import fs from "fs/promises";
import path from "path";

// Local storage root (ONLY used for legacy/offline fallback if needed)
const storageRoot = path.resolve(process.cwd(), "storage");

const photoDir = path.join(storageRoot, "photos");
const transcriptDir = path.join(storageRoot, "transcripts");
const receiptDir = path.join(storageRoot, "receipts");
const signaturesDir = path.join(storageRoot, "signatures");
const stampsDir = path.join(storageRoot, "stamps");
const logosDir = path.join(storageRoot, "logos");

const allowedPhotoTypes: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const allowedPhotoExtensions = ["png", "jpg", "jpeg", "webp"];

async function ensureDirectories() {
  await fs.mkdir(photoDir, { recursive: true, mode: 0o775 });
  await fs.mkdir(transcriptDir, { recursive: true, mode: 0o775 });
  await fs.mkdir(receiptDir, { recursive: true, mode: 0o775 });
  await fs.mkdir(signaturesDir, { recursive: true, mode: 0o775 });
  await fs.mkdir(stampsDir, { recursive: true, mode: 0o775 });
  await fs.mkdir(logosDir, { recursive: true, mode: 0o775 });
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 🚨 LEGACY ONLY (DEPRECATED)
 * Backend now serves images directly via /uploads/photos
 */
export function photoApiUrl(pupilId: string) {
  return `/uploads/photos/${encodeURIComponent(pupilId)}`;
}

/**
 * LEGACY LOCAL SAVE (not used in production anymore)
 */
export async function saveStudentPhoto(pupilId: string, file: File) {
  await ensureDirectories();

  const ext = allowedPhotoTypes[file.type];
  if (!ext) {
    throw new Error("Unsupported photo type. Use PNG, JPG, or WEBP.");
  }

  for (const existingExt of allowedPhotoExtensions) {
    const existingPath = path.join(photoDir, `${pupilId}.${existingExt}`);
    if (await fileExists(existingPath)) {
      await fs.rm(existingPath);
    }
  }

  const filePath = path.join(photoDir, `${pupilId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // ⚠️ still returns backend-compatible path
  return `/uploads/photos/${pupilId}.${ext}`;
}

/**
 * MAIN UPLOAD FLOW (USED IN PROD)
 */
export async function uploadStudentPhotoToBackend(
  pupilId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3006";

  const response = await fetch(
    `${apiUrl}/api/admin/students/${encodeURIComponent(pupilId)}/photo`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to upload photo: ${response.statusText}`
    );
  }

  const result = await response.json();

  // backend returns: /uploads/photos/{filename}
  return result.photoUrl;
}

export async function getStudentPhotoFilePath(pupilId: string) {
  await ensureDirectories();

  for (const ext of allowedPhotoExtensions) {
    const candidate = path.join(photoDir, `${pupilId}.${ext}`);
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

/* =========================
   PDFs / RECEIPTS / ETC
========================= */

export async function saveTranscriptPdf(
  pupilId: string,
  pdfData: Uint8Array
) {
  await ensureDirectories();

  const filePath = path.join(transcriptDir, `${pupilId}.pdf`);
  await fs.writeFile(filePath, Buffer.from(pdfData));
  return filePath;
}

export async function saveReceiptPdf(
  paymentId: string,
  pdfData: Uint8Array
) {
  await ensureDirectories();

  const filePath = path.join(receiptDir, `${paymentId}.pdf`);
  await fs.writeFile(filePath, Buffer.from(pdfData));
  return filePath;
}

/* =========================
   SCHOOL ASSETS
========================= */

export async function saveSchoolSignature(schoolId: string, file: File) {
  await ensureDirectories();

  const ext = allowedPhotoTypes[file.type];
  if (!ext) {
    throw new Error("Unsupported image type. Use PNG, JPG, or WEBP.");
  }

  for (const existingExt of allowedPhotoExtensions) {
    const existingPath = path.join(
      signaturesDir,
      `${schoolId}.${existingExt}`
    );
    if (await fileExists(existingPath)) {
      await fs.rm(existingPath);
    }
  }

  const filePath = path.join(signaturesDir, `${schoolId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/uploads/signatures/${schoolId}.${ext}`;
}

export async function saveSchoolStamp(schoolId: string, file: File) {
  await ensureDirectories();

  const ext = allowedPhotoTypes[file.type];
  if (!ext) {
    throw new Error("Unsupported image type. Use PNG, JPG, or WEBP.");
  }

  for (const existingExt of allowedPhotoExtensions) {
    const existingPath = path.join(stampsDir, `${schoolId}.${existingExt}`);
    if (await fileExists(existingPath)) {
      await fs.rm(existingPath);
    }
  }

  const filePath = path.join(stampsDir, `${schoolId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/uploads/stamps/${schoolId}.${ext}`;
}

export async function saveSchoolLogo(schoolId: string, file: File) {
  await ensureDirectories();

  const ext = allowedPhotoTypes[file.type];
  if (!ext) {
    throw new Error("Unsupported image type. Use PNG, JPG, or WEBP.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const webpSizes = [64, 200, 600];

  for (const size of webpSizes) {
    const outputPath = path.join(logosDir, `${schoolId}-${size}.webp`);

    const output = await import("sharp").then((sharpModule) =>
      sharpModule.default(buffer)
        .resize(size, size, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer()
    );

    await fs.writeFile(outputPath, output);
  }

  return `/uploads/logos/${schoolId}-200.webp`;
}

/* =========================
   FILE LOOKUPS
========================= */

export async function getSchoolSignatureFilePath(schoolId: string) {
  await ensureDirectories();

  for (const ext of allowedPhotoExtensions) {
    const candidate = path.join(signaturesDir, `${schoolId}.${ext}`);
    if (await fileExists(candidate)) return candidate;
  }

  return null;
}

export async function getSchoolStampFilePath(schoolId: string) {
  await ensureDirectories();

  for (const ext of allowedPhotoExtensions) {
    const candidate = path.join(stampsDir, `${schoolId}.${ext}`);
    if (await fileExists(candidate)) return candidate;
  }

  return null;
}

export async function getSchoolLogoFilePath(schoolId: string) {
  await ensureDirectories();

  const candidate = path.join(logosDir, `${schoolId}-200.webp`);
  if (await fileExists(candidate)) return candidate;

  return null;
}