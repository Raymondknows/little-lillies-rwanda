import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getStudentPhotoFilePath } from "@/lib/storage";
import { getStaffSession, getParentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTeacherAccessibleClassIds } from "@/lib/teacher-permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pupilid: string }> },
) {
  const { pupilid: pupilId } = await params;

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

  // Verify pupil exists in this school
  const pupil = await prisma.pupil.findFirst({
    where: { id: pupilId, schoolId },
  });

  if (!pupil) {
    return new Response("Not found", { status: 404 });
  }

  // For parents: verify they're linked to this student
  if (parentSession) {
    const linked = await prisma.guardianPupil.findFirst({
      where: { pupilId, guardianId: parentSession.guardianId },
    });
    if (!linked) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // For teachers: verify they have access to student's class
  if (staffSession && staffSession.role === "TEACHER") {
    const accessibleClassIds = await getTeacherAccessibleClassIds(
      staffSession.userId,
      schoolId
    );
    if (!pupil.classId || !accessibleClassIds.includes(pupil.classId)) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const photoPath = await getStudentPhotoFilePath(pupilId);
  if (!photoPath) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await fs.readFile(photoPath);
  const ext = path.extname(photoPath).slice(1).toLowerCase();
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
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
