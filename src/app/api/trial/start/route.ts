import { NextResponse } from "next/server";
// Database access removed - use backend API instead
export type PaymentMethod = "PAYSTACK" | "BANK_TRANSFER" | "MANUAL";
import { sendEmail, buildTrialEmail } from "@/lib/email";

export async function POST(request: Request) {
  const payload = await request.json();
  const { plan, schoolName, email, name, phone, trialDays } = payload ?? {};
  if (!plan || !schoolName || !email || !name) {
    return NextResponse.json({ error: "Missing trial details." }, { status: 400 });
  }

  const days = Number(trialDays) || 7;
  const reference = `TRIAL-${Date.now()}-${Math.round(Math.random() * 1000000)}`;

  const trialPayment = await prisma.platformPayment.create({
    data: {
      amount: 0,
      method: PaymentMethod.OTHER,
      reference,
      recordedBy: `Trial (ClickBase)`,
      note: `Free trial started: ${plan} plan for ${schoolName} (${email}${phone ? `, ${phone}` : ""}) — ${days} day trial`,
    },
  });

  const internalRecipients = (process.env.PURCHASE_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (!internalRecipients.includes("sales@clickbasegroup.com")) {
    internalRecipients.push("sales@clickbasegroup.com");
  }

  try {
    const message = buildTrialEmail({
      plan,
      schoolName,
      contactName: name,
      email,
      phone,
      trialDays: days,
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
    console.error("Failed to send trial confirmation email:", err);
  }

  return NextResponse.json({ success: true, trialId: trialPayment.id, trialEndsInDays: days });
}
