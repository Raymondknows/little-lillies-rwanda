import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  try {
    // Call backend logout endpoint to clear server-side session
    await fetch(`${getBackendUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).catch(() => {
      // Ignore backend errors - we'll clear cookies locally anyway
    });
  } catch (error) {
    console.error("Backend logout failed:", error);
  }

  // Clear all session cookies
  const cookieStore = await cookies();
  cookieStore.delete("schoolbase_session");
  cookieStore.delete("schoolbase_staff");
  cookieStore.delete("schoolbase_parent");

  // Get redirect URL from query param or body
  let redirectUrl = "/login";
  try {
    const body = await request.json();
    if (body.redirectUrl) redirectUrl = body.redirectUrl;
  } catch {
    const redirectParam = request.nextUrl.searchParams.get("redirectUrl");
    if (redirectParam) redirectUrl = redirectParam;
  }

  // Use 303 See Other to force GET redirect after POST
  // This is the proper HTTP way to redirect after form submission
  return NextResponse.redirect(new URL(redirectUrl, request.url), {
    status: 303,
  });
}
