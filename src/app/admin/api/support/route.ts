import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaffSession, getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { sendEmail, buildPlatformCommunicationEmail, logEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  await requireStaffSession({ allowTrial: true });
  const schoolId = await getCurrentSchoolId();
  const body = await request.json();
  const { subject, message, priority } = body as {
    subject?: string;
    message?: string;
    priority?: string;
  };

  if (!subject || !subject.trim() || !message || !message.trim()) {
    return NextResponse.json({ message: "Subject and message are required." }, { status: 400 });
  }

  const staff = await getStaffSession();

  const supportRequest = await prisma.supportRequest.create({
    data: {
      schoolId,
      subject: subject.trim(),
      message: message.trim(),
      priority: (priority?.toUpperCase() || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      status: "OPEN",
      messages: {
        create: {
          senderRole: "SCHOOL",
          senderName: staff?.name ?? "School staff",
          senderEmail: staff?.email,
          body: message.trim(),
        },
      },
    },
    include: { messages: true },
  });

  // Send notification to platform support team and acknowledge the requester
  try {
    const staff = await getStaffSession();
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    const supportRecipient = process.env.SUPPORT_EMAIL ?? process.env.CONTACT_REPLY_TO ?? "support@schoolbase.live";

    const toSupport = buildPlatformCommunicationEmail({
      emailType: "SUPPORT_UPDATE",
      recipientName: "Support team",
      schoolName: school?.name ?? "School",
      subject: `New support request: ${supportRequest.subject}`,
      message: `A new support request has been submitted.

Request ID: ${supportRequest.id}
Subject: ${supportRequest.subject}
Priority: ${supportRequest.priority}

Message:
${supportRequest.message}

Submitted by: ${staff?.name ?? "Unknown"} <${staff?.email ?? "n/a"}>
`,
      appUrl,
    });

    await sendEmail({
      to: supportRecipient,
      subject: toSupport.subject,
      text: toSupport.text,
      html: toSupport.html,
      replyTo: staff?.email ?? undefined,
    });

    await logEmail({
      schoolId,
      recipientEmail: supportRecipient,
      recipientName: "Support Team",
      emailType: "SUPPORT_UPDATE",
      subject: toSupport.subject,
      status: "SENT",
    });

    // Acknowledge to requester
    if (staff?.email) {
      const ack = buildPlatformCommunicationEmail({
        emailType: "SUPPORT_UPDATE",
        recipientName: staff.name,
        schoolName: school?.name ?? "School",
        subject: `Support request received: ${supportRequest.subject}`,
        message: `Thanks ${staff.name},\n\nWe have received your support request (ID: ${supportRequest.id}). Our support team will review it and get back to you shortly.`,
        appUrl,
      });

      await sendEmail({
        to: staff.email,
        subject: ack.subject,
        text: ack.text,
        html: ack.html,
      });

      await logEmail({
        schoolId,
        recipientEmail: staff.email,
        recipientName: staff.name,
        emailType: "SUPPORT_UPDATE",
        subject: ack.subject,
        status: "SENT",
      });
    }
  } catch (err) {
    console.error("Failed to notify support team about new request:", err);
  }

  return NextResponse.json({ supportRequest }, { status: 201 });
}
