"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend-url";

// Server actions for Vercel compatibility - use API routes

export async function platformAdminLogoutAction(formData?: FormData): Promise<any> {
  try {
    const response = await fetch(
      `${getBackendUrl()}/api/auth/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
  } catch (error) {
    console.error("Logout failed:", error);
  }

  // Clear all session cookies (schoolbase_session is the main one set during login)
  const cookieStore = await cookies();
  cookieStore.delete('schoolbase_session'); // ✅ CRITICAL: This is the JWT cookie set during login
  cookieStore.delete('schoolbase_staff');   // Legacy fallback
  cookieStore.delete('schoolbase_parent');  // Legacy fallback

  // Redirect to login immediately
  redirect("/schoolbase-admin-login");
}

export async function sendPlatformCommunicationEmailAction(...args: any[]): Promise<any> {
  throw new Error("Use POST /api/platform-admin/emails instead");
}

export async function sendSetupCompletionRemindersAction(...args: any[]): Promise<any> {
  try {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/reminders/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to send reminders (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send reminders');
  }
}

export async function sendSetupCompletionReminder(schoolId: string): Promise<any> {
  try {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/reminders/send-single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ schoolId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send reminder (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send reminder');
  }
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

export async function createVideoAction(data: any): Promise<any> {
  try {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create video (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create video');
  }
}

export async function updateVideoAction(videoId: string, data: any): Promise<any> {
  try {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update video (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update video');
  }
}

export async function deleteVideoAction(videoId: string): Promise<any> {
  try {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/videos/${videoId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete video (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete video');
  }
}
