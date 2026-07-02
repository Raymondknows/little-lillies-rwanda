import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/profile`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({ message: "Failed to parse response." }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying profile request:", error);
    return NextResponse.json({ message: "Failed to proxy profile request." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/schoolbase-admin/api/profile`, {
      method: "PATCH",
      headers: {
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({ message: "Failed to parse response." }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying profile update request:", error);
    return NextResponse.json({ message: "Failed to proxy profile update request." }, { status: 500 });
  }
}
