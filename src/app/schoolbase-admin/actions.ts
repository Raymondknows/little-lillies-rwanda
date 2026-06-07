"use server";

// Server actions removed for Vercel compatibility
// Use API routes instead

export async function platformAdminLogoutAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/auth/logout instead");
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
