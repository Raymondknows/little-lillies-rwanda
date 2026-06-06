import nodemailer from "nodemailer";
import { sendViaBrevoAPI } from "@/lib/brevo";
import { escapeHtml } from "@/lib/email-utils";
import { buildDerivStyleEmail, buildEmailInfoPanel, buildEmailCtaButton } from "@/lib/email-layout";

function parseRecipients(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => item.split(",").map((address) => address.trim())).filter(Boolean);
  return value.split(",").map((address) => address.trim()).filter(Boolean);
}

function parseEnvFile(content: string) {
  const lines = content.split(/\r?\n/);
  const env: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key) continue;
    let value = rest.join("=").trim();
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

// Do not attempt to read local .env files from frontend; rely on actual environment variables.

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpRequireTls = process.env.SMTP_REQUIRE_TLS === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;
const contactReplyTo = process.env.CONTACT_REPLY_TO;

const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";

if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
  console.warn(
    "Email is not fully configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.",
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: smtpRequireTls,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

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
    const rejectionMessage = rejected.length > 0 ? `Rejected recipients: ${rejected.join(", ")}.` : "No recipients accepted.";
    throw new Error(`SMTP send failed: ${rejectionMessage} Provider response: ${info.response}`);
  }

  return {
    messageId: info.messageId,
    response: info.response,
    accepted,
    rejected,
  };
}

export function buildPurchaseEmail({
  plan,
  schoolName,
  contactName,
  email,
  phone,
  amount,
  reference,
}: {
  plan: string;
  schoolName: string;
  contactName: string;
  email: string;
  phone?: string;
  amount: number;
  reference: string;
}) {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount / 100);

  const subject = `SchoolBase subscription purchased: ${plan}`;

  const bankName = process.env.BANK_NAME ?? process.env.NEXT_PUBLIC_BANK_NAME;
  const bankAccount = process.env.BANK_ACCOUNT_NUMBER ?? process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER;
  const bankAccountName = process.env.BANK_ACCOUNT_NAME ?? process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME;

  const bankDetailsText = bankAccount && bankAccountName
    ? `\nOffline payment option (bank transfer):\n- Account name: ${bankAccountName}\n- Account number: ${bankAccount}\n- Bank: ${bankName ?? "—"}\n\nPlease email sales@clickbasegroup.com with a copy of the transfer advice so we can confirm and begin onboarding.`
    : "";

  const text = `Hello ${contactName},

Thank you for purchasing the ${plan} plan for ${schoolName}.

Payment details:
- Amount: ${formattedAmount}
- Plan: ${plan}
- School: ${schoolName}
- Contact email: ${email}
- Contact phone: ${phone ?? "n/a"}
- Reference: ${reference}

Payment received by ClickBase Technologies Ltd. Our onboarding team will contact you shortly.
${bankDetailsText}

Thanks,
SchoolBase`;

  const bodyHtml = `<p>Hello ${contactName},</p>
<p>Thank you for purchasing the <strong>${plan}</strong> plan for <strong>${schoolName}</strong>.</p>
<ul>
  <li><strong>Amount:</strong> ${formattedAmount}</li>
  <li><strong>Plan:</strong> ${plan}</li>
  <li><strong>School:</strong> ${schoolName}</li>
  <li><strong>Contact email:</strong> ${email}</li>
  <li><strong>Contact phone:</strong> ${phone ?? "n/a"}</li>
  <li><strong>Reference:</strong> ${reference}</li>
</ul>
<p>Payment was received by <strong>ClickBase Technologies Ltd</strong>. Our onboarding team will contact you shortly to begin onboarding.</p>
${bankAccount && bankAccountName ? `<p><strong>Offline payment (bank transfer)</strong><br/>Account name: ${bankAccountName}<br/>Account number: ${bankAccount}<br/>Bank: ${bankName ?? "—"}<br/><br/>Please email <a href="mailto:sales@clickbasegroup.com">sales@clickbasegroup.com</a> with the transfer advice so we can confirm the payment.</p>` : ""}
<p>Thanks,<br/>SchoolBase</p>`;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${DEFAULT_APP_URL.replace(/\/$/, '')}/logo.png`,
    headerLogoHref: DEFAULT_APP_URL,
    preheader: `Purchase confirmation for ${schoolName}`,
    heroTitle: `Subscription purchase received`,
    heroSubtitle: `Thank you for your purchase.`,
    bodyHtml,
    ctas: [],
    variant: "success",
  });

  return { subject, text, html };
}

export function buildGuardianRegistrationEmail({
  guardianName,
  pupilName,
  className,
  admissionNo,
  relation,
  schoolName,
  headerLogoUrl,
}: {
  guardianName: string;
  pupilName: string;
  className: string;
  admissionNo: string;
  relation: string;
  schoolName: string;
  headerLogoUrl?: string;
}) {
  const subject = `${pupilName} has been registered with ${schoolName}`;
  const text = `Hello ${guardianName},

${schoolName} has successfully registered ${pupilName} in ${className}.

Student details:
- Name: ${pupilName}
- Admission no: ${admissionNo}
- Class: ${className}
- Relationship: ${relation}

You will receive updates on attendance, results, fees, and school notices through SchoolBase.
If you have questions, please reply to this email or contact your school administrator.

Thank you,
SchoolBase`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(guardianName)},</p>
    <p>${escapeHtml(schoolName)} has completed the registration for <strong>${escapeHtml(pupilName)}</strong> in <strong>${escapeHtml(className)}</strong>.</p>
    ${buildEmailInfoPanel(
      "Student details",
      `
        <ul style="margin:0;padding-left:18px;color:#334155;">
          <li><strong>Name:</strong> ${escapeHtml(pupilName)}</li>
          <li><strong>Admission number:</strong> ${escapeHtml(admissionNo)}</li>
          <li><strong>Class:</strong> ${escapeHtml(className)}</li>
          <li><strong>Relationship:</strong> ${escapeHtml(relation)}</li>
        </ul>`
    )}
    <p style="margin: 0 0 16px; color: #334155;">Attendance, results, fees, and school notices will be sent through the SchoolBase parent portal.</p>
    <p style="margin: 0 0 16px; color: #334155;">If you need help, reply to this email or contact the school office.</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName,
    headerLogoUrl: headerLogoUrl ?? `${DEFAULT_APP_URL.replace(/\/$/, '')}/logo.png`,
    headerLogoHref: DEFAULT_APP_URL,
    preheader: `${schoolName} has registered ${pupilName} in ${className}.`,
    heroTitle: `Student registration complete`,
    heroSubtitle: `Your child is now enrolled in ${escapeHtml(className)} and your parent portal updates are active.`,
    bodyHtml,
    ctas: [
      {
        label: "Open parent portal",
        href: "https://schoolbase.live/login",
      },
    ],
    variant: "success",
    cardless: true,
  });

  return { subject, text, html };
}

export function buildTeacherRegistrationEmail({
  teacherName,
  teacherEmail,
  schoolName,
  assignedClasses,
  assignedSubjects,
  registrationTime,
  appUrl,
  headerLogoUrl,
}: {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  registrationTime: string;
  appUrl: string;
  headerLogoUrl?: string;
}) {
  const loginUrl = `${appUrl.replace(/\/$/, "")}/login`;
  const formattedRegistrationTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(registrationTime));
  const classText = assignedClasses.length > 0 ? assignedClasses.join(", ") : "No classes assigned yet";
  const subjectText = assignedSubjects.length > 0 ? assignedSubjects.join(", ") : "No subjects assigned yet";

  const subject = `Your SchoolBase account is ready at ${schoolName}`;
  const text = `Hello ${teacherName},

Your teacher account at ${schoolName} is ready.

Login URL: ${loginUrl}
Email: ${teacherEmail}
Registered: ${formattedRegistrationTime}

Assigned classes: ${classText}
Assigned subjects: ${subjectText}

Use your email address and the password created during setup to log in. If you need help accessing your account, please reply to this email or contact your school administrator.

Thank you,
SchoolBase`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(teacherName)},</p>
    <p>Your teacher account at <strong>${escapeHtml(schoolName)}</strong> is ready.</p>
    ${buildEmailInfoPanel(
      "Login details",
      `
        <ul style="margin:0;padding-left:18px;color:#334155;">
          <li><strong>Login URL:</strong> <a href="${escapeHtml(loginUrl)}" style="color:#1d4ed8;">${escapeHtml(loginUrl)}</a></li>
          <li><strong>Email:</strong> ${escapeHtml(teacherEmail)}</li>
          <li><strong>Registered:</strong> ${escapeHtml(formattedRegistrationTime)}</li>
        </ul>`
    )}
    ${buildEmailInfoPanel(
      "Assignments",
      `
        <ul style="margin:0;padding-left:18px;color:#334155;">
          <li><strong>Classes:</strong> ${escapeHtml(classText)}</li>
          <li><strong>Subjects:</strong> ${escapeHtml(subjectText)}</li>
        </ul>`
    )}
    <p style="margin: 0 0 16px; color: #334155;">Use your SchoolBase login details to access your classes, attendance, results, and communication tools.</p>
    <p style="margin: 0 0 16px; color: #334155;">If you need help accessing your account or resetting your password, please reply to this email or contact your school administrator.</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName,
    headerLogoUrl: headerLogoUrl ?? `${DEFAULT_APP_URL.replace(/\/$/, "")}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Your SchoolBase account for ${schoolName} has been created.`,
    heroTitle: `Teacher account ready`,
    heroSubtitle: `Log in to manage classes, attendance, results, and communication.`,
    bodyHtml,
    ctas: [
      {
        label: "Open SchoolBase login",
        href: loginUrl,
      },
    ],
    variant: "success",
  });

  return { subject, text, html };
}

export function buildTeacherAssignmentEmail({
  teacherName,
  schoolName,
  assignedClasses,
  assignedSubjects,
  appUrl,
  headerLogoUrl,
}: {
  teacherName: string;
  schoolName: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  appUrl: string;
  headerLogoUrl?: string;
}) {
  const loginUrl = `${appUrl.replace(/\/$/, "")}/login`;
  const classText = assignedClasses.length > 0 ? assignedClasses.join(", ") : "No classes assigned";
  const subjectText = assignedSubjects.length > 0 ? assignedSubjects.join(", ") : "No subjects assigned";

  const subject = `New SchoolBase assignment at ${schoolName}`;
  const text = `Hello ${teacherName},

Your SchoolBase assignments have been updated at ${schoolName}.

Assigned classes: ${classText}
Assigned subjects: ${subjectText}

Log in at ${loginUrl} to review your schedule and manage attendance, results, and classroom communication.

If you have any questions, please reply to this email or contact your school administrator.

Thank you,
SchoolBase`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(teacherName)},</p>
    <p>Your assignments at <strong>${escapeHtml(schoolName)}</strong> have been updated.</p>
    ${buildEmailInfoPanel(
      "Assigned classes",
      `
        <p style="margin:0;color:#334155;">${escapeHtml(classText)}</p>`
    )}
    ${buildEmailInfoPanel(
      "Assigned subjects",
      `
        <p style="margin:0;color:#334155;">${escapeHtml(subjectText)}</p>`
    )}
    <p style="margin: 0 0 16px; color: #334155;">Log in to SchoolBase to view your classes, take attendance, and enter results.</p>
    <p style="margin: 0 0 16px; color: #334155;">If you need help, reply to this email or contact your school administrator.</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName,
    headerLogoUrl: headerLogoUrl ?? `${DEFAULT_APP_URL.replace(/\/$/, "")}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Your class and subject assignments at ${schoolName} have changed.`,
    heroTitle: `Assignment update`,
    heroSubtitle: `Your teacher responsibilities have been updated.`,
    bodyHtml,
    ctas: [
      {
        label: "Open SchoolBase login",
        href: loginUrl,
      },
    ],
    variant: "default",
  });

  return { subject, text, html };
}

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

Use the code below to complete your SchoolBase signup for ${schoolName}.

Code: ${otp}

This code expires in 15 minutes.

If you did not request this, ignore this email.

Continue signup here: ${appUrl}/signup/verify?email=${encodeURIComponent(adminEmail)}

Thanks,
SchoolBase`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(adminName)},</p>
    <p>Use the code below to complete your SchoolBase signup for <strong>${escapeHtml(schoolName)}</strong>.</p>
    <p style="font-size:22px;font-weight:800;letter-spacing:0.12em;color:${escapeHtml(
      process.env.NEXT_PUBLIC_BRAND_PRIMARY ?? "#0A66C2",
    )};margin:18px 0;">${escapeHtml(otp)}</p>
    <p style="margin:0 0 12px;">This code expires in 15 minutes.</p>
    <p style="margin:0 0 16px;">If you did not request this, ignore this email.</p>
    <p><a href="${escapeHtml(`${appUrl}/signup/verify?email=${encodeURIComponent(adminEmail)}`)}">Complete signup</a></p>
    <p>Thanks,<br/>SchoolBase</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${appUrl.replace(/\/$/, '')}/logo.png`,
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
  const subject = `Reset your SchoolBase password`;

  const text = `Hello ${userName},

Use the link below to reset your password. This link expires in 1 hour.

${appUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(userEmail)}

If you did not request this, ignore this email.

Thanks,
SchoolBase`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Use the button below to reset your SchoolBase password. The link expires in 1 hour.</p>
    ${buildEmailInfoPanel(
      "Account",
      `<div>${escapeHtml(userEmail)}</div>`,
    )}
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${appUrl.replace(/\/$/, '')}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Reset your SchoolBase password`,
    heroTitle: `Reset your password`,
    heroSubtitle: "Click the button below to choose a new password.",
    bodyHtml: `${bodyHtml}${buildEmailCtaButton({ label: "Reset password", href: `${appUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(userEmail)}` })}`,
    ctas: [],
    variant: "default",
    cardless: true,
  });

  return { subject, text, html };
}

export function buildTrialEmail({
  plan,
  schoolName,
  contactName,
  email,
  phone,
  trialDays,
  reference,
}: {
  plan: string;
  schoolName: string;
  contactName: string;
  email: string;
  phone?: string;
  trialDays: number;
  reference: string;
}) {
  const subject = `Your ${plan} free trial has started`;

  const text = `Hello ${contactName},

Thank you for starting a ${trialDays}-day free trial of the ${plan} plan for ${schoolName}.

Trial details:
- Plan: ${plan}
- School: ${schoolName}
- Contact email: ${email}
- Contact phone: ${phone ?? "n/a"}
- Reference: ${reference}

Your trial is active and our onboarding team will contact you with next steps. You can upgrade anytime from the admin dashboard.

Thanks,
SchoolBase`;

  const html = `<p>Hello ${contactName},</p>
<p>Thank you for starting a <strong>${trialDays}-day free trial</strong> of the <strong>${plan}</strong> plan for <strong>${schoolName}</strong>.</p>
<ul>
  <li><strong>Plan:</strong> ${plan}</li>
  <li><strong>School:</strong> ${schoolName}</li>
  <li><strong>Contact email:</strong> ${email}</li>
  <li><strong>Contact phone:</strong> ${phone ?? "n/a"}</li>
  <li><strong>Reference:</strong> ${reference}</li>
</ul>
<p>Your trial is active and our onboarding team will contact you with next steps. You can upgrade anytime from the admin dashboard.</p>
<p>Thanks,<br/>SchoolBase</p>`;

  const wrappedHtml = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${DEFAULT_APP_URL.replace(/\/$/, '')}/logo.png`,
    headerLogoHref: DEFAULT_APP_URL,
    preheader: `Your ${plan} free trial for ${schoolName}`,
    heroTitle: `Your ${plan} free trial has started`,
    heroSubtitle: `Welcome — your trial is active.`,
    bodyHtml: html,
    ctas: [],
    variant: "default",
  });

  return { subject, text, html: wrappedHtml };
}

export function buildWelcomeEmail({
  adminName,
  schoolName,
  appUrl,
}: {
  adminName: string;
  schoolName: string;
  appUrl: string;
}) {
  const subject = `Welcome to SchoolBase | Smart behind the scenes. Simple on your screen.`;

  const text = `Hello ${adminName},

My name is Nwokpor Raymond Ikenna, Founder and CEO of ClickBase Technologies Ltd, and I want to personally welcome you to SchoolBase.

Across Africa, school owners, principals, bursars, and teachers work harder than most people will ever see.

Long days. Endless paperwork. Fee records scattered in notebooks. Result periods filled with pressure. Parents waiting for updates that should have arrived hours ago. Staff trying their best with systems that were never truly built for them.

We understood that frustration deeply.

That is why we created SchoolBase.

Not just as another school software, but as a calm and modern system designed for African schools first, simple enough for everyday staff, powerful enough for growing schools, and professional enough to make parents trust your institution even more.

We believe schools should spend less time chasing records and more time building futures.

With SchoolBase, your school can:

- Manage fees and receipts professionally
- Publish results with confidence
- Communicate with parents instantly
- Track attendance easily
- Run a modern school website, all in one place

And the best part is this: you do not need a big IT department to use it.

We designed SchoolBase to feel simple from the very first click.

Your workspace is now ready, and we are excited to walk this journey with you.

Our team is here to support you as you set up your school, staff, students, and daily operations. If you need help at any point, simply reply to this email and we will be there.

Thank you for trusting us.

We are honoured to serve schools building the next generation of Africa.

Warm regards,

Nwokpor Raymond Ikenna
Chairman - ClickBase Group

Follow ClickBase Technologies:
LinkedIn: https://www.linkedin.com/company/106371744/
Facebook: https://web.facebook.com/profile.php?id=61577572757498

Get started: ${appUrl}/admin`;

  const bodyHtml = `
    <p>Hello ${escapeHtml(adminName)},</p>
    
    <p>My name is <strong>Nwokpor Raymond Ikenna</strong>, Founder and CEO of <strong>ClickBase Technologies Ltd</strong>, and I want to personally welcome you to <strong>SchoolBase</strong>.</p>
    
    <p style="margin-top: 20px; color: #475569; line-height: 1.6;">Across Africa, school owners, principals, bursars, and teachers work harder than most people will ever see.</p>
    
    <p style="color: #475569; line-height: 1.6;">Long days. Endless paperwork. Fee records scattered in notebooks. Result periods filled with pressure. Parents waiting for updates that should have arrived hours ago. Staff trying their best with systems that were never truly built for them.</p>
    
    <p style="color: #475569; line-height: 1.6; font-weight: 600;">We understood that frustration deeply.</p>
    
    <p style="color: #475569; line-height: 1.6;">That is why we created <strong>SchoolBase</strong>.</p>
    
    <p style="color: #475569; line-height: 1.6;">Not just as another school software, but as a calm and modern system designed for African schools first, simple enough for everyday staff, powerful enough for growing schools, and professional enough to make parents trust your institution even more.</p>
    
    <p style="color: #64748b; font-style: italic; margin: 20px 0; padding: 16px; background-color: #f1f5f9; border-left: 4px solid #0A66C2;">We believe schools should spend less time chasing records and more time building futures.</p>
    
    <p style="margin: 20px 0; color: #334155;"><strong>With SchoolBase, your school can:</strong></p>
    
    <ul style="color: #334155; margin: 0 0 20px 20px; line-height: 1.8;">
      <li>Manage fees and receipts professionally</li>
      <li>Publish results with confidence</li>
      <li>Communicate with parents instantly</li>
      <li>Track attendance easily</li>
      <li>Run a modern school website, all in one place</li>
    </ul>
    
    <p style="color: #334155;"><strong>And the best part is this:</strong> you do not need a big IT department to use it.</p>
    
    <p style="color: #334155;">We designed SchoolBase to feel simple from the very first click.</p>
    
    <div style="margin: 24px 0; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
      <p style="margin: 0; color: #166534; font-weight: 600;">Your workspace is now ready, and we are excited to walk this journey with you.</p>
    </div>
    
    <p style="color: #334155;">Our team is here to support you as you set up your school, staff, students, and daily operations. If you need help at any point, simply reply to this email and we will be there.</p>
    
    <p style="color: #334155; margin-bottom: 40px;">Thank you for trusting us.<br/><strong>We are honoured to serve schools building the next generation of Africa.</strong></p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">

    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
      <strong>Warm regards,</strong><br/>
      Nwokpor Raymond Ikenna<br/>
      Chairman - ClickBase Group
    </p>

    <p style="color: #64748b; font-size: 14px; margin: 16px 0;">
      Follow ClickBase Technologies:<br/>
      <a href="https://www.linkedin.com/company/106371744/" style="color: #0A66C2; text-decoration: none; margin-right: 16px;">LinkedIn</a>
      <a href="https://web.facebook.com/profile.php?id=61577572757498" style="color: #0A66C2; text-decoration: none;">Facebook</a>
    </p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: "SchoolBase",
    headerLogoUrl: `${appUrl.replace(/\/$/, '')}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Welcome to SchoolBase - Your school management system is ready`,
    heroTitle: `Welcome to SchoolBase, ${escapeHtml(adminName)}!`,
    heroSubtitle: "Smart behind the scenes. Simple on your screen.",
    bodyHtml,
    ctas: [
      {
        label: "Go to your workspace",
        href: `${appUrl}/admin`,
      },
    ],
    variant: "success",
    cardless: true,
  });

  return { 
    subject, 
    text,
    html
  };
}

export function buildSetupCompletionReminderEmail({
  adminName,
  schoolName,
  adminEmail,
  appUrl,
  incompleteTasks,
}: {
  adminName: string;
  schoolName: string;
  adminEmail: string;
  appUrl: string;
  incompleteTasks: string[];
}) {
  const subject = `Complete your ${schoolName} setup on SchoolBase`;

  const tasksList = incompleteTasks
    .map((task) => `• ${task}`)
    .join("\n");

  const text = `Hello ${adminName},

We noticed you've created a ${schoolName} account on SchoolBase but haven't completed the setup yet.

To get the most out of SchoolBase, please complete these tasks:

${tasksList}

Once your setup is complete, you can start managing admission, attendance, fees, results, and parent communication all in one place.

Complete setup: ${appUrl}/admin/settings

If you have questions, reply to this email or visit our support page.

Thanks,
SchoolBase`;

  const tasksHtml = incompleteTasks
    .map((task) => `<li>${escapeHtml(task)}</li>`)
    .join("");

  const bodyHtml = `
    <p>Hello ${escapeHtml(adminName)},</p>
    <p>We noticed you've created a <strong>${escapeHtml(schoolName)}</strong> account on SchoolBase but haven't completed the setup.</p>
    <p>To unlock the full power of SchoolBase, please complete these tasks:</p>
    <ul style="margin:16px 0;padding-left:24px;color:#334155;">
      ${tasksHtml}
    </ul>
    <p>Once setup is complete, you'll be able to manage admission, attendance, fees, results, and keep parents informed — all in one place.</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName,
    headerLogoUrl: `${appUrl.replace(/\/$/, '')}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Complete ${schoolName} setup on SchoolBase`,
    heroTitle: `Complete your setup`,
    heroSubtitle: `You're just a few steps away from going live.`,
    bodyHtml,
    ctas: [
      {
        label: "Complete setup",
        href: `${appUrl}/admin/settings`,
      },
    ],
    variant: "default",
  });

  return { subject, text, html };
}

export function buildFeeReminderEmail({
  invoiceId,
  invoiceNo,
  schoolName,
  guardianName,
  pupilName,
  balance,
  currency,
  dueDate,
  appUrl,
  manualPaymentAccountName,
  manualPaymentAccountNumber,
  manualPaymentBankName,
  headerLogoUrl,
  termName,
  sessionName,
}: {
  invoiceId: string;
  invoiceNo: string;
  schoolName: string;
  guardianName: string;
  pupilName: string;
  balance: number;
  currency: string;
  dueDate: Date | null;
  appUrl: string;
  manualPaymentAccountName?: string | null;
  manualPaymentAccountNumber?: string | null;
  manualPaymentBankName?: string | null;
  headerLogoUrl?: string | null;
  termName?: string | null;
  sessionName?: string | null;
}) {
  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(balance / 100);

  const dueText = dueDate
    ? dueDate.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "soon";

  const subject = `Fee reminder: invoice ${invoiceNo}`;

  const paymentPeriodHtml = termName || sessionName
    ? buildEmailInfoPanel(
        "Payment period",
        `<div style="margin:0;padding-left:0;color:#334155;">` +
          `${termName ? `<div><strong>Term:</strong> ${escapeHtml(termName)}</div>` : ""}` +
          `${sessionName ? `<div><strong>Session:</strong> ${escapeHtml(sessionName)}</div>` : ""}` +
          `</div>`,
      )
    : "";

  const bodyHtml = `
    <p>Hello ${escapeHtml(guardianName)},</p>
    <p>This is a reminder from <strong>${escapeHtml(schoolName)}</strong> for ${escapeHtml(pupilName)}.</p>
    ${buildEmailInfoPanel(
      "Invoice details",
      `
        <ul style="margin:0;padding-left:18px;color:#334155;">
          <li><strong>Invoice:</strong> ${escapeHtml(invoiceNo)}</li>
          <li><strong>Amount due:</strong> ${escapeHtml(formattedBalance)}</li>
          <li><strong>Due date:</strong> ${escapeHtml(dueText)}</li>
        </ul>`
    )}
    ${paymentPeriodHtml}
    <p style="margin:0 0 16px;color:#334155;">
      Please pay through the parent portal or use the school&apos;s manual banking details below.
    </p>
    ${manualPaymentAccountName && manualPaymentAccountNumber
      ? buildEmailInfoPanel(
          "Manual payment details",
          `<div><strong>Account name:</strong> ${escapeHtml(manualPaymentAccountName)}<br/>` +
            `<strong>Account number:</strong> ${escapeHtml(manualPaymentAccountNumber)}<br/>` +
            `${manualPaymentBankName ? `<strong>Bank:</strong> ${escapeHtml(manualPaymentBankName)}<br/>` : ""}` +
            `</div>`,
        )
      : ""}
    <p style="margin:0 0 16px;color:#334155;">View and pay this invoice here:</p>
  `;

  const periodText = termName || sessionName
    ? ` (${termName ? `Term ${termName}` : ""}${termName && sessionName ? ", " : ""}${sessionName ? `Session ${sessionName}` : ""})`
    : "";

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName,
    headerLogoUrl: headerLogoUrl ?? `${appUrl.replace(/\/$/, "")}/logo.png`,
    headerLogoHref: appUrl,
    preheader: `Reminder for invoice ${invoiceNo} due ${dueText}`,
    heroTitle: `Fee reminder for ${escapeHtml(pupilName)}`,
    heroSubtitle: `Invoice ${escapeHtml(invoiceNo)} is ${escapeHtml(formattedBalance)} and due ${escapeHtml(dueText)}${escapeHtml(periodText)}.`,
    bodyHtml: `${bodyHtml}${buildEmailCtaButton({ label: "View invoice and pay", href: `${appUrl}/parent/invoices/${encodeURIComponent(invoiceId)}` })}`,
    ctas: [],
    variant: "alert",
    cardless: true,
  });

  const text = `Hello ${guardianName},\n\n` +
    `${schoolName} is reminding you of invoice ${invoiceNo}${periodText} for ${pupilName}. ` +
    `Amount due: ${formattedBalance}, due ${dueText}.\n\n` +
    `View and pay: ${appUrl}/parent/invoices/${encodeURIComponent(invoiceId)}\n\n` +
    `${manualPaymentAccountName && manualPaymentAccountNumber ? `Manual payment details:\n- Account name: ${manualPaymentAccountName}\n- Account number: ${manualPaymentAccountNumber}\n${manualPaymentBankName ? `- Bank: ${manualPaymentBankName}\n` : ""}` : ""}` +
    `\nPlease contact the school if you need help.`;

  return { subject, text, html };
}

export function buildInvoicePaymentEmail({
  guardianName,
  pupilName,
  className,
  invoiceId,
  invoiceNo,
  amount,
  reference,
  termName,
  sessionName,
  schoolName,
  appUrl,
  headerLogoUrl,
}: {
  guardianName: string;
  pupilName: string;
  className: string;
  invoiceId: string;
  invoiceNo: string;
  amount: number;
  reference: string;
  termName?: string | null;
  sessionName?: string | null;
  schoolName?: string;
  appUrl?: string;
  headerLogoUrl?: string | null;
}) {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount / 100);

  const subject = `Payment received for invoice ${invoiceNo}`;
  const periodText = termName || sessionName
    ? ` (${termName ? `Term ${termName}` : ""}${termName && sessionName ? ", " : ""}${sessionName ? `Session ${sessionName}` : ""})`
    : "";

  const paymentPeriodHtml = termName || sessionName
    ? buildEmailInfoPanel(
        "Payment period",
        `<div style="margin:0;padding-left:0;color:#334155;">` +
          `${termName ? `<div><strong>Term:</strong> ${escapeHtml(termName)}</div>` : ""}` +
          `${sessionName ? `<div><strong>Session:</strong> ${escapeHtml(sessionName)}</div>` : ""}` +
          `</div>`,
      )
    : "";

  const bodyHtml = `
    <p>Hello ${escapeHtml(guardianName)},</p>
    <p>We received your payment for <strong>${escapeHtml(pupilName)}</strong>${escapeHtml(periodText)} (${escapeHtml(className)}).</p>
    ${buildEmailInfoPanel(
      "Payment details",
      `
        <ul style=\"margin:0;padding-left:18px;color:#334155;\">
          <li><strong>Invoice:</strong> ${escapeHtml(invoiceNo)}</li>
          <li><strong>Amount paid:</strong> ${escapeHtml(formattedAmount)}</li>
          <li><strong>Reference:</strong> ${escapeHtml(reference)}</li>
        </ul>`,
    )}
    ${paymentPeriodHtml}
    <p style=\"margin:0 0 16px;color:#334155;\">Thank you for paying on time.</p>
  `;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName || "SchoolBase",
    headerLogoUrl: headerLogoUrl ?? (appUrl ? `${appUrl.replace(/\/$/, "")}/logo.png` : undefined),
    headerLogoHref: appUrl,
    preheader: `Payment received for invoice ${invoiceNo}`,
    heroTitle: `Payment received for ${escapeHtml(pupilName)}`,
    heroSubtitle: `Invoice ${escapeHtml(invoiceNo)} payment of ${escapeHtml(formattedAmount)} received${escapeHtml(periodText)}.`,
    bodyHtml,
    ctas: appUrl && invoiceId
      ? [
          {
            label: "View invoice",
            href: `${appUrl}/parent/invoices/${encodeURIComponent(invoiceId)}`,
          },
        ]
      : [],
    variant: "success",
    cardless: true,
  });

  const text = `Hello ${guardianName},\n\nWe received your payment for ${pupilName}${periodText} (${className}).\n\nPayment details:\n- Invoice: ${invoiceNo}\n- Amount paid: ${formattedAmount}\n- Reference: ${reference}\n\nThank you for paying on time.\n\nBest regards,\n${schoolName || "SchoolBase"}`;

  return { subject, text, html };
}

export function buildPlatformCommunicationEmail({
  emailType,
  recipientName,
  schoolName,
  subject,
  message,
  appUrl,
}: {
  emailType: string;
  recipientName?: string;
  schoolName: string;
  subject: string;
  message: string;
  appUrl: string;
}) {
  const typeLabels: Record<string, string> = {
    PRODUCT_UPDATE: "Product update",
    PRICE_UPDATE: "Price update",
    SUPPORT_UPDATE: "Support update",
    ONBOARDING_GUIDANCE: "Onboarding guidance",
    BEST_PRACTICE_TIP: "Best practice tip",
    MANUAL_ANNOUNCEMENT: "Announcement",
    POLICY_UPDATE: "Policy update",
    ACCOUNT_SECURITY: "Security notice",
  };

  const heroTitle = typeLabels[emailType] ?? "Platform update";
  const trimmedMessage = message.trim();
  const hasGreeting = /^(hello|hi|dear)\b/i.test(trimmedMessage);
  const hasSignature = /(best regards|best,|thanks,|thank you,|regards,|sincerely,|schoolbase)$/i.test(trimmedMessage.trim().split(/\n/).slice(-2).join(" "));

  const text = `${hasGreeting ? "" : recipientName ? `Hello ${recipientName},\n\n` : `Hello ${schoolName} team,\n\n`}${trimmedMessage}${hasSignature ? "" : "\n\nRegards,\nSchoolBase"}`;

  const paragraphs = trimmedMessage
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 1rem;line-height:1.75;color:#334155;">${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");

  const bodyHtml = `${hasGreeting ? "" : `<p>${recipientName ? `Hello ${escapeHtml(recipientName)},` : `Hello ${escapeHtml(schoolName)} team,`}</p>`}
    ${paragraphs}
    ${hasSignature ? "" : `<p style="margin:1.5rem 0 0 0;color:#475569;">Regards,<br/>SchoolBase</p>`}`;

  const html = buildDerivStyleEmail({
    title: subject,
    headerTitle: schoolName,
    headerLogoUrl: `${appUrl.replace(/\/$/, "")}/logo.png`,
    headerLogoHref: appUrl,
    preheader: subject,
    heroTitle,
    heroSubtitle: `A message from SchoolBase to help drive school success.`,
    bodyHtml,
    ctas: appUrl
      ? [
          {
            label: "Open SchoolBase",
            href: appUrl,
          },
        ]
      : [],
    variant: "default",
  });

  return { subject, text, html };
}

export async function logEmail({
  schoolId,
  recipientEmail,
  recipientName,
  emailType,
  subject,
  messageId,
  status = "SENT",
  error,
}: {
  schoolId?: string;
  recipientEmail: string;
  recipientName?: string;
  emailType: string;
  subject: string;
  messageId?: string;
  status?: string;
  error?: string;
}) {
  try {
    // Use the shared prisma client
    const { prisma } = await import("@/lib/db");
    
    await prisma.emailLog.create({
      data: {
        schoolId: schoolId || null,
        recipientEmail,
        recipientName: recipientName || null,
        emailType: emailType as any,
        subject,
        messageId: messageId || null,
        status: status as any,
        error: error || null,
      },
    });
  } catch (err) {
    console.error("Failed to log email:", err);
    // Don't throw - logging failure shouldn't break email sending
  }
}
