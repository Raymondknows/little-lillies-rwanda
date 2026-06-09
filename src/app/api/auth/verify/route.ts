import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    const cookieHeader = request.headers.get("cookie");

    // Pass the request to the backend, including cookies
    const response = await fetch(`${backendUrl}/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: "include",
    });

    const data = await response.json();

    // Forward the response with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Verify endpoint error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
