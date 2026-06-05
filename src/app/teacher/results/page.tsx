import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSchoolId } from "@/lib/school";
import { getStaffSession } from "@/lib/auth";
import TeacherResultsPageClient from "./results-client";

export default async function TeacherResultsPage() {
  const session = await getStaffSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  const schoolId = await getCurrentSchoolId();
  const classes = await prisma.teacherClass.findMany({
    where: { teacherId: session.userId, schoolId },
    include: { class: true },
  });
  const classPhases = Array.from(new Set(classes.map((item) => item.class.phase)));

  const assessments = await prisma.assessment.findMany({
    where: { schoolId, phase: { in: classPhases } },
    orderBy: { createdAt: "desc" },
    include: { term: true, _count: { select: { results: true } } },
  });

  return <TeacherResultsPageClient assessments={assessments} />;
}
