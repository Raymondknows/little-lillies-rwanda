"use server";

// Server actions removed for Vercel compatibility
// Use backend API endpoints instead

export async function requestSignupOtpAction(formData: FormData) {
  throw new Error("Use API endpoint POST /api/signup/request-otp instead");
}

export async function verifySignupOtpAction(formData: FormData) {
  throw new Error("Use API endpoint POST /api/signup/verify-otp instead");
}
