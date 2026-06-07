// Email sending removed for Vercel compatibility
// All email operations must use backend API routes
// This file is intentionally empty to prevent nodemailer imports

export function buildSignupVerificationEmail() {
  throw new Error("Use backend API for email operations");
}

export function buildInvoicePaymentEmail() {
  throw new Error("Use backend API for email operations");
}

export async function sendEmail() {
  throw new Error("Use backend API for email operations");
}
