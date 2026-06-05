"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { hashPassword, createStaffSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, buildSignupVerificationEmail, buildWelcomeEmail, buildPlatformCommunicationEmail, logEmail } from "@/lib/email";
import { Prisma, UserRole } from "@prisma/client";

const OTP_VALID_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000)).padStart(6, "0");
}

export async function requestSignupOtpAction(formData: FormData) {
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const adminName = String(formData.get("adminName") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const country = String(formData.get("country") ?? "").trim().toUpperCase();

  if (!schoolName || !slug || !adminName || !adminEmail || !password) {
    return;
  }

  const existingSchool = await prisma.school.findUnique({ where: { slug } });
  if (existingSchool) {
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) {
    return;
  }

  const passwordHash = await hashPassword(password);
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);

  await prisma.signupOtp.upsert({
    where: { email: adminEmail },
    update: {
      schoolName,
      slug,
      country: country || "NG",
      adminName,
      passwordHash,
      otpHash,
      attempts: 0,
      expiresAt,
      verifiedAt: null,
    },
    create: {
      email: adminEmail,
      schoolName,
      slug,
      country: country || "NG",
      adminName,
      passwordHash,
      otpHash,
      attempts: 0,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
  const { subject, text, html } = buildSignupVerificationEmail({
    otp,
    adminName,
    adminEmail,
    schoolName,
    appUrl,
  });

  await sendEmail({
    to: adminEmail,
    subject,
    text,
    html,
  });

  redirect(`/signup/verify?email=${encodeURIComponent(adminEmail)}`);
}

export async function verifySignupOtpAction(formData: FormData) {
  const adminEmail = String(formData.get("adminEmail") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!adminEmail || !otp) {
    return;
  }

  const signupOtp = await prisma.signupOtp.findUnique({ where: { email: adminEmail } });
  if (!signupOtp || signupOtp.verifiedAt || signupOtp.expiresAt < new Date()) {
    return;
  }

  const isValid = await bcrypt.compare(otp, signupOtp.otpHash);
  if (!isValid) {
    await prisma.signupOtp.update({
      where: { email: adminEmail },
      data: { attempts: signupOtp.attempts + 1 },
    });
    return;
  }

  if (signupOtp.attempts >= MAX_OTP_ATTEMPTS) {
    return;
  }

  const existingSchool = await prisma.school.findUnique({ where: { slug: signupOtp.slug } });
  if (existingSchool) {
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existingUser) {
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: signupOtp.schoolName,
          slug: signupOtp.slug,
          websiteEnabled: true,
          currency: signupOtp.country || "NGN",
          country: signupOtp.country || "NG",
          timezone: "Africa/Lagos",
          city: "",
          phone: "",
          email: "",
          tagline: "",
          status: "TRIAL",
        },
      });

      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          email: adminEmail,
          name: signupOtp.adminName,
          role: UserRole.SCHOOL_ADMIN,
          passwordHash: signupOtp.passwordHash,
        },
      });

      await tx.academicYear.create({
        data: {
          schoolId: school.id,
          name: "2025/2026",
          isCurrent: true,
          terms: {
            create: [
              { name: "Term 1", sortOrder: 1 },
              { name: "Term 2", sortOrder: 2 },
              { name: "Term 3", sortOrder: 3 },
            ],
          },
        },
      });

      await tx.signupOtp.update({
        where: { email: adminEmail },
        data: { verifiedAt: new Date() },
      });
    });

    // Auto-sign-in the newly created school admin and force subscription step.
    const createdUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (createdUser && createdUser.schoolId) {
      // Send welcome email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
      const school = await prisma.school.findUnique({ where: { id: createdUser.schoolId } });
      
      if (school) {
        try {
          const { subject, text, html } = buildWelcomeEmail({
            adminName: signupOtp.adminName,
            schoolName: school.name,
            appUrl,
          });

          await sendEmail({
            to: adminEmail,
            subject,
            text,
            html,
          });
        } catch (emailError) {
          // Log but don't fail the signup if email fails
          console.error("Failed to send welcome email:", emailError);
        }
          
          // Send internal notifications to onboarding and sales
          try {
            const onboardingRecipient = process.env.ONBOARDING_EMAIL ?? "onboarding@schoolbase.live";
            const salesRecipient = process.env.SALES_EMAIL ?? "sales@schoolbase.live";

            const internal = buildPlatformCommunicationEmail({
              emailType: "ONBOARDING_GUIDANCE",
              recipientName: "Onboarding team",
              schoolName: school.name,
              subject: `New school signup: ${school.name}`,
              message: `A new school has signed up.

School: ${school.name}
School ID: ${school.id}
Admin name: ${signupOtp.adminName}
Admin email: ${adminEmail}
Country: ${signupOtp.country ?? "n/a"}
Signup time: ${new Date().toISOString()}

Open the admin: ${appUrl}/schoolbase-admin/schools/${school.id}
`,
              appUrl,
            });

            const sendResult = await sendEmail({
              to: [onboardingRecipient, salesRecipient],
              subject: internal.subject,
              text: internal.text,
              html: internal.html,
            });

            // log onboarding and sales notifications with messageId
            await logEmail({
              schoolId: school.id,
              recipientEmail: onboardingRecipient,
              recipientName: "Onboarding Team",
              emailType: "ONBOARDING_GUIDANCE",
              subject: internal.subject,
              messageId: sendResult.messageId,
              status: "SENT",
            });

            await logEmail({
              schoolId: school.id,
              recipientEmail: salesRecipient,
              recipientName: "Sales Team",
              emailType: "ONBOARDING_GUIDANCE",
              subject: internal.subject,
              messageId: sendResult.messageId,
              status: "SENT",
            });
          } catch (internalErr) {
            console.error("Failed to send internal onboarding/sales notifications:", internalErr);
          }
      }

      await createStaffSession({
        userId: createdUser.id,
        schoolId: createdUser.schoolId,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
      });
      // Redirect to settings page to setup school location/currency first before subscription
      redirect('/admin/settings?onboarding=1');
      return;
    }

    // Fallback
    redirect("/login?signup=success");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }

    throw error;
  }
}
