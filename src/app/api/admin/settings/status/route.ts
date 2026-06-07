import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "http://localhost:3006";

export async function GET(request: NextRequest) {
  try {
    // Get auth cookie to pass to backend
    const cookies = request.headers.get("cookie") || "";

    const response = await fetch(`${API_URL}/api/admin/settings/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: cookies,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch settings status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Settings status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings status" },
      { status: 500 }
    );
  }
}
