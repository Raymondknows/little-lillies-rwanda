import { NextRequest, NextResponse } from "next/server";
// Database access removed - use backend API instead
import { requirePlatformAdminSession } from "@/lib/auth";
import { sendEmail, buildPlatformCommunicationEmail, logEmail } from "@/lib/email";

const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export async function PATCH(request: NextRequest) {
  await requirePlatformAdminSession();
  const body = await request.json();
  const { requestId, response, status } = body as {
    requestId?: string;
    response?: string;
    status?: string;
  };

  if (!requestId) {
    return NextResponse.json({ message: "Request ID is required." }, { status: 400 });
  }

  if (!response || !response.trim()) {
    return NextResponse.json({ message: "Response cannot be empty." }, { status: 400 });
  }

  const normalizedStatus = status?.toUpperCase();
  const statusValue = validStatuses.includes(normalizedStatus || "") ? normalizedStatus : "IN_PROGRESS";

  const supportRequest = await prisma.supportRequest.update({
    where: { id: requestId },
    data: {
      response: response.trim(),
      status: statusValue as any,
      messages: {
        create: {
          senderRole: "PLATFORM_ADMIN",
          senderName: "Support team",
          body: response.trim(),
        },
      },
    },
    include: { messages: true },
  });

  // Send the reply to the school's primary admin email (if available)
  try {
    const school = await prisma.school.findUnique({
      where: { id: supportRequest.schoolId ?? undefined },
      include: { users: { where: { role: "SCHOOL_ADMIN" }, select: { name: true, email: true } } },
    });

    const adminUser = school?.users?.[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    const supportRecipient = process.env.SUPPORT_EMAIL ?? process.env.CONTACT_REPLY_TO ?? "support@schoolbase.live";

    if (adminUser?.email) {
      const emailContent = buildPlatformCommunicationEmail({
        emailType: "SUPPORT_UPDATE",
        recipientName: adminUser.name,
        schoolName: school?.name ?? "School",
        subject: `Response to support request: ${supportRequest.subject}`,
        message: response.trim(),
        appUrl,
      });

      await sendEmail({
        to: adminUser.email,
        cc: supportRecipient,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      await logEmail({
        schoolId: supportRequest.schoolId ?? undefined,
        recipientEmail: adminUser.email,
        recipientName: adminUser.name,
        emailType: "SUPPORT_UPDATE",
        subject: emailContent.subject,
        status: "SENT",
      });

      // also log the copy sent to support inbox
      await logEmail({
        schoolId: supportRequest.schoolId ?? undefined,
        recipientEmail: supportRecipient,
        recipientName: "Support Team",
        emailType: "SUPPORT_UPDATE",
        subject: emailContent.subject,
        status: "SENT",
      });
    }
  } catch (err) {
    console.error("Failed to send support reply email:", err);
  }

  return NextResponse.json({ supportRequest }, { status: 200 });
}
