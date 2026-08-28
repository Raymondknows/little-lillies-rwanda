import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${getBackendUrl()}/api/admin/verify`, {
      method: "POST",
      headers: {
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({ authenticated: false }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying admin verification:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
