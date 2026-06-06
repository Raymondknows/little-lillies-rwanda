import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getStaffSession, getParentSession } from "@/lib/auth";
import { getSchoolSignatureFilePath } from "@/lib/storage";

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

    // Get signature file path
    const signaturePath = await getSchoolSignatureFilePath(schoolId);

    if (!signaturePath) {
      return new Response("Not found", { status: 404 });
    }

    const buffer = await fs.readFile(signaturePath);
    const ext = path.extname(signaturePath).slice(1).toLowerCase();
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
    console.error("[SCHOOL SIGNATURE] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
