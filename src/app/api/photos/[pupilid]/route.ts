import { NextResponse } from "next/server";
import { getStaffSession, getParentSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTeacherAccessibleClassIds } from "@/lib/teacher-permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pupilid: string }> },
) {
  const { pupilid: pupilId } = await params;

  console.log(`[PHOTO ROUTE] Request received for pupilId: ${pupilId}`);

  // Check authentication
  const staffSession = await getStaffSession();
  const parentSession = await getParentSession();

  if (!staffSession && !parentSession) {
    console.log(`[PHOTO ROUTE] No auth session - returning 401`);
    return new Response("Unauthorized", { status: 401 });
  }

  const schoolId = staffSession?.schoolId || parentSession?.schoolId;
  if (!schoolId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify pupil exists in this school
  console.log(`[PHOTO ROUTE] Looking up pupil: ${pupilId}`);
  const pupil = await prisma.pupil.findFirst({
    where: { id: pupilId, schoolId },
  });

  if (!pupil) {
    console.log(`[PHOTO ROUTE] Pupil found: NO`);
    return new Response("Not found", { status: 404 });
  }
  
  console.log(`[PHOTO ROUTE] Pupil found: YES`);
  console.log(`[PHOTO ROUTE] photoUrl from DB: ${pupil.photoUrl}`);

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

  // Proxy photo requests to the backend if a photoUrl exists.
  if (pupil.photoUrl) {
    try {
      const backendUrl = process.env.BACKEND_URL || process.env.API_URL || "http://127.0.0.1:3006";
      const fullUrl = pupil.photoUrl.startsWith("/") ? `${backendUrl.replace(/\/$/, "")}${pupil.photoUrl}` : pupil.photoUrl;

      const response = await fetch(fullUrl, { next: { revalidate: 3600 } });
      if (!response.ok) return new Response(null, { status: response.status });
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (err) {
      console.error(`[PHOTO ROUTE] proxy error`, err);
      return new Response("Error", { status: 500 });
    }
  }

  return new Response("Not found", { status: 404 });
}
