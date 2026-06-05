import { prisma } from "@/lib/db";
import { sendEmail, buildFeeReminderEmail } from "@/lib/email";
import { createFeeReminderMessage, sendWhatsAppMessage } from "@/lib/whatsapp";

/**
 * Create result publication notification message
 */
export function createResultPublishedMessage(
  childName: string,
  termName: string,
  schoolName: string,
  appUrl: string,
): string {
  return `Hi! ${schoolName} has published ${childName}'s ${termName} results.\n\nLogin to view: ${appUrl}`;
}

/**
 * Send fee reminder notifications to guardians for a specific invoice.
 */
function truncateForDatabase(value: string | null | undefined, maxLength = 191): string | null {
  if (!value) return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

export async function sendFeeReminderNotification(
  schoolId: string,
  guardianId: string,
  guardianWhatsApp: string | null,
  guardianPhone: string | null,
  guardianEmail: string | null,
  childFirstName: string,
  childLastName: string,
  invoiceId: string,
  invoiceNo: string,
  amountDue: number,
  amountPaid: number,
  dueDate: Date | null,
  schoolName: string,
  currency: string,
  headerLogoUrl?: string | null,
  termName?: string | null,
  sessionName?: string | null,
): Promise<boolean> {
  const message = createFeeReminderMessage(
    childFirstName,
    childLastName,
    invoiceNo,
    amountDue - amountPaid,
    dueDate,
    schoolName,
    currency,
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://schoolbase.live";
  const [school, guardian] = await Promise.all([
    prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        manualPaymentAccountName: true,
        manualPaymentAccountNumber: true,
        manualPaymentBankName: true,
      },
    }),
    prisma.guardian.findUnique({
      where: { id: guardianId },
      select: { firstName: true, lastName: true },
    }),
  ]);

  const emailContent = buildFeeReminderEmail({
    invoiceId,
    invoiceNo,
    schoolName,
    guardianName: guardian ? `${guardian.firstName} ${guardian.lastName}` : "Parent",
    pupilName: `${childFirstName} ${childLastName}`,
    balance: amountDue - amountPaid,
    currency,
    dueDate,
    appUrl,
    headerLogoUrl,
    termName,
    sessionName,
    manualPaymentAccountName: school?.manualPaymentAccountName ?? null,
    manualPaymentAccountNumber: school?.manualPaymentAccountNumber ?? null,
    manualPaymentBankName: school?.manualPaymentBankName ?? null,
  });

  const subject = emailContent.subject;
  const emailBody = emailContent.text;

  let overallSuccess = false;
  const results: Array<{
    channel: "WHATSAPP" | "EMAIL";
    success: boolean;
    failureReason?: string | null;
  }> = [];

  const whatsappContact = guardianWhatsApp ?? guardianPhone;
  if (whatsappContact) {
    try {
      const success = await sendWhatsAppMessage(whatsappContact, message, schoolId);
      results.push({
        channel: "WHATSAPP",
        success,
        failureReason: success ? null : "WhatsApp send failed",
      });
      overallSuccess ||= success;
    } catch (error) {
      results.push({
        channel: "WHATSAPP",
        success: false,
        failureReason: error instanceof Error ? error.message : "Unknown send error",
      });
    }
  }

  if (guardianEmail) {
    try {
      await sendEmail({
        to: guardianEmail,
        subject,
        text: emailBody,
        html: emailContent.html,
      });
      results.push({ channel: "EMAIL", success: true });
      overallSuccess = true;
    } catch (error) {
      results.push({
        channel: "EMAIL",
        success: false,
        failureReason: error instanceof Error ? error.message : "Unknown email error",
      });
    }
  }

  if (results.length === 0) {
    await prisma.notification.create({
      data: {
        schoolId,
        guardianId,
        type: "FEE_REMINDER",
        title: subject,
        body: message,
        channel: "EMAIL",
        status: "FAILED",
        failureReason: "No contact details on file",
        relatedId: invoiceId,
      },
    });
    return false;
  }

  for (const result of results) {
    await prisma.notification.create({
      data: {
        schoolId,
        guardianId,
        type: "FEE_REMINDER",
        title: subject,
        body: message,
        channel: result.channel,
        status: result.success ? "SENT" : "FAILED",
        failureReason: truncateForDatabase(result.failureReason ?? null),
        relatedId: invoiceId,
        sentAt: result.success ? new Date() : undefined,
      },
    });
  }

  return overallSuccess;
}

export async function sendResultPublishedNotifications(
  assessmentId: string,
  schoolId: string,
): Promise<{
  total: number;
  sent: number;
  failed: number;
}> {
  // Get assessment details
  const assessment = await prisma.assessment.findFirst({
    where: { id: assessmentId, schoolId },
    include: { term: true },
  });

  if (!assessment) {
    return { total: 0, sent: 0, failed: 0 };
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) {
    return { total: 0, sent: 0, failed: 0 };
  }

  // Get all results for this assessment with guardian contacts
  const results = await prisma.result.findMany({
    where: { assessmentId },
    include: {
      pupil: {
        include: {
          guardians: {
            include: { guardian: true },
          },
        },
      },
    },
  });

  if (results.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Track unique guardians to notify (avoid duplicate notifications per pupil)
  const guardiansToNotify = new Set<string>();
  const pupilByGuardian = new Map<string, string[]>();

  for (const result of results) {
    for (const link of result.pupil.guardians) {
      guardiansToNotify.add(link.guardian.id);
      if (!pupilByGuardian.has(link.guardian.id)) {
        pupilByGuardian.set(link.guardian.id, []);
      }
      pupilByGuardian
        .get(link.guardian.id)!
        .push(
          `${result.pupil.firstName} ${result.pupil.lastName}`,
        );
    }
  }

  let sent = 0;
  let failed = 0;
  const total = guardiansToNotify.size;

  // Send notifications to each guardian
  for (const guardianId of guardiansToNotify) {
    const guardian = await prisma.guardian.findUnique({
      where: { id: guardianId },
    });

    if (!guardian) continue;

    // Combine all children's names for this guardian
    const childNames = Array.from(new Set(pupilByGuardian.get(guardianId) || []))
      .join(", ");

    const message = `Hi! ${school.name} has published results for ${childNames}.\n\nLogin to view: ${appUrl}`;

    // Try WhatsApp first
    if (guardian.whatsapp) {
      try {
        const success = await sendWhatsAppMessage(guardian.whatsapp, message, schoolId);

        // Create notification record
        await prisma.notification.create({
          data: {
            schoolId,
            guardianId,
            type: "RESULT_PUBLISHED",
            title: `Results Published - ${assessment.term.name}`,
            body: message,
            channel: "WHATSAPP",
            status: success ? "SENT" : "FAILED",
            relatedId: assessmentId,
          },
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to send WhatsApp to ${guardian.whatsapp}:`, error);
        failed++;

        // Log the failure
        await prisma.notification.create({
          data: {
            schoolId,
            guardianId,
            type: "RESULT_PUBLISHED",
            title: `Results Published - ${assessment.term.name}`,
            body: message,
            channel: "WHATSAPP",
            status: "FAILED",
            failureReason: error instanceof Error ? error.message : "Unknown error",
            relatedId: assessmentId,
          },
        });
      }
    } else {
      // Log that we couldn't send (no contact)
      await prisma.notification.create({
        data: {
          schoolId,
          guardianId,
          type: "RESULT_PUBLISHED",
          title: `Results Published - ${assessment.term.name}`,
          body: message,
          channel: "WHATSAPP",
          status: "FAILED",
          failureReason: "No WhatsApp number on file",
          relatedId: assessmentId,
        },
      });
      failed++;
    }
  }

  return { total, sent, failed };
}
