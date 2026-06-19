import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = getBackendUrl();
    
    const response = await fetch(
      `${backendUrl}/schoolbase-admin/api/impersonate`,
      {
        method: "POST",
        headers: {
          "Cookie": req.headers.get("cookie") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error impersonating school:", error);
    return NextResponse.json({ message: "Impersonation failed" }, { status: 500 });
  }
}
