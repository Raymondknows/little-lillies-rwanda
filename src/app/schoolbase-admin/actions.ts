"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Server actions for Vercel compatibility - use API routes

export async function platformAdminLogoutAction(formData?: FormData): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3006"}/api/auth/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
  } catch (error) {
    console.error("Logout failed:", error);
  }

  // Always clear the platform admin cookie regardless of API response
  const cookieStore = await cookies();
  cookieStore.delete('schoolbase_staff');

  // Redirect to login immediately
  redirect("/login");
}

export async function sendPlatformCommunicationEmailAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/platform-admin/emails instead");
}

export async function sendSetupCompletionRemindersAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/platform-admin/reminders instead");
}

export async function sendSetupCompletionReminder(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/platform-admin/reminders instead");
}

export async function setSchoolPlanAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/schoolbase-admin/schools/plan instead");
}

export async function approveSchoolSubscriptionAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/schoolbase-admin/subscriptions/approve instead");
}

export async function rejectSchoolSubscriptionAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/schoolbase-admin/subscriptions/reject instead");
}

export async function createVideoAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/schoolbase-admin/videos instead");
}

export async function updateVideoAction(...args: any[]): Promise<any> {
  throw new Error("Use PATCH /api/schoolbase-admin/videos instead");
}

export async function deleteVideoAction(...args: any[]): Promise<any> {
  throw new Error("Use DELETE /api/schoolbase-admin/videos instead");
}
