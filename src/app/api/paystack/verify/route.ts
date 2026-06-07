import { NextResponse } from "next/server";
// Database access removed - use backend API instead
import { sendEmail, buildInvoicePaymentEmail } from "@/lib/email";
import { decryptText } from "@/lib/crypto";

export async function POST(request: Request) {
  const payload = await request.json();
  const { reference, invoiceId } = payload ?? {};
  
  // School fee payments: use per-school Paystack secret if configured, otherwise use PAYSTACK_SECRET_KEY
  // NOTE: This should NEVER use PAYSTACK_SUBSCRIPTION_SECRET_KEY (ClickBase's own key)
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      pupil: { include: { guardians: { include: { guardian: true } }, class: true } },
      feeSchedule: {
        include: {
          term: {
            include: {
              academicYear: true,
            },
          },
        },
      },
    },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const schoolId = invoice.schoolId;
  let secretKey: string | undefined = undefined;
  try {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (school?.paystackSecretEncrypted) {
      secretKey = decryptText(school.paystackSecretEncrypted) || undefined;
    }
  } catch (err) {
    console.warn("Failed to load per-school secret, falling back to env key", err);
  }

  if (!secretKey) {
    secretKey = process.env.PAYSTACK_SECRET_KEY;
  }

  if (!reference || !invoiceId) {
    return NextResponse.json({ error: "Missing reference or invoice ID." }, { status: 400 });
  }
  if (!secretKey) {
    return NextResponse.json({ error: "Paystack secret key not configured." }, { status: 500 });
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
    return NextResponse.json({ error: "Payment not successful." }, { status: 400 });
  }

  // invoice already loaded above

  const amountPaid = Number(transaction.amount);
  const newPaid = invoice.amountPaid + amountPaid;
  const status = newPaid >= invoice.amountDue ? "PAID" : "PART_PAID";

  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        invoiceId,
        amount: amountPaid,
        method: "ONLINE",
        reference: reference,
        recordedBy: "Paystack",
      },
    });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { amountPaid: newPaid, status },
    });

    return p;
  });

  const guardianEmails = invoice.pupil.guardians
    .map((entry) => entry.guardian.email)
    .filter((address): address is string => Boolean(address));

  const internalRecipients = (process.env.PURCHASE_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (guardianEmails.length > 0) {
    try {
      const guardian = invoice.pupil.guardians[0]?.guardian;
      const classLabel = invoice.pupil.class
        ? `${invoice.pupil.class.name}${invoice.pupil.class.arm ? ` ${invoice.pupil.class.arm}` : ""}`
        : "Class not set";
      const message = buildInvoicePaymentEmail({
        guardianName: `${guardian?.firstName ?? "Parent"} ${guardian?.lastName ?? ""}`.trim(),
        pupilName: `${invoice.pupil.firstName} ${invoice.pupil.lastName}`,
        className: classLabel,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        amount: amountPaid,
        reference,
        termName: invoice.feeSchedule?.term?.name ?? null,
        sessionName: invoice.feeSchedule?.term?.academicYear?.name ?? null,
      });

      await sendEmail({
        to: guardianEmails,
        cc: internalRecipients,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (err) {
      console.error("Failed to send invoice payment confirmation email:", err);
    }
  } else if (internalRecipients.length > 0) {
    try {
      await sendEmail({
        to: internalRecipients,
        subject: `Payment received for invoice ${invoice.invoiceNo}`,
        text: `A payment was recorded for invoice ${invoice.invoiceNo} (${invoice.pupil.firstName} ${invoice.pupil.lastName}). Reference: ${reference}.`,
      });
    } catch (err) {
      console.error("Failed to send internal payment notification email:", err);
    }
  }

  return NextResponse.json({ success: true, paymentId: payment.id });
}
