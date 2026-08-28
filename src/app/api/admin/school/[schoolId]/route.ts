import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId } = await context.params;
    const response = await fetch(`${getBackendUrl()}/api/admin/school/${encodeURIComponent(schoolId)}`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => ({ error: "Failed to parse response." }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying school request:", error);
    return NextResponse.json({ error: "Failed to proxy school request." }, { status: 500 });
  }
}
