import { NextResponse } from "next/server";
import { getSchoolLogoFilePath } from "@/lib/storage";
import fs from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ schoolId: string }> },
) {
  try {
    const { schoolId } = await params;
    const filePath = await getSchoolLogoFilePath(schoolId);

    if (!filePath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving logo:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
