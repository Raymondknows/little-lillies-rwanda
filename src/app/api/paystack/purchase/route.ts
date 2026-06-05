import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PaymentMethod, UserRole } from "@prisma/client";
import { sendEmail, buildPurchaseEmail } from "@/lib/email";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const payload = await request.json();
  const { reference, plan, schoolName, email, name, phone } = payload ?? {};
  // Optional slug for provisioning
  const rawSlug = (payload?.slug ?? "") as string;
  // Use ClickBase's own Paystack secret for subscription payments only
  const secretKey = process.env.PAYSTACK_SUBSCRIPTION_SECRET_KEY;

  if (!reference || !plan || !schoolName || !email || !name) {
    return NextResponse.json(
      { error: "Missing payment reference or contact details." },
      { status: 400 },
    );
  }

  if (!secretKey) {
    return NextResponse.json(
      { error: "ClickBase subscription Paystack secret not configured." },
      { status: 500 },
    );
  }

  const verifyResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  const verifyData = await verifyResponse.json();
  if (!verifyResponse.ok || verifyData.status !== true) {
    return NextResponse.json(
      { error: verifyData.message || "Paystack verification failed." },
      { status: 400 },
    );
  }

  const transaction = verifyData.data;
  if (transaction.status !== "success") {
    return NextResponse.json({ error: "Payment was not successful." }, { status: 400 });
  }

  const payment = await prisma.platformPayment.create({
    data: {
      amount: Number(transaction.amount),
      method: PaymentMethod.ONLINE,
      reference,
      recordedBy: "Paystack (ClickBase)",
      note: `Subscription purchase: ${plan} plan for ${schoolName} (${email}${phone ? `, ${phone}` : ""}) — paid to ClickBase Technologies Ltd`,
    },
  });

  const internalRecipients = (process.env.PURCHASE_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  // Ensure sales inbox is always notified
  if (!internalRecipients.includes("sales@clickbasegroup.com")) {
    internalRecipients.push("sales@clickbasegroup.com");
  }

  try {
    const message = buildPurchaseEmail({
      plan,
      schoolName,
      contactName: name,
      email,
      phone,
      amount: Number(transaction.amount),
      reference,
    });

    await sendEmail({
      to: email,
      cc: internalRecipients,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: process.env.CONTACT_REPLY_TO ?? email,
    });
  } catch (err) {
    console.error("Failed to send purchase confirmation email:", err);
  }

  // Provision school and admin user after successful payment (idempotent by slug)
  try {
    // Derive slug: prefer provided, otherwise slugify the school name
    const slug = (rawSlug || schoolName || "")
      .toLowerCase()
      .replace(/[^a-z0-9\-\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    if (slug) {
      const existing = await prisma.school.findUnique({ where: { slug } });
      if (!existing) {
        const tempPassword = Math.random().toString(36).slice(-12) + "A1";
        const passwordHash = await hashPassword(tempPassword);

        const school = await prisma.school.create({
          data: {
            name: schoolName,
            slug,
            websiteEnabled: true,
            currency: "NGN",
            country: "NG",
            city: "",
            phone: phone ?? "",
            email: email ?? "",
            tagline: "",
          },
        });

        // Create admin user bound to the school
        await prisma.user.create({
          data: {
            schoolId: school.id,
            email,
            name,
            role: UserRole.SCHOOL_ADMIN,
            passwordHash,
          },
        });

        // Seed an academic year with three terms
        // (Grading scales are auto-seeded via database trigger on School insert)
        await prisma.academicYear.create({
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
        // Seed default grading scale (Nigerian standard: A 70-100, B 60-69, etc.)
        const gradingScales = [
          { minScore: 70, maxScore: 100, grade: "A", sortOrder: 0 },
          { minScore: 60, maxScore: 69, grade: "B", sortOrder: 1 },
          { minScore: 50, maxScore: 59, grade: "C", sortOrder: 2 },
          { minScore: 45, maxScore: 49, grade: "D", sortOrder: 3 },
          { minScore: 40, maxScore: 44, grade: "E", sortOrder: 4 },
          { minScore: 0, maxScore: 39, grade: "F", sortOrder: 5 },
        ];

        for (const scale of gradingScales) {
          await prisma.gradingScale.create({
            data: {
              schoolId: school.id,
              minScore: scale.minScore,
              maxScore: scale.maxScore,
              grade: scale.grade,
              sortOrder: scale.sortOrder,
            },
          });
        }
        // Send provisioning email with temporary password
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
          const text = `Hello ${name},\n\nThank you for your purchase. Your SchoolBase account has been created for ${schoolName}.\n\nLogin URL: ${appUrl}/login\nUsername: ${email}\nTemporary password: ${tempPassword}\n\nPlease sign in and change your password immediately. Our onboarding team will contact you with next steps.\n\nThanks,\nSchoolBase`;
          const html = `<p>Hello ${name},</p><p>Thank you for your purchase. Your SchoolBase account has been created for <strong>${schoolName}</strong>.</p><p><strong>Login URL:</strong> <a href="${appUrl}/login">${appUrl}/login</a><br/><strong>Username:</strong> ${email}<br/><strong>Temporary password:</strong> ${tempPassword}</p><p>Please sign in and change your password immediately. Our onboarding team will contact you with next steps.</p><p>Thanks,<br/>SchoolBase</p>`;

          await sendEmail({
            to: email,
            subject: `Your SchoolBase account for ${schoolName}`,
            text,
            html,
          });
        } catch (err) {
          console.error("Failed to send provisioning email:", err);
        }
      } else {
        // If school already exists, notify internal team
        console.warn(`Purchase received for existing school slug: ${slug}`);
      }
    }
  } catch (err) {
    console.error("Provisioning failed after purchase:", err);
  }

  return NextResponse.json({ success: true, paymentId: payment.id });
}
