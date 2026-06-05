import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import FeeSchedulesPageClient from "./schedules-client";

export default async function FeeSchedulesPage({ searchParams }: { searchParams?: { success?: string } }) {
  const showSuccess = searchParams?.success === "1";
  const school = await getCurrentSchool();

  const terms = await prisma.term.findMany({
    where: { academicYear: { schoolId: school.id } },
    include: { academicYear: true },
    orderBy: [{ academicYear: { name: "desc" } }, { sortOrder: "asc" }],
  });

  const classes = await prisma.class.findMany({
    where: { schoolId: school.id },
    orderBy: { name: "asc" },
  });

  const feeSchedules = await prisma.feeSchedule.findMany({
    where: { schoolId: school.id },
    include: {
      term: { include: { academicYear: true } },
      class: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <FeeSchedulesPageClient
      feeSchedules={feeSchedules}
      currency={school.currency}
      terms={terms}
      classes={classes}
      success={showSuccess}
    />
  );
}
