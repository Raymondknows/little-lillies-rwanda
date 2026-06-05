import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth";
import { getCurrentSchoolId } from "@/lib/school";
import { prisma } from "@/lib/db";
import { saveSchoolLogo } from "@/lib/storage";

const MAX_BYTES = 3 * 1024 * 1024;
const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = await getCurrentSchoolId();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "File is required" }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Unsupported file type. Use PNG, JPG, or WEBP." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: "File too large. Max 3MB." }, { status: 413 });
    }

    const url = await saveSchoolLogo(schoolId, file);
    await prisma.school.update({ where: { id: schoolId }, data: { logoUrl: url } });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
