import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getStaffSession, getParentSession } from "@/lib/auth";
import { getSchoolLogoFilePath } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    // Check authentication - logos are public but we track who's requesting
    const staffSession = await getStaffSession();
    const parentSession = await getParentSession();

    if (!staffSession && !parentSession) {
      return new Response("Unauthorized", { status: 401 });
    }

    const schoolId = staffSession?.schoolId || parentSession?.schoolId;
    if (!schoolId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get logo file path
    const logoPath = await getSchoolLogoFilePath(schoolId);

    if (!logoPath) {
      return new Response("Not found", { status: 404 });
    }

    const buffer = await fs.readFile(logoPath);
    const ext = path.extname(logoPath).slice(1).toLowerCase();
    const contentType = ext === "webp" ? "image/webp" : "image/jpeg";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[SCHOOL LOGO] Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
