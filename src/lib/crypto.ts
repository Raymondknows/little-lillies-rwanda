import crypto from "crypto";

const MASTER_KEY = process.env.MASTER_KEY;
if (!MASTER_KEY) {
  // Do not throw at import time in CI; functions will throw when used if missing.
  // But log so developers notice when running locally.
  console.warn("MASTER_KEY is not set — encrypted fields will not be usable.");
}

function getKey() {
  if (!MASTER_KEY) throw new Error("Missing MASTER_KEY environment variable (base64 32 bytes)");
  const key = Buffer.from(MASTER_KEY, "base64");
  if (key.length !== 32) throw new Error("MASTER_KEY must be base64-encoded 32 bytes");
  return key;
}

export function encryptText(plain: string) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}::${encrypted.toString("base64")}::${tag.toString("base64")}`;
}

export function decryptText(payload: string) {
  const key = getKey();
  const parts = (payload || "").split("::");
  if (parts.length !== 3) return null;
  const iv = Buffer.from(parts[0], "base64");
  const data = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
