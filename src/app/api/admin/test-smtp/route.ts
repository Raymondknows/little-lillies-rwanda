import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

function parseRecipients(value: unknown): string[] {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  await requireStaffSession();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 },
    );
  }

  const recipient = typeof body.recipient === "string" ? body.recipient.trim() : "";
  const envRecipients = process.env.SMTP_TEST_RECIPIENT ?? process.env.SMTP_TEST_RECIPIENTS ?? "";
  const recipients = recipient || envRecipients;

  if (!recipients) {
    return NextResponse.json(
      {
        success: false,
        message:
          "No SMTP test recipient configured. Provide a recipient in the form or set SMTP_TEST_RECIPIENT(S) in your environment.",
      },
      { status: 400 },
    );
  }

  try {
    const info = await sendEmail({
      to: recipients,
      subject: "SchoolBase SMTP test",
      text: "This is a test message from SchoolBase. If you received it, the SMTP configuration is working.",
      html: `<div style=\"font-family: Arial, sans-serif; color: #111; line-height: 1.6;\"><h1>SchoolBase SMTP test</h1><p>This is a test message from SchoolBase. If you received it, your SMTP configuration is working.</p></div>`,
    });

    return NextResponse.json({
      success: true,
      message: "SMTP test email sent successfully.",
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "SMTP test email send failed.",
      },
      { status: 500 },
    );
  }
}
