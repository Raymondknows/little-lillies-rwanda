import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import AcademicYearSettingsPageClient from "./academic-years-client";

export default async function AcademicYearSettingsPage() {
  const school = await getCurrentSchool();

  const academicYears = await prisma.academicYear.findMany({
    where: { schoolId: school.id },
    orderBy: [{ isCurrent: "desc" }, { name: "desc" }],
    include: {
      terms: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return <AcademicYearSettingsPageClient academicYears={academicYears} />;
}
