import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendEmail, buildSignupVerificationEmail } from "@/lib/email";
import type { UserRole } from "@prisma/client";

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
};

export type ParentSession = {
  guardianId: string;
  schoolId: string;
  name: string;
  phone: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

async function signToken(payload: JWTPayload, cookieName: string) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function createStaffSession(user: StaffSession) {
  await signToken(user, STAFF_COOKIE);
}

export async function createParentSession(session: ParentSession) {
  await signToken(session, PARENT_COOKIE);
}

export async function destroyStaffSession() {
  const jar = await cookies();
  jar.delete(STAFF_COOKIE);
}

export async function destroyParentSession() {
  const jar = await cookies();
  jar.delete(PARENT_COOKIE);
}

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
  const session = await getStaffSession();
  if (!session || session.role !== "PLATFORM_ADMIN") return null;
  return session;
}

export async function requirePlatformAdminSession() {
  const session = await getPlatformAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
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

export async function requireStaffSession(options: { allowTrial?: boolean } = {}) {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  // Platform admins bypass school checks
  if (session.role === "PLATFORM_ADMIN") return session;

  // If the session is scoped to a school, ensure the school's status allows use.
  if (session.schoolId) {
    const school = await prisma.school.findUnique({ where: { id: session.schoolId } });
    if (!school) throw new Error("UNAUTHORIZED");

    // If the school is not active (e.g., still on initial signup or free plan), redirect to subscribe
    // unless the caller explicitly allows trial school access (e.g. support flows).
    if (school.status === "TRIAL" && !options.allowTrial) {
      redirect('/admin/subscribe');
    }
  }

  return session;
}

const OTP_VALID_MINUTES = 15;

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000)).padStart(6, "0");
}

export async function loginStaff(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const signupOtp = await prisma.signupOtp.findUnique({ where: { email } });
    if (signupOtp && !signupOtp.verifiedAt) {
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);

      await prisma.signupOtp.update({
        where: { email },
        data: {
          otpHash,
          attempts: 0,
          expiresAt,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
      const { subject, text, html } = buildSignupVerificationEmail({
        otp,
        adminName: signupOtp.adminName,
        adminEmail: signupOtp.email,
        schoolName: signupOtp.schoolName,
        appUrl,
      });

      await sendEmail({
        to: signupOtp.email,
        subject,
        text,
        html,
      });

      return {
        verifyEmail: signupOtp.email,
        verifyMessage:
          "Your signup is not complete. A new verification code was sent to your email.",
      };
    }

    return { error: "Invalid email or password." };
  }

  if (!user.passwordHash || !user.schoolId) {
    return { error: "Invalid email or password." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  await createStaffSession({
    userId: user.id,
    schoolId: user.schoolId,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return { success: true };
}

export async function loginPlatformAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || user.role !== "PLATFORM_ADMIN") {
    return { error: "Invalid platform admin credentials." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid platform admin credentials." };

  await createStaffSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return { success: true };
}

const COUNTRY_DIALING_CODE: Record<string, string> = {
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

function buildLoginPhoneCandidates(phone: string, country?: string) {
  const normalized = normalizePhone(phone, country);
  const candidates = new Set<string>();
  if (!normalized) return [];

  candidates.add(normalized);
  if (normalized.startsWith("+")) {
    const match = normalized.match(/^\+(\d{1,3})(\d+)$/);
    if (match) {
      candidates.add(`0${match[2]}`);
    }
  } else if (normalized.startsWith("0")) {
    const countryCode = country ? COUNTRY_DIALING_CODE[country.toUpperCase()] : undefined;
    if (countryCode) {
      candidates.add(`${countryCode}${normalized.slice(1)}`);
    }

    if (!countryCode) {
      // If the school is not known, also try the most common supported trunk codes
      candidates.add(`+234${normalized.slice(1)}`);
      candidates.add(`+233${normalized.slice(1)}`);
      candidates.add(`+250${normalized.slice(1)}`);
    }
  }

  return Array.from(candidates);
}

export async function loginParent(
  phone: string,
  admissionNo: string,
  schoolSlug?: string,
) {
  let country: string | undefined;

  if (schoolSlug) {
    const school = await prisma.school.findUnique({
      where: { slug: schoolSlug },
      select: { country: true },
    });
    country = school?.country ?? undefined;
  }
  // Prefer admission-number-first lookup: find pupil(s) matching the admission
  // number and then locate a guardian for that pupil. This makes the
  // admission number the primary key for parent login (phone is secondary).
  const normalizeAdmission = (a: string) => a.replace(/\W+/g, "").toLowerCase();
  const inputAdm = normalizeAdmission(admissionNo.trim());

  if (inputAdm) {
    // Find candidate pupils in the school (if provided) or across all schools.
    const pupilWhere: any = schoolSlug
      ? { school: { slug: schoolSlug }, admissionNo: { contains: admissionNo.trim() } }
      : { admissionNo: { contains: admissionNo.trim() } };

    const pupils = await prisma.pupil.findMany({
      where: pupilWhere,
      include: { guardians: { include: { guardian: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Filter pupils by normalized admission match (exact or prefix)
    const matchedPupil = pupils.find((p) => {
      const stored = p.admissionNo ?? "";
      const normStored = normalizeAdmission(stored);
      return (
        normStored === inputAdm ||
        normStored.startsWith(inputAdm) ||
        inputAdm.startsWith(normStored)
      );
    });

    if (matchedPupil) {
      // If phone provided, try to match among the pupil's guardians first.
      const phoneCandidates = phone ? buildLoginPhoneCandidates(phone, country) : [];

      let guardianRecord: any | null = null;

      if (phoneCandidates.length > 0) {
        for (const gp of matchedPupil.guardians) {
          const g = gp.guardian;
          if (!g) continue;
          const gPhones = [g.phone, g.whatsapp].filter(Boolean) as string[];
          if (gPhones.some((ph) => phoneCandidates.includes(ph))) {
            guardianRecord = g;
            break;
          }
        }
      }

      // If no matching guardian by phone, fall back to any guardian for the pupil.
      if (!guardianRecord) {
        // Prefer guardian with whatsapp, then phone, otherwise first guardian.
        guardianRecord = matchedPupil.guardians.map((g) => g.guardian).find((g) => g?.whatsapp) ??
          matchedPupil.guardians.map((g) => g.guardian).find((g) => g?.phone) ??
          matchedPupil.guardians.map((g) => g.guardian)[0] ?? null;
      }

      if (!guardianRecord) {
        return { error: "No guardian found for this admission number." };
      }

      await createParentSession({
        guardianId: guardianRecord.id,
        schoolId: matchedPupil.schoolId,
        name: `${guardianRecord.firstName} ${guardianRecord.lastName}`,
        phone: guardianRecord.whatsapp || guardianRecord.phone || "",
      });

      return { success: true };
    }
  }

  // Fallback: phone-first lookup (legacy behavior)
  const phoneCandidates = buildLoginPhoneCandidates(phone, country);
  if (phoneCandidates.length === 0) {
    return { error: "Phone number not found. Contact the school." };
  }

  const predicate = phoneCandidates.flatMap((value) => [
    { phone: value },
    { whatsapp: value },
  ]);

  const whereCondition = schoolSlug
    ? {
        school: { slug: schoolSlug },
        OR: predicate,
      }
    : {
        OR: predicate,
      };

  const guardian = await prisma.guardian.findFirst({
    where: whereCondition,
    include: {
      school: true,
      pupils: { include: { pupil: true } },
    },
  });

  if (!guardian) {
    return { error: "Phone number not found. Contact the school." };
  }

  const inputAdmNorm = inputAdm;
  if (inputAdmNorm) {
    const link = guardian.pupils.find((gp) => {
      const stored = gp.pupil.admissionNo ?? "";
      const normStored = normalizeAdmission(stored);
      return (
        normStored === inputAdmNorm ||
        normStored.startsWith(inputAdmNorm) ||
        inputAdmNorm.startsWith(normStored)
      );
    });
    if (!link) {
      return { error: "Admission number does not match this phone." };
    }
  }

  await createParentSession({
    guardianId: guardian.id,
    schoolId: guardian.schoolId,
    name: `${guardian.firstName} ${guardian.lastName}`,
    phone: guardian.phone,
  });

  return { success: true };
}
