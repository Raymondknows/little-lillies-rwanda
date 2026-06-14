import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getBackendUrl(): string {
  // On Vercel (vercel.app domain) or production, use the actual backend
  if (process.env.NODE_ENV === "production") {
    return "https://api.schoolbase.live";
  }
  return "http://localhost:3006";
}

export async function POST(request: NextRequest) {
  console.log('[LOGOUT-HANDLER] Logout request received');
  
  // Get redirect URL from query param or body
  let redirectUrl = "/login";
  try {
    const body = await request.json();
    if (body.redirectUrl) redirectUrl = body.redirectUrl;
  } catch {
    const redirectParam = request.nextUrl.searchParams.get("redirectUrl");
    if (redirectParam) redirectUrl = redirectParam;
  }

  console.log('[LOGOUT-HANDLER] Redirect URL:', redirectUrl);

  // Call backend logout endpoint to clear the session server-side
  const backendUrl = getBackendUrl();
  console.log('[LOGOUT-HANDLER] Calling backend logout at:', backendUrl);
  
  try {
    const response = await fetch(`${backendUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log('[LOGOUT-HANDLER] Backend logout response status:', response.status);
    const data = await response.json();
    console.log('[LOGOUT-HANDLER] Backend logout response:', data);
  } catch (error) {
    console.error("[LOGOUT-HANDLER] Backend logout failed:", error);
    // Continue anyway - still redirect even if backend call fails
  }

  // Clear frontend cookies as well (in case they exist)
  const cookieStore = await cookies();
  console.log('[LOGOUT-HANDLER] Clearing frontend cookies');
  cookieStore.delete("schoolbase_session");
  cookieStore.delete("schoolbase_staff");
  cookieStore.delete("schoolbase_parent");

  console.log('[LOGOUT-HANDLER] Redirecting to:', redirectUrl);
  
  // Redirect with 303 See Other (proper HTTP for POST redirect)
  return NextResponse.redirect(new URL(redirectUrl, request.url), {
    status: 303,
  });
}
