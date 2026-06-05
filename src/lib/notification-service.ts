import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

interface NotificationPayload {
  schoolId: string;
  guardianId: string;
  type: string; // "FEE_REMINDER", "RESULT_PUBLISHED", "ATTENDANCE_ALERT", etc.
  title: string;
  body: string;
  channel: "WHATSAPP" | "SMS" | "EMAIL";
  relatedId?: string;
}

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 60000, // 1 minute
  maxDelayMs: 86400000, // 24 hours
  backoffMultiplier: 5,
};

/**
 * Send a notification with automatic retry and status tracking
 */
export async function sendNotification(payload: NotificationPayload) {
  const { schoolId, guardianId, type, title, body, channel, relatedId } =
    payload;

  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      schoolId,
      guardianId,
      type,
      title,
      body,
      channel,
      relatedId,
      status: "PENDING",
    },
  });

  // Send notification
  const result = await deliverNotification(notification, channel);

  // Update status
  await updateNotificationStatus(
    notification.id,
    result.success ? "SENT" : "FAILED",
    result.reference,
    result.error
  );

  return notification;
}

/**
 * Attempt to deliver a notification via the specified channel
 */
async function deliverNotification(notification: any, channel: string) {
  const guardian = await prisma.guardian.findUnique({
    where: { id: notification.guardianId },
  });

  if (!guardian) {
    return {
      success: false,
      reference: null,
      error: "Guardian not found",
    };
  }

  if (channel === "WHATSAPP") {
    return deliverWhatsApp(guardian, notification);
  }

  if (channel === "SMS") {
    return deliverSMS(guardian, notification);
  }

  if (channel === "EMAIL") {
    return deliverEmail(guardian, notification);
  }

  return {
    success: false,
    reference: null,
    error: `Unknown channel: ${channel}`,
  };
}

/**
 * Deliver via WhatsApp (Twilio)
 */
async function deliverWhatsApp(guardian: any, notification: any) {
  const phone = guardian.whatsapp || guardian.phone;
  if (!phone) {
    return {
      success: false,
      reference: null,
      error: "Guardian has no WhatsApp number",
    };
  }

  try {
    const success = await sendWhatsAppMessage(phone, notification.body, notification.schoolId);
    return {
      success,
      reference: success ? `whatsapp:${phone}` : null,
      error: success ? null : "WhatsApp delivery failed",
    };
  } catch (error) {
    return {
      success: false,
      reference: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deliver via SMS (SMS fallback when WhatsApp unavailable)
 */
async function deliverSMS(guardian: any, notification: any) {
  const phone = guardian.phone;
  if (!phone) {
    return {
      success: false,
      reference: null,
      error: "Guardian has no phone number",
    };
  }

  try {
    const success = await sendSMS(phone, notification.body);
    return {
      success,
      reference: success ? `sms:${phone}` : null,
      error: success ? null : "SMS delivery failed",
    };
  } catch (error) {
    return {
      success: false,
      reference: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deliver via Email
 */
async function deliverEmail(guardian: any, notification: any) {
  const email = guardian.email;
  if (!email) {
    return {
      success: false,
      reference: null,
      error: "Guardian has no email",
    };
  }

  try {
    await sendEmail({
      to: email,
      subject: notification.title,
      text: notification.body,
    });
    return {
      success: true,
      reference: `email:${email}`,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      reference: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update notification status and track delivery
 */
async function updateNotificationStatus(
  notificationId: string,
  status: "SENT" | "FAILED",
  reference: string | null,
  failureReason: string | null
) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status,
      sentAt: status === "SENT" ? new Date() : null,
      reference,
      failureReason,
      updatedAt: new Date(),
    },
  });
}

/**
 * Retry failed notifications with exponential backoff
 * Call this from a background worker job
 */
export async function retryFailedNotifications(config = DEFAULT_RETRY_CONFIG) {
  const failed = await prisma.notification.findMany({
    where: { status: "FAILED" },
    orderBy: { updatedAt: "asc" },
    take: 50,
  });

  let retried = 0;
  let succeeded = 0;

  for (const notification of failed) {
    const timeSinceFailure =
      Date.now() - notification.updatedAt.getTime();
    const retryCount = (notification.failureReason?.match(/retry:/g) || [])
      .length;

    if (retryCount >= config.maxRetries) {
      console.log(
        `[Notification] Reached max retries for ${notification.id}`
      );
      continue;
    }

    // Calculate if we should retry based on backoff schedule
    const nextRetryDelay = Math.min(
      config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount),
      config.maxDelayMs
    );

    if (timeSinceFailure < nextRetryDelay) {
      continue;
    }

    try {
      const guardian = await prisma.guardian.findUnique({
        where: { id: notification.guardianId },
      });

      if (!guardian) {
        continue;
      }

      const result = await deliverNotification(
        notification,
        notification.channel
      );

      if (result.success) {
        await updateNotificationStatus(
          notification.id,
          "SENT",
          result.reference,
          null
        );
        succeeded++;
      } else {
        const newFailureReason = `${notification.failureReason || ""} retry:${retryCount + 1}:${result.error}`.trim();
        await updateNotificationStatus(
          notification.id,
          "FAILED",
          result.reference,
          newFailureReason
        );
      }

      retried++;
    } catch (error) {
      console.error(`[Notification] Retry error for ${notification.id}:`, error);
    }
  }

  return { total: failed.length, retried, succeeded };
}

/**
 * Get notification delivery stats
 */
export async function getNotificationStats(schoolId: string) {
  const stats = await prisma.notification.groupBy({
    by: ["channel", "status"],
    where: { schoolId },
    _count: true,
  });

  return stats;
}
