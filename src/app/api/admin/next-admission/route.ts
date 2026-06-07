import { NextResponse } from "next/server";
import { getCurrentSchoolId } from "@/lib/school";
// Database access removed - use backend API instead

export async function GET() {
  const schoolId = await getCurrentSchoolId();
  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  let prefix = "SCH";
  const rawInitials = (school as any)?.initials;
  if (rawInitials && typeof rawInitials === "string" && rawInitials.trim()) {
    prefix = rawInitials.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  } else if (school?.name) {
    const words = school.name.split(/[^A-Za-z0-9]+/).filter(Boolean);
    let letters = words.slice(0, 3).map((w: string) => w[0]).join("").toUpperCase();
    if (letters.length < 3 && words[0]) {
      const remaining = words[0].slice(1).replace(/[^A-Za-z0-9]/g, "");
      for (const ch of remaining) {
        letters += ch.toUpperCase();
        if (letters.length >= 3) break;
      }
    }
    prefix = (letters || "SCH").replace(/[^A-Z0-9]/g, "").slice(0, 6);
  }

  const year = new Date().getFullYear();

  // Prefer reading the admission counter if present (shows next without reserving).
  const counter = await prisma.admissionCounter.findUnique({ where: { schoolId_year: { schoolId, year } } });
  let nextSeqNum: number;
  if (counter) {
    nextSeqNum = counter.lastSeq + 1;
  } else {
    const existingCount = await prisma.pupil.count({ where: { schoolId, admissionNo: { startsWith: `${prefix}-${year}-` } } });
    nextSeqNum = existingCount + 1;
  }

  const nextSeq = String(nextSeqNum).padStart(4, "0");
  const nextAdmissionNo = `${prefix}-${year}-${nextSeq}`;

  return NextResponse.json({ nextAdmissionNo });
}
