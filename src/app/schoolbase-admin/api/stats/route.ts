import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/stats`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({ message: "Failed to parse response." }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying stats request:", error);
    return NextResponse.json({ message: "Failed to proxy stats request." }, { status: 500 });
  }
}
