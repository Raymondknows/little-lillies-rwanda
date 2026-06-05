import { NextResponse } from "next/server";
import { getSchoolStampFilePath } from "@/lib/storage";
import fs from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const filePath = await getSchoolStampFilePath(schoolId);

    if (!filePath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const mimeType = filePath.endsWith(".png")
      ? "image/png"
      : filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")
        ? "image/jpeg"
        : "image/webp";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving stamp:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
