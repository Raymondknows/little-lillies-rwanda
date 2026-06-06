"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePlatformAdminSession } from "@/lib/auth";
import {
  createVideo,
  deleteVideo,
  getVideoById,
  getVideos,
  updateVideo,
} from "@/lib/video-tutorials";

const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || "http://localhost:3006";

function setAuthCookie(name: string, token: string) {
  cookies().set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function setSchoolPlanAction(formData: FormData) {
  await requirePlatformAdminSession();

  const schoolId = String(formData.get("schoolId") ?? "");
  const plan = String(formData.get("plan") ?? "STARTER");

  if (!schoolId) throw new Error("Missing schoolId");

  const expiresAt = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);

  await prisma.school.update({ where: { id: schoolId }, data: { plan: plan as any, status: "ACTIVE", subscriptionExpiresAt: expiresAt } });

  await prisma.platformAuditLog.create({ data: { schoolId, event: "subscription.updated", details: JSON.stringify({ by: "platform-admin", plan, expiresAt }) } });

  redirect('/schoolbase-admin/subscriptions?updated=1');
}

export async function approveSchoolSubscriptionAction(formData: FormData) {
  await requirePlatformAdminSession();

  const schoolId = String(formData.get("schoolId") ?? "");
  const plan = String(formData.get("plan") ?? "STARTER");

  if (!schoolId) throw new Error("Missing schoolId");

  const expiresAt = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      plan: plan as any,
      status: "ACTIVE",
      subscriptionExpiresAt: expiresAt,
    },
  });

  await prisma.platformAuditLog.create({
    data: {
      schoolId,
      event: "subscription.approved",
      details: JSON.stringify({
        by: "platform-admin",
        method: "manual-approval",
        plan,
        expiresAt: expiresAt.toISOString(),
      }),
    },
  });

  redirect('/schoolbase-admin/subscriptions?approved=1');
}

export async function rejectSchoolSubscriptionAction(formData: FormData) {
  await requirePlatformAdminSession();

  const schoolId = String(formData.get("schoolId") ?? "");

  if (!schoolId) throw new Error("Missing schoolId");

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      status: "CANCELLED",
    },
  });

  await prisma.platformAuditLog.create({
    data: {
      schoolId,
      event: "subscription.rejected",
      details: JSON.stringify({
        by: "platform-admin",
        method: "manual-rejection",
      }),
    },
  });

  redirect('/schoolbase-admin/subscriptions?rejected=1');
}

export async function loginPlatformAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data = await response.json();
  if (response.ok && data.token) {
    setAuthCookie("schoolbase_staff", data.token);
  }

  return data;
}

export async function platformAdminLogoutAction() {
  const { destroyStaffSession } = await import("@/lib/auth");
  await destroyStaffSession();
  redirect("/schoolbase-admin/login");
}

// Video Tutorial Actions
export async function createVideoAction(data: {
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  featured: boolean;
}) {
  await requirePlatformAdminSession();

  try {
    const video = await createVideo(data);
    return { success: true, videoId: video.id };
  } catch (error) {
    console.error("Error creating video:", error);
    throw new Error("Failed to create video");
  }
}

export async function updateVideoAction(
  videoId: string,
  data: {
    title: string;
    description: string;
    videoUrl: string;
    category: string;
    featured: boolean;
  }
) {
  await requirePlatformAdminSession();

  try {
    await updateVideo(videoId, data);

    return { success: true };
  } catch (error) {
    console.error("Error updating video:", error);
    throw new Error("Failed to update video");
  }
}

export async function deleteVideoAction(videoId: string) {
  await requirePlatformAdminSession();

  try {
    await deleteVideo(videoId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting video:", error);
    throw new Error("Failed to delete video");
  }
}

export async function getVideosAction() {
  try {
    const videos = await getVideos();
    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new Error("Failed to fetch videos");
  }
}

export async function getVideoByIdAction(videoId: string) {
  try {
    const video = await getVideoById(videoId);
    return video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export async function sendSetupCompletionRemindersAction() {
  try {
    await requirePlatformAdminSession();

    const { checkSchoolSetup } = await import("@/lib/setup-checker");
    const { buildSetupCompletionReminderEmail, sendEmail, logEmail } = await import("@/lib/email");

    // Get schools less than 7 days old
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const schools = await prisma.school.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        users: {
          where: { role: "SCHOOL_ADMIN" },
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log(`[Setup Reminders] Starting bulk send for ${schools.length} schools`);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";
    let sentCount = 0;
    let skippedCount = 0;

    for (const school of schools) {
      try {
        // Check if setup is incomplete
        const setup = await checkSchoolSetup(school.id);

        if (setup.isComplete) {
          skippedCount++;
          continue;
        }

        // Get admin user
        const adminUser = school.users[0];
        if (!adminUser) {
          skippedCount++;
          continue;
        }

        console.log(`[Setup Reminders] Sending reminder to ${school.name} (${adminUser.email})`);

        // Send email
        const emailContent = buildSetupCompletionReminderEmail({
          adminName: adminUser.name,
          schoolName: school.name,
          adminEmail: adminUser.email,
          appUrl,
          incompleteTasks: setup.incompleteTasks,
        });

        const result = await sendEmail({
          to: adminUser.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        });

        // Log the email
        await logEmail({
          schoolId: school.id,
          recipientEmail: adminUser.email,
          recipientName: adminUser.name,
          emailType: "SETUP_COMPLETION_REMINDER",
          subject: emailContent.subject,
          messageId: result.messageId,
          status: "SENT",
        });

        sentCount++;
      } catch (error) {
        console.error(`[Setup Reminders] Failed to send reminder to school ${school.id}:`, error);
        
        // Log the failed email attempt
        const adminUser = school.users[0];
        if (adminUser) {
          try {
            await logEmail({
              schoolId: school.id,
              recipientEmail: adminUser.email,
              recipientName: adminUser.name,
              emailType: "SETUP_COMPLETION_REMINDER",
              subject: "Setup Completion Reminder",
              status: "FAILED",
            });
          } catch (logError) {
            console.error(`[Setup Reminders] Failed to log error for school ${school.id}:`, logError);
          }
        }
        
        skippedCount++;
      }
    }

    console.log(`[Setup Reminders] Completed - Sent: ${sentCount}, Skipped: ${skippedCount}`);

    return {
      success: true,
      sentCount,
      skippedCount,
      totalProcessed: schools.length,
    };
  } catch (error) {
    console.error(`[Setup Reminders] Bulk send failed:`, error);
    throw error;
  }
}

export async function sendSetupCompletionReminder(schoolId: string) {
  try {
    await requirePlatformAdminSession();

    const { checkSchoolSetup } = await import("@/lib/setup-checker");
    const { buildSetupCompletionReminderEmail, sendEmail, logEmail } = await import("@/lib/email");

    console.log(`[Setup Reminder] Starting email send for school: ${schoolId}`);

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        users: {
          where: { role: "SCHOOL_ADMIN" },
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!school) {
      throw new Error(`School ${schoolId} not found`);
    }

    const adminUser = school.users[0];
    if (!adminUser) {
      throw new Error(`No admin user found for school ${schoolId}`);
    }

    console.log(`[Setup Reminder] Sending to admin: ${adminUser.email}`);

    const setup = await checkSchoolSetup(school.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";

    const emailContent = buildSetupCompletionReminderEmail({
      adminName: adminUser.name,
      schoolName: school.name,
      adminEmail: adminUser.email,
      appUrl,
      incompleteTasks: setup.incompleteTasks,
    });

    const result = await sendEmail({
      to: adminUser.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    console.log(`[Setup Reminder] Email sent successfully, messageId: ${result.messageId}`);

    // Log the email
    await logEmail({
      schoolId: school.id,
      recipientEmail: adminUser.email,
      recipientName: adminUser.name,
      emailType: "SETUP_COMPLETION_REMINDER",
      subject: emailContent.subject,
      messageId: result.messageId,
      status: "SENT",
    });

    return { success: true, sentTo: adminUser.email };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Setup Reminder] Failed to send email: ${errorMessage}`, error);
    throw error;
  }
}

export async function sendPlatformCommunicationEmailAction(formData: FormData) {
  await requirePlatformAdminSession();

  const target = String(formData.get("target") ?? "school");
  const schoolId = String(formData.get("schoolId") ?? "");
  const segment = String(formData.get("segment") ?? "all");
  const emailType = String(formData.get("emailType") ?? "MANUAL_ANNOUNCEMENT");
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!body) {
    throw new Error("Email body is required.");
  }

  const { buildPlatformCommunicationEmail, sendEmail, logEmail } = await import("@/lib/email");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://schoolbase.live";

  let schools = [] as Array<{
    id: string;
    name: string;
    users: Array<{ name: string; email: string }>;
  }>;

  if (target === "school") {
    if (!schoolId) {
      throw new Error("School selection is required.");
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        users: {
          where: { role: "SCHOOL_ADMIN" },
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!school) {
      throw new Error(`School ${schoolId} not found.`);
    }

    schools = [school];
  } else {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const where: any = {};

    if (segment === "active") {
      where.status = "ACTIVE";
    } else if (segment === "trial") {
      where.status = "TRIAL";
    } else if (segment === "new") {
      where.createdAt = { gte: sevenDaysAgo };
    }

    schools = await prisma.school.findMany({
      where,
      include: {
        users: {
          where: { role: "SCHOOL_ADMIN" },
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  let sentCount = 0;
  let skippedCount = 0;

  for (const school of schools) {
    const adminUser = school.users[0];
    if (!adminUser) {
      skippedCount++;
      continue;
    }

    const emailContent = buildPlatformCommunicationEmail({
      emailType,
      schoolName: school.name,
      recipientName: adminUser.name,
      subject,
      message: body,
      appUrl,
    });

    try {
      const result = await sendEmail({
        to: adminUser.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      await logEmail({
        schoolId: school.id,
        recipientEmail: adminUser.email,
        recipientName: adminUser.name,
        emailType,
        subject: emailContent.subject,
        messageId: result.messageId,
        status: "SENT",
      });

      sentCount++;
    } catch (error) {
      console.error(`Failed to send ${emailType} email to school ${school.id}:`, error);

      await logEmail({
        schoolId: school.id,
        recipientEmail: adminUser.email,
        recipientName: adminUser.name,
        emailType,
        subject,
        status: "FAILED",
        error: error instanceof Error ? error.message : String(error),
      });

      skippedCount++;
    }
  }

  return {
    success: true,
    sentCount,
    skippedCount,
    totalProcessed: schools.length,
  };
}
