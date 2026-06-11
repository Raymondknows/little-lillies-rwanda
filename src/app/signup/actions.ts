"use server";

import { redirect } from "next/navigation";

/**
 * Request OTP for signup verification
 * This is a server action that calls the API route to avoid client-side CORS issues
 */
export async function requestSignupOtpAction(formData: FormData) {
  try {
    const schoolName = formData.get("schoolName");
    const slug = formData.get("slug");
    const country = formData.get("country");
    const adminName = formData.get("adminName");
    const adminEmail = formData.get("adminEmail");
    const password = formData.get("password");

    if (!schoolName || !slug || !country || !adminName || !adminEmail || !password) {
      throw new Error("Missing required fields");
    }

    const response = await fetch("/api/signup/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        schoolName,
        slug,
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
      country: String(country),
      adminName: String(adminName),
      password: String(password),
    });
    redirect(`/signup/verify?${params.toString()}`);
  } catch (error) {
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
    const country = formData.get("country");
    const adminName = formData.get("adminName");
    const adminEmail = formData.get("adminEmail");
    const password = formData.get("password");
    const otp = formData.get("otp");

    if (!otp) {
      throw new Error("OTP is required");
    }

    const response = await fetch("/api/signup/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        schoolName,
        slug,
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

    // Redirect to login with success message
    redirect("/login?signup=success");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}
