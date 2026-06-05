import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const storageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../storage",
);
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

export function photoApiUrl(pupilId: string) {
  return `/api/photos/${pupilId}`;
}

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
  return `${photoApiUrl(pupilId)}?t=${Date.now()}`;
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

export async function saveTranscriptPdf(pupilId: string, pdfData: Uint8Array) {
  await ensureDirectories();
  const filePath = path.join(transcriptDir, `${pupilId}.pdf`);
  await fs.writeFile(filePath, Buffer.from(pdfData));
  return filePath;
}

export async function saveReceiptPdf(paymentId: string, pdfData: Uint8Array) {
  await ensureDirectories();
  const filePath = path.join(receiptDir, `${paymentId}.pdf`);
  await fs.writeFile(filePath, Buffer.from(pdfData));
  return filePath;
}

export async function saveSchoolSignature(schoolId: string, file: File) {
  await ensureDirectories();
  const ext = allowedPhotoTypes[file.type];
  if (!ext) {
    throw new Error("Unsupported image type. Use PNG, JPG, or WEBP.");
  }

  // Remove old signature if exists
  for (const existingExt of allowedPhotoExtensions) {
    const existingPath = path.join(signaturesDir, `${schoolId}.${existingExt}`);
    if (await fileExists(existingPath)) {
      await fs.rm(existingPath);
    }
  }

  const filePath = path.join(signaturesDir, `${schoolId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return `/api/school-signature/${schoolId}`;
}

export async function saveSchoolStamp(schoolId: string, file: File) {
  await ensureDirectories();
  const ext = allowedPhotoTypes[file.type];
  if (!ext) {
    throw new Error("Unsupported image type. Use PNG, JPG, or WEBP.");
  }

  // Remove old stamp if exists
  for (const existingExt of allowedPhotoExtensions) {
    const existingPath = path.join(stampsDir, `${schoolId}.${existingExt}`);
    if (await fileExists(existingPath)) {
      await fs.rm(existingPath);
    }
  }

  const filePath = path.join(stampsDir, `${schoolId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return `/api/school-stamp/${schoolId}`;
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
      sharpModule.default(buffer).resize(size, size, { fit: "cover" }).webp({ quality: 80 }).toBuffer(),
    );
    await fs.writeFile(outputPath, output);
  }

  return `/api/school-logo/${schoolId}`;
}

export async function getSchoolSignatureFilePath(schoolId: string) {
  await ensureDirectories();
  for (const ext of allowedPhotoExtensions) {
    const candidate = path.join(signaturesDir, `${schoolId}.${ext}`);
    if (await fileExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function getSchoolStampFilePath(schoolId: string) {
  await ensureDirectories();
  for (const ext of allowedPhotoExtensions) {
    const candidate = path.join(stampsDir, `${schoolId}.${ext}`);
    if (await fileExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function getSchoolLogoFilePath(schoolId: string) {
  await ensureDirectories();
  const candidate = path.join(logosDir, `${schoolId}-200.webp`);
  if (await fileExists(candidate)) {
    return candidate;
  }
  return null;
}
