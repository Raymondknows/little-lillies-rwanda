import nodemailer from "nodemailer";
import { sendViaBrevoAPI } from "@/lib/brevo";
import { escapeHtml } from "@/lib/email-utils";
import {
  buildDerivStyleEmail,
  buildEmailInfoPanel,
  buildEmailCtaButton,
} from "@/lib/email-layout";

function parseRecipients(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        item.split(",").map((address) => address.trim()),
      )
      .filter(Boolean);
  }
  return value.split(",").map((address) => address.trim()).filter(Boolean);
}

/* ---------------------------
   ENV (Vercel-safe only)
----------------------------*/

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpRequireTls = process.env.SMTP_REQUIRE_TLS === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;
const contactReplyTo = process.env.CONTACT_REPLY_TO;

const DEFAULT_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";

/* ---------------------------
   Transporter
----------------------------*/

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpRequireTls,
  auth:
    smtpUser && smtpPass
      ? {
          user: smtpUser,
          pass: smtpPass,
        }
      : undefined,
});

/* ---------------------------
   SEND EMAIL CORE
----------------------------*/

export type EmailSendResult = {
  messageId?: string;
  response?: string;
  accepted?: string[];
  rejected?: string[];
};

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  cc?: string | string[];
  replyTo?: string;
}): Promise<EmailSendResult> {
  const recipients = parseRecipients(options.to);

  if (recipients.length === 0) {
    throw new Error("No recipient email addresses provided.");
  }

  const useBrevoApi = Boolean(process.env.BREVO_API_KEY);

  /* ---------------------------
     BREVO PATH (preferred)
  ----------------------------*/
  if (useBrevoApi) {
    const result = await sendViaBrevoAPI({
      to: recipients,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text,
      replyTo: options.replyTo ?? contactReplyTo,
    });

    if (!result.success) {
      throw new Error(`Brevo API send failed: ${result.error}`);
    }

    return {
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
    };
  }

  /* ---------------------------
     SMTP PATH (fallback)
  ----------------------------*/
  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error("SMTP email settings are not configured.");
  }

  const cc = parseRecipients(options.cc);

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: recipients,
    cc: cc.length > 0 ? cc : undefined,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo ?? contactReplyTo,
  });

  const rejected = (info.rejected ?? []).filter(Boolean).map(String);
  const accepted = (info.accepted ?? []).filter(Boolean).map(String);

  if (rejected.length > 0 || accepted.length === 0) {
    throw new Error(
      `SMTP send failed. Rejected: ${rejected.join(", ") || "none"}`,
    );
  }

  return {
    messageId: info.messageId,
    response: info.response,
    accepted,
    rejected,
  };
}

/* =========================================================
   EMAIL BUILDERS (UNCHANGED LOGIC - SAFE TO DEPLOY)
========================================================= */

export function buildSignupVerificationEmail({
  otp,
  adminName,
  adminEmail,
  schoolName,
  appUrl,
}: {
  otp: string;
  adminName: string;
  adminEmail: string;
  schoolName: string;
  appUrl: string;
}) {
  const subject = `Your SchoolBase signup code for ${schoolName}`;

  const text = `Hello ${adminName},

Code: ${otp}

This code expires in 15 minutes.

${appUrl}/signup/verify?email=${encodeURIComponent(adminEmail)}`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(adminName)},</p>
    <p>Your verification code:</p>
    <p style="font-size:22px;font-weight:700;">${escapeHtml(otp)}</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${appUrl.replace(/\/$/, "")}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Verification code for ${schoolName}`,
    heroTitle: "Verify your signup",
    heroSubtitle: `Enter the code sent to ${escapeHtml(adminEmail)}`,
    bodyHtml,
    ctas: [],
    variant: "default",
    cardless: true,
  });

  return { subject, text, html };
}

/* ---------------------------
   PASSWORD RESET
----------------------------*/

export function buildPasswordResetEmail({
  token,
  userName,
  userEmail,
  appUrl,
}: {
  token: string;
  userName: string;
  userEmail: string;
  appUrl: string;
}) {
  const subject = "Reset your SchoolBase password";

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
    token,
  )}&email=${encodeURIComponent(userEmail)}`;

  const text = `Hello ${userName},

Reset your password:
${resetUrl}`;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${appUrl.replace(/\/$/, "")}/logo.png`,
    headerLogoHref: appUrl,
    preheader: "Reset your password",
    heroTitle: "Reset your password",
    heroSubtitle: "Click below to continue",
    bodyHtml: `<p>Reset your password securely.</p>`,
    ctas: [
      {
        label: "Reset Password",
        href: resetUrl,
      },
    ],
    variant: "default",
    cardless: true,
  });

  return { subject, text, html };
}
