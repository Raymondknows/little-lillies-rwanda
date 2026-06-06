import { NextResponse } from "next/server";
import { getStaffSession, getParentSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const staffSession = await getStaffSession();
    const parentSession = await getParentSession();

    if (!staffSession && !parentSession) {
      return new Response("Unauthorized", { status: 401 });
    }

    const schoolId = staffSession?.schoolId || parentSession?.schoolId;
    if (!schoolId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || "http://localhost:3006";
    const resp = await fetch(`${backendUrl}/api/admin/school-stamp/${schoolId}`, {
      headers: { cookie: request.headers.get("cookie") || "" },
      redirect: "follow",
    });

    if (!resp.ok) {
      return NextResponse.json({ error: "Not found" }, { status: resp.status });
    }

    const buffer = await resp.arrayBuffer();
    const mimeType = resp.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[SCHOOL STAMP] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
