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

  // First try to get photo from local storage
  let photoPath = await getStudentPhotoFilePath(pupilId);
  
  if (!photoPath) {
    console.log(`[PHOTO ROUTE] Local file not found`);
  } else {
    console.log(`[PHOTO ROUTE] Local file found: ${photoPath}`);
  }
  
  // If not found locally, check if backend has it and proxy the request
  if (!photoPath && pupil.photoUrl) {
    if (pupil.photoUrl.startsWith("/uploads/photos/")) {
      console.log(`[PHOTO ROUTE] Proxying to backend: ${pupil.photoUrl}`);
      const backendUrl = process.env.BACKEND_URL || process.env.API_URL || "http://127.0.0.1:3006";
      const fullUrl = `${backendUrl}${pupil.photoUrl}`;
      
      try {
        const response = await fetch(fullUrl, {
          next: { revalidate: 3600 },
        });
        
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const contentType = response.headers.get("content-type") || "image/jpeg";
          console.log(`[PHOTO ROUTE] Backend proxy SUCCESS`);
          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600",
            },
          });
        } else {
          console.log(`[PHOTO ROUTE] Backend proxy FAILED: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`[PHOTO ROUTE] Backend proxy ERROR: ${error}`);
      }
    } else {
      console.log(`[PHOTO ROUTE] photoUrl exists but not a backend path: ${pupil.photoUrl}`);
    }
    console.log(`[PHOTO ROUTE] Returning 404`);
    return new Response("Not found", { status: 404 });
  }
  
  if (!photoPath) {
    console.log(`[PHOTO ROUTE] No photoPath and no photoUrl in DB - returning 404`);
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
