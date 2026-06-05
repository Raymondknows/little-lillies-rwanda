import NewStudentClient from "./new-student-client";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";

export default async function NewStudentPage() {
  const schoolId = await getCurrentSchoolId();
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });
  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  // Derive initials (prefer explicit `initials`), fallback to name-based initials
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
  const existingCount = await prisma.pupil.count({
    where: { schoolId, admissionNo: { startsWith: `${prefix}-${year}-` } },
  });
  const nextSeq = String(existingCount + 1).padStart(4, "0");
  const nextAdmissionNo = `${prefix}-${year}-${nextSeq}`;

  return <NewStudentClient classes={classes} nextAdmissionNo={nextAdmissionNo} />;
}
