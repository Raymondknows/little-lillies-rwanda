"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Request OTP for signup verification
 * This is a server action that calls the API route to avoid client-side CORS issues
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

    // Build absolute URL for server action
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const apiUrl = `${protocol}://${host}/api/signup/request-otp`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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

    // Build absolute URL for server action
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const apiUrl = `${protocol}://${host}/api/signup/verify-otp`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
