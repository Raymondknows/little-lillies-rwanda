"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend-url";

// Server actions for authentication workflows

export async function staffLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/admin-login");
}

export async function staffLogoutAction() {
  try {
    // ✅ CRITICAL: Call backend to clear server-side session
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

  // Clear all session cookies
  const cookieStore = await cookies();
  cookieStore.delete('littlelillies_session');
  cookieStore.delete('schoolbase_staff');
  cookieStore.delete('schoolbase_parent');

  // Redirect to login page
  redirect('/login');
}

export async function parentLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/parent-login");
}

export async function platformAdminLogoutAction() {
  try {
    // ✅ CRITICAL: Call backend to clear server-side session
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

  // Clear all session cookies
  const cookieStore = await cookies();
  cookieStore.delete('littlelillies_session');
  cookieStore.delete('schoolbase_staff');
  cookieStore.delete('schoolbase_parent');

  // Redirect to login page
  redirect('/login');
}

export async function parentLogoutAction() {
  try {
    // ✅ CRITICAL: Call backend to clear server-side session
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

  // Clear all session cookies
  const cookieStore = await cookies();
  cookieStore.delete('littlelillies_session');
  cookieStore.delete('schoolbase_staff');
  cookieStore.delete('schoolbase_parent');

  // Redirect to login page
  redirect('/login');
}

export async function requestPasswordResetAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/request-password-reset");
}

export async function resetPasswordAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/reset-password");
}
