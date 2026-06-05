"use server";

import { redirect } from "next/navigation";
import {
  destroyParentSession,
  destroyStaffSession,
  loginParent,
  loginStaff,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
import { hashPassword } from "@/lib/auth";

export async function staffLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return loginStaff(email, password);
}

export async function staffLogoutAction() {
  await destroyStaffSession();
  redirect("/login");
}

export async function parentLoginAction(formData: FormData) {
  const phone = String(formData.get("phone") ?? "");
  const admissionNo = String(formData.get("admissionNo") ?? "");
  return loginParent(phone, admissionNo);
}

export async function parentLogoutAction() {
  await destroyParentSession();
  redirect("/parent/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid revealing whether an account exists.
  if (!user) {
    redirect('/forgot-password?sent=1');
    return;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash,
      attempts: 0,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
  const { subject, text, html } = buildPasswordResetEmail({
    token,
    userName: user.name,
    userEmail: user.email,
    appUrl,
  });

  await sendEmail({ to: user.email, subject, text, html });
  redirect('/forgot-password?sent=1');
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !token || password.length < 8) {
    redirect(`/reset-password?error=${encodeURIComponent("Invalid request")}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect(`/reset-password?error=${encodeURIComponent("Invalid request")}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  }

  const reset = await prisma.passwordReset.findFirst({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!reset) {
    redirect(`/reset-password?error=${encodeURIComponent("Invalid or expired reset link")}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  }

  const ok = await bcrypt.compare(token, reset.tokenHash);
  if (!ok) {
    await prisma.passwordReset.update({ where: { id: reset.id }, data: { attempts: reset.attempts + 1 } });
    redirect(`/reset-password?error=${encodeURIComponent("Invalid or expired reset link")}&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  }

  const newHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    await tx.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
  });
  redirect('/login?reset=success');
}
