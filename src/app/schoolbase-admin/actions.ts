// Server actions removed for Vercel compatibility
// Use API routes instead

export async function platformAdminLogoutAction() {
  throw new Error("Use POST /api/auth/logout instead");
}

export async function sendPlatformCommunicationEmailAction() {
  throw new Error("Use POST /api/platform-admin/emails instead");
}

export async function sendSetupCompletionRemindersAction() {
  throw new Error("Use POST /api/platform-admin/reminders instead");
}

export async function sendSetupCompletionReminder() {
  throw new Error("Use POST /api/platform-admin/reminders instead");
}

export async function setSchoolPlanAction() {
  throw new Error("Use POST /api/schoolbase-admin/schools/plan instead");
}

export async function approveSchoolSubscriptionAction() {
  throw new Error("Use POST /api/schoolbase-admin/subscriptions/approve instead");
}

export async function rejectSchoolSubscriptionAction() {
  throw new Error("Use POST /api/schoolbase-admin/subscriptions/reject instead");
}

export async function createVideoAction() {
  throw new Error("Use POST /api/schoolbase-admin/videos instead");
}

export async function updateVideoAction() {
  throw new Error("Use PATCH /api/schoolbase-admin/videos instead");
}

export async function deleteVideoAction() {
  throw new Error("Use DELETE /api/schoolbase-admin/videos instead");
}
