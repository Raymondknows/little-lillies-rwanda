"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Server actions for authentication workflows

export async function staffLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/admin-login");
}

export async function staffLogoutAction() {
  try {
    // Delete the session cookie directly
    const cookieStore = await cookies();
    cookieStore.delete('schoolbase_session');
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Redirect to login page
  redirect('/login');
}

export async function parentLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/parent-login");
}

export async function platformAdminLogoutAction() {
  try {
    // Delete the session cookie directly
    const cookieStore = await cookies();
    cookieStore.delete('schoolbase_session');
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Redirect to login page
  redirect('/schoolbase-admin/login');
}

export async function parentLogoutAction() {
  try {
    // Delete the session cookie directly
    const cookieStore = await cookies();
    cookieStore.delete('schoolbase_session');
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Redirect to login page
  redirect('/login');
}

export async function requestPasswordResetAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/request-password-reset");
}

export async function resetPasswordAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/reset-password");
}
