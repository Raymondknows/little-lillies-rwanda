"use server";

import { redirect } from "next/navigation";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3006";

function getSignupBackendUrl(path: string) {
  return `${BACKEND_URL.replace(/\/+$/, "")}${path}`;
}

/**
 * Request OTP for signup verification
 * This is a server action that calls the backend directly.
 */
export async function requestSignupOtpAction(formData: FormData) {
  try {
    const schoolName = formData.get("schoolName");
    const slug = formData.get("slug");
    const tagline = formData.get("tagline");
    const address = formData.get("address");
    const phone = formData.get("phone");
    const country = formData.get("country");
    const adminName = formData.get("adminName");
    const adminEmail = formData.get("adminEmail");
    const password = formData.get("password");

    if (!schoolName || !slug || !country || !adminName || !adminEmail || !password) {
      throw new Error("Missing required fields");
    }

    const apiUrl = getSignupBackendUrl("/api/trial/request-otp");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolName,
        slug,
        tagline,
        address,
        phone,
        country,
        adminName,
        adminEmail,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to request OTP");
    }

    // Redirect to OTP verification page with all form data
    const params = new URLSearchParams({
      email: String(adminEmail),
      schoolName: String(schoolName),
      slug: String(slug),
      tagline: String(tagline ?? ""),
      address: String(address ?? ""),
      phone: String(phone ?? ""),
      country: String(country),
      adminName: String(adminName),
      password: String(password),
    });
    redirect(`/signup/verify?${params.toString()}`);
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || (error as any).digest?.includes('NEXT_REDIRECT'))) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Verify OTP and create school account
 */
export async function verifySignupOtpAction(formData: FormData) {
  try {
    const schoolName = formData.get("schoolName");
    const slug = formData.get("slug");
    const tagline = formData.get("tagline");
    const address = formData.get("address");
    const phone = formData.get("phone");
    const country = formData.get("country");
    const adminName = formData.get("adminName");
    const adminEmail = formData.get("adminEmail");
    const password = formData.get("password");
    const otp = formData.get("otp");

    if (!otp) {
      throw new Error("OTP is required");
    }

    const apiUrl = getSignupBackendUrl("/api/trial/verify-otp");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolName,
        slug,
        tagline,
        address,
        phone,
        country,
        adminName,
        adminEmail,
        password,
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Failed to verify OTP");
    }

    // Redirect to success page which shows the success modal
    redirect("/signup/success");
  } catch (error) {
    // Re-throw Next.js redirect errors
    if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || (error as any).digest?.includes('NEXT_REDIRECT'))) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
