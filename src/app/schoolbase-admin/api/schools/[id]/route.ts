import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: schoolId } = await params;
    if (!schoolId) {
      return NextResponse.json({ message: "School ID is required." }, { status: 400 });
    }

    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/schoolbase-admin/api/schools/${schoolId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Failed to fetch school detail");
      return NextResponse.json({ message: error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying school detail:", error);
    return NextResponse.json({ message: "Failed to fetch school detail." }, { status: 500 });
  }
}
