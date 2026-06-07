import { NextRequest, NextResponse } from "next/server";
// Database access removed - use backend API instead
export type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
import { requireStaffSession, getStaffSession } from "@/lib/auth";
import { sendEmail, buildPlatformCommunicationEmail, logEmail } from "@/lib/email";

export async function PATCH(request: NextRequest) {
  await requireStaffSession({ allowTrial: true });
  const body = await request.json();
  const { requestId, response, status } = body as { requestId?: string; response?: string; status?: string };

  if (!requestId) {
    return NextResponse.json({ message: "Request ID is required." }, { status: 400 });
  }

  if (!response || !response.trim()) {
    return NextResponse.json({ message: "Response cannot be empty." }, { status: 400 });
  }

  const staff = await getStaffSession();

  const normalizedStatus = (status?.toUpperCase() as SupportStatus) ?? "IN_PROGRESS";

  const supportRequest = await prisma.supportRequest.update({
    where: { id: requestId },
    data: {
      response: response.trim(),
      status: normalizedStatus,
      messages: {
        create: {
          senderRole: "SCHOOL",
          senderName: staff?.name ?? "School staff",
          senderEmail: staff?.email,
          body: response.trim(),
        },
      },
    },
    include: { messages: true },
  });

  // Notify platform support inbox of the school's reply and log it
  try {
    const staff = await getStaffSession();
    const school = await prisma.school.findUnique({ where: { id: supportRequest.schoolId } });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    const supportRecipient = process.env.SUPPORT_EMAIL ?? process.env.CONTACT_REPLY_TO ?? "support@schoolbase.live";

    const emailContent = buildPlatformCommunicationEmail({
      emailType: "SUPPORT_UPDATE",
      recipientName: "Support team",
      schoolName: school?.name ?? "School",
      subject: `Reply from school: ${supportRequest.subject}`,
      message: `Reply from ${staff?.name ?? "School staff"} <${staff?.email ?? "n/a"}>:\n\n${response.trim()}\n\nRequest ID: ${supportRequest.id}`,
      appUrl,
    });

    await sendEmail({
      to: supportRecipient,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      replyTo: staff?.email ?? undefined,
    });

    await logEmail({
      schoolId: supportRequest.schoolId ?? undefined,
      recipientEmail: supportRecipient,
      recipientName: "Support Team",
      emailType: "SUPPORT_UPDATE",
      subject: emailContent.subject,
      status: "SENT",
    });
  } catch (err) {
    console.error("Failed to send school's reply to support inbox:", err);
  }

  return NextResponse.json({ supportRequest }, { status: 200 });
}
