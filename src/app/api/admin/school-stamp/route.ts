import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getStaffSession, getParentSession } from "@/lib/auth";
import { getSchoolStampFilePath } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    // Check authentication
    const staffSession = await getStaffSession();
    const parentSession = await getParentSession();

    if (!staffSession && !parentSession) {
      return new Response("Unauthorized", { status: 401 });
    }

    const schoolId = staffSession?.schoolId || parentSession?.schoolId;
    if (!schoolId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Try to get stamp from local storage first
    let stampPath = await getSchoolStampFilePath(schoolId);

    // If not found locally, proxy to backend
    if (!stampPath) {
      const backendUrl = process.env.BACKEND_URL || process.env.API_URL || "http://127.0.0.1:3006";
      const backendPath = `/uploads/stamps/${schoolId}`;
      const fullUrl = `${backendUrl}${backendPath}`;
      
      try {
        const response = await fetch(fullUrl, {
          next: { revalidate: 3600 },
        });
        
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const contentType = response.headers.get("content-type") || "image/png";
          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch (error) {
        console.error("[SCHOOL STAMP] Backend proxy error:", error);
      }
      
      return new Response("Not found", { status: 404 });
    }

    const buffer = await fs.readFile(stampPath);
    const ext = path.extname(stampPath).slice(1).toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[SCHOOL STAMP] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
