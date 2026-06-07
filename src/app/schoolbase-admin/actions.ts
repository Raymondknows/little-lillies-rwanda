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
