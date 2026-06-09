"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Server actions for authentication workflows

export async function staffLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/admin-login");
}

export async function staffLogoutAction() {
  try {
    // Clear the staff cookie immediately
    const cookieStore = await cookies();
    cookieStore.delete('schoolbase_staff');
    cookieStore.delete('schoolbase_parent');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    
    // Call backend logout (best effort, don't block on failure)
    fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Ignore backend logout errors
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Always redirect to login after logout attempt
  redirect('/login');
}

export async function parentLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/parent-login");
}

export async function parentLogoutAction() {
  throw new Error("Use the backend API instead: POST /api/auth/logout");
}

export async function requestPasswordResetAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/request-password-reset");
}

export async function resetPasswordAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/reset-password");
}
