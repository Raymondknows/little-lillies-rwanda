"use server";

// Server actions removed for Vercel compatibility
// Use backend API endpoints instead for authentication workflows.

export async function staffLoginAction(formData: FormData) {
  throw new Error("Use the backend API instead: POST /api/auth/admin-login");
}

export async function staffLogoutAction() {
  throw new Error("Use the backend API instead: POST /api/auth/logout");
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
