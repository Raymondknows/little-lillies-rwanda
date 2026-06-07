import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, buildSignupVerificationEmail } from "@/lib/email";

export type UserRole = "SCHOOL_ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "PLATFORM_ADMIN";

const STAFF_COOKIE = "schoolbase_staff";
const PARENT_COOKIE = "schoolbase_parent";

function secret() {
  const key = process.env.SESSION_SECRET ?? "schoolbase-dev-secret-change-me";
  return new TextEncoder().encode(key);
}

export type StaffSession = {
  userId: string;
  schoolId?: string | null;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
};

export type ParentSession = {
  guardianId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
};

export async function getStaffSession(): Promise<StaffSession | null> {
  const jar = await cookies();
  const token = jar.get(STAFF_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as StaffSession;
  } catch {
    return null;
  }
}

export async function getPlatformAdminSession(): Promise<StaffSession | null> {
  return null;
}

export async function requirePlatformAdminSession(): Promise<StaffSession> {
  throw new Error("Use GET /api/platform-admin/session instead");
}

export async function getParentSession(): Promise<ParentSession | null> {
  const jar = await cookies();
  const token = jar.get(PARENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as ParentSession;
  } catch {
    return null;
  }
}

export async function destroyStaffSession() {
  const jar = await cookies();
  jar.delete(STAFF_COOKIE);
}

export async function destroyParentSession() {
  const jar = await cookies();
  jar.delete(PARENT_COOKIE);
}

export async function requireStaffSession(options?: { allowTrial?: boolean }) {
  throw new Error("Use backend API for session validation instead");
}

export async function createStaffSession(): Promise<void> {
  throw new Error("Use backend API for session creation instead");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const COUNTRY_DIALING_CODE: Record<string, string> = {
  NG: "+234",
  GH: "+233",
  RW: "+250",
};

export function normalizePhone(phone: string, country?: string) {
  const cleaned = phone
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^+\d]/g, "");

  if (!cleaned) return "";
  const normalized = cleaned.startsWith("00") ? `+${cleaned.slice(2)}` : cleaned;
  if (normalized.startsWith("+")) {
    return normalized;
  }

  if (normalized.startsWith("0")) {
    const code = country ? COUNTRY_DIALING_CODE[country.toUpperCase()] : undefined;
    if (code) {
      return `${code}${normalized.slice(1)}`;
    }
  }

  return normalized;
}
